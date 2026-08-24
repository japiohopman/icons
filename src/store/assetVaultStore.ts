import { create } from 'zustand';
import { CatalogAsset, CatalogCategory } from '@/types/asset';
import { VirtualFolder } from '@/types/vault';
import { getIconCatalog, CATALOG_CATEGORIES, addOrUpdateCatalogAsset } from '@/lib/catalog';

export interface AssetVaultState {
  // Data
  assets: CatalogAsset[];
  folders: VirtualFolder[];

  // Navigation & Selection State
  activeFolderId: string; // 'all' or virtual folder ID
  selectedAssetIds: string[];
  selectedFolderId: string | null;
  searchQuery: string;
  viewMode: 'grid' | 'list';
  expandedFolderIds: Record<string, boolean>;
  showMissingOnly: boolean;

  // Editor Modal/Workspace State
  isEditorOpen: boolean;
  editorAssetId: string | null;

  // Actions
  loadCatalog: () => void;
  loadFolders: () => Promise<void>;
  setActiveFolderId: (id: string) => void;
  setSelectedAssetIds: (ids: string[]) => void;
  toggleAssetSelection: (id: string, multi?: boolean) => void;
  setSelectedFolderId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  toggleFolderExpanded: (folderId: string) => void;
  setShowMissingOnly: (val: boolean) => void;

  createFolder: (name: string, parentId?: string | null) => Promise<VirtualFolder>;
  renameFolder: (folderId: string, newName: string) => Promise<void>;
  moveAssetToFolder: (assetId: string, targetFolderId: string | null) => Promise<void>;
  moveFolderToFolder: (folderId: string, targetParentId: string | null) => Promise<void>;

  setIsEditorOpen: (open: boolean) => void;
  setEditorAssetId: (assetId: string | null) => void;
  updateAsset: (asset: CatalogAsset) => void;
}

const DEFAULT_FOLDERS: VirtualFolder[] = CATALOG_CATEGORIES.map((cat: CatalogCategory) => ({
  id: cat.id,
  name: cat.name,
  parentId: null,
  category: cat.id,
}));

export const useAssetVaultStore = create<AssetVaultState>((set, get) => ({
  assets: [],
  folders: DEFAULT_FOLDERS,
  activeFolderId: 'all',
  selectedAssetIds: ['combat.3d-hammer'],
  selectedFolderId: null,
  searchQuery: '',
  viewMode: 'grid',
  expandedFolderIds: { combat: true, magic: true },
  showMissingOnly: false,
  isEditorOpen: false,
  editorAssetId: null,

  loadCatalog: () => {
    const catalogAssets = getIconCatalog();
    set({ assets: catalogAssets });
  },

  loadFolders: async () => {
    try {
      const res = await fetch('/api/folders');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.folders) && data.folders.length > 0) {
          set({ folders: data.folders });
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to load folders from server, using default catalog folders.', err);
    }
    // Fallback to default category folders
    set({ folders: DEFAULT_FOLDERS });
  },

  setActiveFolderId: (id: string) => {
    set({ activeFolderId: id });
  },

  setSelectedAssetIds: (ids: string[]) => {
    set({ selectedAssetIds: ids });
  },

  toggleAssetSelection: (id: string, multi = false) => {
    const current = get().selectedAssetIds;
    if (multi) {
      if (current.includes(id)) {
        set({ selectedAssetIds: current.filter((item) => item !== id) });
      } else {
        set({ selectedAssetIds: [...current, id] });
      }
    } else {
      set({ selectedAssetIds: [id] });
    }
  },

  setSelectedFolderId: (id: string | null) => {
    set({ selectedFolderId: id });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setViewMode: (mode: 'grid' | 'list') => {
    set({ viewMode: mode });
  },

  toggleFolderExpanded: (folderId: string) => {
    set((state) => ({
      expandedFolderIds: {
        ...state.expandedFolderIds,
        [folderId]: !state.expandedFolderIds[folderId],
      },
    }));
  },

  setShowMissingOnly: (val: boolean) => {
    set({ showMissingOnly: val });
  },

  createFolder: async (name: string, parentId: string | null = null) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/^-+|-+$/g, '');
    const newFolderId = `folder_${slug}_${Date.now().toString(36)}`;
    const newFolder: VirtualFolder = {
      id: newFolderId,
      name,
      parentId: parentId || (get().activeFolderId !== 'all' ? get().activeFolderId : null),
    };

    const updatedFolders = [...get().folders, newFolder];
    set({ folders: updatedFolders });

    // Persist to server
    try {
      await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folders: updatedFolders }),
      });
    } catch (e) {
      console.error('Failed to persist created folder:', e);
    }

    return newFolder;
  },

  renameFolder: async (folderId: string, newName: string) => {
    const updatedFolders = get().folders.map((f) => (f.id === folderId ? { ...f, name: newName } : f));
    set({ folders: updatedFolders });

    try {
      await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folders: updatedFolders }),
      });
    } catch (e) {
      console.error('Failed to persist renamed folder:', e);
    }
  },

  moveAssetToFolder: async (assetId: string, targetFolderId: string | null) => {
    // Reassign asset's logical folderId
    const updatedAssets = get().assets.map((asset) => {
      if (asset.id === assetId) {
        return {
          ...asset,
          folderId: targetFolderId || undefined,
        };
      }
      return asset;
    });

    set({ assets: updatedAssets });

    // Find the target asset to update in `lib/catalog` as well
    const updatedAsset = updatedAssets.find((a) => a.id === assetId);
    if (updatedAsset) {
      addOrUpdateCatalogAsset(updatedAsset);
    }

    // Persist via API
    try {
      await fetch('/api/assets/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, folderId: targetFolderId }),
      });
    } catch (e) {
      console.error('Failed to persist asset folder move:', e);
    }
  },

  moveFolderToFolder: async (folderId: string, targetParentId: string | null) => {
    // Prevent dragging a folder into itself
    if (folderId === targetParentId) return;

    const updatedFolders = get().folders.map((f) => {
      if (f.id === folderId) {
        return { ...f, parentId: targetParentId };
      }
      return f;
    });

    set({ folders: updatedFolders });

    try {
      await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folders: updatedFolders }),
      });
    } catch (e) {
      console.error('Failed to persist folder nesting move:', e);
    }
  },

  setIsEditorOpen: (open: boolean) => {
    set({ isEditorOpen: open });
  },

  setEditorAssetId: (assetId: string | null) => {
    set({ editorAssetId: assetId });
  },

  updateAsset: (asset: CatalogAsset) => {
    addOrUpdateCatalogAsset(asset);
    set((state) => {
      const existingIdx = state.assets.findIndex((a) => a.id === asset.id);
      let updatedAssets: CatalogAsset[];
      if (existingIdx >= 0) {
        updatedAssets = [...state.assets];
        updatedAssets[existingIdx] = asset;
      } else {
        updatedAssets = [asset, ...state.assets];
      }
      return { assets: updatedAssets };
    });
  },
}));
