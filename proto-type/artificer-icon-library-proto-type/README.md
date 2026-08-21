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
Photopea API / Live Messaging / Scripts (`postMessage`)
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

## ⚡ Current Capabilities (PHOTOPEA-001)

- **Application-Owned UI**: The user interacts exclusively with application navigation, inspector panels, and editor controls. Photopea operates inside a programmatically managed engine container.
- **EditorEngine Boundary**: Centralized messaging bridge handling Photopea iframe mounting, `postMessage` script dispatch, and array buffer message receipt.
- **Vertical Slice Operation**: Selected assets can be opened, programmatically resized to target dimensions via engine scripting, and exported back as new asset results while keeping source assets unmodified.

---

## 🔮 Roadmap & Future Directions

- Multi-format asset storage abstraction beyond repository static assets.
- Advanced editing operations (crop, canvas resize, layers, filters, vector transforms).
- Asset version history, variant tracking, and metadata provenance.
- Non-destructive export workflows across icons, illustrations, and images.
