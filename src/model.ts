import { MultiDirectedGraph } from 'graphology';
import type { VisualDocument } from './schema.js';

export type SemanticGraph = MultiDirectedGraph;

export function buildSemanticGraph(visual: VisualDocument): SemanticGraph {
  const graph = new MultiDirectedGraph({ allowSelfLoops: false });
  visual.nodes.forEach((node) => graph.addNode(node.id, { ...node }));
  visual.edges.forEach((edge, index) => graph.addEdgeWithKey(`e${index + 1}`, edge.from, edge.to, { ...edge }));
  return graph;
}

export interface GraphSummary {
  nodes: number;
  edges: number;
  nodeTypes: Record<string, number>;
  edgeTypes: Record<string, number>;
  groups: string[];
}

export function summarizeGraph(graph: SemanticGraph): GraphSummary {
  const nodeTypes: Record<string, number> = {};
  const edgeTypes: Record<string, number> = {};
  const groups = new Set<string>();
  graph.forEachNode((_id, attributes) => {
    const type = String(attributes.type ?? 'step');
    nodeTypes[type] = (nodeTypes[type] ?? 0) + 1;
    if (attributes.group) groups.add(String(attributes.group));
  });
  graph.forEachEdge((_id, attributes) => {
    const type = String(attributes.type ?? 'flow');
    edgeTypes[type] = (edgeTypes[type] ?? 0) + 1;
  });
  return { nodes: graph.order, edges: graph.size, nodeTypes, edgeTypes, groups: [...groups].sort() };
}
