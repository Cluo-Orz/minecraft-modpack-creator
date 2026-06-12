const USER_AGENT = "copilot-minecraft-modpack-probe/0.1";

const defaultSamples = [
  {
    label: "阡陌交通 mod",
    query: "阡陌交通",
    manualAliases: [],
  },
];

function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => value.trim()).filter(Boolean))];
}

function normalizeSpaces(value) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeForMatch(value) {
  return value.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "");
}

function expandAlias(alias) {
  if (typeof alias !== "string") {
    return [];
  }
  const results = new Set([alias]);
  results.add(alias.replace(/and/gi, " and "));
  results.add(alias.replace(/-/g, " "));
  results.add(alias.replace(/_/g, " "));
  results.add(alias.replace(/\s+/g, ""));
  return [...results].map(normalizeSpaces).filter(Boolean);
}

function extractAliasesFromMcmodHit(hit) {
  const aliases = [];
  const { data = {}, title = "" } = hit;
  aliases.push(data.chinese_name);
  aliases.push(data.sub_name);
  aliases.push(data.abbr);
  const titleMatch = title.match(/\(([^)]+)\)/);
  if (titleMatch) {
    aliases.push(titleMatch[1]);
  }
  return unique(aliases.flatMap(expandAlias));
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
      ...options.headers,
    },
  });
  if (!response.ok) {
    const error = new Error(`${response.status} ${response.statusText}`);
    error.status = response.status;
    error.body = await response.text();
    throw error;
  }
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,text/plain;q=0.9,*/*;q=0.8",
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.text();
}

async function searchMcmod(query) {
  const url = `https://mcmod-api.zkitefly.eu.org/s/key=${encodeURIComponent(query)}`;
  const hits = await fetchJson(url);
  return {
    platform: "mcmod-unofficial-api",
    status: hits.length ? "found" : "not_found",
    query,
    hits: hits.slice(0, 5).map((hit) => ({
      title: hit.title,
      chineseName: hit.data?.chinese_name ?? null,
      englishName: hit.data?.sub_name ?? null,
      address: hit.address,
    })),
  };
}

async function searchModrinth(aliases) {
  const attempts = [];
  for (const alias of aliases) {
    const url = `https://api.modrinth.com/v2/search?query=${encodeURIComponent(alias)}&limit=5`;
    const data = await fetchJson(url);
    const exactish = data.hits.find((hit) => {
      const haystacks = [hit.title, hit.slug, hit.description].filter(Boolean).join(" ").toLowerCase();
      return haystacks.includes(alias.toLowerCase());
    });
    attempts.push({ alias, totalHits: data.total_hits });
    if (exactish) {
      return {
        platform: "modrinth",
        status: "found",
        query: alias,
        attempts,
        hit: {
          title: exactish.title,
          slug: exactish.slug,
          projectType: exactish.project_type,
          loaders: exactish.categories,
          versions: exactish.versions?.slice(0, 5) ?? [],
          projectId: exactish.project_id,
        },
      };
    }
  }
  return { platform: "modrinth", status: "not_found", attempts };
}

async function searchGithubRepos(aliases) {
  const attempts = [];
  for (const alias of aliases) {
    const queries = unique([
      `${alias} in:name`,
      `"${alias}" in:name`,
      `${alias} minecraft mod`,
    ]);
    for (const searchQuery of queries) {
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}&per_page=5`;
      let data;
      try {
        data = await fetchJson(url);
      } catch (error) {
        if (error.status === 403 && typeof error.body === "string" && error.body.includes("rate limit exceeded")) {
          return {
            platform: "github-repositories",
            status: "rate_limited",
            note: "GitHub anonymous rate limit exceeded; rerun later or use authenticated GitHub requests for higher limits.",
            attempts,
          };
        }
        throw error;
      }
      attempts.push({ alias, searchQuery, totalCount: data.total_count });
      const aliasKey = normalizeForMatch(alias);
      const best = data.items
        ?.map((item) => {
          const nameKey = normalizeForMatch(item.name ?? "");
          const fullNameKey = normalizeForMatch(item.full_name ?? "");
          const descriptionKey = normalizeForMatch(item.description ?? "");
          let score = 0;
          if (nameKey === aliasKey) score += 6;
          if (nameKey.includes(aliasKey)) score += 3;
          if (fullNameKey.includes(aliasKey)) score += 2;
          if (descriptionKey.includes(aliasKey)) score += 4;
          if (item.language === "Java") score += 1;
          if (item.stargazers_count > 0) score += Math.min(3, Math.log10(item.stargazers_count + 1));
          return { item, score };
        })
        ?.sort((a, b) => b.score - a.score)[0]?.item;
      if (best) {
        return {
          platform: "github-repositories",
          status: "found",
          query: alias,
          attempts,
          hit: {
            fullName: best.full_name,
            description: best.description,
            htmlUrl: best.html_url,
            stars: best.stargazers_count,
          },
        };
      }
    }
  }
  return { platform: "github-repositories", status: "not_found", attempts };
}

async function searchBbsmc(aliases) {
  const attempts = [];
  for (const alias of aliases) {
    const url = `https://bbsmc.net/mods?query=${encodeURIComponent(alias)}`;
    const text = await fetchText(url);
    const visibleHeadingMatch = text.includes(`>${alias}<`) || text.includes(`"${alias}"`);
    attempts.push({ alias, visibleHeadingMatch });
  }
  return {
    platform: "bbsmc",
    status: "weak_support",
    note: "查询页可访问，但当前实测看不出稳定的服务端关键词过滤；更适合作为补充发现源，不适合第一版主搜索源。",
    attempts,
  };
}

async function searchCurseForge(aliases) {
  const apiKey = process.env.CURSEFORGE_API_KEY || process.env.CF_API_KEY;
  if (!apiKey) {
    return {
      platform: "curseforge",
      status: "blocked",
      note: "缺少 CURSEFORGE_API_KEY/CF_API_KEY，官方 API 不能直接实测。",
    };
  }

  const attempts = [];
  for (const alias of aliases) {
    const url = `https://api.curseforge.com/v1/mods/search?gameId=432&classId=6&searchFilter=${encodeURIComponent(alias)}&pageSize=5`;
    try {
      const data = await fetchJson(url, {
        headers: {
          "x-api-key": apiKey,
        },
      });
      attempts.push({ alias, totalCount: data.pagination?.totalCount ?? data.data?.length ?? 0 });
      if (data.data?.length) {
        const best = data.data[0];
        return {
          platform: "curseforge",
          status: "found",
          query: alias,
          attempts,
          hit: {
            id: best.id,
            name: best.name,
            slug: best.slug,
            summary: best.summary,
            downloadCount: best.downloadCount,
          },
        };
      }
    } catch (error) {
      if (error.status === 403) {
        return {
          platform: "curseforge",
          status: "restricted",
          note: "API key is valid enough for general endpoints but does not currently have Minecraft mod search access.",
          attempts,
        };
      }
      throw error;
    }
  }

  return { platform: "curseforge", status: "not_found", attempts };
}

async function searchMinebbs() {
  return {
    platform: "minebbs",
    status: "unsupported",
    note: "官方 OpenAPI 当前只支持按资源 ID 读取，不支持按关键词搜索 Mod。",
  };
}

async function searchHimcbbs() {
  return {
    platform: "himcbbs",
    status: "unsupported",
    note: "公开 API 仍是预览态，当前没有稳定的资源关键词搜索接口可用。",
  };
}

function summarizePlatform(result) {
  const core = `${result.platform}: ${result.status}`;
  if (result.query) {
    return `${core} (via "${result.query}")`;
  }
  if (result.note) {
    return `${core} - ${result.note}`;
  }
  return core;
}

async function probeSample(sample) {
  const mcmod = await searchMcmod(sample.query);
  const mcmodAliases = mcmod.hits?.[0]
    ? extractAliasesFromMcmodHit({
        title: mcmod.hits[0].title,
        data: {
          chinese_name: mcmod.hits[0].chineseName,
          sub_name: mcmod.hits[0].englishName,
        },
      })
    : [];

  const aliases = unique([sample.query, ...sample.manualAliases, ...mcmodAliases].flatMap(expandAlias));

  const platforms = await Promise.all([
    Promise.resolve(mcmod),
    searchModrinth(aliases),
    searchGithubRepos(aliases),
    searchBbsmc(aliases),
    searchCurseForge(aliases),
    searchMinebbs(),
    searchHimcbbs(),
  ]);

  return {
    sample: sample.label,
    seedQuery: sample.query,
    aliases,
    platforms,
  };
}

function buildSamplesFromArgv(argv) {
  const queries = argv.map((value) => value.trim()).filter(Boolean);
  if (!queries.length) {
    return defaultSamples;
  }

  return queries.map((query) => ({
    label: `${query} mod`,
    query,
    manualAliases: [],
  }));
}

async function main() {
  const samples = buildSamplesFromArgv(process.argv.slice(2));
  const results = [];
  for (const sample of samples) {
    results.push(await probeSample(sample));
  }

  console.log(JSON.stringify(results, null, 2));
  console.log("\n=== Summary ===");
  for (const result of results) {
    console.log(`\n${result.sample}`);
    console.log(`Aliases: ${result.aliases.join(", ")}`);
    for (const platform of result.platforms) {
      console.log(`- ${summarizePlatform(platform)}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
