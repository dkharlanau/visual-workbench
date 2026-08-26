# Visual metadata language

A Visual Workbench source is ordinary Markdown with a `visual` object in YAML front matter. The canonical machine-readable contract is [`schemas/visual-workbench.schema.json`](../schemas/visual-workbench.schema.json).

```yaml
---
visual:
  version: 1
  title: Customer creation
  description: From source creation to target availability.
  kind: checkpoint-flow
  direction: right
  theme: paper
  density: balanced
  nodes:
    - id: source
      label: Customer created
      type: system
      subtitle: Source application
    - id: gate
      label: Validate and govern
      type: checkpoint
      owner: Master Data
    - id: target
      label: Customer available
      type: outcome
      status: success
  edges:
    - from: source
      to: gate
      label: Customer
      type: data
    - from: gate
      to: target
      type: flow
---
```

## Document fields

| Field | Values | Purpose |
| --- | --- | --- |
| `version` | positive integer | Metadata language version |
| `title` | string | Human-facing title |
| `description` | string | One-line context |
| `kind` | process, checkpoint-flow, data-flow, system-flow, plan, roadmap, timeline, handoff, dependency-map, relationship | Visual method |
| `direction` | right, down, left, up | Primary reading direction where the method uses one |
| `theme` | paper, slate | Presentation theme |
| `density` | airy, balanced, compact | Spacing policy |
| `nodes` | array | Semantic entities |
| `edges` | array | Semantic relationships |

## Node fields

Required: `id`, `label`.

Optional: `type`, `subtitle`, `description`, `owner`, `group`, `status`, `tags`.

Statuses are `neutral`, `success`, `warning`, `danger`, and `muted`. Status describes meaning, not a user-selected color.

## Edge fields

Required: `from`, `to`.

Optional: `label`, `type`, `status`, `note`.

The parser rejects duplicate node IDs, missing relationship targets and self-loops. This keeps the source useful as machine-readable context, not only as diagram input.

Method-selection guidance lives in [`docs/visual-methods.md`](visual-methods.md).
