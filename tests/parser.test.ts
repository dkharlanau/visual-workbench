import { describe, expect, it } from 'vitest';
import { parseVisualMarkdown, VisualWorkbenchError } from '../src/parser.js';

const valid = `---
visual:
  version: 1
  title: Tiny process
  kind: process
  nodes:
    - id: start
      label: Start
    - id: end
      label: End
      type: outcome
  edges:
    - from: start
      to: end
---
Notes.`;

describe('parseVisualMarkdown', () => {
  it('parses a semantic model from Markdown front matter', () => {
    const parsed = parseVisualMarkdown(valid);
    expect(parsed.visual.title).toBe('Tiny process');
    expect(parsed.visual.nodes).toHaveLength(2);
    expect(parsed.body).toBe('Notes.');
  });

  it('rejects missing relationship targets', () => {
    const invalid = valid.replace('to: end', 'to: missing');
    expect(() => parseVisualMarkdown(invalid)).toThrow(VisualWorkbenchError);
  });

  it('rejects duplicate ids', () => {
    const invalid = valid.replace('id: end', 'id: start');
    expect(() => parseVisualMarkdown(invalid)).toThrow(/invalid relationships/i);
  });
});
