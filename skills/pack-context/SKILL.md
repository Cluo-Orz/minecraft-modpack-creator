---
name: pack-context
description: Summarize and maintain the evolving modpack project state. Use whenever work needs the latest pack profile, selected or rejected mods, constraints, prior analyses, compatibility reports, integration history, or updates to durable pack-state references.
---

Treat the modpack as an evolving project state.

Your job is to read the durable references, synthesize the current picture, and keep the project context file aligned with accepted decisions.

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
