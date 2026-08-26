import type { LayoutResult, PositionedNode, PositionedStage } from './layout.js';
import { rerouteOrthogonalEdges } from './routing.js';
import type { VisualDocument, VisualStage } from './schema.js';

const STAGE_GAP = 12;
const STAGE_PADDING = 24;
const STAGE_HEADER = 68;
const NODE_GAP = 28;
const MIN_STAGE_WIDTH = 220;
const MIN_STAGE_HEIGHT = 172;

function orderedStages(visual: VisualDocument): VisualStage[] {
  const ordered = visual.stages
    .map((stage, index) => ({ stage, index }))
    .sort((a, b) => (a.stage.order ?? a.index) - (b.stage.order ?? b.index) || a.index - b.index)
    .map(({ stage }) => stage);
  return visual.direction === 'left' || visual.direction === 'up' ? ordered.reverse() : ordered;
}

function memberNodes(nodes: PositionedNode[], stageId: string): PositionedNode[] {
  return nodes.filter((node) => node.stage === stageId);
}

function stageWidth(members: PositionedNode[]): number {
  return Math.max(MIN_STAGE_WIDTH, ...members.map((node) => node.width + STAGE_PADDING * 2));
}

function stageHeight(members: PositionedNode[]): number {
  return Math.max(MIN_STAGE_HEIGHT, ...members.map((node) => node.height + STAGE_HEADER + STAGE_PADDING * 2));
}

function layoutHorizontalStages(base: LayoutResult, visual: VisualDocument): LayoutResult {
  const nodes = base.nodes.map((node) => ({ ...node }));
  const stages: PositionedStage[] = [];
  let cursorX = 0;
  let maxBottom = 0;

  for (const stage of orderedStages(visual)) {
    const members = memberNodes(nodes, stage.id).sort((a, b) => a.y - b.y || a.id.localeCompare(b.id));
    const width = stageWidth(members);
    const centerX = cursorX + width / 2;
    let cursorY = STAGE_HEADER + STAGE_PADDING;
    members.forEach((node) => {
      node.x = centerX - node.width / 2;
      node.y = Math.max(node.y, cursorY);
      cursorY = node.y + node.height + NODE_GAP;
      maxBottom = Math.max(maxBottom, node.y + node.height + STAGE_PADDING);
    });
    stages.push({ ...stage, x: cursorX, y: 0, width, height: 0, orientation: 'vertical' });
    cursorX += width + STAGE_GAP;
  }

  const width = Math.max(320, cursorX - STAGE_GAP);
  const height = Math.max(180, base.height, maxBottom);
  stages.forEach((stage) => { stage.height = height; });
  const edges = rerouteOrthogonalEdges(base.edges, nodes, visual.direction);
  return { ...base, width, height, nodes, edges, groups: [], stages };
}

function layoutVerticalStages(base: LayoutResult, visual: VisualDocument): LayoutResult {
  const nodes = base.nodes.map((node) => ({ ...node }));
  const stages: PositionedStage[] = [];
  let cursorY = 0;
  let maxRight = 0;

  for (const stage of orderedStages(visual)) {
    const members = memberNodes(nodes, stage.id).sort((a, b) => a.x - b.x || a.id.localeCompare(b.id));
    const height = stageHeight(members);
    const contentY = cursorY + STAGE_HEADER + STAGE_PADDING;
    let cursorX = STAGE_PADDING;
    members.forEach((node) => {
      node.x = Math.max(node.x, cursorX);
      node.y = contentY + (height - STAGE_HEADER - STAGE_PADDING * 2 - node.height) / 2;
      cursorX = node.x + node.width + NODE_GAP;
      maxRight = Math.max(maxRight, node.x + node.width + STAGE_PADDING);
    });
    stages.push({ ...stage, x: 0, y: cursorY, width: 0, height, orientation: 'horizontal' });
    cursorY += height + STAGE_GAP;
  }

  const width = Math.max(320, base.width, maxRight);
  stages.forEach((stage) => { stage.width = width; });
  const height = Math.max(180, cursorY - STAGE_GAP);
  const edges = rerouteOrthogonalEdges(base.edges, nodes, visual.direction);
  return { ...base, width, height, nodes, edges, groups: [], stages };
}

export function applyStageLayout(base: LayoutResult, visual: VisualDocument): LayoutResult {
  if (visual.stages.length === 0) return base;
  return visual.direction === 'right' || visual.direction === 'left'
    ? layoutHorizontalStages(base, visual)
    : layoutVerticalStages(base, visual);
}
