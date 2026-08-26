# Visual Workbench

**Describe meaning. Generate the visual.**

Visual Workbench is a metadata-driven visual modeling engine for processes, plans, data flows, checkpoints, handoffs, dependencies and relationships. The source of truth is Markdown + structured metadata; layout and presentation are generated automatically.

The goal is not to be another drawing tool. It is a small visual language, method library and rendering engine that lets humans and agents describe **what things are and how they relate**, then produces consistent, business-readable views.

## Why

Most diagram-as-code tools still make authors think like diagram designers: boxes, arrows, shapes and layout hints. Visual Workbench moves the authoring layer up one level.

```text
Meaning                   Visual method             Output
──────────────────        ─────────────────         ─────────────
steps                      process                   SVG
systems                    system flow        ───▶   HTML
business data              data flow                  docs
milestones / outcomes      plan / roadmap             agent views
checkpoints                checkpoint flow
handoffs                   handoff
risks / exceptions         exception emphasis
relationships              relationship map
```

A model contains no x/y coordinates and no manually chosen colors.

## Example

```yaml
---
visual:
  version: 1
  title: Customer creation
  description: Creation path with an operational checkpoint.
  kind: checkpoint-flow
  direction: right
  theme: paper
  density: airy
  nodes:
    - id: source
      label: Customer created
      type: system
    - id: gate
      label: Govern customer
      type: checkpoint
      subtitle: expected ≤ 5 min
      owner: Master Data
    - id: target
      label: Customer available
      type: outcome
      status: success
  edges:
    - from: source
      to: gate
      label: Customer
      type: data
    - from: gate
      to: target
      label: Business object
      type: flow
---
```

```bash
npm install
npm run build
node dist/cli.js render examples/customer-creation.md -o customer-creation.svg
node dist/cli.js validate examples/customer-creation.md
node dist/cli.js inspect examples/customer-creation.md
```

## Engine

```text
Markdown + semantic metadata
            ↓
       Zod validation
            ↓
 Graphology semantic graph
            ↓
      Visual method policy
            ↓
   ELK.js layout + routing
            ↓
 Visual Workbench visual grammar
            ├── SVG
            └── standalone HTML
```

- **Graphology** keeps the semantic graph independent from any renderer and leaves room for graph analysis and agent queries.
- **ELK.js** owns geometry: layered flow layouts, non-linear relationship layouts and edge routing.
- **Custom SVG rendering** keeps the business visual grammar under our control instead of inheriting a generic graph-library aesthetic.
- A future **Cytoscape.js adapter** can provide interactive exploration without becoming the source of truth.

## Visual methods

`process`, `checkpoint-flow`, `data-flow`, `system-flow`, `plan`, `roadmap`, `timeline`, `handoff`, `dependency-map`, `relationship`.

`kind` is not just a label. Each method maps to a layout policy. For example, directed flows use layered layouts while relationship maps switch to a non-hierarchical stress layout.

See [visual method selection](docs/visual-methods.md).

## Semantic vocabulary

Nodes: `step`, `system`, `data`, `role`, `decision`, `checkpoint`, `milestone`, `outcome`, `risk`, `note`.

Relationships: `flow`, `data`, `dependency`, `relation`, `control`, `exception`.

Status is semantic (`neutral`, `success`, `warning`, `danger`, `muted`). The renderer owns the actual presentation.

## Agent-ready

`AGENTS.md` defines the core rule: **do not draw; model meaning**. Reusable skills in `skills/` teach agents to choose a method and generate compact semantic models for processes, plans and data flows.

The JSON Schema at `schemas/visual-workbench.schema.json` is intended for IDE validation and agent tooling.

## Repository map

```text
src/
  schema.ts           metadata language
  parser.ts           Markdown/YAML ingestion + diagnostics
  model.ts            Graphology semantic graph
  methods.ts          visual method policies
  layout.ts           ELK adapter + sizing policy
  themes.ts           presentation tokens
  renderers/          SVG + standalone HTML
  cli.ts              render / validate / inspect

examples/              process, plan, data and supply-chain reference models
docs/                  methodology, language, architecture and roadmap
schemas/               machine-readable metadata contract
skills/                reusable visual-thinking agent skills
tests/                 parser, method and rendering tests
```

## Design rules

1. Model meaning, never coordinates.
2. Prefer one clear reading path over visual completeness.
3. Treat data, controls and exceptions as first-class objects.
4. Keep normal flow visually dominant; make exceptions visible without making the whole canvas red.
5. Choose the visual method from the question the reader needs answered.
6. Let one model generate multiple views in later versions.
7. Let agents produce or transform metadata, but keep final rendering deterministic.

See [the methodology](docs/methodology.md), [language reference](docs/language.md), [architecture](docs/architecture.md), [visual methods](docs/visual-methods.md) and [roadmap](docs/roadmap.md).

## Status

`0.1.0` foundation: semantic Markdown → validated graph → method-specific automatic layout → SVG/HTML. Next: groups/swimlanes, named views, visual regression and an interactive viewer.
