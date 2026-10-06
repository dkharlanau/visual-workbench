import type {
  EdgeType,
  NodeType,
  ProjectionLimitReason,
  Status,
  VisualDocument,
  VisualEdge,
  VisualNode,
  VisualView,
  ViewFocus,
} from './schema.js';

export class VisualViewError extends Error {
  constructor(message: string, public readonly details: string[] = []) {
    super(message);
    this.name = 'VisualViewError';
  }
}

const executiveTypes = new Set<NodeType>(['system', 'decision', 'checkpoint', 'milestone', 'outcome', 'risk']);
const flowTypes = new Set<NodeType>(['step', 'system', 'role', 'decision', 'checkpoint', 'milestone', 'outcome', 'risk']);
const edgeTypePriority: EdgeType[] = ['exception', 'control', 'dependency', 'data', 'flow', 'relation'];
const limitReasonOrder: ProjectionLimitReason[] = ['depth', 'cycle', 'budget'];

export const MAX_HIDDEN_DEPTH = 6;
export const MAX_EXPLORATION_STATES_PER_SOURCE = 256;
export const MAX_SOURCE_PATH_REFS_PER_BRIDGE = 8;

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
    case 'all': return new Set(visual.nodes.map((node) => node.id));
    case 'executive': {
      const ids = idsMatching(visual, (node) => executiveTypes.has(node.type) || node.status === 'warning' || node.status === 'danger');
      return ids.size > 0 ? ids : idsMatching(visual, (node) => node.type === 'step' || node.type === 'role');
    }
    case 'flow': return idsMatching(visual, (node) => flowTypes.has(node.type));
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
  if (view.includeStages && (!node.stage || !view.includeStages.includes(node.stage))) return false;
  if (view.excludeStages && node.stage && view.excludeStages.includes(node.stage)) return false;
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

function isRiskNode(node: VisualNode): boolean {
  return node.type === 'risk' || node.status === 'warning' || node.status === 'danger';
}

function conservativeStatus(path: VisualEdge[], hiddenNodes: VisualNode[]): Status {
  const statuses = [...path.map((edge) => edge.status), ...hiddenNodes.map((node) => node.status)];
  if (statuses.includes('danger')) return 'danger';
  if (statuses.includes('warning')) return 'warning';
  return 'neutral';
}

function collapsedLabel(hiddenNodes: VisualNode[]): string | undefined {
  if (hiddenNodes.length === 0) return undefined;
  const first = hiddenNodes[0]?.label ?? '';
  const short = first.length > 28 ? `${first.slice(0, 27)}…` : first;
  return hiddenNodes.length === 1 ? `via ${short}` : `via ${short} +${hiddenNodes.length - 1}`;
}

function edgeRef(edge: VisualEdge): string {
  const label = edge.label ? `:${edge.label}` : '';
  return `${edge.from}->${edge.to}:${edge.type}:${edge.status}${label}`;
}

function pathRef(path: VisualEdge[], hiddenIds: string[]): string {
  return `hidden=${hiddenIds.join('>')}|edges=${path.map(edgeRef).join('>')}`;
}

function sortedLimitReasons(reasons: Iterable<ProjectionLimitReason>): ProjectionLimitReason[] {
  const set = new Set(reasons);
  return limitReasonOrder.filter((reason) => set.has(reason));
}

function mergeStatus(current: Status, candidate: Status): Status {
  if (current === 'danger' || candidate === 'danger') return 'danger';
  if (current === 'warning' || candidate === 'warning') return 'warning';
  return 'neutral';
}

interface BridgeAggregate {
  from: string;
  to: string;
  type: EdgeType;
  status: Status;
  pathCount: number;
  hiddenNodeIds: Set<string>;
  hiddenRiskNodeIds: Set<string>;
  sourcePathRefs: Set<string>;
  sourcePathRefsTruncated: boolean;
  representative?: { ref: string; hiddenNodes: VisualNode[] };
}

interface ProjectedEdgesResult {
  edges: VisualEdge[];
  limitReasons: ProjectionLimitReason[];
  collapsedEdgeCount: number;
}

