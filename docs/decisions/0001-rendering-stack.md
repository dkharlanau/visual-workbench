# ADR 0001: Semantic graph + ELK + custom SVG

Status: accepted

## Context

Visual Workbench needs to render processes, plans, data flows and relationship views from semantic metadata. The source format must remain independent from a particular UI framework or graph renderer.

## Decision

Use three separate layers:

1. **Graphology** for the in-memory semantic graph and future graph queries/analysis.
2. **ELK.js** for automatic graph layout, especially layered directed diagrams and orthogonal edge routing.
3. **A custom SVG renderer** for the business-facing visual grammar.

Cytoscape.js is intentionally deferred to an interactive viewer adapter. It should consume the semantic graph rather than define it.

## Consequences

- Markdown sources contain no coordinates.
- The same model can render in CLI, CI and future web viewers.
- Visual styling remains product-specific instead of inheriting a generic graph library look.
- New layout strategies can be added without changing the metadata language.
- Interactive graph exploration can be layered on later without coupling the core package to a browser UI.
