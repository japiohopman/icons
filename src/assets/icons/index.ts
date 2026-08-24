import { IconDefinition, FolderNode } from '@/types/vault';

// Process and parse dynamically imported SVGs
const svgModules = (import.meta as Record<string, any>).glob('/src/assets/icons/svg/**/*.svg', { query: '?raw', eager: true });

const DYNAMIC_SVGS: Record<string, IconDefinition> = {};
const SVG_CATEGORIES: Record<string, Record<string, IconDefinition>> = {};

// Map folder names in src/assets/icons/svg/<folder>/ to standard category IDs
const FOLDER_TO_CATEGORY: Record<string, string> = {
  abilities: 'ability_score',
  action: 'actions',
  actors: 'creatures',
  damage: 'damage_types',
  dice: 'dice',
  items: 'equipment',
  schools: 'magic_schools',
  statuses: 'conditions',
  tarot: 'tarot',
  ui: 'ui',
  attacks: 'attacks',
  character: 'character',
  currency: 'currency',
  editor: 'editor',
  equipment_doll: 'equipment_doll',
  feats: 'feats',
  features: 'features',
  materials: 'materials',
  minigame: 'minigame',
  musical_instruments: 'musical_instruments',
  skill: 'skill',
  stat_comparison: 'stat_comparison',
  subclasses: 'subclasses',
  traits: 'traits',
  world_atlas: 'world_atlas',
  book_reader: 'book_reader',
};

Object.entries(svgModules).forEach(([filePath, module]) => {
  const rawContent = (module as any).default || (module as any);
  if (typeof rawContent !== 'string') return;

  const parts = filePath.split('/');
  const filename = parts[parts.length - 1];
  const folderName = parts[parts.length - 2];

  const id = filename.replace(/\.svg$/, '');
  const categoryId = FOLDER_TO_CATEGORY[folderName] || folderName;

  const pathMatch = rawContent.match(/<path[^>]+d=["']([^"']+)["']/i);
  const fallbackPath = pathMatch ? pathMatch[1] : '';

  const labelMatch = rawContent.match(/data-label=["']([^"']+)["']/i);
  const label = labelMatch
    ? labelMatch[1]
    : id
      .replace(/^(tarot_\d+_|trait-)/i, '')
      .replace(/[-_]/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const descMatch = rawContent.match(/data-description=["']([^"']+)["']/i);
  const description = descMatch
    ? descMatch[1]
    : `A symbolic icon representing ${label}.`;

  const usageMatch = rawContent.match(/data-usage=["']([^"']+)["']/i);
  const usage = usageMatch ? usageMatch[1] : undefined;

  const usedInMatch = rawContent.match(/data-used-in=["']([^"']+)["']/i);
  const usedIn = usedInMatch ? usedInMatch[1] : undefined;

  const definition: IconDefinition = {
    path: fallbackPath,
    label,
    description,
    usage,
    usedIn,
  };

  DYNAMIC_SVGS[id] = definition;

  if (!SVG_CATEGORIES[categoryId]) {
    SVG_CATEGORIES[categoryId] = {};
  }
  SVG_CATEGORIES[categoryId][id] = definition;
});

// Default fallback icons if SVGs aren't loaded or when searching default icons
if (Object.keys(DYNAMIC_SVGS).length === 0) {
  DYNAMIC_SVGS['save'] = {
    path: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
    label: 'Save',
    description: 'Save asset to vault',
  };
}

export const ALL_ICONS = DYNAMIC_SVGS;

// Construct the filesystem directory explorer tree dynamically from svgModules
const rootNode: FolderNode = {
  type: 'folder',
  name: 'svg',
  path: '',
  children: [],
};

Object.keys(svgModules).forEach((filePath) => {
  const prefix = '/src/assets/icons/svg/';
  const index = filePath.indexOf(prefix);
  if (index === -1) return;

  const relativePath = filePath.substring(index + prefix.length);
  const segments = relativePath.split('/');

  let currentNode = rootNode;
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const isFile = i === segments.length - 1;

    if (isFile) {
      const iconId = segment.replace(/\.svg$/, '');
      currentNode.children.push({
        type: 'file',
        name: segment,
        iconId,
        path: relativePath,
      });
    } else {
      let dirNode = currentNode.children.find(
        (child) => child.type === 'folder' && child.name === segment
      ) as FolderNode;
      if (!dirNode) {
        dirNode = {
          type: 'folder',
          name: segment,
          path: currentNode.path ? `${currentNode.path}/${segment}` : segment,
          children: [],
        };
        currentNode.children.push(dirNode);
      }
      currentNode = dirNode;
    }
  }
});

function sortTree(node: FolderNode) {
  node.children.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
  node.children.forEach((child) => {
    if (child.type === 'folder') {
      sortTree(child);
    }
  });
}

sortTree(rootNode);

export const EXPLORER_TREE = rootNode;
