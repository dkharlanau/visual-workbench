import { describe, expect, it } from 'vitest';
import { parseVisualMarkdown, VisualWorkbenchError } from '../src/parser.js';

const valid = `---
visual:
  title: Grouped process
  groups:
    - id: business
      label: Business
  nodes:
    - id: start
      label: Start
      group: business
---`;

describe('semantic groups', () => {
  it('parses explicit lane groups', () => {
    const parsed = parseVisualMarkdown(valid);
    expect(parsed.visual.groups).toHaveLength(1);
    expect(parsed.visual.nodes[0]?.group).toBe('business');
  });

  it('rejects a node that references a missing group', () => {
    expect(() => parseVisualMarkdown(valid.replace('group: business', 'group: missing'))).toThrow(VisualWorkbenchError);
  });

  it('requires every node to belong to a lane when groups are active', () => {
    expect(() => parseVisualMarkdown(valid.replace('\n      group: business', ''))).toThrow(/no group while lane groups are active/i);
  });

  it('rejects duplicate group ids', () => {
    const invalid = valid.replace('  nodes:', '    - id: business\n      label: Duplicate\n  nodes:');
    expect(() => parseVisualMarkdown(invalid)).toThrow(/invalid relationships or identifiers/i);
  });
});
