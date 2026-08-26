# Icons — Product Roadmap

## Product vision

`icons` is evolving into a standalone **Asset Vault with an integrated Editor Engine**.

The application owns the user experience, asset organization, metadata, editing workflows, and future storage abstraction. Specialized engines provide capabilities where appropriate.

Photopea is one such engine. It must remain an implementation detail behind the application's editor-engine boundary; the application owns the UI and workflow.

Icons are the first asset type. The architecture must scale to photographs, images, illustrations, backgrounds, sprites, documents, generated assets, and other supported asset types without requiring a new application architecture for each type.

## Core asset architecture

### Physical asset store

All physical asset files live outside `src/`.

```text
public/
└── assets/
    ├── icons/
    │   ├── attack.svg
    │   ├── dodge.svg
    │   └── ...
    ├── images/
    ├── photos/
    ├── backgrounds/
    └── ...
```

`public/assets/icons/` is intentionally a **flat physical asset store**. New SVG files can be added there without creating application directories or imports.

### Semantic asset catalog

Asset organization and meaning live in `src/`, not in the physical asset directory.

```text
src/
└── assets/
    └── catalog/
        ├── icons/
        │   ├── combat.json
        │   ├── conditions.json
        │   ├── equipment.json
        │   └── ...
        └── ...
```

JSON is the canonical semantic layer. It defines stable asset IDs, names, categories, descriptions, tags, and the physical asset path.

An SVG is the asset file, not the metadata database.

### Stable identity

Asset identity must not depend on a filename or physical folder structure.

Conceptually:

```text
asset ID → metadata → physical asset path
```

This allows the physical storage strategy to change later without forcing UI/editor architecture changes.

## Application architecture

Production code belongs in the real root `src/` application.

```text
src/
├── components/
├── engine/
├── hooks/
├── lib/
├── store/
├── tools/
├── types/
└── assets/
    └── catalog/
```

The `proto-type/` directory is **reference-only**.

Agents must never use the prototype as the production application architecture or add new product functionality there.

## Asset Vault state architecture

The Asset Vault is becoming a desktop-like application rather than a simple icon list. Shared application state should be centralized where it crosses multiple UI surfaces.

The planned state boundary is a lightweight Zustand store under `src/store/`.

The store may own application state such as:

- active folder
- selected assets
- folder tree
- search/filter state
- browser/view state
- drag-and-drop state
- editor session state
- unsaved-change state
- persistence status

The store must **not** become a dumping ground for services or engine implementations. File I/O, catalog parsing, persistence APIs, and Photopea communication remain behind dedicated services/engines.

## Virtual folders and desktop-like asset management

The Asset Vault should provide a familiar Windows-like file-management experience while keeping the physical asset store flat.

Folders are **logical/semantic entities**, not filesystem directories.

Conceptually:

```text
Asset Vault
├── Combat
│   ├── Weapons
│   └── Attacks
├── Magic
├── Creatures
└── UI
```

while physical icon files remain:

```text
public/assets/icons/
    attack.svg
    sword.svg
    ...
```

Folder metadata belongs in the semantic application/catalog layer. Creating, renaming, moving, and organizing folders must not create physical subdirectories under `public/assets/icons/`.

The intended interaction model includes:

- New Folder
- Rename Folder
- Select assets
- Drag assets into folders
- Drag folders where supported
- Multi-selection
- familiar desktop-style navigation

`dnd-kit` is the preferred drag-and-drop foundation unless an assigned task establishes a concrete reason to use another maintained solution.

## Catalog and performance architecture

The current icon catalog contains thousands of assets. The UI must not assume that every catalog entry should become a DOM node at application startup.

Performance work should favor architectural solutions over timing tricks:

- lazy-load catalog data where useful
- virtualize large asset grids/lists
- render only visible asset previews
- avoid eager creation of thousands of animated React elements
- keep editor/asset-browser state separate from raw catalog parsing

A target architecture is:

```text
JSON catalogs
      ↓
Catalog service
      ↓
Zustand Asset Vault store
      ↓
Virtualized Asset Browser
      ↓
Asset Editor
      ↓
EditorEngine
      ↓
PhotopeaEngine
```

Do not add arbitrary delays or timeouts merely to make startup appear faster. Measure and address the actual source of work.

## Editor architecture

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

The Photopea iframe/runtime may exist internally, but it is not the application's editor UI.

## Phases

### Phase 1 — Foundation

- [x] Repository and initial application foundation
- [x] Agentic development workflow
- [x] Editor engine boundary
- [x] Photopea import/result communication
- [x] CI validation
- [x] Establish canonical Asset Vault catalog
- [ ] Remove production dependence on prototype and legacy icon paths

### Phase 2 — Asset Vault foundation

- [x] Establish flat `public/assets/` physical asset stores
- [x] Establish JSON catalog architecture
- [x] Define stable asset identity
- [x] Build icon catalog/import workflow
- [x] Build application-owned asset browser from catalog data
- [x] Build asset inspector
- [x] Separate asset storage from editor implementation
- [x] Establish logical/virtual folder model
- [x] Establish centralized Asset Vault application state
- [x] Add desktop-like folder and drag/drop workflows
- [x] Add virtualized/lazy asset browsing for large catalogs

### Phase 3 — Core editing

- [x] Open/import through EditorEngine
- [x] Resize
- [x] Canvas resize
- [x] Crop
- [x] Transform
- [x] Rotate/flip
- [x] Basic layer operations
- [x] Export PNG/result pipeline
- [x] Export additional supported formats where appropriate
- [x] Reliable SVG Save/Save As workflow

### Phase 4 — Icon workflows

- [ ] Icon variants
- [ ] Reusable editing presets
- [ ] Templates
- [ ] Metadata-aware icon workflows
- [ ] Improved preview and comparison workflows

### Phase 5 — Multi-asset workflows

- [ ] Photograph/image asset workflows
- [ ] Illustration/background workflows
- [ ] Sprite/game-asset workflows
- [ ] Document/source-file workflows
- [ ] Asset-type-aware tools

### Phase 6 — Production asset management

- [ ] Persistent asset/project state
- [ ] Import/export workflows
- [ ] Version-aware editing workflows
- [ ] Storage abstraction
- [ ] Future server/object-storage integration

### Phase 7 — Future expansion

- [ ] Image generation integration (out of initial scope)
- [ ] Authentication/configuration if required
- [ ] Deployment automation
- [ ] Production monitoring and diagnostics
- [ ] Performance improvements based on real usage

## Roadmap rules

This document describes product direction. It is not permission for an agent to implement every unchecked item.

Agents may only implement work explicitly assigned through `docs/TASKBOARD.md` or a direct task instruction.

Completed work must reflect the actual repository state.

When architecture and scope are ambiguous, stop and request a decision rather than copying prototype patterns or inventing a parallel architecture.
