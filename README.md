# Visual Workbench

**Describe meaning. Generate the visual.**

Visual Workbench is a metadata-driven visual modeling engine for processes, plans, data flows, checkpoints, dependencies and relationships. The source of truth is Markdown + structured metadata; layout and presentation are generated automatically.

The goal is not to be another drawing tool. It is a small visual language and engine that lets humans and AI describe **what things are and how they relate**, then produces consistent, business-readable views.

## Why

Most diagram-as-code tools still make authors think like diagram designers: boxes, arrows, shapes and layout hints. Visual Workbench moves the authoring layer up one level.

```text
Meaning                Visual method             Output
──────────────          ─────────────────         ─────────────
steps                   process                   SVG
systems                 system flow       ───▶    HTML
business data           data flow                  docs
milestones              planning                  future viewers
checkpoints             controls
risks / exceptions      exception emphasis
relationships           graph views
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
    - id: afs
      label: Customer created
      type: system
      subtitle: AFS
    - id: mdg
      label: Govern customer
      type: checkpoint
      subtitle: expected ≤ 5 min
      owner: Master Data
    - id: s4
      label: Customer available
      type: outcome
      subtitle: S/4HANA
      status: success
  edges:
    - from: afs
      to: mdg
      label: Customer
      type: data
    - from: mdg
      to: s4
      label: Business Partner
      type: flow
---
```

Render it:

```bash
npm install
npm run build
node dist/cli.js render examples/customer-creation.md -o customer-creation.svg
```

Or during development:

```bash
npx tsx src/cli.ts render examples/customer-creation.md -o customer-creation.svg
npx tsx src/cli.ts validate examples/customer-creation.md
npx tsx src/cli.ts inspect examples/customer-creation.md
```

## Engine

```text
Markdown
   ↓
YAML metadata
   ↓
Zod validation
   ↓
Graphology semantic graph
   ↓
Visual method + sizing policy
   ↓
ELK.js layered layout + orthogonal routing
   ↓
Visual Workbench renderer
   ├── SVG
   └── standalone HTML
```

- **Graphology** keeps the semantic graph independent from any renderer and gives us a path to graph analysis and agent queries.
- **ELK.js** handles layered directed layout, crossings and orthogonal routes.
- **Custom SVG rendering** keeps the business visual grammar under our control instead of inheriting a generic graph-library aesthetic.
- A future **Cytoscape.js adapter** can add deep interactive exploration without becoming the source of truth.

## Semantic vocabulary

Nodes: `step`, `system`, `data`, `role`, `decision`, `checkpoint`, `milestone`, `outcome`, `risk`, `note`.

Relationships: `flow`, `data`, `dependency`, `relation`, `control`, `exception`.

Visual methods in the first schema: `process`, `plan`, `data-flow`, `relationship`, `system-flow`, `checkpoint-flow`.

Status is semantic (`neutral`, `success`, `warning`, `danger`, `muted`). The renderer owns the actual presentation.

## Repository map

```text
src/
  schema.ts           metadata language
  parser.ts           Markdown/YAML ingestion + diagnostics
  model.ts            Graphology semantic graph
  layout.ts           ELK adapter + sizing policy
  themes.ts           presentation tokens
  renderers/          SVG + standalone HTML
  cli.ts              render / validate / inspect

examples/              reference models
docs/                  methodology, language, architecture, roadmap
tests/                 parser and rendering tests
```

## Design rules

1. Model meaning, never coordinates.
2. Prefer one clear reading path over visual completeness.
3. Treat data, controls and exceptions as first-class objects.
4. Keep normal flow visually dominant; make exceptions visible without making the whole canvas red.
5. Let one model generate multiple views in later versions.
6. Let AI produce or transform metadata, but keep final rendering deterministic.

See [the methodology](docs/methodology.md), [language reference](docs/language.md), [architecture](docs/architecture.md) and [roadmap](docs/roadmap.md).

## Status

`0.1.0` foundation: semantic Markdown → validated graph → automatic layout → SVG/HTML. Next: visual-method intelligence, swimlanes, multiple views and an interactive viewer.
