/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import combat from '../assets/catalog/icons/combat.json';
import equipment from '../assets/catalog/icons/equipment.json';
import creatures from '../assets/catalog/icons/creatures.json';
import magic from '../assets/catalog/icons/magic.json';
import conditions from '../assets/catalog/icons/conditions.json';
import character from '../assets/catalog/icons/character.json';
import world from '../assets/catalog/icons/world.json';
import cardsDice from '../assets/catalog/icons/cards_dice.json';
import tarot from '../assets/catalog/icons/tarot.json';
import ui from '../assets/catalog/icons/ui.json';
import general from '../assets/catalog/icons/general.json';

import { CatalogAsset, CatalogCategory } from '../types/asset';

export const CATALOG_CATEGORIES: CatalogCategory[] = [
  { id: 'combat', name: 'Combat & Weapons', description: 'Attacks, weapons, armor, and combat tactics.' },
  { id: 'equipment', name: 'Equipment & Items', description: 'Gear, potions, tools, containers, and loot.' },
  { id: 'creatures', name: 'Creatures & Beasts', description: 'Monsters, animals, undead, and fantasy actors.' },
  { id: 'magic', name: 'Magic & Spells', description: 'Arcane traditions, elemental forces, and spellcraft.' },
  { id: 'conditions', name: 'Conditions & Statuses', description: 'Status effects, ailments, and environmental conditions.' },
  { id: 'character', name: 'Character & Traits', description: 'Body attributes, skills, feats, and personal traits.' },
  { id: 'world', name: 'World & Atlas', description: 'Terrain, locations, structures, and geography.' },
  { id: 'cards_dice', name: 'Cards & Dice', description: 'Polyhedral dice, playing cards, and tabletop tokens.' },
  { id: 'tarot', name: 'Tarot Arcana', description: 'Tarot cards and divination arcana.' },
  { id: 'ui', name: 'User Interface', description: 'Controls, navigation, and system indicators.' },
  { id: 'general', name: 'General Vault Assets', description: 'Miscellaneous icons and symbols.' },
];

const ALL_CATALOG_ASSETS: CatalogAsset[] = [
  ...combat,
  ...equipment,
  ...creatures,
  ...magic,
  ...conditions,
  ...character,
  ...world,
  ...cardsDice,
  ...tarot,
  ...ui,
  ...general,
] as CatalogAsset[];

const ASSETS_BY_ID = new Map<string, CatalogAsset>(
  ALL_CATALOG_ASSETS.map((asset) => [asset.id, asset])
);

// Map by physical file name / path for flexible fallback resolution
const ASSETS_BY_FILE = new Map<string, CatalogAsset>();
ALL_CATALOG_ASSETS.forEach((asset) => {
  ASSETS_BY_FILE.set(asset.file, asset);
  const fileName = asset.file.split('/').pop();
  if (fileName) {
    ASSETS_BY_FILE.set(fileName, asset);
    ASSETS_BY_FILE.set(fileName.replace(/\.svg$/, ''), asset);
  }
});

export function getIconCatalog(): CatalogAsset[] {
  return ALL_CATALOG_ASSETS;
}

export function getCatalogCategories(): CatalogCategory[] {
  return CATALOG_CATEGORIES;
}

export function getAssetById(id: string): CatalogAsset | undefined {
  if (ASSETS_BY_ID.has(id)) {
    return ASSETS_BY_ID.get(id);
  }
  return ASSETS_BY_FILE.get(id);
}

export function getAssetsByCategory(categoryId: string): CatalogAsset[] {
  if (!categoryId || categoryId === 'all') {
    return ALL_CATALOG_ASSETS;
  }
  return ALL_CATALOG_ASSETS.filter((a) => a.category === categoryId);
}
