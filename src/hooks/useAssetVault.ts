import { useState, useEffect, useCallback, useMemo } from 'react';
import { Asset } from '@/types/asset';
import { IconDefinition } from '@/types/vault';
import { assetService } from '@/services/assetService';
import { EXPLORER_TREE } from '@/assets/icons';

export function useAssetVault() {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>('save');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolderPath, setActiveFolderPath] = useState('all');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  const [filteredAssetIds, setFilteredAssetIds] = useState<string[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const loadAssetList = useCallback(async () => {
    const ids = await assetService.listAssetIds({
      searchQuery,
      folderPath: activeFolderPath,
      showMissingOnly,
    });
    setFilteredAssetIds(ids);
  }, [searchQuery, activeFolderPath, showMissingOnly]);

  useEffect(() => {
    loadAssetList();
  }, [loadAssetList]);

  useEffect(() => {
    if (!selectedAssetId) {
      setSelectedAsset(null);
      return;
    }
    let isMounted = true;
    assetService.getAsset(selectedAssetId).then((asset) => {
      if (isMounted) {
        setSelectedAsset(asset);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedAssetId]);

  const selectedMetadata = useMemo<IconDefinition | null>(() => {
    if (!selectedAssetId) return null;
    return assetService.getIconDefinition(selectedAssetId);
  }, [selectedAssetId]);

  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  }, []);

  const saveEditedAsset = useCallback(async (resultAsset: Asset) => {
    await assetService.saveAsset(resultAsset);
    setSelectedAssetId(resultAsset.id);
    await loadAssetList();
  }, [loadAssetList]);

  return {
    selectedAssetId,
    setSelectedAssetId,
    selectedAsset,
    selectedMetadata,
    searchQuery,
    setSearchQuery,
    activeFolderPath,
    setActiveFolderPath,
    expandedFolders,
    toggleFolder,
    viewMode,
    setViewMode,
    showMissingOnly,
    setShowMissingOnly,
    filteredAssetIds,
    explorerTree: EXPLORER_TREE,
    saveEditedAsset,
  };
}
