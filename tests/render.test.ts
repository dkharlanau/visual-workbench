import { describe, expect, it } from 'vitest';
import { renderMarkdown } from '../src/index.js';

const source = `---
visual:
  version: 1
  title: Render test
  kind: data-flow
  nodes:
    - id: source
      label: Source
      type: system
    - id: data
      label: Order
      type: data
    - id: target
      label: Target
      type: system
  edges:
    - from: source
      to: data
      label: Extract
      type: data
    - from: data
      to: target
      label: Load
      type: flow
---
`;

describe('renderMarkdown', () => {
  it('renders accessible SVG', async () => {
    const svg = await renderMarkdown(source, 'svg');
    expect(svg).toContain('<svg');
    expect(svg).toContain('aria-labelledby');
    expect(svg).toContain('Render test');
    expect(svg).toContain('data-node-id="source"');
    expect(svg).toContain('marker-end=');
  });

  it('renders a standalone HTML document', async () => {
    const html = await renderMarkdown(source, 'html');
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('<svg');
  });
});
