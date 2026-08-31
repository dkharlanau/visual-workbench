# Visual Workbench

**Describe meaning. Generate the visual.**

Visual Workbench is a metadata-driven visual modeling engine for processes, plans, data flows, checkpoints, handoffs, dependencies and relationships. The source of truth is Markdown + structured metadata; layout and presentation are generated automatically.

[Open the live generated gallery](https://dkharlanau.github.io/visual-workbench/).

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

The package is not published to the npm registry. The supported v0.1 path is to run it from a checked-out repository with Node.js 20 or later:

```bash
git clone https://github.com/dkharlanau/visual-workbench.git
cd visual-workbench
npm ci
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

## Staged roadmaps

`stages` express ordered planning periods such as Now, Next, Pilot and Scale. The renderer derives bands, spacing and edge routes; authors assign meaning without drawing columns. Every node must belong to a stage while stages are active. Stages and lane groups cannot be combined in one model yet.

```bash
node dist/cli.js render examples/product-roadmap.md -o product-roadmap.svg
node dist/cli.js render examples/product-roadmap.md --view outcomes -o roadmap-outcomes.svg
```

Named views can use `includeStages` and `excludeStages` to focus on selected periods. See the [metadata language](docs/language.md) and the [complete roadmap example](examples/product-roadmap.md).

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
  stages.ts           ordered roadmap stage composition + routing
  themes.ts           presentation tokens
  renderers/          SVG + standalone HTML
  cli.ts              render / views / render-views / validate / inspect

examples/              process, plan, roadmap, data, supply-chain and handoff models
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
9. Use stages for meaningful planning periods, not manually drawn columns.
10. Let agents produce or transform metadata, but keep final rendering deterministic.

See [methodology](docs/methodology.md), [language](docs/language.md), [architecture](docs/architecture.md), [visual methods](docs/visual-methods.md), [named views](docs/views.md), [groups](docs/groups.md) and [roadmap](docs/roadmap.md).

## Related projects

- [Enterprise Architecture Composer](https://github.com/dkharlanau/enterprise-architecture-composer) emits native coordinate-free Visual Workbench Markdown. The pinned [compatibility workflow](docs/enterprise-architecture-composer.md) generates a real architecture and renders all four named views; it is evidence for the tested revisions only.
- [Project Evidence Graph](https://github.com/dkharlanau/project-evidence-graph) remains the traceability source for the read-only [Project Evidence adapter](docs/project-evidence-graph.md). Visual Workbench preserves evidence references but does not revalidate them.
- [Mapping as Code](https://github.com/dkharlanau/mapping-as-code) can emit a semantic data-flow projection as described in the [mapping integration guide](docs/mapping-as-code.md). Mapping rules remain owned by the producer.
- [Agent-Ready Web Profile](https://github.com/dkharlanau/agent-ready-web-profile) can describe the public gallery, manifest and schema as discoverable web surfaces. It does not validate visual semantics.
- [AI CV Builder](https://github.com/dkharlanau/ai-cv-builder) may link to a published visual as evidence, but there is no direct model exchange between the projects.

## Status

**v0.1 source distribution.** Semantic Markdown → validated graph → named semantic views → method-specific ELK layout → semantic swimlanes or roadmap stages → SVG/HTML is implemented and exercised by the public generated gallery. npm publication is not part of the current distribution contract. Next: timeline-specific date grammar, visual regression, cluster views and an interactive workbench.

## License

MIT. See [`LICENSE`](LICENSE).

## About the author

Created and maintained by **Dzmitryi Kharlanau**, an SAP consultant and system analyst working across enterprise architecture, data, integration, operations, and practical AI.

- [Website and knowledge base](https://dkharlanau.github.io/)
- [LinkedIn](https://www.linkedin.com/in/dkharlanau/)
