# Icons — Agent Taskboard

This is the operational taskboard for AI-assisted development.

## Product identity

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

## Completed

- PHOTOPEA-001 — Establish the Photopea engine boundary (DONE - merged)
- PHOTOPEA-002 — Import/open workflow (covered by merged EditorEngine pipeline)
- PHOTOPEA-003 — Export/result abstraction (covered by merged EditorEngine pipeline)
- PHOTOPEA-004 — Resize controls (covered by merged EditorEngine pipeline)
- PHOTOPEA-005 — Canvas and Crop Controls (merged)
- APP-002 — Establish Canonical Asset Vault Catalog (merged/completed)

## Agent workflow

1. Read `AGENTS.md`.
2. Read `ROADMAP.md`.
3. Read this taskboard.
4. Take exactly one assigned task.
5. Inspect the existing implementation and the prototype reference.
6. Do not copy the prototype architecture.
7. Implement the smallest maintainable production solution.
8. Run checks.
9. Update relevant documentation.
10. Open a focused PR.
11. Report exactly what was tested and any limitations.
