# Visual methods

Visual Workbench methods are decision rules, not fixed templates. They determine the layout family, reading direction, spacing and visual emphasis applied to one semantic graph.

| Question | Method | Use when |
| --- | --- | --- |
| What happens next? | `process` | The main meaning is an ordered sequence of work. |
| Where can the flow fail or be controlled? | `checkpoint-flow` | Gates, SLA, validation and exception paths matter. |
| How does information move? | `data-flow` | Data objects, transformations and system boundaries matter. |
| Which systems hand work to each other? | `system-flow` | Applications/services are the primary nodes. |
| What are we trying to achieve and in what order? | `plan` | Outcomes, milestones, risks and gates matter more than dates. |
| What changes by stage? | `roadmap` | A staged progression is more useful than a task list. |
| What happens over time? | `timeline` | Time ordering is the core message. |
| Who gives what to whom? | `handoff` | Responsibility or information transfer is the main risk. |
| What depends on what? | `dependency-map` | Blocking/enabling relationships are the main message. |
| How are these things connected? | `relationship` | There is no useful single hierarchy or primary sequence. |

## Method selection heuristic

Prefer a directed method when the user can naturally read the visual as “from A to B”. Prefer `relationship` only when forcing a sequence would distort the meaning.

For planning, start with `plan`; move to `roadmap` only when staged progression is the message and to `timeline` only when actual time order matters.

For operational processes, use `checkpoint-flow` instead of `process` when monitoring, SLA, validation or failure handling is central to the question.
