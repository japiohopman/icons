import { Asset } from '@/types/asset';
import { IconDefinition, VaultFilterOptions } from '@/types/vault';
import { ALL_ICONS } from '@/assets/icons';
import { getAssetById, getIconCatalog } from '@/lib/catalog';

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

    const catalogAsset = getAssetById(id);
    const def = (ALL_ICONS as Record<string, IconDefinition>)[id];

    if (!catalogAsset && !def) return null;

    const fileUrl = catalogAsset?.file || `/assets/icons/${id}.svg`;

    return {
      id,
      name: catalogAsset?.name || `${id}.svg`,
      category: 'icon',
      mimeType: 'image/svg+xml',
      file: fileUrl,
      data: fileUrl,
      width: 512,
      height: 512,
      metadata: {
        label: catalogAsset?.name || def?.label || id,
        description: catalogAsset?.description || def?.description,
        usage: def?.usage,
        usedIn: def?.usedIn,
      },
    } as Asset & { file?: string };
  }

  public getIconDefinition(id: string): IconDefinition | null {
    const catalogAsset = getAssetById(id);
    const def = (ALL_ICONS as Record<string, IconDefinition>)[id];
    if (catalogAsset) {
      return {
        label: catalogAsset.name,
        description: catalogAsset.description,
      };
    }
    return def || null;
  }

  public async listAssetIds(filter?: VaultFilterOptions): Promise<string[]> {
    const catalog = getIconCatalog();
    let ids = catalog.length > 0 ? catalog.map((a) => a.id) : Object.keys(ALL_ICONS);

    if (filter?.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      ids = ids.filter((id) => id.toLowerCase().includes(q));
    }

    return ids;
  }

  public async saveAsset(asset: Asset): Promise<void> {
    this.inMemoryVault[asset.id] = asset;
  }
}

export const assetService = new VaultAssetService();
