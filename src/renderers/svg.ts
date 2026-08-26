import type { LayoutResult, Point, PositionedEdge, PositionedGroup, PositionedNode } from '../layout.js';
import type { VisualDocument } from '../schema.js';
import { getTheme, type Theme } from '../themes.js';

const HEADER_HEIGHT = 104;
const MARGIN = 28;

function escapeXml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

function wrapText(value: string, maxChars: number): string[] {
  const words = value.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (!current) { current = word; continue; }
    if (`${current} ${word}`.length <= maxChars) current += ` ${word}`;
    else { lines.push(current); current = word; }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function shifted(point: Point): Point {
  return { x: point.x + MARGIN, y: point.y + HEADER_HEIGHT };
}

function pathData(points: Point[]): string {
  if (points.length === 0) return '';
  const [first, ...rest] = points.map(shifted);
  if (!first) return '';
  return [`M ${first.x} ${first.y}`, ...rest.map((point) => `L ${point.x} ${point.y}`)].join(' ');
}

function renderGroup(group: PositionedGroup, theme: Theme): string {
  const x = group.x + MARGIN;
  const y = group.y + HEADER_HEIGHT;
  const label = escapeXml(group.label);
  const description = group.description ? `<title>${escapeXml(group.description)}</title>` : '';
  return `<g data-group-id="${escapeXml(group.id)}">
  ${description}
  <rect x="${x}" y="${y}" width="${group.width}" height="${group.height}" rx="12" fill="${theme.card}" fill-opacity="0.48" stroke="${theme.border}"/>
  <line x1="${x}" y1="${y + 30}" x2="${x + group.width}" y2="${y + 30}" stroke="${theme.border}"/>
  <text x="${x + 14}" y="${y + 20}" font-size="10" font-weight="750" letter-spacing="1.1" fill="${theme.muted}">${label.toUpperCase()}</text>
</g>`;
}

function edgeAppearance(edge: PositionedEdge, theme: Theme): { stroke: string; dash?: string; marker: string } {
  if (edge.type === 'exception' || edge.status === 'danger') return { stroke: theme.statuses.danger, dash: '7 7', marker: 'arrow-danger' };
  if (edge.type === 'control') return { stroke: theme.nodeAccents.checkpoint, dash: '5 5', marker: 'arrow-control' };
  if (edge.type === 'data') return { stroke: theme.nodeAccents.data, marker: 'arrow-data' };
  if (edge.type === 'dependency') return { stroke: theme.edge, dash: '3 6', marker: 'arrow-default' };
  return { stroke: theme.edge, marker: 'arrow-default' };
}

function renderEdge(edge: PositionedEdge, theme: Theme): string {
  const appearance = edgeAppearance(edge, theme);
  const d = pathData(edge.points);
  if (!d) return '';
  const line = `<path d="${d}" fill="none" stroke="${appearance.stroke}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"${appearance.dash ? ` stroke-dasharray="${appearance.dash}"` : ''} marker-end="url(#${appearance.marker})"/>`;
  if (!edge.label || !edge.labelPosition) return line;
  const pos = shifted(edge.labelPosition);
  const width = Math.min(176, Math.max(58, edge.label.length * 6.4 + 22));
  const x = pos.x - width / 2;
  const y = pos.y - 12;
  return `${line}\n<g><rect x="${x}" y="${y}" width="${width}" height="24" rx="12" fill="${theme.edgeLabel}" stroke="${theme.border}"/><text x="${pos.x}" y="${pos.y + 4}" text-anchor="middle" font-size="11" font-weight="600" fill="${theme.edgeLabelText}">${escapeXml(edge.label)}</text></g>`;
}

function nodeTypeLabel(node: PositionedNode): string {
  return node.type.replace('-', ' ').toUpperCase();
}

function renderNode(node: PositionedNode, theme: Theme): string {
  const x = node.x + MARGIN;
  const y = node.y + HEADER_HEIGHT;
  const accent = node.status === 'neutral' ? theme.nodeAccents[node.type] : theme.statuses[node.status];
  const labelLines = wrapText(node.label, Math.max(16, Math.floor(node.width / 8.2)));
  const subtitleLines = node.subtitle ? wrapText(node.subtitle, Math.max(20, Math.floor(node.width / 7.1))).slice(0, 1) : [];
  const ownerLines = node.owner ? wrapText(node.owner, Math.max(20, Math.floor(node.width / 7.1))).slice(0, 1) : [];
  const bodyTop = y + 45;
  const labelText = labelLines.map((line, index) => `<tspan x="${x + 18}" dy="${index === 0 ? 0 : 18}">${escapeXml(line)}</tspan>`).join('');
  const labelBottom = bodyTop + Math.max(0, labelLines.length - 1) * 18;
  const subtitle = subtitleLines.length ? `<text x="${x + 18}" y="${labelBottom + 21}" font-size="11.5" fill="${theme.muted}">${escapeXml(subtitleLines[0] ?? '')}</text>` : '';
  const owner = ownerLines.length ? `<text x="${x + 18}" y="${y + node.height - 14}" font-size="10.5" font-weight="600" fill="${theme.muted}">${escapeXml(ownerLines[0] ?? '')}</text>` : '';
  return `<g data-node-id="${escapeXml(node.id)}">
  <rect x="${x}" y="${y}" width="${node.width}" height="${node.height}" rx="14" fill="${theme.card}" stroke="${theme.border}"/>
  <rect x="${x}" y="${y}" width="4" height="${node.height}" rx="2" fill="${accent}"/>
  <circle cx="${x + node.width - 17}" cy="${y + 17}" r="4" fill="${theme.statuses[node.status]}"/>
  <text x="${x + 18}" y="${y + 22}" font-size="9.5" font-weight="700" letter-spacing="1.1" fill="${accent}">${escapeXml(nodeTypeLabel(node))}</text>
  <text x="${x + 18}" y="${bodyTop}" font-size="14" font-weight="650" fill="${theme.text}">${labelText}</text>
  ${subtitle}
  ${owner}
</g>`;
}

function marker(id: string, color: string): string {
  return `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${color}"/></marker>`;
}

export function renderSvg(visual: VisualDocument, layout: LayoutResult): string {
  const theme = getTheme(visual.theme);
  const width = Math.ceil(layout.width + MARGIN * 2);
  const height = Math.ceil(layout.height + HEADER_HEIGHT + MARGIN);
  const description = visual.description ? `<text x="${MARGIN}" y="66" font-size="12.5" fill="${theme.muted}">${escapeXml(visual.description)}</text>` : '';
  const kind = visual.kind.replace('-', ' ').toUpperCase();
  const kindWidth = Math.max(72, kind.length * 7 + 24);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="vwb-title vwb-desc">
  <title id="vwb-title">${escapeXml(visual.title)}</title>
  <desc id="vwb-desc">${escapeXml(visual.description ?? `${visual.kind} generated by Visual Workbench`)}</desc>
  <defs>
    ${marker('arrow-default', theme.edge)}
    ${marker('arrow-data', theme.nodeAccents.data)}
    ${marker('arrow-control', theme.nodeAccents.checkpoint)}
    ${marker('arrow-danger', theme.statuses.danger)}
  </defs>
  <rect width="${width}" height="${height}" fill="${theme.canvas}"/>
  <text x="${MARGIN}" y="38" font-family="Inter, ui-sans-serif, system-ui, sans-serif" font-size="24" font-weight="720" letter-spacing="-0.4" fill="${theme.text}">${escapeXml(visual.title)}</text>
  ${description}
  <g font-family="Inter, ui-sans-serif, system-ui, sans-serif">
    <rect x="${width - MARGIN - kindWidth}" y="22" width="${kindWidth}" height="26" rx="13" fill="${theme.card}" stroke="${theme.border}"/>
    <text x="${width - MARGIN - kindWidth / 2}" y="39" text-anchor="middle" font-size="9.5" font-weight="700" letter-spacing="1" fill="${theme.muted}">${escapeXml(kind)}</text>
    ${layout.groups.map((group) => renderGroup(group, theme)).join('\n')}
    ${layout.edges.map((edge) => renderEdge(edge, theme)).join('\n')}
    ${layout.nodes.map((node) => renderNode(node, theme)).join('\n')}
  </g>
</svg>`;
}
