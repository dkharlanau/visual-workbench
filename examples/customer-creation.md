---
visual:
  version: 1
  title: Customer creation
  description: Creation path with operational checkpoints and an exception route.
  kind: checkpoint-flow
  direction: right
  theme: paper
  density: airy
  nodes:
    - id: afs
      label: Customer created
      type: system
      subtitle: AFS
      owner: Source system
    - id: mdg
      label: Govern customer
      type: checkpoint
      subtitle: MDG · expected ≤ 5 min
      owner: Master Data
    - id: s4
      label: Customer available
      type: system
      subtitle: S/4HANA
      owner: Target system
      status: success
    - id: incident
      label: Replication exception
      type: risk
      subtitle: Missing or delayed customer
      owner: Operations
      status: danger
  edges:
    - from: afs
      to: mdg
      label: Customer
      type: data
    - from: mdg
      to: s4
      label: Business Partner
      type: flow
    - from: mdg
      to: incident
      label: SLA missed
      type: exception
      status: danger
---

This view intentionally keeps the happy path dominant while making the operational failure path visible.
