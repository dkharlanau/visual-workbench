# Release and compatibility policy

Visual Workbench uses Semantic Versioning for source releases.

- Patch releases preserve the v0.1 metadata contract and CLI behavior while fixing defects.
- Minor releases may add optional semantic fields, methods, views, or renderers. During `0.x`, read release notes before upgrading.
- Major releases may break the metadata language and require a migration guide.

## Supported release surface

The v0.1 contract covers the checked-in TypeScript source, compiled `dist/` CLI/library, metadata schema, examples, tests, and generated gallery. Node.js 24 is the golden runtime; the package declares Node.js 20 or later.

GitHub Releases contain a byte-reproducible `npm pack` tarball, a deterministic source archive, and checksums. npm-registry publication is explicitly outside the current distribution contract.

## Compatibility boundaries

- Producer adapters preserve references but do not transfer semantic ownership to Visual Workbench.
- Coordinate-free input and deterministic layout do not imply semantic correctness of the source model.
- The pinned Composer compatibility workflow proves the exact checked-out revisions only.
- Interactive editing, date-aware timeline grammar, universal accessibility certification, and production evidence validation are non-goals for v0.1.

See the [golden quickstart](GOLDEN_QUICKSTART.md) and [v0.1.2 release notes](../release/v0.1.2.md).
