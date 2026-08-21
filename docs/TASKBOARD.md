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

#### PHOTOPEA-001 — Establish the Photopea engine boundary

**Goal**

Replace any iframe-first approach with an application-owned Photopea engine/bridge (`EditorEngine` / `PhotopeaEngine`).

**Completed Requirements**

- Established `EditorEngine` abstraction interface (`src/engine/types.ts`) and generic `Asset` model.
- Implemented `PhotopeaEngine` (`src/engine/PhotopeaEngine.ts`) with official Live Messaging API, binary ArrayBuffer asset transfer, task queue serialization, readiness handshake, and strict origin validation.
- Created application-owned UI controls modal (`src/components/AssetEditorModal.tsx`).
- Integrated into main application UI (`src/App.tsx`).
- Proved vertical slice: Select Asset → Open Asset → Application Resize Action → Photopea Engine Execution → Application Result Preview (Original preserved).
- Documentation updated in `proto-type/artificer-icon-library-proto-type/README.md`.

### READY — Future Photopea tasks

These are intentionally not assigned yet:

- PHOTOPEA-002 — Import/open workflow
- PHOTOPEA-003 — Export/result abstraction
- PHOTOPEA-004 — Resize controls
- PHOTOPEA-005 — Canvas/crop controls
- PHOTOPEA-006 — Transform controls
- PHOTOPEA-007 — Layer inspection and operations

Do not implement these until they are explicitly moved into `IN PROGRESS` or assigned directly.

## Completed

- PHOTOPEA-001 — Establish the Photopea engine boundary (Pending Review)

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
