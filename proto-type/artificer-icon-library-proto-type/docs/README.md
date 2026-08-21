# Artificer Icon & Asset Studio — Prototype Documentatie

> **⚠️ BELANGRIJKE MEDEDELING: DIT IS EEN PROTOTYPE / PROOF OF CONCEPT**  
> Deze applicatie is **strikt een prototype en conceptueel voorbeeld (reference blueprint)**.  
> Het dient als visuele en functionele leidraad voor de uiteindelijke, volwaardige applicatie die momenteel wordt ontwikkeld.  
> De definitieve productie-applicatie zal worden aangedreven door de **Photopea API** als centrale grafische motor.

---

## 1. Wat is deze applicatie?

De **Artificer Icon Library** (deze prototype webapp) is een interactieve asset explorer en preview tool voor RPG-iconen, grafische elementen, tokens en spell/ability symbolen.

### Huidige Functionaliteiten in dit Prototype:
- **Bestandsstructuur Verkenner (Tree Explorer):** Navigeer door alle mappen en submappen (`src/assets/icons/svg/`) zoals `abilities`, `damage`, `items`, `world_atlas`, etc.
- **Snelle Zoekfunctie:** Filter realtime op bestandsnaam en trefwoord binnen de gehele catalogus.
- **Interactieve Preview & Editor:**
  - Schalen van iconen (16px tot 128px+).
  - Aanpassen van kleuren (primaire kleur, secundaire accenten, achtergrond).
  - Randen, schaduwen en presets (Tokens, Dark Fantasy, Cyberpunk, D&D Classic).
- **Directe Export:** Downloaden als SVG, PNG of kopiëren naar het klembord als schone SVG-code of React component.

---

## 2. Doel & Rol van dit Prototype

Dit prototype is ontworpen om:
1. **De UI/UX en workflow te valideren:** Hoe gebruikers door honderden assets bladeren, categoriseren, filteren en inspecteren.
2. **Assetbeheer en metadata te standaardiseren:** Bepalen hoe categorieën, subpaden en icon-definities gestructureerd moeten worden.
3. **Als voorbeeld en specificatie te dienen** voor het engineeringteam dat de definitieve applicatie bouwt.

---

## 3. De Echte Applicatie: Aangedreven door de Photopea API

In de uiteindelijke versie zal niet alleen sprake zijn van een statische SVG viewer, maar van een **volwaardige grafische studio** waarbij de **Photopea API** fungeert als de onderliggende motor (*engine*).

### Waarom de Photopea API als motor?
- **Volledige Layer & Canvas Manipulatie:** Ondersteuning voor complexe lagen, blend modes, filters, maskers en effecten.
- **Geavanceerde PSD / Vector Bewerking:** Direct bewerken van vectorpaden, slimme objecten en rasterlagen binnen een ingebedde of headless Photopea instance.
- **Automatisering via Scripts:** Dynamisch genereren van icon varianten, frames, borders en batch-exports via Photopea's script API (`app.activeDocument...`).
- **High-Res Export Formaten:** Ondersteuning voor multi-resolutie exports, spritesheets, WebP, PNG met alpha channel en printklare resoluties (300 DPI).

---

## 4. Architectuur & Bestandsoverzicht

```
/
├── docs/
│   └── README.md                # Deze documentatie
├── src/
│   ├── assets/
│   │   └── icons/
│   │       ├── svg/             # De bron-SVG's georganiseerd per map/categorie
│   │       └── index.ts         # Dynamische module loader & boomstructuur generator
│   ├── components/
│   │   └── IconUploader.tsx     # Prototype asset upload component
│   ├── game_icons.tsx           # Universeel GameIcon rendering component
│   ├── types.ts                 # TypeScript definities voor nodes, bomen en iconen
│   └── App.tsx                  # Hoofdapplicatie met explorer, preview en canvas
└── metadata.json
```

---

## 5. Volgende Stappen & Roadmap

1. **Photopea API Integratie:** Inbedden van een headless/iframe Photopea workspace om geselecteerde iconen direct over te dragen naar een actieve Photoshop-compatibele canvas.
2. **Template Systeem:** Kaders, runen, badges en RPG-fiches klaarmaken als lagen binnen Photopea templates.
3. **Batch Generatie:** Automatisch genereren van complete icon-sets met consistente kleurenpaletten en effecten via API scripts.

---

## 6. Photopea API Proof of Concept (POC)

A minimal proof of concept for Photopea API integration has been added to test live client-side communication between the Icons application and Photopea.

### What Was Implemented
- **PhotopeaModal Component (`src/components/PhotopeaModal.tsx`)**: An embedded workspace container hosting the official Photopea editor via iframe.
- **Bi-directional Web Messaging (postMessage)**: Native browser postMessage communication to send binary SVG files to Photopea and receive binary PNG exports back.
- **Script Controls**: Quick buttons to execute ExtendedScript commands directly in the active Photopea document context.
- **Side-by-Side Comparison**: UI displaying the original SVG icon next to the exported PNG result returned from Photopea.

### How It Works
1. **Selection**: User selects an icon from the Icons App and clicks **"Edit in Photopea (API POC)"**.
2. **Handshake**: The modal opens an iframe pointing to `https://www.photopea.com`. Upon initialization, Photopea sends a `"done"` postMessage string signal.
3. **Image Transfer**: The application encodes the SVG string into a binary `ArrayBuffer` and sends it to Photopea via `postMessage(arrayBuffer, '*')`.
4. **Operation**: The user can edit the icon directly using Photopea's canvas UI or trigger automated scripts (e.g. `app.activeDocument.activeLayer.rotate(45)` or `app.activeDocument.activeLayer.invert()`).
5. **Export & Return**: The application sends `app.activeDocument.saveToOE("png")`. Photopea exports the document and sends back an `ArrayBuffer`, which is converted to a PNG Blob URL for immediate side-by-side preview and download.

### Verified Photopea API Capabilities
- [x] Loading Photopea iframe directly from public URL (`https://www.photopea.com`).
- [x] Receiving initial ready state `"done"` message via `window.addEventListener('message', ...)`.
- [x] Passing binary file data (`ArrayBuffer` of SVG) via `postMessage`.
- [x] Executing ExtendedScript strings (`app.activeDocument.activeLayer...`) via `postMessage`.
- [x] Exporting active document via `app.activeDocument.saveToOE("png")` and receiving PNG `ArrayBuffer`.
- [x] Safe memory management using Blob URL creation and `URL.revokeObjectURL` cleanup on unmount.

### What Was Not Tested
- Cross-origin restrictions with custom fonts or external resource URLs loaded inside Photopea.
- Batch processing multiple icons sequentially in a single iframe session.
- Advanced PSD layer template synchronization with application state.

### Possible Next Steps
- Implement reusable template overlays (e.g., RPG borders and frames) loaded as layered PSD templates.
- Add preset export scripts for generating multi-resolution icon sheets (e.g. 32px, 64px, 128px PNGs).

### POC Verdict
- **Verdict**: Works
- **What was successfully verified**: Seamless client-side communication, binary image transfer into Photopea, ExtendedScript automation, and binary export back to the host application without requiring a backend server.
- **Biggest limitation discovered**: Initial iframe load time depends on client network speed to fetch Photopea assets.
- **Recommended next step**: Proceed with integrating Photopea templates for RPG borders and badge generation.
