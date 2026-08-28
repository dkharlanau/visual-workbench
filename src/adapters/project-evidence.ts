import { createHash } from 'node:crypto';
import { z } from 'zod';
import type { EdgeType, NodeType, Status, VisualDocument, VisualEdge, VisualNode } from '../schema.js';

const ProjectEvidenceNodeSchema = z.object({
  id: z.string().trim().min(1),
  type: z.string().trim().min(1).default('artifact'),
  title: z.string().trim().min(1).optional(),
  status: z.string().trim().min(1).optional(),
  risk: z.string().trim().min(1).optional(),
}).passthrough();

const ProjectEvidenceLinkSchema = z.object({
  from: z.string().trim().min(1),
  to: z.string().trim().min(1),
  type: z.string().trim().min(1).default('relation'),
}).passthrough();

export const ProjectEvidenceGraphSchema = z.object({
  nodes: z.array(ProjectEvidenceNodeSchema).min(1),
  links: z.array(ProjectEvidenceLinkSchema).default([]),
  external_bridges: z.array(ProjectEvidenceLinkSchema).default([]),
}).passthrough();

export type ProjectEvidenceGraph = z.infer<typeof ProjectEvidenceGraphSchema>;

export class ProjectEvidenceAdapterError extends Error {
  constructor(message: string, public readonly details: string[] = []) {
    super(message);
    this.name = 'ProjectEvidenceAdapterError';
  }
}

const nodeTypeMap: Record<string, NodeType> = {
  requirement: 'milestone',
  decision: 'decision',
  mapping: 'data',
  interface: 'system',
  test: 'checkpoint',
  defect: 'risk',
  change: 'step',
  evidence: 'outcome',
  checkpoint: 'checkpoint',
  control: 'checkpoint',
  risk: 'risk',
  process: 'step',
  task: 'step',
  cutover_task: 'step',
};

function stableVisualId(sourceId: string): string {
  const digest = createHash('sha256').update(sourceId).digest('hex').slice(0, 8);
  const slug = sourceId
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^[^a-zA-Z0-9]+/, '')
    .replace(/-+$/g, '')
    .slice(0, 72) || 'artifact';
  return `${slug}-${digest}`;
}

function nodeStatus(type: string, rawStatus?: string, rawRisk?: string): Status {
  const status = (rawStatus ?? '').toLowerCase();
  const risk = (rawRisk ?? '').toLowerCase();

  if (['failed', 'failure', 'error', 'blocked', 'rejected', 'invalid'].includes(status)) return 'danger';
  if (['warning', 'warn', 'stale', 'at_risk', 'at-risk'].includes(status)) return 'warning';
  if (['passed', 'pass', 'complete', 'completed', 'approved', 'resolved', 'verified', 'success'].includes(status)) return 'success';
  if (['unknown', 'unverified', 'pending', 'draft'].includes(status)) return 'muted';
  if (['critical', 'high'].includes(risk)) return 'warning';
  if (type.toLowerCase() === 'defect') return 'danger';
  return 'neutral';
}

function edgeType(type: string): EdgeType {
  const value = type.toLowerCase();
  if (/(revealed|failed|blocked|violat|exception)/.test(value)) return 'exception';
  if (/(verified|substantiated|evidence|tested|assured)/.test(value)) return 'control';
  if (/(implemented|fixed|resolved|depends|required|requires|derived)/.test(value)) return 'dependency';
  if (/(map|transform|replicat|flow|transfer)/.test(value)) return 'data';
  return 'relation';
}

function mapNode(node: z.infer<typeof ProjectEvidenceNodeSchema>, visualId: string): VisualNode {
  const artifactType = node.type.toLowerCase();
  const subtitle = `${node.type} · ${node.id}`;
  return {
    id: visualId,
    label: node.title ?? node.id,
    type: nodeTypeMap[artifactType] ?? 'note',
    subtitle,
    status: nodeStatus(artifactType, node.status, node.risk),
    tags: ['project-evidence', `artifact:${artifactType}`, `source-id:${node.id}`],
  };
}

