# Icons — Agent Taskboard

This is the operational taskboard for AI-assisted development.

> **CRITICAL RULE FOR ALL AGENTS**:
> The `proto-type/` directory is **reference-only**.
> All new features, UI components, hooks, engine integrations, and application logic **MUST** target the production application structure in `src/`.

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

#### VAULT-001 — Establish the Real Application Structure

**Goal**

Transition the project from prototype experimentation to a clean, production-grade Asset Vault foundation in `src/`.

**Completed Requirements**

- Created production `src/` architecture:
  - `src/types/`: Domain models (`asset.ts`, `engine.ts`, `vault.ts`).
  - `src/services/`: Asset storage and repository abstraction (`assetService.ts`).
  - `src/engine/`: `EditorEngine` abstraction and `PhotopeaEngine` bridge.
  - `src/tools/`: Editor tools (`resize.ts`, `export.ts`).
  - `src/hooks/`: Vault & editor state management (`useAssetVault.ts`, `useEditor.ts`).
  - `src/components/`: Modular UI (`AssetVaultHeader`, `AssetVaultSidebar`, `AssetBrowser`, `AssetInspector`, `AssetEditorModal`).
  - `src/assets/`: Icon definitions catalog and `GameIcon` renderer.
- Standardized root project configuration (`package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.gitignore`).
- Updated documentation (`README.md`, `docs/TASKBOARD.md`) marking `proto-type/` as reference-only.
- Verified vertical flow: Asset Vault -> Select Asset -> Inspect Asset -> Open Editor -> EditorEngine -> Photopea -> Output Result -> Save to Vault.

#### PHOTOPEA-001 — Establish the Photopea engine boundary

**Goal**

Replace any iframe-first approach with an application-owned Photopea engine/bridge (`EditorEngine` / `PhotopeaEngine`).

**Completed Requirements**

- Established `EditorEngine` abstraction interface (`src/types/engine.ts`) and generic `Asset` model.
- Implemented `PhotopeaEngine` (`src/engine/PhotopeaEngine.ts`) with official Live Messaging API, binary ArrayBuffer asset transfer, task queue serialization, readiness handshake, and strict origin validation.
- Created application-owned UI controls modal (`src/components/AssetEditorModal.tsx`).
- Integrated into main application UI (`src/App.tsx`).
- Proved vertical slice: Select Asset → Open Asset → Application Resize Action → Photopea Engine Execution → Application Result Preview (Original preserved).

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
- VAULT-001 — Establish the real application structure (Pending Review)

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
