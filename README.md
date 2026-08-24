# Asset Vault — Integrated Editor Engine

Welcome to the **Asset Vault** repository.

The application is a creative asset management vault with an integrated graphics processing engine (Photopea) behind an application-owned UI.

While icons are the initial asset category used to validate application workflows, the architecture is generic and designed for managing, editing, and exporting diverse creative assets (images, illustrations, photographs, game assets, UI elements, backgrounds, and future AI-generated assets).

---

## 🏛️ Asset Architecture & Production Workflows

The repository enforces a strict rule separating physical file storage from application semantics:

```text
public/assets/            → PHYSICAL ASSET STORAGE (Files)
src/assets/catalog/      → SEMANTIC ASSET CATALOG (Meaning & Metadata)
src/                     → APPLICATION CODE
proto-type/              → REFERENCE ONLY
```

### Physical Asset Store (`public/assets/`)
All physical asset files live outside `src/`.
- `public/assets/icons/` is a **flat physical asset store** containing physical `.svg` files.
- Physical asset directories are intentionally flat (no category subdirectories like `public/assets/icons/combat/`).
- The directory structure is intentionally dumb; the catalog provides the intelligence.

### Semantic Asset Catalog (`src/assets/catalog/`)
Logical organization, metadata, and taxonomy belong in `src/assets/catalog/`:
- `src/assets/catalog/icons/*.json` contains JSON catalog files (`combat.json`, `equipment.json`, `creatures.json`, `magic.json`, etc.).
- JSON is the semantic source of truth.
- Provides **stable asset IDs** (e.g. `combat.attack`), display names, category classifications, tags, descriptions, and physical file paths (`/assets/icons/attack.svg`).
- Filenames and folder structures are NOT canonical asset identities; asset identity is resolved via catalog metadata.

### Asset Editor Workspace & Save Workflows (VAULT-002)
- **Full Application Workspace**: Occupies the viewport, providing a full editing canvas with native Photopea tools.
- **Save**: Updates the current active asset by saving the physical asset file (`public/assets/icons/*.svg`) and updating the semantic JSON catalog (`src/assets/catalog/icons/*.json`). Edits persist across page reloads.
- **Save As**: Creates a NEW asset with a new stable asset ID, new physical filename, new physical asset file, and new catalog entry while preserving the original asset untouched.
- **Export**: Generates derivative output formats (PNG, WebP, JPG, SVG) for browser download without mutating vault assets.
- **SVG Preservation**: SVG source assets export and save as genuine vector SVG files via Photopea's vector serialization.

---

## 📁 Repository Structure

```text
icons/
├── public/                               # PUBLIC STATIC PHYSICAL ASSET STORE
│   └── assets/                           # Physical creative assets
│       └── icons/                        # Flat icon store (*.svg)
├── src/                                  # PRODUCTION APPLICATION (Primary Codebase)
│   ├── types/                            # Domain types (Asset, CatalogAsset, ExportOptions, etc.)
│   ├── lib/                              # Catalog loader & services (getIconCatalog, getAssetById, etc.)
│   ├── engine/                           # EditorEngine interface & PhotopeaEngine bridge
│   ├── components/                       # Application UI components (Browser, Inspector, Workspace)
│   ├── assets/
│   │   └── catalog/                      # Semantic JSON asset catalogs
│   │       └── icons/                    # Category JSON files (combat.json, magic.json, etc.)
│   ├── App.tsx                           # Application shell & state routing
│   ├── main.tsx                          # Application entry
│   └── index.css                         # Tailwind CSS styling
├── proto-type/                           # REFERENCE MATERIAL ONLY
│   └── artificer-icon-library-proto-type/ # Archived prototype implementation
├── docs/                                 # Documentation & taskboard
│   └── TASKBOARD.md                      # Development taskboard
├── package.json                          # Production dependencies & scripts
├── tsconfig.json                         # TypeScript configuration
├── vite.config.ts                        # Vite bundler configuration
└── server.ts                             # Development Express/Vite server & Persistence API
```

> ⚠️ **Development Note**: `proto-type/` directory is **reference material only**. Do not add new features or application logic to `proto-type/`. All production code belongs in root `src/`. No physical SVG assets belong inside `src/`.

---

## 🚀 Running Locally

### Prerequisites

- Node.js (v18+)

### Steps

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run typecheck / lint:
   ```bash
   npm run lint
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

The application will be accessible at `http://localhost:3000`.

---

## ⚡ Production Capabilities

- **Full Editor Workspace**: Expands to full screen with complete Photopea editing tools, asset info panel, display name editing, and unsaved changes protection.
- **Real Asset Persistence**: Integrated `/api/assets/save` server endpoint persists physical assets to `public/assets/icons/` and syncs JSON catalogs in `src/assets/catalog/icons/`.
- **Non-Destructive Save As**: Save As creates new stable asset IDs and files while leaving source assets preserved.
- **Catalog-Driven Vault**: The UI renders assets directly from the semantic JSON catalog, mapping stable asset IDs to physical asset store URLs (`/assets/icons/*.svg`).
- **EditorEngine Boundary**: Centralized messaging bridge featuring task serialization, Photopea readiness verification, and postMessage binary/text handling.
