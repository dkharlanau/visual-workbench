import type { VisualDocument, VisualKind } from './schema.js';

export type LayoutAlgorithm = 'layered' | 'stress';
export type EdgeRouting = 'ORTHOGONAL' | 'POLYLINE';

export interface VisualMethodPolicy {
  algorithm: LayoutAlgorithm;
  direction: 'RIGHT' | 'DOWN' | 'LEFT' | 'UP' | undefined;
  edgeRouting: EdgeRouting;
  nodeSpacingMultiplier: number;
  layerSpacingMultiplier: number;
  description: string;
}

const directionMap: Record<VisualDocument['direction'], Exclude<VisualMethodPolicy['direction'], undefined>> = {
  right: 'RIGHT',
  down: 'DOWN',
  left: 'LEFT',
  up: 'UP',
};

const descriptions: Record<VisualKind, string> = {
  process: 'Sequential business flow with a dominant reading direction.',
  plan: 'Outcome-led plan with milestones, gates, risks and dependencies.',
  'data-flow': 'Movement and transformation of business information between nodes.',
  relationship: 'Non-linear relationship map where hierarchy is secondary.',
  'system-flow': 'Directed system-to-system handoff or integration landscape.',
  'checkpoint-flow': 'Flow that emphasizes gates, controls, SLAs and exceptions.',
  roadmap: 'Ordered progression of outcomes or capabilities over stages.',
  timeline: 'Time-oriented progression where sequence is the primary structure.',
  handoff: 'Transfer of work, data or responsibility between actors or systems.',
  'dependency-map': 'Prerequisite structure showing what blocks or enables what.',
};

export function getVisualMethodPolicy(visual: Pick<VisualDocument, 'kind' | 'direction'>): VisualMethodPolicy {
  const base: VisualMethodPolicy = {
    algorithm: 'layered',
    direction: directionMap[visual.direction],
    edgeRouting: 'ORTHOGONAL',
    nodeSpacingMultiplier: 1,
    layerSpacingMultiplier: 1,
    description: descriptions[visual.kind],
  };

  switch (visual.kind) {
    case 'relationship':
      return {
        ...base,
        algorithm: 'stress',
        direction: undefined,
        edgeRouting: 'POLYLINE',
        nodeSpacingMultiplier: 1.15,
        layerSpacingMultiplier: 1,
      };
    case 'plan':
      return { ...base, nodeSpacingMultiplier: 1.05, layerSpacingMultiplier: 1.18 };
    case 'roadmap':
    case 'timeline':
      return { ...base, direction: 'RIGHT', nodeSpacingMultiplier: 0.9, layerSpacingMultiplier: 1.28 };
    case 'checkpoint-flow':
      return { ...base, nodeSpacingMultiplier: 1.12, layerSpacingMultiplier: 1.08 };
    case 'data-flow':
      return { ...base, nodeSpacingMultiplier: 0.95, layerSpacingMultiplier: 1.12 };
    case 'handoff':
      return { ...base, nodeSpacingMultiplier: 1.12, layerSpacingMultiplier: 1.05 };
    case 'dependency-map':
      return { ...base, nodeSpacingMultiplier: 1.02, layerSpacingMultiplier: 1.2 };
    default:
      return base;
  }
}
