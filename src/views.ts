import type { EdgeType, NodeType, Status, VisualDocument, VisualEdge, VisualNode, VisualView, ViewFocus } from './schema.js';

export class VisualViewError extends Error {
  constructor(message: string, public readonly details: string[] = []) {
    super(message);
    this.name = 'VisualViewError';
  }
}

const executiveTypes = new Set<NodeType>(['system', 'decision', 'checkpoint', 'milestone', 'outcome', 'risk']);
const flowTypes = new Set<NodeType>(['step', 'system', 'role', 'decision', 'checkpoint', 'milestone', 'outcome', 'risk']);
const edgeTypePriority: EdgeType[] = ['exception', 'control', 'dependency', 'data', 'flow', 'relation'];

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
    case 'executive': {
      const ids = idsMatching(visual, (node) => executiveTypes.has(node.type) || node.status === 'warning' || node.status === 'danger');
      return ids.size > 0 ? ids : idsMatching(visual, (node) => node.type === 'step' || node.type === 'role');
    }
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

function collapsedEdgeType(path: VisualEdge[]): EdgeType {
  return edgeTypePriority.find((type) => path.some((edge) => edge.type === type)) ?? 'flow';
}

function collapsedStatus(path: VisualEdge[]): Status {
  if (path.some((edge) => edge.status === 'danger')) return 'danger';
  if (path.some((edge) => edge.status === 'warning')) return 'warning';
  return 'neutral';
}

function collapsedLabel(hiddenNodes: VisualNode[]): string | undefined {
  if (hiddenNodes.length === 0) return undefined;
  const first = hiddenNodes[0]?.label ?? '';
  const short = first.length > 28 ? `${first.slice(0, 27)}…` : first;
  return hiddenNodes.length === 1 ? `via ${short}` : `via ${short} +${hiddenNodes.length - 1}`;
}

function projectEdges(visual: VisualDocument, selectedIds: Set<string>, view: VisualView): VisualEdge[] {
  const allowedEdges = visual.edges.filter((edge) => passesEdgeFilters(edge, view));
  const direct = allowedEdges.filter((edge) => selectedIds.has(edge.from) && selectedIds.has(edge.to));
  const results: VisualEdge[] = [...direct];
  const occupiedBridgeKeys = new Set(direct.map((edge) => `${edge.from}|${edge.to}|${edge.type}`));

  const outgoing = new Map<string, VisualEdge[]>();
  allowedEdges.forEach((edge) => {
    const list = outgoing.get(edge.from) ?? [];
    list.push(edge);
    outgoing.set(edge.from, list);
  });
  const nodeById = new Map(visual.nodes.map((node) => [node.id, node]));
  const maxHiddenDepth = 6;

  for (const source of selectedIds) {
    const queue: Array<{ nodeId: string; path: VisualEdge[]; hiddenIds: string[] }> = [{ nodeId: source, path: [], hiddenIds: [] }];
    const bestDepth = new Map<string, number>([[source, 0]]);

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) break;
      for (const edge of outgoing.get(current.nodeId) ?? []) {
        const path = [...current.path, edge];
        if (selectedIds.has(edge.to)) {
          if (edge.to === source || current.hiddenIds.length === 0) continue;
          const hiddenNodes = current.hiddenIds.map((id) => nodeById.get(id)).filter((node): node is VisualNode => Boolean(node));
          const type = collapsedEdgeType(path);
          const status = collapsedStatus(path);
          const label = collapsedLabel(hiddenNodes);
          const collapsed: VisualEdge = {
            from: source,
            to: edge.to,
            type,
            status,
            note: `Collapsed view path through: ${hiddenNodes.map((node) => node.label).join(' → ')}`,
            ...(label ? { label } : {}),
          };
          const key = `${collapsed.from}|${collapsed.to}|${collapsed.type}`;
          if (!occupiedBridgeKeys.has(key)) {
            results.push(collapsed);
            occupiedBridgeKeys.add(key);
          }
          continue;
        }

        const nextDepth = current.hiddenIds.length + 1;
        if (nextDepth > maxHiddenDepth) continue;
        const previousDepth = bestDepth.get(edge.to);
        if (previousDepth != null && previousDepth <= nextDepth) continue;
        bestDepth.set(edge.to, nextDepth);
        queue.push({ nodeId: edge.to, path, hiddenIds: [...current.hiddenIds, edge.to] });
      }
    }
  }

  return results;
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
  const edges = projectEdges(visual, nodeIds, view);

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
