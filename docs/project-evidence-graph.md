# Project Evidence Graph integration

Visual Workbench can render a `Project Evidence Graph` JSON artifact directly without copying the project traceability model into a second authored file.

```bash
npm install
npm run build
node dist/cli.js render-project-evidence project-evidence.json -o project-evidence.svg
```

Derived views are available for different review questions:

```bash
node dist/cli.js render-project-evidence project-evidence.json --view executive -o executive.svg
node dist/cli.js render-project-evidence project-evidence.json --view assurance -o assurance.html
node dist/cli.js render-project-evidence project-evidence.json --view exceptions -o exceptions.svg
```

## Ownership boundary

The integration is deliberately one-way:

```text
Project Evidence Graph artifact
        ↓ read-only adapter
Visual Workbench semantic projection
        ↓ deterministic layout/rendering
SVG / HTML
```

`Project Evidence Graph` remains the source of truth for artifact identity, traceability, assurance state and relationship semantics. Visual Workbench owns only the visual projection and presentation policy.

The adapter therefore:

- never rewrites the input artifact;
- preserves every local artifact ID in the rendered node subtitle and provenance tag;
- preserves `external_bridges` as visual control/evidence relationships instead of dropping cross-repository assurance context;
- materializes an external bridge target only as a neutral **reference node** carrying the external logical ID — not as locally verified evidence;
- derives internal Visual Workbench IDs deterministically because Project Evidence IDs and external logical references may contain characters outside the Visual Workbench identifier grammar;
- rejects duplicate local artifact IDs;
- rejects local links whose endpoints do not exist in the supplied graph;
- rejects an external bridge when its source is not a known local Project Evidence artifact;
- keeps the original relationship type as the edge label and note;
- converts project artifact types/statuses into the closest visual vocabulary without claiming that the visual type replaces the upstream semantic type.

An external target reference is intentionally not dereferenced, executed or revalidated by Visual Workbench. Its producer/consumer trust and compatibility rules remain owned by the upstream portfolio contracts.

## Current type projection

| Project Evidence artifact | Visual Workbench node |
| --- | --- |
| requirement | milestone |
| decision | decision |
| mapping | data |
| interface | system |
| test | checkpoint |
| defect | risk |
| change | step |
| evidence | outcome |
| checkpoint / control | checkpoint |
| task / process / cutover_task | step |
| unknown artifact type | note |
| external bridge target | neutral outcome/reference |

The original artifact type remains available as `artifact:<type>` in node tags. External reference nodes carry the `external-reference` tag plus their logical source ID.

Relationships are projected conservatively:

- verification/evidence relations, including `substantiated_by` external bridges → `control`;
- failure/exception relations → `exception`;
- implementation/dependency relations → `dependency`;
- mapping/transfer relations → `data`;
- everything else → `relation`.

This is presentation policy, not semantic rewriting.

## Portfolio role

This adapter is the presentation step in the executable assurance path:

```text
Mapping as Code
  → Reconciliation as Code
  → Cutover Graph
  → Project Evidence Graph
  → Visual Workbench
```

The integration should remain small. Domain truth stays in the owning repositories; Visual Workbench should not grow a second implementation of their validation or assurance logic.
