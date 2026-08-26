import { describe, expect, it } from 'vitest';
import { applyStageLayout } from '../src/stages.js';
import type { LayoutResult } from '../src/layout.js';
import { VisualDocumentSchema } from '../src/schema.js';

function fixture(direction: 'right' | 'left' = 'right') {
  const visual = VisualDocumentSchema.parse({
    title: 'Roadmap fixture',
    kind: 'roadmap',
    direction,
    stages: [
      { id: 'now', label: 'Now', order: 1 },
      { id: 'next', label: 'Next', order: 2 },
    ],
    nodes: [
      { id: 'a', label: 'A', type: 'milestone', stage: 'now' },
      { id: 'b', label: 'B', type: 'checkpoint', stage: 'now' },
      { id: 'c', label: 'C', type: 'outcome', stage: 'next' },
    ],
    edges: [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'c' },
    ],
  });
  const base: LayoutResult = {
    width: 760,
    height: 260,
    groups: [],
    stages: [],
    nodes: visual.nodes.map((node, index) => ({ ...node, x: 40 + index * 220, y: 30 + index * 25, width: 170, height: 76 })),
    edges: visual.edges.map((edge, index) => ({ ...edge, id: `e${index + 1}`, points: [] })),
  };
  return { visual, base };
}

describe('stage layout', () => {
  it('creates ordered roadmap bands and stacks same-stage nodes', () => {
    const { visual, base } = fixture('right');
    const result = applyStageLayout(base, visual);
    expect(result.stages.map((stage) => stage.id)).toEqual(['now', 'next']);
    expect((result.stages[0]?.x ?? 0) + (result.stages[0]?.width ?? 0)).toBeLessThan(result.stages[1]?.x ?? 0);
    const a = result.nodes.find((node) => node.id === 'a');
    const b = result.nodes.find((node) => node.id === 'b');
    expect(a?.x).toBe(b?.x);
    expect((a?.y ?? 0) + (a?.height ?? 0)).toBeLessThan(b?.y ?? 0);
  });

  it('reverses spatial stage order for a left-reading roadmap', () => {
    const { visual, base } = fixture('left');
    const result = applyStageLayout(base, visual);
    expect(result.stages.map((stage) => stage.id)).toEqual(['next', 'now']);
  });

  it('reroutes same-stage edges vertically instead of through cards', () => {
    const { visual, base } = fixture('right');
    const result = applyStageLayout(base, visual);
    const sameStage = result.edges.find((edge) => edge.from === 'a' && edge.to === 'b');
    expect(sameStage?.points.length).toBeGreaterThanOrEqual(2);
    expect(sameStage?.points[0]?.x).toBeCloseTo(sameStage?.points.at(-1)?.x ?? 0, 5);
  });
});
