# Agent guide

Visual Workbench is intended to be easy for humans to author and easy for agents to generate.

## Core rule

Do not draw. Model meaning.

An agent should never invent x/y coordinates, colors, edge bends or decorative shapes. It should identify semantic entities and relationships, select a visual method, produce valid metadata, validate it, and let the renderer decide geometry.

## Agent workflow

1. Identify the user's communication goal: explain sequence, plan work, show data movement, reveal dependencies, show handoffs, expose checkpoints, or map relationships.
2. Choose the smallest suitable `kind` using `docs/visual-methods.md`.
3. Extract only decision-relevant entities. Prefer 4–9 nodes for a first view.
4. Classify nodes (`step`, `system`, `data`, `checkpoint`, `milestone`, `outcome`, `risk`, etc.).
5. Classify relationships (`flow`, `data`, `dependency`, `control`, `exception`).
6. Put operational meaning into `status`, `owner`, `subtitle` and edge labels. Do not encode meaning through requested colors.
7. Run `vwb validate <file>`.
8. Render and inspect. If the view is crowded, reduce semantic scope before adding layout hints.

## Quality rules

- One dominant reading path where a reading path exists.
- Normal flow remains visually dominant.
- Exceptions and risks are visible but do not take over the whole visual.
- Data objects may be nodes when they matter to the business meaning.
- Checkpoints are nodes when a user needs to see where control happens.
- Do not duplicate a node just to improve layout.
- Split a model into multiple views when one visual tries to answer different questions.
