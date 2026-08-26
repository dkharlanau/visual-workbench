# Visual metadata language

A Visual Workbench source is ordinary Markdown with a `visual` object in YAML front matter.

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
| `kind` | process, plan, data-flow, relationship, system-flow, checkpoint-flow | Visual method |
| `direction` | right, down, left, up | Primary reading direction |
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
