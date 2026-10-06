# Named views

A Visual Workbench model can define several business-facing views without duplicating the semantic source.

```yaml
views:
  - id: executive
    title: Supply chain overview
    focus: executive
    kind: process
    density: airy

  - id: information
    title: Supply chain information flow
    focus: data
    kind: data-flow

  - id: exceptions
    title: Supply chain exceptions
    focus: exceptions
    kind: checkpoint-flow
```

## Focus presets

| Focus | Intent |
| --- | --- |
| `all` | Keep the complete model. |
| `executive` | Keep systems, outcomes, milestones, decisions, controls and risks; remove low-level data/notes. |
| `flow` | Emphasize the main operational progression. |
| `data` | Focus on data nodes, data relationships and their immediate context. |
| `controls` | Focus on checkpoints, decisions, risks, control/exception edges and their context. |
| `exceptions` | Focus on risks, danger status, exception paths and their immediate context. |

A view can also override `kind`, `direction`, `theme` and `density`. This means one semantic graph can use different visual methods for different questions.

## Explicit filters

Views may additionally use:

- `includeNodeTypes` / `excludeNodeTypes`
- `includeGroups` / `excludeGroups`
- `includeTags`
- `statuses`
- `includeEdgeTypes` / `excludeEdgeTypes`

Preset selection happens first; explicit filters then narrow the result.

## Semantic path contraction

Simply hiding a node can destroy meaning. Consider:

```text
Supplier → ASN data → Inbound checkpoint
```

An executive view may intentionally hide the ASN object. Visual Workbench detects the hidden directed path and preserves connectivity as a derived relationship:

```text
Supplier ── via Advance shipment notice ──▶ Inbound checkpoint
```

The original model is not changed. The derived edge exists only inside that projected view.

Collapsed paths are aggregated conservatively:

- warning or danger on a hidden node or source edge survives on the derived relationship;
- success is never inferred for a collapsed relationship;
- parallel hidden paths with the same visible endpoints and relationship type are aggregated with maximum retained severity;
- a direct visible edge does not suppress a meaningful hidden alternative;
- bounded source-path references and hidden node IDs are attached as projection provenance.

Path exploration is bounded to avoid uncontrolled graph traversal. The default limits are six hidden nodes and 256 exploration states per visible source. Encountered depth, cycle, or exploration-budget limits are reported instead of being treated as evidence that no relationship exists.

Every named projection also carries a document-level projection report with visible/source counts, hidden risk IDs and completeness limits. SVG/HTML output shows a compact scope disclosure, while `vwb inspect --view ...` exposes the structured report and collapsed-edge provenance for machine review.

## CLI

```bash
# List declared views
vwb views examples/supply-chain.md

# Render one view
vwb render examples/supply-chain.md --view executive -o executive.svg

# Inspect one projected semantic graph, including projection scope/provenance
vwb inspect examples/supply-chain.md --view controls

# Render every named view
vwb render-views examples/supply-chain.md --output-dir .artifacts/views
```
