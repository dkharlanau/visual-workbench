import { MultiDirectedGraph } from 'graphology';
import type { VisualDocument, VisualEdge, VisualNode } from './schema.js';

export type SemanticGraph = MultiDirectedGraph<VisualNode, VisualEdge>;

export function buildSemanticGraph(visual: VisualDocument): SemanticGraph {
  const graph = new MultiDirectedGraph<VisualNode, VisualEdge>({ allowSelfLoops: false });
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
    nodeTypes[attributes.type] = (nodeTypes[attributes.type] ?? 0) + 1;
    if (attributes.group) groups.add(attributes.group);
  });
  graph.forEachEdge((_id, attributes) => {
    edgeTypes[attributes.type] = (edgeTypes[attributes.type] ?? 0) + 1;
  });
  return { nodes: graph.order, edges: graph.size, nodeTypes, edgeTypes, groups: [...groups].sort() };
}
