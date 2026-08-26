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
        ├── graph inspection / future analysis
        │
        ▼
  View + sizing policy
        │
        ▼
      ELK.js
 layered layout + orthogonal routing
        │
        ▼
 Visual Workbench renderer
        │
        ├── SVG
        └── standalone HTML
```

## Why this split

The semantic graph is deliberately independent from layout and rendering. A future React/Cytoscape viewer, PNG exporter, PowerPoint adapter or agent skill can reuse the model without becoming the source of truth.

ELK.js owns geometry. Visual Workbench owns visual grammar: hierarchy, density, node semantics, colors, labels, exception emphasis and business-facing defaults.

## Package boundaries

- `schema.ts` — versioned metadata contract
- `parser.ts` — Markdown/YAML ingestion and structural diagnostics
- `model.ts` — Graphology graph construction and graph-level summaries
- `layout.ts` — conversion to/from ELK and sizing policy
- `renderers/svg.ts` — deterministic visual grammar
- `renderers/html.ts` — portable document wrapper
- `cli.ts` — render, validate and inspect commands
