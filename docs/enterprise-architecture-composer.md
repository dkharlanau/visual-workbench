# Enterprise Architecture Composer integration

[Enterprise Architecture Composer](https://github.com/dkharlanau/enterprise-architecture-composer) emits coordinate-free Visual Workbench Markdown directly. Composer owns the architecture proposal, stable blueprint IDs and decision trace. Visual Workbench owns validation of the visual model, named-view projection, layout and rendering.

## Tested workflow

The compatibility workflow pins Composer commit `71bfd701ba5a0061db16adad82a992c11f8f210d`. It composes the public manufacturing scenario, emits native Visual Workbench Markdown, validates the result, and renders all four declared views with the current renderer.

This proves compatibility with that exact producer baseline. It does not imply compatibility with every Composer revision or with arbitrary architecture JSON.

With both repositories checked out next to each other:

```bash
npm ci
npm run build

node ../enterprise-architecture-composer/bin/eac.mjs visual \
  ../enterprise-architecture-composer/examples/scenarios/global-b2b-manufacturer.context.json \
  --markdown \
  --output architecture.visual.md

node dist/cli.js validate architecture.visual.md
node dist/cli.js views architecture.visual.md
node dist/cli.js render-views architecture.visual.md \
  --output-dir architecture-views
```

The producer currently declares `executive`, `integration`, `data` and `exceptions` views.

## Ownership boundary

- Composer source IDs remain Visual Workbench node IDs.
- Composer chooses architecture semantics and which facts belong in each view.
- Visual Workbench chooses geometry, routing, visual tokens and output format.
- Visual Workbench does not approve recommendations, resolve findings or mutate the Composer result.
- Rendered SVG/HTML is a presentation artifact, not a second architecture source of truth.

Update the pinned baseline only after the compatibility workflow succeeds against the proposed producer revision.
