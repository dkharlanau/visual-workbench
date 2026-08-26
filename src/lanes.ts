import type { LayoutResult, Point, PositionedEdge, PositionedGroup, PositionedNode } from './layout.js';
import type { VisualDocument, VisualGroup } from './schema.js';

const LANE_HEADER = 30;
const LANE_PADDING = 18;
const LANE_GAP = 10;
const PRIMARY_GAP = 36;
const OUTER_PADDING = 24;

function orderedGroups(visual: VisualDocument): VisualGroup[] {
  return visual.groups
    .map((group, index) => ({ group, index }))
    .sort((a, b) => (a.group.order ?? a.index) - (b.group.order ?? b.index) || a.index - b.index)
    .map(({ group }) => group);
}

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
    offsets.set(edge.id, (index - (total - 1) / 2) * 8);
  });
  return offsets;
}

function routeEdge(edge: PositionedEdge, source: PositionedNode, target: PositionedNode, direction: VisualDocument['direction'], offset: number): Point[] {
  if (direction === 'down' || direction === 'up') {
    const start: Point = direction === 'down'
      ? { x: source.x + source.width / 2 + offset, y: source.y + source.height }
      : { x: source.x + source.width / 2 + offset, y: source.y };
    const end: Point = direction === 'down'
      ? { x: target.x + target.width / 2 + offset, y: target.y }
      : { x: target.x + target.width / 2 + offset, y: target.y + target.height };
    const midY = (start.y + end.y) / 2;
    if (Math.abs(start.x - end.x) < 1) return [start, end];
    return [start, { x: start.x, y: midY }, { x: end.x, y: midY }, end];
  }

  const start: Point = direction === 'left'
    ? { x: source.x, y: source.y + source.height / 2 + offset }
    : { x: source.x + source.width, y: source.y + source.height / 2 + offset };
  const end: Point = direction === 'left'
    ? { x: target.x + target.width, y: target.y + target.height / 2 + offset }
    : { x: target.x, y: target.y + target.height / 2 + offset };
  const midX = (start.x + end.x) / 2;
  if (Math.abs(start.y - end.y) < 1) return [start, end];
  return [start, { x: midX, y: start.y }, { x: midX, y: end.y }, end];
}

function rerouteEdges(edges: PositionedEdge[], nodes: PositionedNode[], direction: VisualDocument['direction']): PositionedEdge[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const offsets = parallelOffsets(edges);
  return edges.map((edge) => {
    const source = byId.get(edge.from);
    const target = byId.get(edge.to);
    if (!source || !target) return edge;
    const points = routeEdge(edge, source, target, direction, offsets.get(edge.id) ?? 0);
    const labelPosition = midpoint(points);
    return { ...edge, points, ...(labelPosition ? { labelPosition } : {}) };
  });
}

function layoutHorizontalLanes(base: LayoutResult, visual: VisualDocument): LayoutResult {
  const nodes = base.nodes.map((node) => ({ ...node }));
  const groups: PositionedGroup[] = [];
  let laneY = OUTER_PADDING;
  let maxX = OUTER_PADDING;

  for (const group of orderedGroups(visual)) {
    const members = nodes.filter((node) => node.group === group.id).sort((a, b) => a.x - b.x || a.id.localeCompare(b.id));
    const maxHeight = Math.max(72, ...members.map((node) => node.height));
    let cursor = OUTER_PADDING;
    members.forEach((node) => {
      node.x = Math.max(node.x, cursor);
      cursor = node.x + node.width + PRIMARY_GAP;
      maxX = Math.max(maxX, node.x + node.width + OUTER_PADDING);
    });
    const laneHeight = LANE_HEADER + LANE_PADDING * 2 + maxHeight;
    members.forEach((node) => {
      node.y = laneY + LANE_HEADER + LANE_PADDING + (maxHeight - node.height) / 2;
    });
    groups.push({ ...group, x: 0, y: laneY, width: 0, height: laneHeight, orientation: 'horizontal' });
    laneY += laneHeight + LANE_GAP;
  }

  const width = Math.max(base.width, maxX);
  groups.forEach((group) => { group.width = width; });
  const height = Math.max(base.height, laneY - LANE_GAP + OUTER_PADDING);
  const edges = rerouteEdges(base.edges, nodes, visual.direction);
  return { width, height, nodes, edges, groups };
}

function layoutVerticalLanes(base: LayoutResult, visual: VisualDocument): LayoutResult {
  const nodes = base.nodes.map((node) => ({ ...node }));
  const groups: PositionedGroup[] = [];
  let laneX = OUTER_PADDING;
  let maxY = OUTER_PADDING;

  for (const group of orderedGroups(visual)) {
    const members = nodes.filter((node) => node.group === group.id).sort((a, b) => a.y - b.y || a.id.localeCompare(b.id));
    const maxWidth = Math.max(180, ...members.map((node) => node.width));
    let cursor = LANE_HEADER + LANE_PADDING;
    members.forEach((node) => {
      node.y = Math.max(node.y + LANE_HEADER, cursor);
      cursor = node.y + node.height + PRIMARY_GAP;
      maxY = Math.max(maxY, node.y + node.height + OUTER_PADDING);
    });
    const laneWidth = LANE_PADDING * 2 + maxWidth;
    members.forEach((node) => {
      node.x = laneX + LANE_PADDING + (maxWidth - node.width) / 2;
    });
    groups.push({ ...group, x: laneX, y: 0, width: laneWidth, height: 0, orientation: 'vertical' });
    laneX += laneWidth + LANE_GAP;
  }

  const height = Math.max(base.height, maxY);
  groups.forEach((group) => { group.height = height; });
  const width = Math.max(base.width, laneX - LANE_GAP + OUTER_PADDING);
  const edges = rerouteEdges(base.edges, nodes, visual.direction);
  return { width, height, nodes, edges, groups };
}

export function applyLaneLayout(base: LayoutResult, visual: VisualDocument): LayoutResult {
  if (visual.groups.length === 0) return base;
  return visual.direction === 'down' || visual.direction === 'up'
    ? layoutVerticalLanes(base, visual)
    : layoutHorizontalLanes(base, visual);
}
