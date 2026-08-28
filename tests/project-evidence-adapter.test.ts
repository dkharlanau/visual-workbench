import { describe, expect, it } from 'vitest';
import {
  adaptProjectEvidenceGraph,
  ProjectEvidenceAdapterError,
  projectVisualView,
  renderVisual,
} from '../src/index.js';

const evidenceGraph = {
  nodes: [
    { id: 'REQ-001', type: 'requirement', title: 'Customer country must replicate' },
    { id: 'MAP:customer/country', type: 'mapping', title: 'Country mapping' },
    { id: 'TEST-001', type: 'test', title: 'Replication test', status: 'passed' },
    { id: 'DEF-001', type: 'defect', title: 'Country missing', status: 'failed' },
    { id: 'EVID-001', type: 'evidence', title: 'Verified regression run', status: 'verified' },
  ],
  links: [
    { from: 'REQ-001', to: 'MAP:customer/country', type: 'implemented_by' },
    { from: 'MAP:customer/country', to: 'TEST-001', type: 'verified_by' },
    { from: 'TEST-001', to: 'DEF-001', type: 'revealed' },
    { from: 'DEF-001', to: 'EVID-001', type: 'fixed_by' },
  ],
  external_bridges: [
    { from: 'EVID-001', to: 'eac://reconciliation-as-code/run/customer-country', type: 'substantiated_by' },
  ],
};

describe('Project Evidence Graph adapter', () => {
  it('creates a stable read-only visual projection with provenance tags', () => {
    const visual = adaptProjectEvidenceGraph(evidenceGraph, 'Migration assurance');

    expect(visual.kind).toBe('relationship');
    expect(visual.nodes).toHaveLength(6);
    expect(visual.edges).toHaveLength(5);
    expect(visual.views.map((view) => view.id)).toEqual(['executive', 'assurance', 'exceptions']);

    const mapping = visual.nodes.find((node) => node.label === 'Country mapping');
    expect(mapping?.type).toBe('data');
    expect(mapping?.subtitle).toContain('MAP:customer/country');
    expect(mapping?.tags).toContain('artifact:mapping');
    expect(mapping?.id).toMatch(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/);

    const defect = visual.nodes.find((node) => node.label === 'Country missing');
    expect(defect?.type).toBe('risk');
    expect(defect?.status).toBe('danger');

    const revealed = visual.edges.find((edge) => edge.label === 'revealed');
    expect(revealed?.type).toBe('exception');
    expect(revealed?.status).toBe('danger');

    const external = visual.nodes.find((node) => node.tags.includes('external-reference'));
    expect(external?.subtitle).toBe('eac://reconciliation-as-code/run/customer-country');
    expect(external?.type).toBe('outcome');

    const bridge = visual.edges.find((edge) => edge.label === 'substantiated by');
    expect(bridge?.type).toBe('control');
    expect(bridge?.note).toContain('external bridge');
  });

  it('renders assurance and exception projections', async () => {
    const visual = adaptProjectEvidenceGraph(evidenceGraph);
    const assurance = projectVisualView(visual, 'assurance');
    const exceptions = projectVisualView(visual, 'exceptions');

    expect(assurance.nodes.length).toBeGreaterThan(0);
    expect(assurance.nodes.some((node) => node.tags.includes('external-reference'))).toBe(true);
    expect(exceptions.nodes.some((node) => node.status === 'danger')).toBe(true);

    const svg = await renderVisual(assurance, 'svg');
    expect(svg).toContain('<svg');
    expect(svg).toContain('Project evidence · assurance');
  });

  it('fails closed on duplicate node identities', () => {
    expect(() => adaptProjectEvidenceGraph({
      nodes: [
        { id: 'REQ-1', type: 'requirement' },
        { id: 'REQ-1', type: 'requirement' },
      ],
      links: [],
    })).toThrow(ProjectEvidenceAdapterError);
  });

  it('fails closed on unresolved local relationships', () => {
    expect(() => adaptProjectEvidenceGraph({
      nodes: [{ id: 'REQ-1', type: 'requirement' }],
      links: [{ from: 'REQ-1', to: 'MISSING', type: 'verified_by' }],
    })).toThrow('unresolved link endpoints');
  });

  it('fails closed when an external bridge does not start from a local artifact', () => {
    expect(() => adaptProjectEvidenceGraph({
      nodes: [{ id: 'REQ-1', type: 'requirement' }],
      links: [],
      external_bridges: [{ from: 'MISSING', to: 'eac://producer/evidence/x', type: 'substantiated_by' }],
    })).toThrow('external bridges from unknown local artifacts');
  });
});
