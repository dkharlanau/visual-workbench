# Visual metadata language

A Visual Workbench source is ordinary Markdown with a `visual` object in YAML front matter. The canonical machine-readable contract is [`schemas/visual-workbench.schema.json`](../schemas/visual-workbench.schema.json).

```yaml
---
visual:
  title: Customer creation
  kind: checkpoint-flow
  groups:
    - id: business
      label: Business
      order: 1
    - id: platform
      label: Platform
      order: 2
  nodes:
    - id: source
      label: Customer created
      type: outcome
      group: business
    - id: gate
      label: Validate and govern
      type: checkpoint
      group: platform
    - id: target
      label: Customer available
      type: outcome
      group: business
      status: success
  edges:
    - from: source
      to: gate
      type: data
    - from: gate
      to: target
      type: flow
  views:
    - id: executive
      focus: executive
      kind: process
---
```

## Document fields

| Field | Values | Purpose |
| --- | --- | --- |
| `version` | positive integer | Metadata language version |
| `title` | string | Human-facing title |
| `description` | string | One-line context |
| `kind` | process, checkpoint-flow, data-flow, system-flow, plan, roadmap, timeline, handoff, dependency-map, relationship | Default visual method |
| `direction` | right, down, left, up | Primary reading direction |
| `theme` | paper, slate | Presentation theme |
| `density` | airy, balanced, compact | Spacing policy |
| `groups` | array | Optional semantic swimlanes |
| `nodes` | array | Semantic entities |
| `edges` | array | Semantic relationships |
| `views` | array | Optional named projections of the same semantic model |

## Group fields

Required: `id`, `label`.

Optional: `kind` (`lane`), `description`, `order`.

When groups are present, every node must reference a valid group. Group IDs are unique. Views may filter groups with `includeGroups` and `excludeGroups`.

## Node fields

Required: `id`, `label`.

Optional: `type`, `subtitle`, `description`, `owner`, `group`, `status`, `tags`.

Statuses are `neutral`, `success`, `warning`, `danger`, and `muted`. Status describes meaning, not a user-selected color.

## Edge fields

Required: `from`, `to`.

Optional: `label`, `type`, `status`, `note`.

## View fields

Required: `id`.

A view may use `title`, `description`, `focus`, `kind`, `direction`, `theme`, `density`, `includeNodeTypes`, `excludeNodeTypes`, `includeGroups`, `excludeGroups`, `includeTags`, `statuses`, `includeEdgeTypes` and `excludeEdgeTypes`.

Focus presets are `all`, `executive`, `flow`, `data`, `controls` and `exceptions`. See [`docs/views.md`](views.md).

The parser rejects duplicate node/group/view IDs, missing relationship targets, invalid group references and self-loops.
