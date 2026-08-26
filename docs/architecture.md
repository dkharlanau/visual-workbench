# Architecture

```text
Markdown + YAML metadata
        │
        ▼
   Zod validation
        │
        ▼
 Graphology semantic graph
        │
        ▼
 Named view projection
 + semantic path contraction
        │
        ▼
 Visual method policy
        │
        ▼
      ELK.js
 global layout + base routing
        │
        ▼
 Semantic lane projection
 + deterministic rerouting
        │
        ▼
 Visual Workbench renderer
        │
        ├── SVG
        └── standalone HTML
```

## Separation of concerns

The semantic graph is independent from layout and rendering. A future interactive viewer, PNG exporter, PowerPoint adapter or agent skill can reuse the model without becoming the source of truth.

ELK.js owns global graph geometry. Visual Workbench owns visual method selection, semantic projection, lane composition, hierarchy, density, status emphasis and business-facing presentation.

## Why lanes are a second layout phase

ELK supports hierarchical graphs, but ownership swimlanes are not simply parent/child graph hierarchy. A process still needs one global layering across lanes and cross-lane edges.

Visual Workbench therefore first computes the global graph structure, then constrains the perpendicular axis by semantic lane and recalculates orthogonal routes. This preserves the graph's global progression while making ownership explicit.

See [ADR 0002](decisions/0002-swimlane-layout.md).

## Package boundaries

- `schema.ts` — versioned metadata contract
- `parser.ts` — Markdown/YAML ingestion and semantic diagnostics
- `model.ts` — Graphology graph construction and summaries
- `views.ts` — named view projection and hidden-path contraction
- `methods.ts` — layout policy by communication method
- `layout.ts` — ELK conversion and global layout
- `lanes.ts` — lane geometry and post-layout edge routing
- `renderers/svg.ts` — deterministic business visual grammar
- `renderers/html.ts` — portable document wrapper
- `cli.ts` — render, validate, inspect and named-view commands
