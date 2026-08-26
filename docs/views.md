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

The original model is not changed. The derived edge exists only inside that projected view and carries a note describing the collapsed path.

Path contraction is bounded to avoid uncontrolled graph traversal and is deterministic for the same source model.

## CLI

```bash
# List declared views
vwb views examples/supply-chain.md

# Render one view
vwb render examples/supply-chain.md --view executive -o executive.svg

# Inspect one projected semantic graph
vwb inspect examples/supply-chain.md --view controls

# Render every named view
vwb render-views examples/supply-chain.md --output-dir .artifacts/views
```
