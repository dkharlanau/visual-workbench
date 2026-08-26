# Mapping as Code integration

[Mapping as Code](https://github.com/dkharlanau/mapping-as-code) can emit native Visual Workbench Markdown/frontmatter from an enterprise field mapping.

```bash
map-code project mapping.yaml \
  --target visual-workbench \
  --format markdown \
  --output mapping-visual.md

node dist/cli.js render mapping-visual.md -o mapping.svg
```

The projection follows `schemas/visual-workbench.schema.json` and produces a `data-flow` model with three semantic lanes:

1. source fields;
2. mapping rules;
3. target fields.

Source/target fields become `data` nodes. Stable mapping rules become `step` nodes. Transform types are retained on edges and rule subtitles. High-criticality rules use warning status; critical rules use danger status. Constant mappings remain explicit source-side data nodes rather than disappearing from lineage.

Mapping as Code owns mapping semantics. Visual Workbench owns visual method selection, layout, named views, styling, SVG/HTML rendering, and presentation quality.
