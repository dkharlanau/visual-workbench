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
milestones / outcomes      plan / roadmap             named views
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
  nodes:
    - id: source
      label: Customer created
      type: system
    - id: gate
      label: Govern customer
      type: checkpoint
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
      type: flow
  views:
    - id: executive
      title: Customer availability
      focus: executive
      kind: process
    - id: controls
      focus: controls
      kind: checkpoint-flow
---
```

```bash
npm install
npm run build
node dist/cli.js render examples/supply-chain.md --view executive -o executive.svg
node dist/cli.js views examples/supply-chain.md
node dist/cli.js render-views examples/supply-chain.md --output-dir .artifacts/views
```

## Engine

```text
Markdown + semantic metadata
            ↓
       Zod validation
            ↓
 Graphology semantic graph
            ↓
    Named view projection
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

`kind` is not just a label. Each method maps to a layout policy. Directed flows use layered layouts while relationship maps switch to a non-hierarchical stress layout.

See [visual method selection](docs/visual-methods.md).

## One model, multiple views

Named views answer different questions from the same semantic source. Built-in focus presets are `all`, `executive`, `flow`, `data`, `controls` and `exceptions`. A view can also override the visual method and apply semantic filters.

When a view hides an intermediate node, Visual Workbench can contract that hidden directed path so the visible business flow remains connected instead of producing disconnected boxes.

See [named views](docs/views.md).

## Semantic vocabulary

Nodes: `step`, `system`, `data`, `role`, `decision`, `checkpoint`, `milestone`, `outcome`, `risk`, `note`.

Relationships: `flow`, `data`, `dependency`, `relation`, `control`, `exception`.

Status is semantic (`neutral`, `success`, `warning`, `danger`, `muted`). The renderer owns the actual presentation.

## Agent-ready

`AGENTS.md` defines the core rule: **do not draw; model meaning**. Reusable skills in `skills/` teach agents to choose a method, build a compact semantic source and define views when one source must serve several audiences.

The JSON Schema at `schemas/visual-workbench.schema.json` is intended for IDE validation and agent tooling.

## Repository map

```text
src/
  schema.ts           metadata language
  parser.ts           Markdown/YAML ingestion + diagnostics
  model.ts            Graphology semantic graph
  views.ts            named-view projection + path contraction
  methods.ts          visual method policies
  layout.ts           ELK adapter + sizing policy
  themes.ts           presentation tokens
  renderers/          SVG + standalone HTML
  cli.ts              render / views / render-views / validate / inspect

examples/              process, plan, data and supply-chain reference models
docs/                  methodology, language, views, architecture and roadmap
schemas/               machine-readable metadata contract
skills/                reusable visual-thinking agent skills
tests/                 parser, method, view and rendering tests
```

## Design rules

1. Model meaning, never coordinates.
2. Prefer one clear reading path over visual completeness.
3. Treat data, controls and exceptions as first-class objects.
4. Keep normal flow visually dominant; make exceptions visible without making the whole canvas red.
5. Choose the visual method from the question the reader needs answered.
6. Generate multiple views from one semantic model instead of duplicating sources.
7. Preserve meaningful connectivity when a view hides intermediate detail.
8. Let agents produce or transform metadata, but keep final rendering deterministic.

See [the methodology](docs/methodology.md), [language reference](docs/language.md), [architecture](docs/architecture.md), [visual methods](docs/visual-methods.md), [named views](docs/views.md) and [roadmap](docs/roadmap.md).

## Status

Current foundation: semantic Markdown → validated graph → named semantic views → method-specific automatic layout → SVG/HTML. Next: semantic groups/swimlanes, stronger timeline/roadmap grammar, visual regression and an interactive viewer.
