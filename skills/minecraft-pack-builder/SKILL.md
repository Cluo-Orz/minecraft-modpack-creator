---
name: minecraft-pack-builder
description: Orchestrate the NeoForge server modpack lifecycle. Use when the user describes gameplay or server needs and wants candidate mods, mod selection support, official source validation, download planning, analysis, compatibility evaluation, integration documentation, or iterative pack-state updates.
---

Build and evolve the modpack as a long-running lifecycle, not a one-off recommendation.

This skill owns the loop:

1. Read the current pack state
2. Understand the new requirement
3. Find candidate mods
4. Present a shortlist for user selection
5. Analyze the chosen mods
6. Evaluate pack fit and risks
7. Download or resolve the official acquisition path
8. Generate integration documentation
9. Update references so the next request starts from current reality

---

## Resource navigation

This skill owns the shared pack-building resources:

- `probe-mod-search.mjs` script for Chinese-name, alias, MC百科, Modrinth, and GitHub discovery support
- `mod-analysis.template.json` template for new mod analysis artifacts
- `compat-report.template.json` template for new compatibility reports

When another project skill needs one of these resources, refer to it as the `minecraft-pack-builder` skill's resource by name. Do not duplicate the repository path in downstream skill instructions.

---

## Core references

Always ground your work in these files first:

- `pack-state\project-context.json`
- `pack-state\mod-analyses\*.json`
- `pack-state\compat-reports\*.json`

If the pack state is unclear, use the `pack-context` skill before doing discovery.

If a mod has already been analyzed, reuse that analysis instead of starting from scratch.

---

## Discovery strategy

Use source priority like this:

### Name resolution and Chinese discovery
1. MC百科 / MC百科非官方 API
2. Existing mod analysis references

### Official or semi-official release sources
1. Modrinth
2. GitHub repository / GitHub releases
3. CurseForge only when Minecraft search access is actually available

### Supplemental discovery only
- BBSMC
- Other domestic community pages

Do not treat weak discovery sources as authoritative download sources.

---

## Shortlist workflow

When the user gives a requirement:

1. Translate the request into 1-3 search intents
   - capability
   - pack role
   - constraints such as NeoForge, server-first, performance, version

2. Search for candidates
   - Prefer this skill's `probe-mod-search.mjs` script when a Chinese name or uncertain alias is involved
   - Use MC百科 to normalize Chinese names to canonical English names
   - Validate release presence on Modrinth and GitHub

3. Present a decision-ready shortlist
   Include:
   - mod name
   - why it matches
   - loader / MC version fit
   - server/client installation requirement
   - major risk or tradeoff
   - source confidence

4. Wait for the user to choose
   Do not auto-commit to a mod when there are meaningful tradeoffs.

---

## After the user chooses

For each selected mod:

1. Use the `mod-analyzer` skill
2. Use the `pack-compat` skill
3. Resolve official acquisition path
4. Download only from the validated source when direct download is available and appropriate
5. Generate or update integration documentation
6. Update `pack-state\project-context.json`

If the mod cannot be safely downloaded automatically, record the exact official manual acquisition path instead of inventing one.

---

## Outputs you own

You should leave the repository with updated long-term state:

- `pack-state\project-context.json`
- `pack-state\mod-analyses\<slug>.json`
- `pack-state\compat-reports\<slug-or-combo>.json`
- `pack-state\integration-docs\<slug>.md` when integration work has been analyzed

---

## Guardrails

- Favor reproducible, source-backed recommendations
- Prefer official release sources over mirrors
- Do not treat a community discussion page as authoritative distribution
- Reuse existing analysis artifacts whenever possible
- Keep the pack state current after every accepted decision
