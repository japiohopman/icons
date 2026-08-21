# Artificer Asset Catalog

This file tracks the status and metadata of all game assets.

## Category Completion Status
- [x] **Ability Scores** (`ability_score.ts`)
- [x] **Magic Schools** (`magic_schools.ts`)
- [x] **Tarot** (`tarot.ts`)
- [ ] **UI** (`ui.ts`) - *In Progress*
- [ ] **World Atlas** (`world_atlas.ts`) - *In Progress*
- [ ] **Equipment** (`equipment.ts`) - *In Progress*
- [x] **Currency** (`currency.ts`)

---

## Metadata Register

| Category | ID | Label | Description | Used In | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| UI | `pluus` | Add / Create | A simple mathematical plus sign. | Quick-add, Inventory | ✅ Path OK |
| UI | `minus` | Minus | A simple horizontal stroke. | HP tracking, removal actions | ✅ Path OK |
| UI | `chat_interface` | Chat Interface | Two chat bubbles. | Navbar button | ✅ Path OK |
| World Atlas | `map` | World Map | Detailed cartographic representation. | World Atlas, Travel System | ✅ Path OK |
| World Atlas | `map_marker` | Map Marker | A simple upside-down tear shape marker. | Editor setting new location nodes | ✅ Path OK |
| Traits | `draconic_ancestry` | Draconic Ancestry | Scaled dragon-like pattern. | Dragonborn traits | ✅ Path OK |
| Traits | `lucky` | Lucky | Abstract circular/orbital pattern. | Lucky trait, Halfling traits | ✅ Path OK |
| Currency | `copper_coin` | Copper Coin | Standard copper currency. | Inventory, Shop | ✅ Path OK |
| Currency | `electrum_coin` | Electrum Coin | Rare electrum currency. | Inventory, Rewards | ✅ Path OK |
| Currency | `gold_coin` | Gold Coin | Standard gold currency. | Inventory, Shop | ✅ Path OK |
| Currency | `platinum_coin` | Platinum Coin | High-value platinum currency. | Inventory, Treasury | ✅ Path OK |
| Currency | `silver_coin` | Silver Coin | Standard silver currency. | Inventory, Shop | ✅ Path OK |

## Optimization Registry
| Category | ID | Base Path | Optimization | Result |
| :--- | :--- | :--- | :--- | :--- |
| UI | `chevron_right` | `chevron_left` | Rotate 180° | ✅ OK |
| UI | `chevron_down` | `chevron_left` | Rotate 270° | ✅ OK |
| UI | `chevron_up` | `chevron_left` | Rotate 90° | ✅ OK |
| UI | `arrow_right` | `arrow_left` | Rotate 180° | ✅ OK |
| UI | `arrow_down` | `arrow_left` | Rotate 270°, Bounce | ✅ OK |
| UI | `arrow_up` | `arrow_left` | Rotate 90°, Bounce | ✅ OK |

## Special Color Assignments
- **Currency**: Copper (`#B45309`), Electrum (`#10B981`), Silver (`#94A3B8`), Gold (`#FBBF24`), Platinum (`#E2E8F0`)
- **Vitality / Heart**: Red (`#EF4444`)
- **Shield**: Blue (`#3B82F6`)

## Missing Icons (Need Paths)
- [ ] `equipment.potion` (General consumable)
- [ ] `equipment.scroll` (Magic items)
- [ ] `world_atlas.lake` (Map markers)
- [ ] `world_atlas.forest` (Map markers)

*(Agent Note: Use the Importer tool in the app to generate code for these when paths are found.)*
