import { Asset, CatalogAsset } from '@/types/asset';
import { IconDefinition, VaultFilterOptions } from '@/types/vault';
import { getAssetById, getIconCatalog, addOrUpdateCatalogAsset } from '@/lib/catalog';

export interface IAssetService {
  getAsset(id: string): Promise<Asset | null>;
  getCatalogAsset(id: string): CatalogAsset | undefined;
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

    const catAsset = getAssetById(id);
    if (!catAsset) return null;

    let dataUrl = catAsset.file;
    try {
      const res = await fetch(catAsset.file);
      if (res.ok) {
        const svgText = await res.text();
        dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgText)}`;
      }
    } catch (e) {
      // Fallback to static URL
    }

    return {
      id: catAsset.id,
      name: `${catAsset.name}.svg`,
      category: 'icon',
      mimeType: 'image/svg+xml',
      data: dataUrl,
      width: 512,
      height: 512,
      metadata: {
        label: catAsset.name,
        description: catAsset.description,
        tags: catAsset.tags,
        category: catAsset.category,
        file: catAsset.file,
      },
    };
  }

  public getCatalogAsset(id: string): CatalogAsset | undefined {
    return getAssetById(id);
  }

  public getIconDefinition(id: string): IconDefinition | null {
    const catAsset = getAssetById(id);
    if (!catAsset) return null;
    return {
      label: catAsset.name,
      description: catAsset.description,
      usage: `Canonical ${catAsset.category} asset`,
    };
  }

  public async listAssetIds(filter?: VaultFilterOptions): Promise<string[]> {
    let assets = getIconCatalog();

    if (filter?.category && filter.category !== 'all') {
      assets = assets.filter((a) => a.category === filter.category);
    }

    if (filter?.folderId) {
      assets = assets.filter((a) => a.folderId === filter.folderId || a.category === filter.folderId);
    }

    if (filter?.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      assets = assets.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return assets.map((a) => a.id);
  }

  public async saveAsset(asset: Asset): Promise<void> {
    this.inMemoryVault[asset.id] = asset;
    const catAsset = getAssetById(asset.id);
    if (catAsset) {
      addOrUpdateCatalogAsset({
        ...catAsset,
        name: asset.name.replace(/\.svg$/, ''),
      });
    }
  }
}

export const assetService = new VaultAssetService();