function projectEdges(visual: VisualDocument, selectedIds: Set<string>, view: VisualView): ProjectedEdgesResult {
  const allowedEdges = visual.edges.filter((edge) => passesEdgeFilters(edge, view));
  const direct = allowedEdges.filter((edge) => selectedIds.has(edge.from) && selectedIds.has(edge.to));
  const outgoing = new Map<string, VisualEdge[]>();
  allowedEdges.forEach((edge) => {
    const list = outgoing.get(edge.from) ?? [];
    list.push(edge);
    outgoing.set(edge.from, list);
  });
  outgoing.forEach((edges) => edges.sort((a, b) => edgeRef(a).localeCompare(edgeRef(b))));

  const nodeById = new Map(visual.nodes.map((node) => [node.id, node]));
  const bridges = new Map<string, BridgeAggregate>();
  const sourceLimitReasons = new Map<string, Set<ProjectionLimitReason>>();
  const globalLimitReasons = new Set<ProjectionLimitReason>();

  for (const source of [...selectedIds].sort()) {
    const limitReasons = new Set<ProjectionLimitReason>();
    sourceLimitReasons.set(source, limitReasons);
    const queue: Array<{ nodeId: string; path: VisualEdge[]; hiddenIds: string[]; visited: Set<string> }> = [
      { nodeId: source, path: [], hiddenIds: [], visited: new Set([source]) },
    ];
    let exploredStates = 0;

    while (queue.length > 0) {
      if (exploredStates >= MAX_EXPLORATION_STATES_PER_SOURCE) {
        limitReasons.add('budget');
        globalLimitReasons.add('budget');
        break;
      }
      const current = queue.shift();
      if (!current) break;
      exploredStates += 1;

      for (const edge of outgoing.get(current.nodeId) ?? []) {
        const path = [...current.path, edge];

        if (selectedIds.has(edge.to)) {
          if (edge.to === source) {
            if (current.hiddenIds.length > 0) {
              limitReasons.add('cycle');
              globalLimitReasons.add('cycle');
            }
            continue;
          }
          if (current.hiddenIds.length === 0) continue;

          const hiddenNodes = current.hiddenIds
            .map((id) => nodeById.get(id))
            .filter((node): node is VisualNode => Boolean(node));
          const type = collapsedEdgeType(path);
          const status = conservativeStatus(path, hiddenNodes);
          const ref = pathRef(path, current.hiddenIds);
          const key = `${source}|${edge.to}|${type}`;
          let aggregate = bridges.get(key);
          if (!aggregate) {
            aggregate = {
              from: source,
              to: edge.to,
              type,
              status: 'neutral',
              pathCount: 0,
              hiddenNodeIds: new Set(),
              hiddenRiskNodeIds: new Set(),
              sourcePathRefs: new Set(),
              sourcePathRefsTruncated: false,
            };
            bridges.set(key, aggregate);
          }

          aggregate.pathCount += 1;
          aggregate.status = mergeStatus(aggregate.status, status);
          hiddenNodes.forEach((node) => {
            aggregate?.hiddenNodeIds.add(node.id);
            if (isRiskNode(node)) aggregate?.hiddenRiskNodeIds.add(node.id);
          });

          if (aggregate.sourcePathRefs.has(ref) || aggregate.sourcePathRefs.size < MAX_SOURCE_PATH_REFS_PER_BRIDGE) {
            aggregate.sourcePathRefs.add(ref);
          } else {
            aggregate.sourcePathRefsTruncated = true;
          }
          if (!aggregate.representative || ref.localeCompare(aggregate.representative.ref) < 0) {
            aggregate.representative = { ref, hiddenNodes };
          }
          continue;
        }

        if (current.visited.has(edge.to)) {
          limitReasons.add('cycle');
          globalLimitReasons.add('cycle');
          continue;
        }

        const nextDepth = current.hiddenIds.length + 1;
        if (nextDepth > MAX_HIDDEN_DEPTH) {
          limitReasons.add('depth');
          globalLimitReasons.add('depth');
          continue;
        }

        queue.push({
          nodeId: edge.to,
          path,
          hiddenIds: [...current.hiddenIds, edge.to],
          visited: new Set([...current.visited, edge.to]),
        });
      }
    }
  }

  const collapsed = [...bridges.values()]
    .sort((a, b) => `${a.from}|${a.to}|${a.type}`.localeCompare(`${b.from}|${b.to}|${b.type}`))
    .map((aggregate): VisualEdge => {
      const hiddenNodeIds = [...aggregate.hiddenNodeIds].sort();
      const hiddenRiskNodeIds = [...aggregate.hiddenRiskNodeIds].sort();
      const sourcePathRefs = [...aggregate.sourcePathRefs].sort();
      const limitReasons = sortedLimitReasons(sourceLimitReasons.get(aggregate.from) ?? []);
      const hiddenLabels = hiddenNodeIds.map((id) => nodeById.get(id)?.label ?? id);
      const riskLabels = hiddenRiskNodeIds.map((id) => nodeById.get(id)?.label ?? id);
      const preview = hiddenLabels.slice(0, 3).join(', ');
      const hiddenSummary = hiddenLabels.length > 3 ? `${preview} +${hiddenLabels.length - 3}` : preview;
      const riskSummary = riskLabels.length > 0 ? `; hidden risk: ${riskLabels.join(', ')}` : '';
      const refsSummary = aggregate.sourcePathRefsTruncated
        ? `; provenance refs retained ${sourcePathRefs.length}/${aggregate.pathCount}`
        : '';
      const limitSummary = limitReasons.length > 0 ? `; exploration limited: ${limitReasons.join(', ')}` : '';
      const label = collapsedLabel(aggregate.representative?.hiddenNodes ?? []);

      return {
        from: aggregate.from,
        to: aggregate.to,
        type: aggregate.type,
        status: aggregate.status,
        note: `Collapsed view aggregation: ${aggregate.pathCount} source path(s); hidden nodes: ${hiddenSummary || 'none'}${riskSummary}${refsSummary}${limitSummary}`,
        ...(label ? { label } : {}),
        projection: {
          kind: 'collapsed-path',
          pathCount: aggregate.pathCount,
          hiddenNodeIds,
          hiddenRiskNodeIds,
          sourcePathRefs,
          sourcePathRefsTruncated: aggregate.sourcePathRefsTruncated,
          aggregation: 'conservative-max-severity',
          limited: limitReasons.length > 0,
          limitReasons,
        },
      };
    });

  return {
    edges: [...direct, ...collapsed],
    limitReasons: sortedLimitReasons(globalLimitReasons),
    collapsedEdgeCount: collapsed.length,
  };
}

