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

New SVG files should be addable there without creating application imports or a new source-code directory.

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

The Photopea iframe/runtime may exist internally but must not become the application's editor UI.

### Storage boundary

Do not hard-code the future product to GitHub or a filesystem layout beyond the current public asset store. The catalog must provide a layer that can later point to server/object storage.

## Current priority

### IN PROGRESS

#### APP-002 — Establish the Canonical Asset Vault Catalog

**Goal**

Correct the current production architecture before adding more editor features.

Create the real Asset Vault asset model using:

```text
public/assets/icons/     → physical SVG files
src/assets/catalog/      → JSON semantic catalog
```

The prototype must remain reference-only.

**Required outcomes**

- Remove production SVG files from `src/`.
- Stop using SVG files as the runtime metadata/source-of-truth mechanism.
- Establish a canonical JSON catalog for icons.
- Keep physical SVG assets in the flat `public/assets/icons/` directory.
- Use stable asset IDs independent of physical filenames.
- Make the application resolve an asset from catalog metadata to its public asset path.
- Remove production dependence on legacy/duplicate icon paths where safe.
- Preserve existing icon functionality while moving it onto the canonical catalog.
- Do not add new editor features in this task.

**Important**

Do not blindly migrate the prototype.

Inspect it, extract useful ideas, then implement the production architecture cleanly.

### BLOCKED / HUMAN DECISION

None currently.

### READY

No new feature task is authorized until APP-002 is reviewed.

Future work such as transform, layers, variants, presets, and additional asset types must wait for explicit assignment.

## Completed

- PHOTOPEA-001 — Establish the Photopea engine boundary (DONE - merged)
- PHOTOPEA-002 — Import/open workflow (covered by merged EditorEngine pipeline)
- PHOTOPEA-003 — Export/result abstraction (covered by merged EditorEngine pipeline)
- PHOTOPEA-004 — Resize controls (covered by merged EditorEngine pipeline)
- PHOTOPEA-005 — Canvas and Crop Controls (merged; implementation review/foundation correction continues through APP-002)

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

## Human decision points

Architecture changes, scope expansion, new infrastructure, new external services, storage changes, security/configuration decisions, and product-direction changes require explicit human approval.
