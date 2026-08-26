import { describe, expect, it } from 'vitest';
import { applyLaneLayout } from '../src/lanes.js';
import type { LayoutResult } from '../src/layout.js';
import { VisualDocumentSchema } from '../src/schema.js';

function fixture(direction: 'right' | 'down' = 'right') {
  const visual = VisualDocumentSchema.parse({
    title: 'Lane fixture',
    kind: 'handoff',
    direction,
    groups: [
      { id: 'a', label: 'Team A', order: 1 },
      { id: 'b', label: 'Team B', order: 2 },
    ],
    nodes: [
      { id: 'one', label: 'One', group: 'a' },
      { id: 'two', label: 'Two', group: 'b' },
      { id: 'three', label: 'Three', group: 'a' },
    ],
    edges: [
      { from: 'one', to: 'two' },
      { from: 'two', to: 'three' },
    ],
  });
  const base: LayoutResult = {
    width: 620,
    height: 900,
    groups: [],
    stages: [],
    nodes: visual.nodes.map((node, index) => ({ ...node, x: 40 + index * 180, y: 40 + index * 30, width: 160, height: 80 })),
    edges: visual.edges.map((edge, index) => ({ ...edge, id: `e${index + 1}`, points: [] })),
  };
  return { visual, base };
}

describe('lane layout', () => {
  it('creates non-overlapping horizontal ownership lanes and reroutes edges', () => {
    const { visual, base } = fixture('right');
    const result = applyLaneLayout(base, visual);
    expect(result.groups).toHaveLength(2);
    expect(result.groups[0]?.orientation).toBe('horizontal');
    expect((result.groups[0]?.y ?? 0) + (result.groups[0]?.height ?? 0)).toBeLessThan(result.groups[1]?.y ?? 0);
    const one = result.nodes.find((node) => node.id === 'one');
    const three = result.nodes.find((node) => node.id === 'three');
    expect(one?.y).toBe(three?.y);
    expect(result.edges.every((edge) => edge.points.length >= 2)).toBe(true);
    expect(result.height).toBeLessThan(base.height);
  });

  it('turns groups into vertical lanes for top-to-bottom flows', () => {
    const { visual, base } = fixture('down');
    const result = applyLaneLayout(base, visual);
    expect(result.groups[0]?.orientation).toBe('vertical');
    expect((result.groups[0]?.x ?? 0) + (result.groups[0]?.width ?? 0)).toBeLessThan(result.groups[1]?.x ?? 0);
    expect(result.width).toBeLessThan(base.width);
    expect(result.height).toBeGreaterThanOrEqual(base.height);
  });
});