export interface VisualViewSummary {
  id: string;
  title: string;
  focus: ViewFocus;
  kind: VisualDocument['kind'];
}

export function listVisualViews(visual: VisualDocument): VisualViewSummary[] {
  return visual.views.map((view) => ({ id: view.id, title: view.title ?? view.id, focus: view.focus, kind: view.kind ?? visual.kind }));
}

export function projectVisualView(visual: VisualDocument, viewId?: string): VisualDocument {
  if (!viewId) return visual;
  const view = visual.views.find((candidate) => candidate.id === viewId);
  if (!view) throw new VisualViewError(`Unknown visual view: ${viewId}`, visual.views.map((candidate) => candidate.id));

  const candidateIds = presetIds(visual, view.focus);
  const nodes = visual.nodes.filter((node) => candidateIds.has(node.id) && passesNodeFilters(node, view));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const projectedEdges = projectEdges(visual, nodeIds, view);
  if (nodes.length === 0) throw new VisualViewError(`View ${view.id} selected no nodes.`, ['Relax the focus or include filters for this view.']);

  const activeGroups = new Set(nodes.flatMap((node) => node.group ? [node.group] : []));
  const activeStages = new Set(nodes.flatMap((node) => node.stage ? [node.stage] : []));
  const hiddenNodes = visual.nodes.filter((node) => !nodeIds.has(node.id));
  const hiddenNodeIds = hiddenNodes.map((node) => node.id).sort();
  const hiddenRiskNodeIds = hiddenNodes.filter(isRiskNode).map((node) => node.id).sort();

  const projected: VisualDocument = {
    ...visual,
    groups: visual.groups.filter((group) => activeGroups.has(group.id)),
    stages: visual.stages.filter((stage) => activeStages.has(stage.id)),
    nodes,
    edges: projectedEdges.edges,
    views: [],
    projection: {
      viewId: view.id,
      sourceNodeCount: visual.nodes.length,
      visibleNodeCount: nodes.length,
      sourceEdgeCount: visual.edges.length,
      projectedEdgeCount: projectedEdges.edges.length,
      collapsedEdgeCount: projectedEdges.collapsedEdgeCount,
      hiddenNodeIds,
      hiddenRiskNodeIds,
      limited: projectedEdges.limitReasons.length > 0,
      limitReasons: projectedEdges.limitReasons,
      maxHiddenDepth: MAX_HIDDEN_DEPTH,
      maxExplorationStatesPerSource: MAX_EXPLORATION_STATES_PER_SOURCE,
      maxSourcePathRefsPerBridge: MAX_SOURCE_PATH_REFS_PER_BRIDGE,
    },
  };
  if (view.title) projected.title = view.title;
  if (view.description) projected.description = view.description;
  if (view.kind) projected.kind = view.kind;
  if (view.direction) projected.direction = view.direction;
  if (view.theme) projected.theme = view.theme;
  if (view.density) projected.density = view.density;
  return projected;
}
