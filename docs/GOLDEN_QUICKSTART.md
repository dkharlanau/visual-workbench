# Golden quickstart — v0.1.2

This walkthrough validates and renders one synthetic handoff model from the released tag.

Requirements: Git and Node.js 24.

```bash
git clone --branch v0.1.2 --depth 1 \
  https://github.com/dkharlanau/visual-workbench.git
cd visual-workbench
npm ci --ignore-scripts --no-audit --no-fund
npm run check

node dist/cli.js validate examples/order-fulfillment-lanes.md
node dist/cli.js render \
  examples/order-fulfillment-lanes.md \
  -o /tmp/visual-workbench-v0.1.2.svg
```

Verify the released Node.js 24 rendering digest:

```bash
node -e 'const fs=require("node:fs"); const c=require("node:crypto"); const p="/tmp/visual-workbench-v0.1.2.svg"; const actual=c.createHash("sha256").update(fs.readFileSync(p)).digest("hex"); const expected="4d3ab1393e76b7ea2a8f1462634635eeb46f2e07c135b1e9200e8eb8fceace2e"; if(actual!==expected) throw new Error(`${actual} != ${expected}`); console.log(`verified ${actual}`)'
```

Open the SVG and confirm that normal flow, the exception path, and ownership lanes remain distinguishable. A matching digest proves the released fixture/rendering pipeline, not that every generated visual is useful for every audience.
