# Visual Workbench methodology

Visual Workbench treats a visual as a **view of structured meaning**, not as a drawing.

## Principles

1. **Model meaning, not coordinates.** Authors describe steps, systems, data, decisions, outcomes, checkpoints, risks and their relationships.
2. **One semantic vocabulary, multiple visual methods.** Process, planning, data-flow and relationship views share the same core graph model.
3. **Business readability beats diagram completeness.** The engine should remove visual noise before adding detail.
4. **Exceptions are first-class.** Failure paths, risks and controls should never be hidden inside prose.
5. **Deterministic output.** A committed model should render the same way in local CLI, CI and documentation.
6. **Progressive disclosure.** A future model may produce executive, operating and technical views without duplicating the source.
7. **AI chooses a method; the renderer enforces it.** Agents can classify content and populate metadata, while final geometry and styling remain deterministic.

## Core semantic vocabulary

### Nodes

- `step` — activity or action
- `system` — application, service or environment
- `data` — business object, message or dataset
- `role` — person, team or responsibility
- `decision` — branch or choice
- `checkpoint` — validation, SLA, gate or control
- `milestone` — significant point in a plan
- `outcome` — intended business result
- `risk` — exception, issue or uncertainty
- `note` — supporting context

### Relationships

- `flow` — normal progression
- `data` — movement or transformation of information
- `dependency` — prerequisite
- `relation` — semantic association represented directionally for layout
- `control` — checkpoint, validation or governance link
- `exception` — failure or alternate path

## Visual methods

The first release maps semantic models into six methods: `process`, `plan`, `data-flow`, `relationship`, `system-flow`, and `checkpoint-flow`.

The method is not a template with fixed boxes. It is a set of layout, emphasis and simplification rules. Later versions will add automatic method selection and view generation.
