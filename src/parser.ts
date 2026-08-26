import { parse as parseYaml } from 'yaml';
import { MarkdownEnvelopeSchema, type VisualDocument } from './schema.js';

export interface ParsedVisualMarkdown {
  visual: VisualDocument;
  body: string;
}

export class VisualWorkbenchError extends Error {
  constructor(message: string, public readonly details: string[] = []) {
    super(message);
    this.name = 'VisualWorkbenchError';
  }
}

function splitFrontMatter(markdown: string): { metadata: string; body: string } {
  const normalized = markdown.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) {
    throw new VisualWorkbenchError('Visual Workbench documents must start with YAML front matter delimited by ---');
  }
  return {
    metadata: match[1] ?? '',
    body: normalized.slice(match[0].length).trim(),
  };
}

function validateModel(visual: VisualDocument): void {
  const nodeIds = new Set<string>();
  const viewIds = new Set<string>();
  const groupIds = new Set<string>();
  const details: string[] = [];

  visual.groups.forEach((group) => {
    if (groupIds.has(group.id)) details.push(`Duplicate group id: ${group.id}`);
    groupIds.add(group.id);
  });

  visual.nodes.forEach((node) => {
    if (nodeIds.has(node.id)) details.push(`Duplicate node id: ${node.id}`);
    nodeIds.add(node.id);
    if (node.group && !groupIds.has(node.group)) details.push(`Node ${node.id} references missing group: ${node.group}`);
    if (visual.groups.length > 0 && !node.group) details.push(`Node ${node.id} has no group while lane groups are active.`);
  });

  visual.edges.forEach((edge, index) => {
    if (!nodeIds.has(edge.from)) details.push(`edges[${index}].from references missing node: ${edge.from}`);
    if (!nodeIds.has(edge.to)) details.push(`edges[${index}].to references missing node: ${edge.to}`);
    if (edge.from === edge.to) details.push(`edges[${index}] creates a self-loop on ${edge.from}; self-loops are not supported yet.`);
  });

  visual.views.forEach((view) => {
    if (viewIds.has(view.id)) details.push(`Duplicate view id: ${view.id}`);
    viewIds.add(view.id);
    for (const groupId of [...(view.includeGroups ?? []), ...(view.excludeGroups ?? [])]) {
      if (!groupIds.has(groupId)) details.push(`View ${view.id} references missing group: ${groupId}`);
    }
  });

  if (details.length > 0) {
    throw new VisualWorkbenchError('The visual model contains invalid relationships or identifiers.', details);
  }
}

export function parseVisualMarkdown(markdown: string): ParsedVisualMarkdown {
  const { metadata, body } = splitFrontMatter(markdown);
  let raw: unknown;
  try {
    raw = parseYaml(metadata);
  } catch (error) {
    throw new VisualWorkbenchError(`Invalid YAML front matter: ${error instanceof Error ? error.message : String(error)}`);
  }
  const result = MarkdownEnvelopeSchema.safeParse(raw);
  if (!result.success) {
    const details = result.error.issues.map((issue) => `${issue.path.join('.') || 'visual'}: ${issue.message}`);
    throw new VisualWorkbenchError('Visual metadata does not match the Visual Workbench schema.', details);
  }
  validateModel(result.data.visual);
  return { visual: result.data.visual, body };
}
