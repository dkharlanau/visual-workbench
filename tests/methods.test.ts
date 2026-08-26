import { describe, expect, it } from 'vitest';
import { getVisualMethodPolicy } from '../src/methods.js';

describe('visual method policies', () => {
  it('uses a non-hierarchical layout for relationship maps', () => {
    const policy = getVisualMethodPolicy({ kind: 'relationship', direction: 'right' });
    expect(policy.algorithm).toBe('stress');
    expect(policy.edgeRouting).toBe('POLYLINE');
    expect(policy.direction).toBeUndefined();
  });

  it('forces timelines into a left-to-right reading direction', () => {
    const policy = getVisualMethodPolicy({ kind: 'timeline', direction: 'down' });
    expect(policy.direction).toBe('RIGHT');
    expect(policy.layerSpacingMultiplier).toBeGreaterThan(1);
  });
});
