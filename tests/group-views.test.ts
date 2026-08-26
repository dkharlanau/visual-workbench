import { describe, expect, it } from 'vitest';
import { renderMarkdown } from '../src/index.js';
import { parseVisualMarkdown } from '../src/parser.js';
import { projectVisualView } from '../src/views.js';

const source = `---
visual:
  title: Grouped view
  kind: handoff
  groups:
    - id: business
      label: Business & Customer
      order: 1
    - id: integration
      label: Integration
      order: 2
  nodes:
    - id: source
      label: Request
      type: system
      group: business
    - id: payload
      label: Canonical payload
      type: data
      group: integration
    - id: target
      label: Available
      type: outcome
      group: business
  edges:
    - from: source
      to: payload
      type: data
    - from: payload
      to: target
      type: data
  views:
    - id: executive
      focus: executive
      kind: process
---`;

describe('groups and named views', () => {
  it('drops empty lanes while preserving contracted connectivity', () => {
    const visual = parseVisualMarkdown(source).visual;
    const projected = projectVisualView(visual, 'executive');
    expect(projected.groups.map((group) => group.id)).toEqual(['business']);
    expect(projected.edges.some((edge) => edge.from === 'source' && edge.to === 'target')).toBe(true);
  });

  it('renders lane groups as first-class SVG structure', async () => {
    const full = await renderMarkdown(source, 'svg');
    expect(full).toContain('data-group-id="business"');
    expect(full).toContain('data-group-id="integration"');
    expect(full).toContain('BUSINESS &amp; CUSTOMER');

    const executive = await renderMarkdown(source, 'svg', 'executive');
    expect(executive).toContain('data-group-id="business"');
    expect(executive).not.toContain('data-group-id="integration"');
  });
});
