import { IconDefinition, FolderNode } from '@/types/vault';
import { getIconCatalog } from '@/lib/catalog';

const DYNAMIC_ICONS: Record<string, IconDefinition> = {};

const catalogAssets = getIconCatalog();

catalogAssets.forEach((asset) => {
  DYNAMIC_ICONS[asset.id] = {
    label: asset.name,
    description: asset.description,
  };
});

// Default fallback icon if catalog is empty
if (Object.keys(DYNAMIC_ICONS).length === 0) {
  DYNAMIC_ICONS['save'] = {
    label: 'Save',
    description: 'Save asset to vault',
  };
}

export const ALL_ICONS = DYNAMIC_ICONS;

export const EXPLORER_TREE: FolderNode = {
  type: 'folder',
  name: 'icons',
  path: '',
  children: [],
};
