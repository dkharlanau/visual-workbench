import type { NodeType, Status, VisualDocument, VisualEdge, VisualNode, VisualView, ViewFocus } from './schema.js';

export class VisualViewError extends Error {
  constructor(message: string, public readonly details: string[] = []) {
    super(message);
    this.name = 'VisualViewError';
  }
}

const executiveTypes = new Set<NodeType>(['system', 'decision', 'checkpoint', 'milestone', 'outcome', 'risk']);
const flowTypes = new Set<NodeType>(['step', 'system', 'role', 'decision', 'checkpoint', 'milestone', 'outcome', 'risk']);

function idsMatching(visual: VisualDocument, predicate: (node: VisualNode) => boolean): Set<string> {
  return new Set(visual.nodes.filter(predicate).map((node) => node.id));
}

function addEdgeEndpoints(visual: VisualDocument, ids: Set<string>, predicate: (edge: VisualEdge) => boolean): void {
  visual.edges.filter(predicate).forEach((edge) => {
    ids.add(edge.from);
    ids.add(edge.to);
  });
}

function expandOneHop(visual: VisualDocument, ids: Set<string>): Set<string> {
  const expanded = new Set(ids);
  visual.edges.forEach((edge) => {
    if (ids.has(edge.from) || ids.has(edge.to)) {
      expanded.add(edge.from);
      expanded.add(edge.to);
    }
  });
  return expanded;
}

function presetIds(visual: VisualDocument, focus: ViewFocus): Set<string> {
  switch (focus) {
    case 'all':
      return new Set(visual.nodes.map((node) => node.id));
    case 'executive':
      return idsMatching(visual, (node) => executiveTypes.has(node.type) || node.status === 'warning' || node.status === 'danger');
    case 'flow':
      return idsMatching(visual, (node) => flowTypes.has(node.type));
    case 'data': {
      const ids = idsMatching(visual, (node) => node.type === 'data');
      addEdgeEndpoints(visual, ids, (edge) => edge.type === 'data');
      return expandOneHop(visual, ids);
    }
    case 'controls': {
      const ids = idsMatching(visual, (node) => node.type === 'checkpoint' || node.type === 'decision' || node.type === 'risk');
      addEdgeEndpoints(visual, ids, (edge) => edge.type === 'control' || edge.type === 'exception');
      return expandOneHop(visual, ids);
    }
    case 'exceptions': {
      const ids = idsMatching(visual, (node) => node.type === 'risk' || node.status === 'danger');
      addEdgeEndpoints(visual, ids, (edge) => edge.type === 'exception' || edge.status === 'danger');
      return expandOneHop(visual, ids);
    }
  }
}

function containsAny(values: string[], selected?: string[]): boolean {
  return !selected || selected.some((value) => values.includes(value));
}

function passesNodeFilters(node: VisualNode, view: VisualView): boolean {
  if (view.includeNodeTypes && !view.includeNodeTypes.includes(node.type)) return false;
  if (view.excludeNodeTypes?.includes(node.type)) return false;
  if (view.includeGroups && (!node.group || !view.includeGroups.includes(node.group))) return false;
  if (view.excludeGroups && node.group && view.excludeGroups.includes(node.group)) return false;
  if (!containsAny(node.tags, view.includeTags)) return false;
  if (view.statuses && !view.statuses.includes(node.status as Status)) return false;
  return true;
}

function passesEdgeFilters(edge: VisualEdge, view: VisualView): boolean {
  if (view.includeEdgeTypes && !view.includeEdgeTypes.includes(edge.type)) return false;
  if (view.excludeEdgeTypes?.includes(edge.type)) return false;
  return true;
}

export interface VisualViewSummary {
  id: string;
  title: string;
  focus: ViewFocus;
  kind: VisualDocument['kind'];
}

export function listVisualViews(visual: VisualDocument): VisualViewSummary[] {
  return visual.views.map((view) => ({
    id: view.id,
    title: view.title ?? view.id,
    focus: view.focus,
    kind: view.kind ?? visual.kind,
  }));
}

export function projectVisualView(visual: VisualDocument, viewId?: string): VisualDocument {
  if (!viewId) return visual;
  const view = visual.views.find((candidate) => candidate.id === viewId);
  if (!view) {
    throw new VisualViewError(`Unknown visual view: ${viewId}`, visual.views.map((candidate) => candidate.id));
  }

  const candidateIds = presetIds(visual, view.focus);
  const nodes = visual.nodes.filter((node) => candidateIds.has(node.id) && passesNodeFilters(node, view));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = visual.edges.filter((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to) && passesEdgeFilters(edge, view));

  if (nodes.length === 0) {
    throw new VisualViewError(`View ${view.id} selected no nodes.`, ['Relax the focus or include filters for this view.']);
  }

  const projected: VisualDocument = { ...visual, nodes, edges, views: [] };
  if (view.title) projected.title = view.title;
  if (view.description) projected.description = view.description;
  if (view.kind) projected.kind = view.kind;
  if (view.direction) projected.direction = view.direction;
  if (view.theme) projected.theme = view.theme;
  if (view.density) projected.density = view.density;
  return projected;
}
