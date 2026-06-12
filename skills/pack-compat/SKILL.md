---
name: pack-compat
description: Evaluate whether analyzed Minecraft mods fit the current modpack. Use when deciding adoption status, conflicts, overlaps, blockers, required adaptations, or compatibility report updates for candidate or selected mods.
---

Decide whether a mod is reasonable for the current pack, not whether it looks interesting in isolation.

---

## Required context

Read:

1. `pack-state\project-context.json`
2. Relevant `pack-state\mod-analyses\*.json`
3. Prior `pack-state\compat-reports\*.json` for similar capabilities

---

## Evaluation dimensions

Check the chosen mod against current pack state:

- loader and Minecraft version alignment
- server-first suitability
- overlap with already accepted mods
- dependency burden
- command / permission overlap
- worldgen overlap
- progression or balance distortion
- operational cost
- documentation burden

---

## Decision model

Always classify the result:

- `fit`
- `fit_with_conditions`
- `hold`
- `reject`

For non-trivial cases, include:

- why
- blockers
- required adaptation steps
- what must be configured before enabling
- whether another mod should be removed or replaced

---

## Output artifact

Create or update:

- `pack-state\compat-reports\<slug-or-combo>.json`

Use the `minecraft-pack-builder` skill's `compat-report.template.json` template as the output shape for new reports.

When a mod is accepted, make sure the compatibility result can be referenced back from `pack-state\project-context.json`.

---

## Guardrails

- Judge relative to the current pack, not generic mod quality
- Avoid soft, vague conclusions; be explicit about adoption state
- If data is missing, say what evidence is missing instead of pretending certainty
