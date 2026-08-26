---
visual:
  version: 1
  title: Order data flow
  description: Business data movement across applications with a control point.
  kind: data-flow
  direction: right
  theme: slate
  density: balanced
  nodes:
    - id: crm
      label: Sales order request
      type: system
      subtitle: CRM
    - id: api
      label: Canonical order
      type: data
      subtitle: Integration contract
    - id: validation
      label: Validate order
      type: checkpoint
      subtitle: Required fields + mappings
    - id: erp
      label: Sales order
      type: system
      subtitle: ERP
      status: success
  edges:
    - from: crm
      to: api
      label: JSON
      type: data
    - from: api
      to: validation
      label: Normalize
      type: flow
    - from: validation
      to: erp
      label: Create
      type: data
---

The data object is first-class rather than being hidden inside an arrow label.
