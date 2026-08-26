# Semantic groups and swimlanes

Groups model a meaningful partition of a flow: ownership, responsibility, system boundary, team, processing zone or another mutually exclusive lane.

They are not generic colored containers.

## Source model

```yaml
groups:
  - id: business
    label: Business
    order: 1
  - id: integration
    label: Integration
    order: 2
  - id: erp
    label: ERP
    order: 3

nodes:
  - id: approve
    label: Approve order
    type: outcome
    group: business
  - id: validate
    label: Validate message
    type: checkpoint
    group: integration
  - id: create
    label: Create sales order
    type: system
    group: erp
```

When `groups` are declared, every node must reference one group. This prevents ambiguous lane placement.

`order` controls the semantic order of lanes, not node coordinates.

## Orientation

The lane orientation follows the reading direction automatically:

- `right` / `left` → horizontal lanes stacked vertically
- `down` / `up` → vertical lanes arranged horizontally

The author still describes meaning only.

## Layout strategy

Visual Workbench intentionally uses two phases.

1. ELK lays out the complete semantic graph without hierarchy so global flow, layering and crossings are considered together.
2. Visual Workbench projects nodes into their semantic lanes while preserving the primary-axis positions as much as possible, resolves same-lane overlap, and deterministically rebuilds orthogonal edge routes.

This avoids treating lane ownership as if it were graph hierarchy.

## Named views

Views and groups compose cleanly. After a named view filters nodes, groups with no remaining nodes are removed before layout.

If an intermediate node was hidden, path contraction happens before lane layout, so the visible handoff remains connected.

## Good lane dimensions

Use lanes for questions such as:

- Who owns each step?
- Which system performs the work?
- Where does a handoff occur?
- Where does responsibility cross an organizational or technical boundary?

Do not use lanes merely to categorize every node. Use `tags` for non-spatial classification.
