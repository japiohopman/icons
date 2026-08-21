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

#### PHOTOPEA-005 — Canvas and Crop Controls

**Goal**

Add application-owned UI and engine capabilities for Canvas Resize and Crop operations on top of the established `EditorEngine` / `PhotopeaEngine` foundation.

**Completed Requirements**

- Extended `EditorEngine` interface (`src/engine/types.ts`) with `resizeCanvas` (with `CanvasAnchor`), `crop` (with `CropBounds`), and input dimension validation.
- Extended `PhotopeaEngine` (`src/engine/PhotopeaEngine.ts`) to execute Photopea ExtendScript canvas resize (`app.activeDocument.resizeCanvas`) and crop (`app.activeDocument.crop`) operations using official Live Messaging API.
- Added application-owned tabbed control UI (`src/components/AssetEditorModal.tsx`) supporting Image Resize, Canvas Resize (with 3x3 anchor grid selection), and Crop Region workflows.
- Implemented robust application-level validation for width, height, X, and Y inputs prior to sending commands to the engine.
- Preserved non-destructive behavior (original source assets remain pristine in the Asset Vault, results return through existing asset-result preview pipeline).

### READY — Future Photopea tasks

These are intentionally not assigned yet:

- PHOTOPEA-006 — Transform controls
- PHOTOPEA-007 — Layer inspection and operations

Do not implement these until they are explicitly moved into `IN PROGRESS` or assigned directly.

## Completed

- PHOTOPEA-001 — Establish the Photopea engine boundary (DONE - merged as accepted architectural foundation)
- PHOTOPEA-002 — Import/open workflow (Covered by merged EditorEngine ArrayBuffer pipeline)
- PHOTOPEA-003 — Export/result abstraction (Covered by merged EditorEngine exportResult pipeline)
- PHOTOPEA-004 — Resize controls (Covered by merged EditorEngine resize pipeline)

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
