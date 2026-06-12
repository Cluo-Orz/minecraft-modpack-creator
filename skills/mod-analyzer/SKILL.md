---
name: mod-analyzer
description: Analyze a chosen or candidate Minecraft mod for adoption planning. Use when work needs source validation, version and loader fit, aliases, dependencies, configuration surfaces, implementation signals, operational risk, or integration implications recorded in pack-state artifacts.
---

Analyze one mod deeply enough that the modpack can make an informed decision about adoption and integration.

---

## Input expectation

Work from at least one of these:

- Chinese mod name
- English mod name
- slug
- source link

If only a Chinese name is available, resolve aliases first.

---

## Analysis workflow

### 1. Resolve identity

Use this order:

1. Existing `pack-state\mod-analyses\*.json`
2. MC百科 / alias discovery
3. The `minecraft-pack-builder` skill's `probe-mod-search.mjs` script with the query argument
4. Modrinth and GitHub validation

Identity should end with:

- canonical display name
- normalized slug
- aliases
- source links

### 2. Validate release source

Prefer:

1. Modrinth project and versions
2. GitHub repository and releases
3. CurseForge only if access exists

Record whether the source is:

- official
- mirrored
- community reference only

### 3. Analyze integration-relevant behavior

Extract the surfaces that matter for pack building:

- Minecraft version and loader support
- server/client install requirement
- dependencies and optional companions
- likely configuration entry points
- commands, permissions, data files, recipes, worldgen, dimensions, entities, loot, or progression changes
- implementation clues from repo structure, docs, release notes, or jar metadata when available

### 4. Judge risk

Explicitly score:

- version risk
- worldgen overlap risk
- progression overlap risk
- config complexity
- operational uncertainty

### 5. Write the analysis artifact

Persist to:

- `pack-state\mod-analyses\<slug>.json`

If the mod is chosen or close to adoption, also support generating:

- `pack-state\integration-docs\<slug>.md`

Use the `minecraft-pack-builder` skill's `mod-analysis.template.json` template as the output shape when creating a new analysis artifact.

---

## Output expectations

A useful analysis answers:

- What is this mod actually for?
- Can it fit this pack?
- Where will configuration likely happen?
- What systems does it touch?
- What would make it risky to add?
- What should the next skill check?

---

## Guardrails

- Separate proven facts from inferred conclusions
- Prefer source-backed statements over community hearsay
- If a release source is weak or ambiguous, say so plainly
