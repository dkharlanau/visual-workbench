---
name: visualize-process
summary: Turn a process description into a compact business process or checkpoint-flow model.
---

# Visualize process

Use `process` for the normal sequence. Use `checkpoint-flow` when gates, validation, SLA or exception handling matter.

Keep the happy path dominant. Represent a failure as an `exception` edge to a `risk` node rather than coloring every step as a warning. Promote a validation or SLA to a `checkpoint` node when a business reader needs to see where control happens.

Typical node vocabulary: `step`, `system`, `checkpoint`, `decision`, `outcome`, `risk`.
