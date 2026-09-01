# Contributing

Contributions should improve semantic modeling, deterministic rendering, accessibility, tested producer projections, or adoption evidence.

Read `AGENTS.md` first. Authors and agents model meaning; the renderer owns coordinates, colors, spacing, and routing.

## Development checks

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run check
node dist/cli.js validate examples/order-fulfillment-lanes.md
node dist/cli.js render examples/order-fulfillment-lanes.md -o /tmp/handoffs.svg
```

Add a synthetic example and tests when changing the metadata language, view projection, lanes/stages, or rendering behavior. Explain compatibility impact for schema or CLI changes.

## Feedback paths

- Use the [15-minute usability kit](docs/USABILITY_TEST_15_MIN.md) for a real first-use session.
- File a privacy-safe [usability report](https://github.com/dkharlanau/visual-workbench/issues/new?template=usability-feedback.yml).
- Use a normal GitHub issue for a reproducible defect or bounded enhancement.

Do not submit client process maps, private system names, internal URLs, credentials, screenshots, or proprietary diagrams.
