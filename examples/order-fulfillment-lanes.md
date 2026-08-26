---
visual:
  version: 1
  title: Order fulfillment handoffs
  description: Ownership lanes keep the global business sequence while exposing cross-team handoffs.
  kind: handoff
  direction: right
  theme: paper
  density: balanced
  groups:
    - id: business
      label: Business
      order: 1
    - id: integration
      label: Integration
      order: 2
    - id: erp
      label: ERP
      order: 3
    - id: warehouse
      label: Warehouse
      order: 4
  nodes:
    - id: request
      label: Order approved
      type: outcome
      group: business
      owner: Sales
    - id: validate
      label: Validate payload
      type: checkpoint
      group: integration
      subtitle: Contract + mappings
    - id: order
      label: Create sales order
      type: system
      group: erp
      subtitle: ERP
    - id: delivery
      label: Release delivery
      type: step
      group: warehouse
      owner: Fulfillment
    - id: confirm
      label: Confirm to customer
      type: outcome
      group: business
      status: success
    - id: invalid
      label: Payload rejected
      type: risk
      group: integration
      status: danger
  edges:
    - from: request
      to: validate
      label: Order request
      type: data
    - from: validate
      to: order
      label: Valid
      type: flow
    - from: order
      to: delivery
      label: Fulfill
      type: flow
    - from: delivery
      to: confirm
      label: Confirm
      type: flow
    - from: validate
      to: invalid
      label: Invalid
      type: exception
      status: danger
  views:
    - id: executive
      title: Order fulfillment overview
      focus: executive
      kind: process
    - id: controls
      title: Order validation controls
      focus: controls
      kind: checkpoint-flow
---

The full view uses swimlanes. The executive view removes the warehouse step and its now-empty lane while preserving the ERP-to-business flow through path contraction.
