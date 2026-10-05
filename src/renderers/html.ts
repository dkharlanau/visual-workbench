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
    main { max-width: 1600px; margin: 0 auto; padding: 24px; }
    .viewer-head { display: flex; align-items: end; justify-content: space-between; gap: 18px; margin-bottom: 12px; }
    .viewer-copy { min-width: 0; }
    .viewer-kicker { display: block; margin-bottom: 4px; color: #667085; font-size: 11px; font-weight: 750; letter-spacing: .11em; text-transform: uppercase; }
    .viewer-title { display: block; overflow: hidden; color: #18212f; font-size: 18px; text-overflow: ellipsis; white-space: nowrap; }
    .viewer-actions { display: flex; flex: 0 0 auto; gap: 8px; }
    .viewer-actions button { appearance: none; border: 1px solid #d0d5dd; border-radius: 9px; background: #fff; color: #344054; cursor: pointer; font: inherit; font-size: 12px; font-weight: 650; padding: 8px 11px; }
    .viewer-actions button[aria-pressed="true"] { border-color: #356ae6; background: #eff4ff; color: #1d4ed8; }
    .visual { overflow: auto; border: 1px solid #d9dee7; border-radius: 18px; background: #fff; box-shadow: 0 1px 3px rgba(16,24,40,.08), 0 12px 32px rgba(16,24,40,.08); }
    .visual svg { display: block; height: auto; }
    .visual.fit svg { width: 100%; min-width: 0; }
    .visual.actual svg { width: max-content; min-width: 0; }
    details { margin-top: 18px; padding: 14px 16px; border: 1px solid #d9dee7; border-radius: 12px; background: #fff; }
    summary { cursor: pointer; font-weight: 650; }
    pre { white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; line-height: 1.6; }
    @media (max-width: 640px) { main { padding: 10px; } .viewer-head { align-items: stretch; flex-direction: column; } .viewer-actions { width: 100%; } .viewer-actions button { flex: 1; } .visual { border-radius: 12px; } }
  </style>
</head>
<body>
  <main>
    <header class="viewer-head">
      <div class="viewer-copy">
        <span class="viewer-kicker">Visual Workbench viewer</span>
        <strong class="viewer-title">${escapeHtml(visual.title)}</strong>
      </div>
      <div class="viewer-actions" aria-label="View size">
        <button type="button" data-viewer-action="fit" aria-pressed="true">Fit view</button>
        <button type="button" data-viewer-action="actual" aria-pressed="false">Actual size</button>
      </div>
    </header>
    <div class="visual fit" id="visual-workbench-viewer">${svg}</div>
    ${narrativeBlock}
  </main>
  <script>
    const viewer = document.getElementById('visual-workbench-viewer');
    const controls = [...document.querySelectorAll('[data-viewer-action]')];
    function setViewerMode(mode) {
      if (!viewer) return;
      viewer.classList.toggle('fit', mode === 'fit');
      viewer.classList.toggle('actual', mode === 'actual');
      controls.forEach((control) => control.setAttribute('aria-pressed', String(control.dataset.viewerAction === mode)));
    }
    controls.forEach((control) => control.addEventListener('click', () => setViewerMode(control.dataset.viewerAction || 'fit')));
  </script>
</body>
</html>`;
}
