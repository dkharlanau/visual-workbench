import ELK from 'elkjs/lib/elk.bundled.js';
import type { SemanticGraph } from './model.js';
import type { VisualDocument, VisualEdge, VisualNode } from './schema.js';

export interface Point { x: number; y: number }
export interface PositionedNode extends VisualNode { x: number; y: number; width: number; height: number }
export interface PositionedEdge extends VisualEdge { id: string; points: Point[]; labelPosition?: Point }
export interface LayoutResult { width: number; height: number; nodes: PositionedNode[]; edges: PositionedEdge[] }

const elk = new ELK();

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function nodeSize(node: VisualNode, density: VisualDocument['density']): { width: number; height: number } {
  const longestText = Math.max(node.label.length, node.subtitle?.length ?? 0, node.owner?.length ?? 0);
  const densityFactor = density === 'compact' ? 0.9 : density === 'airy' ? 1.08 : 1;
  const baseWidth = node.type === 'checkpoint' || node.type === 'milestone' ? 176 : 204;
  const width = clamp((baseWidth + Math.max(0, longestText - 20) * 4.7) * densityFactor, 164, 286);
  const lineCount = 1 + Number(Boolean(node.subtitle)) + Number(Boolean(node.owner));
  const height = clamp((70 + (lineCount - 1) * 18) * densityFactor, 66, 116);
  return { width: Math.round(width), height: Math.round(height) };
}

function directionToElk(direction: VisualDocument['direction']): string {
  const directions: Record<VisualDocument['direction'], string> = { right: 'RIGHT', down: 'DOWN', left: 'LEFT', up: 'UP' };
  return directions[direction];
}

function densitySpacing(density: VisualDocument['density']): { node: number; layer: number } {
  if (density === 'compact') return { node: 28, layer: 62 };
  if (density === 'airy') return { node: 58, layer: 112 };
  return { node: 42, layer: 88 };
}

function estimateEdgeLabel(label: string): { width: number; height: number } {
  return { width: clamp(label.length * 6.6 + 24, 54, 168), height: 24 };
}

function midpoint(points: Point[]): Point | undefined {
  if (points.length === 0) return undefined;
  if (points.length === 1) return points[0];
  const middle = Math.floor((points.length - 1) / 2);
  const a = points[middle];
  const b = points[middle + 1] ?? a;
  if (!a || !b) return undefined;
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export async function layoutGraph(graph: SemanticGraph, visual: VisualDocument): Promise<LayoutResult> {
  const spacing = densitySpacing(visual.density);
  const children = graph.mapNodes((id, attributes) => {
    const size = nodeSize(attributes, visual.density);
    return { id, width: size.width, height: size.height };
  });
  const edges = graph.mapEdges((id, attributes, source, target) => ({
    id,
    sources: [source],
    targets: [target],
    ...(attributes.label ? { labels: [{ id: `${id}:label`, text: attributes.label, ...estimateEdgeLabel(attributes.label) }] } : {}),
  }));
  const laidOut = await elk.layout({
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': directionToElk(visual.direction),
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.spacing.nodeNode': String(spacing.node),
      'elk.layered.spacing.nodeNodeBetweenLayers': String(spacing.layer),
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.layered.cycleBreaking.strategy': 'GREEDY',
      'elk.padding': '[top=30,left=30,bottom=30,right=30]',
    },
    children,
    edges,
  });
  const positionedNodes: PositionedNode[] = (laidOut.children ?? []).map((child) => {
    const attributes = graph.getNodeAttributes(child.id) as VisualNode;
    return { ...attributes, x: child.x ?? 0, y: child.y ?? 0, width: child.width ?? 200, height: child.height ?? 80 };
  });
  const byId = new Map(positionedNodes.map((node) => [node.id, node]));
  const positionedEdges: PositionedEdge[] = (laidOut.edges ?? []).map((edge) => {
    const attributes = graph.getEdgeAttributes(edge.id) as VisualEdge;
    const source = graph.source(edge.id);
    const target = graph.target(edge.id);
    const section = edge.sections?.[0];
    let points: Point[] = [];
    if (section?.startPoint && section.endPoint) {
      points = [section.startPoint, ...(section.bendPoints ?? []), section.endPoint].map((point) => ({ x: point.x, y: point.y }));
    } else {
      const sourceNode = byId.get(source);
      const targetNode = byId.get(target);
      if (sourceNode && targetNode) {
        points = [
          { x: sourceNode.x + sourceNode.width / 2, y: sourceNode.y + sourceNode.height / 2 },
          { x: targetNode.x + targetNode.width / 2, y: targetNode.y + targetNode.height / 2 },
        ];
      }
    }
    const label = edge.labels?.[0];
    const labelPosition = label?.x != null && label?.y != null
      ? { x: label.x + (label.width ?? 0) / 2, y: label.y + (label.height ?? 0) / 2 }
      : midpoint(points);
    return { id: edge.id, ...attributes, points, ...(labelPosition ? { labelPosition } : {}) };
  });
  return {
    width: Math.max(320, laidOut.width ?? 320),
    height: Math.max(180, laidOut.height ?? 180),
    nodes: positionedNodes,
    edges: positionedEdges,
  };
}
