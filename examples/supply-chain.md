---
visual:
  version: 1
  title: Supply chain execution
  description: Physical execution flow with information and control checkpoints.
  kind: checkpoint-flow
  direction: right
  theme: paper
  density: balanced
  nodes:
    - id: supplier
      label: Supplier ready
      type: outcome
      subtitle: Goods prepared
    - id: asn
      label: Advance shipment notice
      type: data
      subtitle: Quantity · ETA · handling units
    - id: inbound
      label: Inbound checkpoint
      type: checkpoint
      subtitle: Match ASN and receipt
      owner: Warehouse
    - id: plant
      label: Plant available stock
      type: system
      subtitle: ERP / WMS
      status: success
    - id: dc
      label: Distribution center
      type: system
      subtitle: Replenishment destination
    - id: mismatch
      label: Receipt mismatch
      type: risk
      subtitle: Quantity or identity differs
      status: warning
  edges:
    - from: supplier
      to: asn
      label: Publish
      type: data
    - from: asn
      to: inbound
      label: Expected receipt
      type: data
    - from: inbound
      to: plant
      label: Post receipt
      type: flow
    - from: plant
      to: dc
      label: Replenish
      type: flow
    - from: inbound
      to: mismatch
      label: Validation failed
      type: exception
      status: warning
  views:
    - id: executive
      title: Supply chain overview
      description: High-level execution path with control and exception visibility.
      focus: executive
      kind: process
      density: airy
    - id: information
      title: Supply chain information flow
      description: Information movement around inbound execution.
      focus: data
      kind: data-flow
    - id: controls
      title: Inbound controls
      focus: controls
      kind: checkpoint-flow
    - id: exceptions
      title: Supply chain exceptions
      focus: exceptions
      kind: checkpoint-flow
---

One semantic model generates several views. The executive view hides the ASN data node but preserves the source-to-checkpoint relationship by contracting the hidden path.
