import { describe, expect, it } from 'vitest';
import { parseVisualMarkdown } from '../src/parser.js';
import { VisualDocumentSchema } from '../src/schema.js';
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

  it('falls back to step nodes for an executive view of a simple process', () => {
    const simple = parseVisualMarkdown(`---\nvisual:\n  title: Simple flow\n  nodes:\n    - id: one\n      label: One\n    - id: two\n      label: Two\n  edges:\n    - from: one\n      to: two\n  views:\n    - id: executive\n      focus: executive\n---`).visual;
    expect(projectVisualView(simple, 'executive').nodes).toHaveLength(2);
  });

  it('reports unknown views', () => {
    expect(() => projectVisualView(visual, 'missing')).toThrow(VisualViewError);
  });
});


const truthfulSource = `---
visual:
  version: 1
  title: Truthful projection
  kind: process
  nodes:
    - id: source
      label: Source
      type: system
    - id: risky
      label: Hidden risk
      type: step
      status: danger
    - id: alternate
      label: Alternate route
      type: step
    - id: target
      label: Target outcome
      type: outcome
  edges:
    - from: source
      to: target
      type: flow
    - from: source
      to: risky
      type: flow
    - from: risky
      to: target
      type: flow
    - from: source
      to: alternate
      type: flow
    - from: alternate
      to: target
      type: flow
      status: warning
  views:
    - id: review
      focus: all
      excludeNodeTypes: [step]
---
`;

describe('truthful projected paths', () => {
  it('aggregates hidden alternatives conservatively without erasing a direct edge', () => {
    const visual = parseVisualMarkdown(truthfulSource).visual;
    const projected = projectVisualView(visual, 'review');
    const pair = projected.edges.filter((edge) => edge.from === 'source' && edge.to === 'target' && edge.type === 'flow');
    const direct = pair.find((edge) => !edge.projection);
    const collapsed = pair.find((edge) => edge.projection?.kind === 'collapsed-path');

    expect(direct).toBeDefined();
    expect(collapsed).toBeDefined();
    expect(collapsed?.status).toBe('danger');
    expect(collapsed?.projection?.pathCount).toBe(2);
    expect(collapsed?.projection?.hiddenNodeIds).toEqual(['alternate', 'risky']);
    expect(collapsed?.projection?.hiddenRiskNodeIds).toEqual(['risky']);
    expect(projected.projection?.hiddenRiskNodeIds).toEqual(['risky']);
  });

  it('is invariant to source node and edge ordering for retained severity and provenance', () => {
    const visual = parseVisualMarkdown(truthfulSource).visual;
    const reversed = {
      ...visual,
      nodes: [...visual.nodes].reverse(),
      edges: [...visual.edges].reverse(),
    };
    const first = projectVisualView(visual, 'review');
    const second = projectVisualView(reversed, 'review');
    const edgeA = first.edges.find((edge) => edge.projection?.kind === 'collapsed-path');
    const edgeB = second.edges.find((edge) => edge.projection?.kind === 'collapsed-path');

    expect(edgeB?.status).toBe(edgeA?.status);
    expect(edgeB?.projection).toEqual(edgeA?.projection);
    expect(second.projection?.hiddenRiskNodeIds).toEqual(first.projection?.hiddenRiskNodeIds);
    expect(second.projection?.limitReasons).toEqual(first.projection?.limitReasons);
  });

  it('never synthesizes success for a collapsed path', () => {
    const visual = parseVisualMarkdown(`---
visual:
  title: Success is not inferred
  nodes:
    - id: source
      label: Source
      type: system
    - id: hidden
      label: Hidden successful step
      type: step
      status: success
    - id: target
      label: Target
      type: outcome
  edges:
    - from: source
      to: hidden
      status: success
    - from: hidden
      to: target
      status: success
  views:
    - id: review
      focus: all
      excludeNodeTypes: [step]
---`).visual;
    const collapsed = projectVisualView(visual, 'review').edges.find((edge) => edge.projection);
    expect(collapsed?.status).toBe('neutral');
  });

  it('reports hidden-depth limits instead of implying that no relationship exists', () => {
    const hidden = Array.from({ length: 7 }, (_, index) => ({
      id: `h${index + 1}`,
      label: `Hidden ${index + 1}`,
      type: 'step' as const,
    }));
    const edges = [
      { from: 'source', to: 'h1' },
      ...Array.from({ length: 6 }, (_, index) => ({ from: `h${index + 1}`, to: `h${index + 2}` })),
      { from: 'h7', to: 'target' },
    ];
    const visual = VisualDocumentSchema.parse({
      title: 'Depth bound',
      nodes: [
        { id: 'source', label: 'Source', type: 'system' },
        ...hidden,
        { id: 'target', label: 'Target', type: 'outcome' },
      ],
      edges,
      views: [{ id: 'review', focus: 'all', excludeNodeTypes: ['step'] }],
    });
    const projected = projectVisualView(visual, 'review');
    expect(projected.projection?.limited).toBe(true);
    expect(projected.projection?.limitReasons).toContain('depth');
    expect(projected.edges.some((edge) => edge.projection)).toBe(false);
  });

  it('reports cycle encounters while retaining reachable projected relationships', () => {
    const visual = VisualDocumentSchema.parse({
      title: 'Cycle bound',
      nodes: [
        { id: 'source', label: 'Source', type: 'system' },
        { id: 'h1', label: 'Hidden one', type: 'step' },
        { id: 'h2', label: 'Hidden two', type: 'step' },
        { id: 'target', label: 'Target', type: 'outcome' },
      ],
      edges: [
        { from: 'source', to: 'h1' },
        { from: 'h1', to: 'h2' },
        { from: 'h2', to: 'h1' },
        { from: 'h2', to: 'target' },
      ],
      views: [{ id: 'review', focus: 'all', excludeNodeTypes: ['step'] }],
    });
    const projected = projectVisualView(visual, 'review');
    expect(projected.projection?.limitReasons).toContain('cycle');
    expect(projected.edges.some((edge) => edge.from === 'source' && edge.to === 'target' && edge.projection)).toBe(true);
  });

  it('reports exploration budget limits and bounds retained source path references', () => {
    const hiddenNodes = Array.from({ length: 300 }, (_, index) => ({
      id: `h${index}`,
      label: `Hidden ${index}`,
      type: 'step' as const,
    }));
    const visual = VisualDocumentSchema.parse({
      title: 'Budget bound',
      nodes: [
        { id: 'source', label: 'Source', type: 'system' },
        ...hiddenNodes,
        { id: 'target', label: 'Target', type: 'outcome' },
      ],
      edges: hiddenNodes.flatMap((node) => [
        { from: 'source', to: node.id },
        { from: node.id, to: 'target' },
      ]),
      views: [{ id: 'review', focus: 'all', excludeNodeTypes: ['step'] }],
    });
    const projected = projectVisualView(visual, 'review');
    const collapsed = projected.edges.find((edge) => edge.projection?.kind === 'collapsed-path');

    expect(projected.projection?.limitReasons).toContain('budget');
    expect(collapsed?.projection?.sourcePathRefs).toHaveLength(8);
    expect(collapsed?.projection?.sourcePathRefsTruncated).toBe(true);
    expect(collapsed?.projection?.limited).toBe(true);
    expect(collapsed?.projection?.limitReasons).toContain('budget');
  });
});
