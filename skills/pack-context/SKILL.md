---
name: pack-context
description: Bootstrap, summarize, and maintain the evolving Minecraft modpack project state. Use whenever work needs a new or existing pack-state directory, the latest pack profile, selected or rejected mods, constraints, prior analyses, compatibility reports, integration history, or updates to durable pack-state references.
---

Treat the modpack as an evolving project state.

Your job is to create the durable state layer when it is missing, read existing references when they exist, synthesize the current picture, and keep the project context file aligned with accepted decisions.

---

## Bootstrap behavior

If `pack-state\project-context.json` does not exist, create the state layer before summarizing:

- `pack-state\project-context.json`
- `pack-state\mod-analyses\`
- `pack-state\compat-reports\`
- `pack-state\integration-docs\`

If `project-context.json` exists but one of the sibling artifact directories is missing, create the missing directory before continuing.

For a new pack, initialize `project-context.json` from the user's stated goals and constraints. Leave unknown fields as `null` or empty arrays instead of guessing.

For an existing pack, inspect the workspace first and derive confirmed facts from available files such as:

- `mods\`
- `config\`
- `defaultconfigs\`
- `kubejs\`
- `datapacks\`
- `manifest.json`
- `modrinth.index.json`
- `pack.toml` or packwiz files
- existing README, changelog, or notes

Separate confirmed facts from hypotheses. If a version, loader, pack goal, or mod role cannot be proven from files or user input, mark it as unknown rather than inventing it.

Use this minimal shape for a new `project-context.json`:

```json
{
  "packName": null,
  "minecraftVersion": null,
  "loader": null,
  "distribution": null,
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
  },
  "evidence": [],
  "hypotheses": []
}
```

After bootstrapping, continue with the normal read order.

---

## Read order

1. `pack-state\project-context.json`
2. `pack-state\mod-analyses\*.json`
3. `pack-state\compat-reports\*.json`

Use the references to answer:

- What pack are we building?
- Which Minecraft version and loader are targeted?
- Which mods are already accepted, rejected, or pending?
- What constraints keep showing up?
- Which capability gaps are still open?

---

## Responsibilities

### 1. Summarize current pack state

Provide a compact state snapshot:

- target distribution
- loader / Minecraft version
- pack goals
- hard constraints
- selected mods
- unresolved capability gaps
- known risks

### 2. Maintain `pack-state\project-context.json`

Update it when decisions become stable:

- a mod is selected
- a mod is rejected with a reason
- a new pack constraint is established
- a compatibility issue becomes known
- an integration document is created

### 3. Link reference artifacts

Keep file references current so other skills can jump straight to the right evidence.

---

## What good output looks like

A good output is not generic pack lore. It is a decision-support snapshot of the current pack, grounded in the references already produced.

Prefer statements like:

- "The pack is currently NeoForge server-first with no pinned Minecraft version yet."
- "RoadWeaver introduces worldgen and road generation risk that should be reviewed against existing structure mods."

---

## Guardrails

- Do not invent project state that is not in the references or directly confirmed by the user
- Keep accepted decisions separate from candidate ideas
- When something is only a hypothesis, label it clearly