function mapEdge(link: z.infer<typeof ProjectEvidenceLinkSchema>, idMap: Map<string, string>, external = false): VisualEdge {
  const type = edgeType(link.type);
  return {
    from: idMap.get(link.from)!,
    to: idMap.get(link.to)!,
    label: link.type.replace(/_/g, ' '),
    type,
    status: type === 'exception' ? 'danger' : 'neutral',
    note: external
      ? `Project Evidence Graph external bridge: ${link.type}`
      : `Project Evidence Graph relation: ${link.type}`,
  };
}

export function adaptProjectEvidenceGraph(input: unknown, title = 'Project evidence'): VisualDocument {
  const parsed = ProjectEvidenceGraphSchema.safeParse(input);
  if (!parsed.success) {
    throw new ProjectEvidenceAdapterError(
      'Invalid Project Evidence Graph input.',
      parsed.error.issues.map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`),
    );
  }

  const sourceIds = new Set<string>();
  const idMap = new Map<string, string>();
  const duplicateIds: string[] = [];
  for (const node of parsed.data.nodes) {
    if (sourceIds.has(node.id)) duplicateIds.push(node.id);
    sourceIds.add(node.id);
    idMap.set(node.id, stableVisualId(node.id));
  }
  if (duplicateIds.length > 0) {
    throw new ProjectEvidenceAdapterError('Project Evidence Graph contains duplicate node IDs.', [...new Set(duplicateIds)]);
  }

  const unresolved = parsed.data.links
    .filter((link) => !sourceIds.has(link.from) || !sourceIds.has(link.to))
    .map((link) => `${link.from} -> ${link.to} (${link.type})`);
  if (unresolved.length > 0) {
    throw new ProjectEvidenceAdapterError('Project Evidence Graph contains unresolved link endpoints.', unresolved);
  }

  const invalidExternalSources = parsed.data.external_bridges
    .filter((bridge) => !sourceIds.has(bridge.from))
    .map((bridge) => `${bridge.from} -> ${bridge.to} (${bridge.type})`);
  if (invalidExternalSources.length > 0) {
    throw new ProjectEvidenceAdapterError('Project Evidence Graph contains external bridges from unknown local artifacts.', invalidExternalSources);
  }

  const externalTargets = new Set(
    parsed.data.external_bridges
      .map((bridge) => bridge.to)
      .filter((target) => !sourceIds.has(target)),
  );
  for (const target of externalTargets) idMap.set(target, stableVisualId(target));

  const nodes: VisualNode[] = parsed.data.nodes.map((node) => mapNode(node, idMap.get(node.id)!));
  for (const target of [...externalTargets].sort()) {
    nodes.push({
      id: idMap.get(target)!,
      label: 'External evidence reference',
      type: 'outcome',
      subtitle: target,
      description: 'External artifact referenced by Project Evidence Graph. The target remains owned and validated by its source repository.',
      status: 'neutral',
      tags: ['project-evidence', 'external-reference', `source-id:${target}`],
    });
  }

  const edges: VisualEdge[] = [
    ...parsed.data.links.map((link) => mapEdge(link, idMap)),
    ...parsed.data.external_bridges.map((bridge) => mapEdge(bridge, idMap, true)),
  ];

  return {
    version: 1,
    title,
    description: 'Read-only visual projection of a Project Evidence Graph artifact. Project Evidence Graph remains the semantic source of truth; Visual Workbench owns presentation only.',
    kind: 'relationship',
    direction: 'right',
    theme: 'paper',
    density: 'balanced',
    groups: [],
    nodes,
    edges,
    views: [
      {
        id: 'executive',
        title: `${title} · executive`,
        focus: 'executive',
        kind: 'relationship',
        density: 'airy',
      },
      {
        id: 'assurance',
        title: `${title} · assurance`,
        focus: 'controls',
        kind: 'relationship',
      },
      {
        id: 'exceptions',
        title: `${title} · exceptions`,
        focus: 'exceptions',
        kind: 'relationship',
      },
    ],
  };
}
