# Agent guide

Visual Workbench is intended to be easy for humans to author and easy for agents to generate.

## Core rule

Do not draw. Model meaning.

An agent should never invent x/y coordinates, colors, edge bends or decorative shapes. It should identify semantic entities and relationships, select a visual method, produce valid metadata, validate it, and let the renderer decide geometry.

## Agent workflow

1. Identify the user's communication goal: explain sequence, plan work, show data movement, reveal dependencies, show handoffs, expose checkpoints, or map relationships.
2. Choose the smallest suitable `kind` using `docs/visual-methods.md`.
3. Extract decision-relevant entities. Prefer 4–9 visible nodes for a first view; the source model itself may be richer.
4. Classify nodes (`step`, `system`, `data`, `checkpoint`, `milestone`, `outcome`, `risk`, etc.).
5. Classify relationships (`flow`, `data`, `dependency`, `control`, `exception`).
6. Put operational meaning into `status`, `owner`, `subtitle` and edge labels. Do not encode meaning through requested colors.
7. Use semantic `groups` only when ownership, system boundary or another mutually exclusive lane helps answer the question. If groups are used, assign every node to one lane.
8. If the same source must answer different questions or serve different audiences, define named `views` instead of duplicating models.
9. Use focus presets first; add explicit semantic filters only when they improve the question being answered.
10. Run `vwb validate <file>`.
11. Render and inspect. If a view is crowded, reduce that view's semantic scope before adding presentation controls.

## Quality rules

- One dominant reading path where a reading path exists.
- Normal flow remains visually dominant.
- Exceptions and risks are visible but do not take over the whole visual.
- Data objects may be nodes when they matter to the business meaning.
- Checkpoints are nodes when a reader needs to see where control happens.
- Do not duplicate a node just to improve layout.
- Use named views for executive, data, control or exception perspectives on one source.
- Use lanes for meaningful partitions, not visual decoration.
- A projected view should preserve meaningful connectivity; hidden intermediary detail must not silently break the visible flow.
