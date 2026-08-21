# Icons — Agent Taskboard

This is the operational taskboard for AI-assisted development.

## Status definitions

- `READY` — explicitly authorized and ready to implement
- `IN PROGRESS` — currently being worked on
- `BLOCKED` — work cannot continue without a decision or dependency
- `REVIEW` — implementation is complete and awaiting human review
- `DONE` — merged and verified

## Current priority

### IN PROGRESS

None.

### REVIEW

#### APP-001 — Establish Real Asset Vault Application Structure

**Goal**

Transition the product from prototype experimentation to a clean, professional production application structure in root `src/`. Treat `proto-type/` as reference-only material.

**Completed Requirements**

- Created root `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `server.ts`, and `.gitignore` configuring the production Asset Vault application.
- Established clean domain architecture in root `src/`:
  - `src/types/` (domain models for generic `Asset`, `AssetCategory`, `ExportOptions`, `CanvasAnchor`, `CropBounds`).
  - `src/engine/` (`EditorEngine` abstraction interface and `PhotopeaEngine` implementation).
  - `src/components/` (`AssetBrowser`, `AssetInspector`, `AssetEditorModal`, `AssetUploader`, `GameIcon`).
  - `src/assets/` (Icon definitions and SVG files migrated cleanly from reference prototype).
  - `src/App.tsx`, `src/main.tsx`, `src/index.css` (Clean application shell).
- Updated repository documentation explicitly marking `proto-type/` as reference-only and `src/` as the primary production application location.

### READY — Future Photopea & Asset Vault tasks

- PHOTOPEA-006 — Transform controls
- PHOTOPEA-007 — Layer inspection and operations

Do not implement these until they are explicitly assigned.

## Completed

- PHOTOPEA-001 — Establish the Photopea engine boundary (DONE - merged as accepted architectural foundation)
- PHOTOPEA-002 — Import/open workflow (Covered by merged EditorEngine ArrayBuffer pipeline)
- PHOTOPEA-003 — Export/result abstraction (Covered by merged EditorEngine exportResult pipeline)
- PHOTOPEA-004 — Resize controls (Covered by merged EditorEngine resize pipeline)
- PHOTOPEA-005 — Canvas and Crop Controls (DONE - merged)

## Agent workflow

1. Read `AGENTS.md`.
2. Read `ROADMAP.md`.
3. Read this taskboard.
4. Take exactly one assigned task.
5. Inspect the existing implementation.
6. Implement the smallest maintainable solution.
7. Run checks.
8. Update relevant documentation.
9. Open a focused PR.
10. Report what was tested and any limitations.

## Human decision points

Architecture changes, scope expansion, new infrastructure, new external services, and security/configuration decisions require explicit human approval.
