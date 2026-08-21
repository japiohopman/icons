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
