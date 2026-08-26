import type { LayoutResult } from '../layout.js';
import type { VisualDocument } from '../schema.js';
import { renderSvg } from './svg.js';

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

export function renderHtml(visual: VisualDocument, layout: LayoutResult, narrative = ''): string {
  const svg = renderSvg(visual, layout);
  const narrativeBlock = narrative ? `<details><summary>Source notes</summary><pre>${escapeHtml(narrative)}</pre></details>` : '';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(visual.title)} · Visual Workbench</title>
  <style>
    :root { color-scheme: light dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #eef1f5; color: #18212f; }
    main { max-width: 1500px; margin: 0 auto; padding: 24px; }
    .visual { overflow: auto; border-radius: 18px; background: #fff; box-shadow: 0 1px 3px rgba(16,24,40,.08), 0 12px 32px rgba(16,24,40,.08); }
    .visual svg { display: block; width: max-content; min-width: 100%; height: auto; }
    details { margin-top: 18px; padding: 14px 16px; border-radius: 12px; background: #fff; }
    summary { cursor: pointer; font-weight: 650; }
    pre { white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; line-height: 1.6; }
    @media (max-width: 640px) { main { padding: 10px; } .visual { border-radius: 12px; } }
  </style>
</head>
<body>
  <main>
    <div class="visual">${svg}</div>
    ${narrativeBlock}
  </main>
</body>
</html>`;
}
