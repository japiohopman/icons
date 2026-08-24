import { create } from 'zustand';
import { CatalogAsset } from '@/types/asset';
import { addOrUpdateCatalogAsset } from '@/lib/catalog';

export interface VirtualFolder {
  id: string;
  name: string;
  parentId: string | null;
  icon?: string;
}

interface AssetVaultState {
  // Folder & Search State
  activeFolderId: string;
  searchQuery: string;
  viewMode: 'grid' | 'list';
  folders: VirtualFolder[];

  // Selection State
  selectedAssetId: string | null;
  selectedAssetIds: string[];

  // Editor Modal Workspace State
  editorAsset: CatalogAsset | null;
  isEditorOpen: boolean;

  // Actions
  setActiveFolderId: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSelectedAssetId: (id: string | null) => void;
  toggleAssetSelection: (id: string) => void;
  clearSelection: () => void;
  openEditor: (asset: CatalogAsset) => void;
  closeEditor: () => void;

  // Persistence Actions
  fetchFolders: () => Promise<void>;
  createFolder: (name: string, parentId?: string | null) => Promise<VirtualFolder | null>;
  renameFolder: (id: string, name: string) => Promise<boolean>;
  deleteFolder: (id: string) => Promise<boolean>;
  moveAssetToFolder: (assetId: string, targetFolderId: string) => Promise<boolean>;
  onAssetSaved: (savedAsset: CatalogAsset) => void;
}

export const useAssetVaultStore = create<AssetVaultState>((set, get) => ({
  activeFolderId: 'all',
  searchQuery: '',
  viewMode: 'grid',
  folders: [],
  selectedAssetId: null,
  selectedAssetIds: [],
  editorAsset: null,
  isEditorOpen: false,

  setActiveFolderId: (id) => set({ activeFolderId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedAssetId: (id) => set({ selectedAssetId: id, selectedAssetIds: id ? [id] : [] }),

  toggleAssetSelection: (id) =>
    set((state) => {
      const exists = state.selectedAssetIds.includes(id);
      const newSelection = exists
        ? state.selectedAssetIds.filter((item) => item !== id)
        : [...state.selectedAssetIds, id];
      return {
        selectedAssetIds: newSelection,
        selectedAssetId: newSelection.length > 0 ? newSelection[newSelection.length - 1] : null,
      };
    }),

  clearSelection: () => set({ selectedAssetIds: [], selectedAssetId: null }),

  openEditor: (asset) => set({ editorAsset: asset, isEditorOpen: true }),
  closeEditor: () => set({ editorAsset: null, isEditorOpen: false }),

  fetchFolders: async () => {
    try {
      const res = await fetch('/api/folders');
      if (res.ok) {
        const folders = await res.json();
        set({ folders });
      }
    } catch (err) {
      console.error('Failed to fetch virtual folders:', err);
    }
  },

  createFolder: async (name, parentId = null) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const folderId = `folder-${slug}-${Date.now()}`;

    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', id: folderId, name, parentId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        set({ folders: data.folders });
        return data.folder;
      }
    } catch (err) {
      console.error('Failed to create folder:', err);
    }
    return null;
  },

  renameFolder: async (id, name) => {
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rename', id, name }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        set({ folders: data.folders });
        return true;
      }
    } catch (err) {
      console.error('Failed to rename folder:', err);
    }
    return false;
  },

  deleteFolder: async (id) => {
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        set({
          folders: data.folders,
          activeFolderId: get().activeFolderId === id ? 'all' : get().activeFolderId,
        });
        return true;
      }
    } catch (err) {
      console.error('Failed to delete folder:', err);
    }
    return false;
  },

  moveAssetToFolder: async (assetId, targetFolderId) => {
    try {
      const res = await fetch('/api/assets/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, targetFolderId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addOrUpdateCatalogAsset(data.asset);
        return true;
      }
    } catch (err) {
      console.error('Failed to move asset:', err);
    }
    return false;
  },

  onAssetSaved: (savedAsset) => {
    addOrUpdateCatalogAsset(savedAsset);
    set({ editorAsset: savedAsset, selectedAssetId: savedAsset.id });
  },
}));
