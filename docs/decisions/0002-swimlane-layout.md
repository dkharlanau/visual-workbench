# ADR 0002: Two-phase swimlane layout

Status: accepted

## Context

Visual Workbench needs ownership/system swimlanes while preserving a single global process sequence across lanes. The graph can have frequent cross-lane edges.

ELK supports hierarchical and compound graphs through hierarchy handling. However, hierarchical containment and swimlane constraints are not the same problem. In particular, forcing nodes into compound parents can interfere with one global layered order across lanes; this limitation is visible in current ELK swimlane discussions.

References:

- https://eclipse.dev/elk/reference/options/org-eclipse-elk-hierarchyHandling.html
- https://github.com/kieler/elkjs/issues/327

## Decision

Use a two-phase strategy:

1. Run ELK on the full flat semantic graph to obtain global ordering/layering.
2. Project nodes into semantic lanes on the axis perpendicular to the primary reading direction.
3. Preserve ELK primary-axis coordinates unless overlap requires adjustment.
4. Rebuild orthogonal routes from the final lane-constrained node geometry.

## Consequences

- Cross-lane sequence remains globally understandable.
- Lane membership remains semantic metadata rather than graph containment.
- Output stays deterministic and headless.
- Parallel relationships receive bounded routing offsets.
- A future cluster/containment feature can use compound ELK separately without forcing swimlanes into the same abstraction.
