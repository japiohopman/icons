/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

// Dynamically import all JSON catalog files under src/assets/catalog/icons/
const catalogModules = (import.meta as any).glob('/src/assets/catalog/icons/*.json', {
  eager: true,
}) as Record<string, { default: CatalogAsset[] }>;

const ALL_CATALOG_ASSETS: CatalogAsset[] = [];

Object.values(catalogModules).forEach((module) => {
  const assets = module.default || module;
  if (Array.isArray(assets)) {
    ALL_CATALOG_ASSETS.push(...(assets as CatalogAsset[]));
  }
});

const ASSETS_BY_ID = new Map<string, CatalogAsset>(
  ALL_CATALOG_ASSETS.map((asset) => [asset.id, asset])
);

const ASSETS_BY_FILE = new Map<string, CatalogAsset>(
  ALL_CATALOG_ASSETS.map((asset) => [asset.file, asset])
);

export function getIconCatalog(): CatalogAsset[] {
  return ALL_CATALOG_ASSETS;
}

export function getCatalogCategories(): CatalogCategory[] {
  return CATALOG_CATEGORIES;
}

export function getAssetById(id: string): CatalogAsset | undefined {
  return ASSETS_BY_ID.get(id);
}

export function getAssetByFile(file: string): CatalogAsset | undefined {
  return ASSETS_BY_FILE.get(file);
}

export function getAssetsByCategory(categoryId: string): CatalogAsset[] {
  if (!categoryId || categoryId === 'all') {
    return ALL_CATALOG_ASSETS;
  }
  return ALL_CATALOG_ASSETS.filter((a) => a.category === categoryId);
}
