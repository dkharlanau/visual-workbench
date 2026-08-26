import { buildSemanticGraph, summarizeGraph, type GraphSummary, type SemanticGraph } from './model.js';
import { layoutGraph, type LayoutResult } from './layout.js';
import { parseVisualMarkdown, type ParsedVisualMarkdown } from './parser.js';
import { renderHtml } from './renderers/html.js';
import { renderSvg } from './renderers/svg.js';
import type { VisualDocument } from './schema.js';
import { projectVisualView } from './views.js';

export * from './schema.js';
export * from './parser.js';
export * from './model.js';
export * from './layout.js';
export * from './lanes.js';
export * from './stages.js';
export * from './routing.js';
export * from './methods.js';
export * from './views.js';
export * from './renderers/svg.js';
export * from './renderers/html.js';
export * from './adapters/project-evidence.js';

export interface PreparedVisual {
  parsed: ParsedVisualMarkdown;
  visual: VisualDocument;
  graph: SemanticGraph;
  summary: GraphSummary;
  layout: LayoutResult;
}

export async function prepareVisual(markdown: string, viewId?: string): Promise<PreparedVisual> {
  const parsed = parseVisualMarkdown(markdown);
  const visual = projectVisualView(parsed.visual, viewId);
  const graph = buildSemanticGraph(visual);
  const summary = summarizeGraph(graph);
  const layout = await layoutGraph(graph, visual);
  return { parsed, visual, graph, summary, layout };
}

export async function renderMarkdown(markdown: string, format: 'svg' | 'html' = 'svg', viewId?: string): Promise<string> {
  const prepared = await prepareVisual(markdown, viewId);
  return format === 'html'
    ? renderHtml(prepared.visual, prepared.layout, prepared.parsed.body)
    : renderSvg(prepared.visual, prepared.layout);
}

export async function renderVisual(visual: VisualDocument, format: 'svg' | 'html' = 'svg'): Promise<string> {
  const graph = buildSemanticGraph(visual);
  const layout = await layoutGraph(graph, visual);
  return format === 'html' ? renderHtml(visual, layout) : renderSvg(visual, layout);
}
