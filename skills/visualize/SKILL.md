---
name: visualize
summary: Convert raw business information into a Visual Workbench semantic model and choose the clearest visual method.
---

# Visualize

Use this skill when the user wants information represented visually but has not specified a diagram notation.

1. Determine the question the visual must answer.
2. Select a method using `docs/visual-methods.md`.
3. Produce the smallest semantic graph that preserves the user's meaning.
4. Use semantic node and edge types rather than generic boxes.
5. Preserve uncertainty, exceptions, ownership and checkpoints when they matter.
6. Generate Visual Workbench Markdown front matter.
7. Validate before rendering.

Do not add coordinates or manual colors. If the visual needs many caveats, create a second view instead of overloading the first.
