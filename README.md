# Minecraft Modpack Creator Skills

[English](./README.md) | [简体中文](./README.zh-CN.md)

An Agent Skills workflow for building Minecraft modpacks with durable context, source-backed decisions, and repeatable integration reviews.

This repository is not a launcher, downloader, or mod manager. It is a skill set for AI agents that helps turn modpack development from ad hoc chat into a maintainable project workflow.

Use it when you want an agent to:

- Plan a new NeoForge / Minecraft modpack from zero.
- Add project memory to an existing modpack.
- Evaluate whether a candidate mod actually fits the current pack.
- Keep accepted decisions, rejected ideas, compatibility reports, and integration notes in files.

## Why It Exists

The hard part of modpack development is rarely "find a mod." The hard part is keeping the reasoning clear:

- What experience is this pack trying to create?
- Which Minecraft version, loader, and server/client constraints matter?
- Which mods are accepted, rejected, or still pending?
- Does a new mod overlap with worldgen, progression, permissions, commands, config, or balance?
- Is the download source official, and where is the evidence?
- Where should the next AI session continue from?

These skills write that context into `pack-state`, so future work can continue from project state instead of a temporary conversation.

## Skills

Each skill is a self-contained folder with a `SKILL.md` file.

| Skill | Purpose |
| --- | --- |
| `minecraft-pack-builder` | Orchestrates the full workflow: requirement intake, candidate discovery, shortlist, analysis, compatibility review, source resolution, and state updates. |
| `mod-analyzer` | Analyzes one mod in depth: source validity, aliases, version / loader support, dependencies, configuration surface, implementation signals, and risks. |
| `pack-compat` | Decides whether one or more analyzed mods fit the current pack and records blockers, overlaps, and adoption conditions. |
| `pack-context` | Maintains the current pack context: goals, constraints, accepted / rejected mods, prior analyses, compatibility reports, and known risks. |

Shared scripts and templates are owned by the `minecraft-pack-builder` skill. Other skills refer to those resources by skill and resource name, not by hard-coded repository paths.

## Project State

Add a `pack-state` directory to the modpack workspace:

```text
pack-state/
  project-context.json
  mod-analyses/
  compat-reports/
  integration-docs/
```

A minimal `project-context.json` can start like this:

```json
{
  "packName": "my-pack",
  "minecraftVersion": null,
  "loader": "NeoForge",
  "distribution": "server-first",
  "goals": [],
  "hardConstraints": [],
  "acceptedMods": [],
  "rejectedMods": [],
  "pendingMods": [],
  "openCapabilityGaps": [],
  "knownRisks": [],
  "artifacts": {
    "modAnalyses": [],
    "compatReports": [],
    "integrationDocs": []
  }
}
```

Commit `pack-state` to Git. It is the long-term memory of the pack.

## Start a New Modpack

Create a clean workspace:

```text
my-modpack/
  mods/
  config/
  pack-state/
```

Then make this repository's `skills/` available to your agent. Depending on your environment, that can mean installing the folders into the agent's skills directory or keeping this repository open as a workspace that supports local skills.

After creating `pack-state/project-context.json`, give the agent a clear target:

```text
Use the minecraft-pack-builder skill.

I want to build a NeoForge server-first survival modpack from zero.
The direction is exploration, roads, towns, light automation, and long-term progression.
Avoid heavy client-only requirements and avoid mods that make worldgen significantly unstable.
Help me clarify the requirements, propose the first candidate mods, and update pack-state once decisions become stable.
```

Recommended loop:

1. Describe the gameplay goal and hard constraints.
2. Let `minecraft-pack-builder` propose candidates.
3. Choose one or more candidate mods.
4. Let `mod-analyzer` write per-mod analysis artifacts.
5. Let `pack-compat` classify fit, blockers, and conditions.
6. Let `pack-context` update durable project state.

A good session ends with updated files, not just advice.

## Connect an Existing Modpack

You do not need to rebuild an existing pack around these skills. Add a state layer and let the agent learn the current project shape.

First, make `skills/` available to the agent and create:

```text
pack-state/
  project-context.json
  mod-analyses/
  compat-reports/
  integration-docs/
```

Then ask the agent to bootstrap context from the existing files:

```text
Use the pack-context skill.

This is an existing Minecraft modpack. Inspect the current workspace and create pack-state/project-context.json.
Use mods/, config/, defaultconfigs/, kubejs/, datapacks/, and any existing notes if present.
Separate confirmed facts from guesses. Do not invent version targets or design goals.
```

Backfill analysis for important mods gradually:

```text
Use the mod-analyzer skill.

Analyze the most important worldgen, progression, and server gameplay mods in this pack.
Create one mod-analyses artifact per important mod, then use pack-compat to identify overlaps and risks.
```

For future changes, make the agent read `pack-state` first:

```text
Use the minecraft-pack-builder skill.

I want to add a road or transportation system to this existing pack.
Read pack-state first, reuse prior analyses, propose candidate mods, and only recommend a mod when the official source and pack fit are clear.
```

## Workflow Contract

- `project-context.json` is the current entry point for pack truth.
- `mod-analyses/*.json` records individual mod sources, capabilities, and risks.
- `compat-reports/*.json` records fit decisions, blockers, and adoption conditions.
- `integration-docs/*.md` records configuration, deployment, and maintenance notes for accepted mods.

If a decision will matter later, keep it out of chat-only memory.

## What This Is Not

- Not a mod download site.
- Not a launcher.
- Not a dependency solver.
- Not a black box that decides the pack direction for you.

Its job is to help you make better decisions and preserve those decisions as project assets.

## Repository Layout

```text
skills/
  minecraft-pack-builder/
    SKILL.md
    scripts/
    references/templates/
  mod-analyzer/
    SKILL.md
  pack-compat/
    SKILL.md
  pack-context/
    SKILL.md
```

## Principles

- Prefer official or trusted sources.
- Prefer explicit tradeoffs over vague "should be fine" conclusions.
- Keep accepted decisions, candidate ideas, and hypotheses separate.
- Reuse existing analysis instead of starting from scratch.
- Leave the project easier to continue than you found it.

