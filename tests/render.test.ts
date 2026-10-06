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


const projectedSource = `---
visual:
  title: Projection disclosure
  kind: process
  nodes:
    - id: source
      label: Source
      type: system
    - id: hidden-risk
      label: Hidden risk
      type: step
      status: danger
    - id: target
      label: Target
      type: outcome
  edges:
    - from: source
      to: hidden-risk
    - from: hidden-risk
      to: target
  views:
    - id: executive
      focus: all
      excludeNodeTypes: [step]
---
`;

describe('projection disclosure', () => {
  it('renders projected scope and hidden-risk disclosure into SVG text and description', async () => {
    const svg = await renderMarkdown(projectedSource, 'svg', 'executive');
    expect(svg).toContain('Scope · 2/3 nodes shown · 1 hidden risk');
    expect(svg).toContain('stroke="#D92D20"');
  });

  it('keeps the same disclosure inside standalone HTML because the generated SVG is embedded', async () => {
    const html = await renderMarkdown(projectedSource, 'html', 'executive');
    expect(html).toContain('Scope · 2/3 nodes shown · 1 hidden risk');
  });
});
