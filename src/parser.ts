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
  if (!normalized.startsWith('---\n')) {
    throw new VisualWorkbenchError('Visual Workbench documents must start with YAML front matter delimited by ---');
  }
  const closingIndex = normalized.indexOf('\n---\n', 4);
  if (closingIndex === -1) {
    throw new VisualWorkbenchError('Could not find the closing --- for YAML front matter.');
  }
  return {
    metadata: normalized.slice(4, closingIndex),
    body: normalized.slice(closingIndex + 5).trim(),
  };
}

function validateRelationships(visual: VisualDocument): void {
  const seen = new Set<string>();
  const details: string[] = [];
  visual.nodes.forEach((node) => {
    if (seen.has(node.id)) details.push(`Duplicate node id: ${node.id}`);
    seen.add(node.id);
  });
  visual.edges.forEach((edge, index) => {
    if (!seen.has(edge.from)) details.push(`edges[${index}].from references missing node: ${edge.from}`);
    if (!seen.has(edge.to)) details.push(`edges[${index}].to references missing node: ${edge.to}`);
    if (edge.from === edge.to) details.push(`edges[${index}] creates a self-loop on ${edge.from}; self-loops are not supported yet.`);
  });
  if (details.length > 0) {
    throw new VisualWorkbenchError('The visual model contains invalid relationships.', details);
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
  validateRelationships(result.data.visual);
  return { visual: result.data.visual, body };
}
