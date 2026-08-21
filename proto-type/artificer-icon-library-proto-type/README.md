# Asset Vault with Integrated Editor Engine

This repository is evolving into a full creative **Asset Vault and Editor Engine** application.

While icons are the initial asset category used to validate the application and workflows, the long-term vision encompasses managing, editing, and exporting diverse creative assets (images, illustrations, photographs, game assets, UI elements, backgrounds, and future AI-generated assets).

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

### The Role of Photopea

**Photopea is NOT the application.**
Photopea serves as an underlying image processing / editing engine integrated programmatically behind our application's UI.

Communication flow:
```text
Asset Vault UI (App / Modal Controls)
       ↓
Application Logic
       ↓
EditorEngine Abstraction Interface (`src/engine/types.ts`)
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
   cd proto-type/artificer-icon-library-proto-type
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

---

## ⚡ Current Editor Capabilities (PHOTOPEA-001 & PHOTOPEA-005)

- **Application-Owned UI**: The user interacts exclusively with application navigation, inspector panels, and application editor controls. Photopea operates inside a programmatically managed engine container behind the UI.
- **EditorEngine Boundary**: Centralized messaging bridge featuring:
  - Task serialization queue preventing concurrent command collisions.
  - Photopea readiness handshake verification (`"done"` message signal).
  - Binary ArrayBuffer asset loading via postMessage.
  - Strict origin validation (`https://www.photopea.com`).
  - Response-driven promise resolution with safety timeouts.
- **Supported Editor Operations**:
  - **Resize (Scale)**: Programmatically resizes/scales active asset image dimensions.
  - **Canvas Resize**: Modifies document canvas size relative to 9-point anchor presets (`center`, `top-left`, `top-center`, `bottom-right`, etc.).
  - **Crop**: Crops document workspace to explicit pixel bounds (`x`, `y`, `width`, `height`).
  - **Export**: Exports current edited document as new binary ArrayBuffer result (PNG) without mutating source assets.
- **Non-Destructive Workflows**: Source assets in the Asset Vault are strictly preserved. Edits generate new result assets displayed in the application preview area.
- **Application Validation**: Defensive input validation for non-negative coordinates, positive non-zero dimensions, and finite numbers before executing engine operations.

---

## 🔮 Roadmap & Future Directions

- Multi-format asset storage abstraction beyond repository static assets.
- Advanced editing operations (crop, canvas resize, layers, filters, vector transforms).
- Asset version history, variant tracking, and metadata provenance.
- Non-destructive export workflows across icons, illustrations, and images.
