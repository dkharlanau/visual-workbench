---
visual:
  version: 1
  title: Product launch plan
  description: Outcome-led planning with milestones, dependencies and risk.
  kind: plan
  direction: right
  theme: paper
  density: balanced
  nodes:
    - id: goal
      label: Validate problem
      type: outcome
      subtitle: Evidence before build
      status: success
    - id: prototype
      label: Working prototype
      type: milestone
      subtitle: End-to-end thin slice
    - id: pilot
      label: Pilot with users
      type: checkpoint
      subtitle: Measure usefulness
    - id: launch
      label: Public release
      type: outcome
      subtitle: Docs + examples + package
    - id: risk
      label: Visual complexity grows
      type: risk
      subtitle: Guard with design constraints
      status: warning
  edges:
    - from: goal
      to: prototype
      type: dependency
    - from: prototype
      to: pilot
      label: Learn
      type: flow
    - from: pilot
      to: launch
      label: Evidence
      type: flow
    - from: prototype
      to: risk
      label: Watch
      type: control
---

The plan is modeled as outcomes and checkpoints instead of a generic task list.
