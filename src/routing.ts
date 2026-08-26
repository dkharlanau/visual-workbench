import type { Point, PositionedEdge, PositionedNode } from './layout.js';
import type { VisualDocument } from './schema.js';

function midpoint(points: Point[]): Point | undefined {
  if (points.length === 0) return undefined;
  const middle = Math.floor((points.length - 1) / 2);
  const a = points[middle];
  const b = points[middle + 1] ?? a;
  if (!a || !b) return undefined;
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function parallelOffsets(edges: PositionedEdge[]): Map<string, number> {
  const totals = new Map<string, number>();
  const seen = new Map<string, number>();
  edges.forEach((edge) => {
    const key = `${edge.from}|${edge.to}`;
    totals.set(key, (totals.get(key) ?? 0) + 1);
  });
  const offsets = new Map<string, number>();
  edges.forEach((edge) => {
    const key = `${edge.from}|${edge.to}`;
    const index = seen.get(key) ?? 0;
    seen.set(key, index + 1);
    const total = totals.get(key) ?? 1;
    const spacing = total <= 1 ? 0 : Math.min(8, 36 / (total - 1));
    offsets.set(edge.id, (index - (total - 1) / 2) * spacing);
  });
  return offsets;
}

function verticalRoute(source: PositionedNode, target: PositionedNode, offset: number): Point[] {
  const sourceCenterY = source.y + source.height / 2;
  const targetCenterY = target.y + target.height / 2;
  const down = targetCenterY >= sourceCenterY;
  const start: Point = down
    ? { x: source.x + source.width / 2 + offset, y: source.y + source.height }
    : { x: source.x + source.width / 2 + offset, y: source.y };
  const end: Point = down
    ? { x: target.x + target.width / 2 + offset, y: target.y }
    : { x: target.x + target.width / 2 + offset, y: target.y + target.height };
  const midY = (start.y + end.y) / 2;
  if (Math.abs(start.x - end.x) < 1) return [start, end];
  return [start, { x: start.x, y: midY }, { x: end.x, y: midY }, end];
}

function horizontalRoute(source: PositionedNode, target: PositionedNode, offset: number): Point[] {
  const sourceCenterX = source.x + source.width / 2;
  const targetCenterX = target.x + target.width / 2;
  const right = targetCenterX >= sourceCenterX;
  const start: Point = right
    ? { x: source.x + source.width, y: source.y + source.height / 2 + offset }
    : { x: source.x, y: source.y + source.height / 2 + offset };
  const end: Point = right
    ? { x: target.x, y: target.y + target.height / 2 + offset }
    : { x: target.x + target.width, y: target.y + target.height / 2 + offset };
  const midX = (start.x + end.x) / 2;
  if (Math.abs(start.y - end.y) < 1) return [start, end];
  return [start, { x: midX, y: start.y }, { x: midX, y: end.y }, end];
}

function routeEdge(source: PositionedNode, target: PositionedNode, direction: VisualDocument['direction'], offset: number): Point[] {
  const horizontalPrimary = direction === 'right' || direction === 'left';
  const separatedHorizontally = source.x + source.width <= target.x || target.x + target.width <= source.x;
  const separatedVertically = source.y + source.height <= target.y || target.y + target.height <= source.y;

  if (horizontalPrimary) {
    return separatedHorizontally || !separatedVertically
      ? horizontalRoute(source, target, offset)
      : verticalRoute(source, target, offset);
  }
  return separatedVertically || !separatedHorizontally
    ? verticalRoute(source, target, offset)
    : horizontalRoute(source, target, offset);
}

export function rerouteOrthogonalEdges(edges: PositionedEdge[], nodes: PositionedNode[], direction: VisualDocument['direction']): PositionedEdge[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const offsets = parallelOffsets(edges);
  return edges.map((edge) => {
    const source = byId.get(edge.from);
    const target = byId.get(edge.to);
    if (!source || !target) return edge;
    const points = routeEdge(source, target, direction, offsets.get(edge.id) ?? 0);
    const labelPosition = midpoint(points);
    return { ...edge, points, ...(labelPosition ? { labelPosition } : {}) };
  });
}
