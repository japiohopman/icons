# Asset Vault — Integrated Editor Engine

Welcome to the **Asset Vault** repository.

The application is a creative asset management vault with an integrated graphics processing engine (Photopea) behind an application-owned UI.

While icons are the initial asset category used to validate application workflows, the architecture is generic and designed for managing, editing, and exporting diverse creative assets (images, illustrations, photographs, game assets, UI elements, backgrounds, and future AI-generated assets).

---

## 🏛️ Asset Architecture: Core Directive

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
│   ├── components/                       # Application UI components (Browser, Inspector, Modal, Uploader)
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
└── server.ts                             # Development Express/Vite server
```

> ⚠️ **Development Note**: `proto-type/` directory is **reference material only**. Do not add new features or application logic to `proto-type/`. All production code belongs in root `src/`. No physical SVG assets belong inside `src/`.

---

## 🏛️ Architecture Overview

The application is structured into three distinct layers:

```text
                  ASSET VAULT
                       |
        ┌──────────────┴──────────────┐
        |                             |
     Storage                      Editor Engine
        |                             |
   organization                 modification
   metadata                     processing
   JSON catalog                 compositing
   search                       export
   variants                     transforms
        |                             |
        └──────────────┬──────────────┘
                       |
                  Application UI
```

### Communication Flow

```text
Asset Vault UI (`src/components/`)
       ↓
Catalog Loader (`src/lib/catalog.ts`)
       ↓
Application State & Logic (`src/App.tsx`)
       ↓
EditorEngine Abstraction Interface (`src/engine/EditorEngine.ts`)
       ↓
PhotopeaEngine Bridge (`src/engine/PhotopeaEngine.ts`)
       ↓
Photopea API / Live Messaging / Binary ArrayBuffer (`postMessage`)
       ↓
Asset Result (ArrayBuffer / Data URL)
       ↓
Asset Vault (Preserves original source asset)
```

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

- **Catalog-Driven Vault**: The UI renders assets directly from the semantic JSON catalog, mapping stable asset IDs to physical asset store URLs (`/assets/icons/*.svg`).
- **Application-Owned UI**: The user interacts exclusively with application navigation, inspector panels, and application editor controls. Photopea operates inside a programmatically managed engine container behind the UI.
- **EditorEngine Boundary**: Centralized messaging bridge featuring:
  - Task serialization queue preventing concurrent command collisions.
  - Photopea readiness handshake verification (`"done"` message signal).
  - Binary ArrayBuffer asset transfer via postMessage.
  - Strict origin validation (`https://www.photopea.com`).
  - Response-driven promise resolution with safety timeouts.
- **Supported Editor Operations**:
  - **Resize (Scale)**: Resizes active asset image dimensions.
  - **Canvas Resize**: Modifies document canvas size relative to 9-point anchor presets (`center`, `top-left`, `bottom-right`, etc.).
  - **Crop**: Crops document workspace to explicit pixel bounds (`x`, `y`, `width`, `height`).
  - **Export**: Exports current edited document as new binary ArrayBuffer result (PNG) without mutating source assets.
- **Non-Destructive Workflows**: Source assets in the Asset Vault are strictly preserved. Edits generate new result assets displayed in the application preview area.
