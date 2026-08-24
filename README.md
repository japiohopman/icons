# Artificer Asset Vault

An **Asset Vault** with an integrated **Editor Engine** for managing, editing, and exporting creative assets.

## Architecture & Codebase Structure

```text
src/
    ├── components/    # Application UI components (Vault Header, Explorer Sidebar, Asset Browser, Inspector, Editor Modal)
    ├── hooks/         # React hooks (useAssetVault, useEditor)
    ├── engine/        # EditorEngine interface & PhotopeaEngine bridge
    ├── tools/         # Asset manipulation tools (resize, export)
    ├── lib/           # Generic utilities & helpers
    ├── assets/        # Asset definitions & static resources
    ├── types/         # Domain models (Asset, EditorEngine, Vault types)
    └── services/      # Storage & asset persistence abstraction (AssetService)

proto-type/
    Reference implementation only. Do NOT add new features or application code to proto-type.
```

### Core Architecture Boundary

The real application strictly isolates UI components from graphics processing engines:

```text
Icons UI (src/components/)
      ↓
Application Logic & Hooks (src/hooks/)
      ↓
Editor Engine Abstraction (src/engine/EditorEngine.ts)
      ↓
Photopea Engine Bridge (src/engine/PhotopeaEngine.ts)
      ↓
Photopea Live Messaging API
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Type Check / Lint

```bash
npm run lint
```
