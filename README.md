# Asset Vault — Integrated Editor Engine

Welcome to the **Asset Vault** repository.

The application is a creative asset management vault with an integrated graphics processing engine (Photopea) behind an application-owned UI.

While icons are the initial asset category used to validate application workflows, the architecture is generic and designed for managing, editing, and exporting diverse creative assets (images, illustrations, photographs, game assets, UI elements, backgrounds, and future AI-generated assets).

---

## 📁 Repository Structure

```text
icons/
├── src/                                  # PRODUCTION APPLICATION (Primary Codebase)
│   ├── types/                            # Domain types (Asset, AssetCategory, ExportOptions, etc.)
│   ├── engine/                           # EditorEngine interface & PhotopeaEngine bridge
│   ├── components/                       # Application UI components (Browser, Inspector, Modal, Uploader)
│   ├── assets/                           # Vault assets and explorer tree definitions
│   ├── App.tsx                           # Application shell & state routing
│   ├── main.tsx                          # Application entry
│   └── index.css                         # Tailwind CSS styling
├── proto-type/                           # REFERENCE MATERIAL ONLY
│   └── artificer-icon-library-proto-type/ # Archived prototype implementation
├── docs/                                 # Documentation & taskboard
│   └── TASKBOARD.md                      # Development taskboard
├── public/                               # Public static assets
├── package.json                          # Production dependencies & scripts
├── tsconfig.json                         # TypeScript configuration
├── vite.config.ts                        # Vite bundler configuration
└── server.ts                             # Development Express/Vite server
```

> ⚠️ **Development Note**: From `APP-001` onward, the `proto-type/` directory is **reference material only**. Do not add new features or application logic to `proto-type/`. All production code belongs in root `src/`.

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
   folders                      compositing
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
