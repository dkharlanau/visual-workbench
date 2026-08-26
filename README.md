# Visual Workbench

**Describe meaning. Generate the visual.**

Visual Workbench is a metadata-driven visual modeling engine for processes, plans, data flows, checkpoints, handoffs, dependencies and relationships. The source of truth is Markdown + structured metadata; layout and presentation are generated automatically.

The goal is not to be another drawing tool. It is a small visual language, method library and rendering engine that lets humans and agents describe **what things are and how they relate**, then produces consistent, business-readable views.

## What makes it different

Most diagram-as-code tools still make authors think like diagram designers: boxes, arrows, shapes and layout hints. Visual Workbench moves the authoring layer up one level.

```text
Semantic source
    │
    ├── process / handoff view
    ├── executive view
    ├── data view
    ├── controls view
    └── exceptions view
              │
              ▼
     automatic business visual
```

A model contains no x/y coordinates and no manually chosen colors.

## Example

```yaml
---
visual:
  title: Order fulfillment
  kind: handoff
  groups:
    - id: business
      label: Business
      order: 1
    - id: platform
      label: Platform
      order: 2
  nodes:
    - id: request
      label: Order approved
      type: outcome
      group: business
    - id: validate
      label: Validate payload
      type: checkpoint
      group: platform
    - id: available
      label: Order available
      type: outcome
      group: business
      status: success
  edges:
    - from: request
      to: validate
      type: data
    - from: validate
      to: available
      type: flow
  views:
    - id: executive
      focus: executive
      kind: process
---
```

```bash
npm install
npm run build
node dist/cli.js render examples/order-fulfillment-lanes.md -o handoffs.svg
node dist/cli.js render examples/order-fulfillment-lanes.md --view executive -o executive.svg
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
  ELK.js global graph layout
            ↓
 lane projection + edge rerouting
            ↓
 Visual Workbench visual grammar
            ├── SVG
            └── standalone HTML
```

- **Graphology** keeps the semantic graph independent from layout and rendering.
- **ELK.js** establishes the global graph structure and flow.
- **Visual Workbench lane composition** preserves ELK's global sequence while placing nodes into semantic ownership lanes and rebuilding orthogonal routes.
- **Custom SVG rendering** keeps the business-facing visual grammar under our control.
- A future **Cytoscape.js adapter** can provide interactive exploration without becoming the source of truth.

## Visual methods

`process`, `checkpoint-flow`, `data-flow`, `system-flow`, `plan`, `roadmap`, `timeline`, `handoff`, `dependency-map`, `relationship`.

`kind` is not just a label. Each method maps to a layout policy. Directed flows use layered layouts while relationship maps switch to a non-hierarchical stress layout.

See [visual method selection](docs/visual-methods.md).

## One model, multiple views

Named views answer different questions from the same semantic source. Built-in focus presets are `all`, `executive`, `flow`, `data`, `controls` and `exceptions`. A view can override the visual method and apply semantic filters.

When a view hides an intermediate node, Visual Workbench contracts the hidden directed path so the visible business flow remains connected instead of producing disconnected boxes.

See [named views](docs/views.md).

## Semantic lanes

`groups` turn ownership, systems or responsibility boundaries into swimlanes. For left-to-right flows the lanes are horizontal; for top-to-bottom flows they become vertical automatically. Every node must belong to a lane when lane groups are active.

Named views automatically remove lanes that become empty after projection.

See [semantic groups and swimlanes](docs/groups.md).

## Semantic vocabulary

Nodes: `step`, `system`, `data`, `role`, `decision`, `checkpoint`, `milestone`, `outcome`, `risk`, `note`.

Relationships: `flow`, `data`, `dependency`, `relation`, `control`, `exception`.

Status is semantic (`neutral`, `success`, `warning`, `danger`, `muted`). The renderer owns the actual presentation.

## Agent-ready

`AGENTS.md` defines the core rule: **do not draw; model meaning**. Reusable skills in `skills/` teach agents to choose a method, build a compact semantic source and define views or lanes only when they improve the reader's question.

The JSON Schema at `schemas/visual-workbench.schema.json` is intended for IDE validation and agent tooling.

## Repository map

```text
src/
  schema.ts           metadata language
  parser.ts           Markdown/YAML ingestion + diagnostics
  model.ts            Graphology semantic graph
  views.ts            named-view projection + path contraction
  methods.ts          visual method policies
  layout.ts           ELK adapter + base graph geometry
  lanes.ts            semantic lane projection + orthogonal rerouting
  themes.ts           presentation tokens
  renderers/          SVG + standalone HTML
  cli.ts              render / views / render-views / validate / inspect

examples/              process, plan, data, supply-chain and handoff models
docs/                  methodology, language, views, groups, architecture and roadmap
schemas/               machine-readable metadata contract
skills/                reusable visual-thinking agent skills
tests/                 parser, method, view, lane and rendering tests
```

## Design rules

1. Model meaning, never coordinates.
2. Prefer one clear reading path over visual completeness.
3. Treat data, controls and exceptions as first-class objects.
4. Keep normal flow visually dominant; make exceptions visible without making the whole canvas red.
5. Choose the visual method from the question the reader needs answered.
6. Generate multiple views from one semantic model instead of duplicating sources.
7. Preserve meaningful connectivity when a view hides intermediate detail.
8. Use lanes for meaningful partitions such as ownership or system boundaries, not decoration.
9. Let agents produce or transform metadata, but keep final rendering deterministic.

See [methodology](docs/methodology.md), [language](docs/language.md), [architecture](docs/architecture.md), [visual methods](docs/visual-methods.md), [named views](docs/views.md), [groups](docs/groups.md) and [roadmap](docs/roadmap.md).

## Status

Current foundation: semantic Markdown → validated graph → named semantic views → method-specific ELK layout → semantic swimlanes → SVG/HTML. Next: richer roadmap/timeline grammar, visual regression, cluster views and an interactive workbench.
