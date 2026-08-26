import { describe, expect, it } from 'vitest';
import { parseVisualMarkdown } from '../src/parser.js';
import { projectVisualView, VisualViewError } from '../src/views.js';

const source = `---
visual:
  version: 1
  title: Order lifecycle
  kind: checkpoint-flow
  nodes:
    - id: source
      label: Source system
      type: system
    - id: payload
      label: Canonical order
      type: data
    - id: gate
      label: Validate order
      type: checkpoint
    - id: target
      label: Order available
      type: outcome
      status: success
    - id: failure
      label: Validation failure
      type: risk
      status: danger
  edges:
    - from: source
      to: payload
      type: data
    - from: payload
      to: gate
      type: data
    - from: gate
      to: target
      label: Create
      type: flow
    - from: gate
      to: target
      label: Confirm
      type: flow
    - from: gate
      to: failure
      type: exception
      status: danger
  views:
    - id: executive
      title: Order overview
      focus: executive
    - id: information
      title: Order information flow
      focus: data
      kind: data-flow
    - id: exceptions
      focus: exceptions
---
`;

describe('named views', () => {
  const visual = parseVisualMarkdown(source).visual;

  it('projects an executive view and contracts hidden data paths', () => {
    const projected = projectVisualView(visual, 'executive');
    expect(projected.nodes.some((node) => node.id === 'payload')).toBe(false);
    expect(projected.nodes.some((node) => node.id === 'source')).toBe(true);
    expect(projected.edges.some((edge) => edge.from === 'source' && edge.to === 'gate' && edge.label?.startsWith('via '))).toBe(true);
  });

  it('preserves parallel source relationships', () => {
    const projected = projectVisualView(visual, 'executive');
    expect(projected.edges.filter((edge) => edge.from === 'gate' && edge.to === 'target' && edge.type === 'flow')).toHaveLength(2);
  });

  it('allows a view to change the visual method', () => {
    const projected = projectVisualView(visual, 'information');
    expect(projected.kind).toBe('data-flow');
    expect(projected.title).toBe('Order information flow');
    expect(projected.nodes.some((node) => node.type === 'data')).toBe(true);
  });

  it('keeps exception context around the risk', () => {
    const projected = projectVisualView(visual, 'exceptions');
    expect(projected.nodes.map((node) => node.id)).toEqual(expect.arrayContaining(['gate', 'failure']));
    expect(projected.edges.some((edge) => edge.type === 'exception')).toBe(true);
  });

  it('reports unknown views', () => {
    expect(() => projectVisualView(visual, 'missing')).toThrow(VisualViewError);
  });
});
