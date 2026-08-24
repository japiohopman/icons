import { Asset } from '@/types/asset';
import { IconDefinition, VaultFilterOptions } from '@/types/vault';
import { ALL_ICONS } from '@/assets/icons';

export interface IAssetService {
  getAsset(id: string): Promise<Asset | null>;
  getIconDefinition(id: string): IconDefinition | null;
  listAssetIds(filter?: VaultFilterOptions): Promise<string[]>;
  saveAsset(asset: Asset): Promise<void>;
}

class VaultAssetService implements IAssetService {
  private inMemoryVault: Record<string, Asset> = {};

  public async getAsset(id: string): Promise<Asset | null> {
    if (this.inMemoryVault[id]) {
      return this.inMemoryVault[id];
    }

    const def = (ALL_ICONS as Record<string, IconDefinition>)[id];
    if (!def) return null;

    const pathStr = def.path || '';
    const svgData = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="${pathStr}"/></svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgData)}`;

    return {
      id,
      name: `${id}.svg`,
      category: 'icon',
      mimeType: 'image/svg+xml',
      data: dataUrl,
      width: 512,
      height: 512,
      metadata: {
        label: def.label,
        description: def.description,
        usage: def.usage,
        usedIn: def.usedIn,
      },
    };
  }

  public getIconDefinition(id: string): IconDefinition | null {
    return (ALL_ICONS as Record<string, IconDefinition>)[id] || null;
  }

  public async listAssetIds(filter?: VaultFilterOptions): Promise<string[]> {
    let ids = Object.keys(ALL_ICONS);

    if (filter?.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      ids = ids.filter((id) => id.toLowerCase().includes(q));
    }

    if (filter?.showMissingOnly) {
      ids = ids.filter((id) => {
        const def = (ALL_ICONS as Record<string, IconDefinition>)[id];
        return !def || !def.path;
      });
    }

    return ids;
  }

  public async saveAsset(asset: Asset): Promise<void> {
    this.inMemoryVault[asset.id] = asset;
  }
}

export const assetService = new VaultAssetService();
