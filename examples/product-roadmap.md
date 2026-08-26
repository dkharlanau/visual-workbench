---
visual:
  version: 1
  title: Visual Workbench product roadmap
  description: Outcome-led roadmap from visual language to a reusable business visualization platform.
  kind: roadmap
  direction: right
  theme: paper
  density: balanced
  stages:
    - id: foundation
      label: Foundation
      timeframe: Now
      order: 1
      description: Prove the semantic model and deterministic rendering core.
    - id: composition
      label: Composition
      timeframe: Next
      order: 2
      description: Add richer ways to structure business meaning.
    - id: validation
      label: Validation
      timeframe: Pilot
      order: 3
      description: Prove that the visuals work for real readers and workflows.
    - id: platform
      label: Platform
      timeframe: Scale
      order: 4
      description: Turn the core into reusable tooling and integrations.
  nodes:
    - id: semantic-core
      label: Semantic visual language
      type: outcome
      stage: foundation
      subtitle: Meaning before geometry
      status: success
    - id: renderer
      label: Deterministic renderer
      type: milestone
      stage: foundation
      subtitle: SVG + HTML + CLI
    - id: views
      label: Multiple views from one model
      type: outcome
      stage: composition
      subtitle: Executive · data · controls
      status: success
    - id: methods
      label: Rich visual methods
      type: milestone
      stage: composition
      subtitle: Roadmap · handoff · relationships
    - id: pilot
      label: Test with real business cases
      type: checkpoint
      stage: validation
      subtitle: Readability before features
    - id: regression
      label: Visual regression corpus
      type: checkpoint
      stage: validation
      subtitle: Geometry + accessibility
    - id: package
      label: Reusable visualization package
      type: milestone
      stage: platform
      subtitle: Stable API + adapters
    - id: agents
      label: Agent visual skills
      type: outcome
      stage: platform
      subtitle: Notes → method → model → visual
  edges:
    - from: semantic-core
      to: renderer
      type: dependency
    - from: renderer
      to: views
      type: flow
    - from: views
      to: methods
      type: dependency
    - from: methods
      to: pilot
      type: flow
    - from: pilot
      to: regression
      label: Learn
      type: control
    - from: regression
      to: package
      label: Quality gate
      type: flow
    - from: package
      to: agents
      type: flow
  views:
    - id: outcomes
      title: Visual Workbench outcomes
      focus: executive
      kind: roadmap
      excludeNodeTypes:
        - checkpoint
---

Stages are semantic planning periods, not manually drawn columns. The renderer derives stage bands, ordering, rail, spacing and edge routes from the model.
