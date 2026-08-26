# Icons — Agent Taskboard

This is the operational taskboard for AI-assisted development.

> **CRITICAL RULE FOR ALL AGENTS**:
> The `proto-type/` directory is **reference-only**.
> All new features, UI components, hooks, engine integrations, and application logic **MUST** target the production application structure in `src/`.

## Status definitions

`icons` is an **Asset Vault with an integrated Editor Engine**.

Icons are the first asset type, not the final scope.

The application owns the UI, workflows, asset catalog, metadata, and storage abstraction. Photopea is an editor engine behind the application, not the application UI.

## Non-negotiable architecture rules

### Prototype boundary

`proto-type/` is **REFERENCE ONLY**.

Agents may inspect it for ideas or proven behavior, but must not add new production functionality there or copy its application architecture into the real product.

### Physical asset boundary

Physical assets do **not** belong in `src/`.

Current physical asset store:

```text
public/assets/
└── icons/
    ├── attack.svg
    ├── dodge.svg
    └── ...
```

`public/assets/icons/` is intentionally a **flat icon store**.

New SVG files can be added there without creating application imports or a new source-code directory.

### Semantic catalog boundary

The logical organization of assets belongs in `src/assets/catalog/`.

```text
src/assets/catalog/
└── icons/
    ├── combat.json
    ├── conditions.json
    ├── equipment.json
    └── ...
```

JSON is the canonical semantic layer for:

- stable asset ID
- name
- category
- description
- tags
- physical file path
- other asset metadata

SVG files are physical assets, not metadata sources.

### Virtual folder boundary

Asset Vault folders are **logical entities**, not physical filesystem directories.

Do not create category/folder subdirectories under `public/assets/icons/`.

Physical storage remains flat. Folder organization belongs in the semantic application/catalog layer.

### State boundary

The Asset Vault is a multi-surface application. Shared application state should live in a lightweight Zustand store under `src/store/` when it crosses browser, folder, selection, editor, or persistence surfaces.

The store owns state, not infrastructure. Do not place Photopea communication, filesystem access, catalog parsing, or persistence implementation inside the store.

### Performance boundary

The catalog contains thousands of assets. Do not eagerly render every asset as a DOM node at application startup.

Prefer:

- lazy catalog loading where useful
- virtualized asset grids/lists
- visible-item rendering
- lightweight previews
- measured performance improvements rather than artificial delays

### Editor boundary

```text
Asset Vault UI
      ↓
Application logic
      ↓
EditorEngine
      ↓
PhotopeaEngine
      ↓
Photopea
```

The Photopea iframe/runtime exists internally but operates behind the application's editor workspace UI.

## Current priority

### IN PROGRESS

#### VAULT-002 — Production Asset Editor & Save / Save As Workflow

**Goal**

Establish the production Asset Editor workspace with real Save, Save As, and Export workflows.

**Required outcomes**

- Replace small editor modal with a full-viewport application workspace.
- Give users full access to Photopea's native editing tools.
- Implement Rename and Display Name management in the editor panel.
- Implement persistent Save updating physical asset files (`public/assets/icons/*.svg`) and catalog records (`src/assets/catalog/icons/*.json`).
- Implement Save As creating a new stable asset ID, new physical asset file, and new catalog record while preserving original assets.
- Support genuine SVG serialization for SVG source assets.
- Separate Export (derivative format downloads) from Vault Save/Save As persistence.

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

Turn the Asset Vault into a scalable, desktop-like asset management experience without changing the flat physical asset store.

**Required outcomes**

- Established `EditorEngine` abstraction interface (`src/types/engine.ts`) and generic `Asset` model.
- Implemented `PhotopeaEngine` (`src/engine/PhotopeaEngine.ts`) with official Live Messaging API, binary ArrayBuffer asset transfer, task queue serialization, readiness handshake, and strict origin validation.
- Created application-owned UI controls modal (`src/components/AssetEditorModal.tsx`).
- Integrated into main application UI (`src/App.tsx`).
- Proved vertical slice: Select Asset → Open Asset → Application Resize Action → Photopea Engine Execution → Application Result Preview (Original preserved).

**Explicitly out of scope**

- Physical folder creation under `public/assets/icons/`.
- Database/cloud storage.
- Multi-user collaboration.
- Asset version history.
- Image generation.
- Rebuilding the editor engine.

#### PHOTOPEA-008 — Reliable SVG Export

**Goal**

Resolve and verify the current Photopea SVG export timeout observed during Asset Vault Save As.

**Required outcomes**

- Diagnose the `saveToOE("svg")` timeout through the existing `PhotopeaEngine` boundary.
- Preserve the real SVG export path; never fake SVG from raster output.
- Implement the smallest reliable fix.
- Add focused verification for SVG Save/Save As.

**Explicitly out of scope**

- Replacing Photopea.
- Rebuilding `EditorEngine`.
- Adding a second editor integration.
- Changing the Asset Vault catalog architecture.

## Completed

- VAULT-002 — Production Asset Editor & Save / Save As Workflow
- PHOTOPEA-008 — Reliable SVG Export
- PHOTOPEA-001 — Establish the Photopea engine boundary (Pending Review)
- VAULT-001 — Establish the real application structure (Pending Review)

## Agent workflow

1. Read `AGENTS.md`.
2. Read `ROADMAP.md`.
3. Read this taskboard.
4. Take exactly one assigned task.
5. Inspect the existing implementation and the prototype reference.
6. Do not copy the prototype architecture.
7. Implement the smallest maintainable production solution.
8. Respect the physical/semantic/state/editor boundaries defined above.
9. Run checks.
10. Update relevant documentation.
11. Open a focused PR.
12. Report exactly what was tested and any limitations.
