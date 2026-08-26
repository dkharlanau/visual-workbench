import type { LayoutResult, PositionedGroup } from './layout.js';
import { rerouteOrthogonalEdges } from './routing.js';
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
  const height = Math.max(180, laneY - LANE_GAP + OUTER_PADDING);
  const edges = rerouteOrthogonalEdges(base.edges, nodes, visual.direction);
  return { ...base, width, height, nodes, edges, groups };
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
  const width = Math.max(320, laneX - LANE_GAP + OUTER_PADDING);
  const edges = rerouteOrthogonalEdges(base.edges, nodes, visual.direction);
  return { ...base, width, height, nodes, edges, groups };
}

export function applyLaneLayout(base: LayoutResult, visual: VisualDocument): LayoutResult {
  if (visual.groups.length === 0) return base;
  return visual.direction === 'down' || visual.direction === 'up'
    ? layoutVerticalLanes(base, visual)
    : layoutHorizontalLanes(base, visual);
}
