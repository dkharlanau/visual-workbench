# Changelog

All notable public release changes are recorded here. Versions follow Semantic Versioning.

## [0.1.2] - 2026-09-01

### Documentation

- Added a copy-paste 30-second proof that validates and renders the committed synthetic handoff example.
- Linked the exact generated gallery artifact and release-pinned verification walkthrough while preserving the human-review boundary.

### Compatibility

- The v0.1 metadata language, CLI behavior, rendering fixtures, adapters, and golden SVG digest are unchanged from v0.1.1.

## [0.1.1] - 2026-09-01

### Changed

- Documented the bounded Visual Workbench relationship to Process as Code, Interface as Code, Reconciliation as Code, and Cutover Graph.
- Made semantic ownership explicit: producer contracts and evidence remain authoritative; a rendered projection does not claim an untested native adapter or transfer validation responsibility.

### Compatibility

- The v0.1 metadata language, CLI behavior, rendering fixtures, and golden SVG digest are unchanged from v0.1.0.

## [0.1.0] - 2026-09-01

### Added

- Semantic Markdown metadata for processes, plans, data flows, relationships, handoffs, lanes, and roadmap stages.
- Deterministic validation, view projection, ELK-based layout, and SVG/standalone HTML rendering.
- Named executive, data, control, and exception views from one source model.
- Tested projections from Enterprise Architecture Composer and Project Evidence Graph.
- Generated public example gallery on GitHub Pages.

### Boundaries

- GitHub Releases provide an installable package tarball and source archive; the package is not published to the npm registry.
- Rendering is deterministic for the released fixtures and supported runtime, but visual pixel identity across arbitrary future layout-engine versions is not promised.
- Visual Workbench renders producer semantics; it does not revalidate architecture or evidence claims owned by another product.

[0.1.2]: https://github.com/dkharlanau/visual-workbench/releases/tag/v0.1.2
[0.1.1]: https://github.com/dkharlanau/visual-workbench/releases/tag/v0.1.1
[0.1.0]: https://github.com/dkharlanau/visual-workbench/releases/tag/v0.1.0
