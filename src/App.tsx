import { useEffect, useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useAssetVaultStore } from '@/store/assetVaultStore';
import { useAssetVault } from '@/hooks/useAssetVault';
import { AssetVaultHeader } from '@/components/AssetVaultHeader';
import { AssetVaultSidebar } from '@/components/AssetVaultSidebar';
import { AssetBrowser } from '@/components/AssetBrowser';
import { AssetInspector } from '@/components/AssetInspector';
import { AssetEditorWorkspace } from '@/components/AssetEditorWorkspace';
import { ALL_ICONS } from '@/assets/icons';
import { getAssetById } from '@/lib/catalog';

export default function App() {
  const {
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
    explorerTree,
    saveEditedAsset,
  } = useAssetVault();

  const { moveAssetToFolder, onAssetSaved } = useAssetVaultStore();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    // Keep Zustand store active folder in sync with hook
    if (useAssetVaultStore.getState().activeFolderId !== activeFolderPath) {
      useAssetVaultStore.getState().setActiveFolderId(activeFolderPath);
    }
  }, [activeFolderPath]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id && over.id) {
      const assetId = String(active.id);
      const targetFolderId = String(over.id);
      await moveAssetToFolder(assetId, targetFolderId);
    }
  };

  const catalogAsset = selectedAssetId ? getAssetById(selectedAssetId) || null : null;

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden text-[13px]">
        <AssetVaultHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalAssetsCount={Object.keys(ALL_ICONS).length}
        />

        <div className="flex flex-1 overflow-hidden">
          <AssetVaultSidebar
            explorerTree={explorerTree}
            activeFolderPath={activeFolderPath}
            selectedAssetId={selectedAssetId}
            onFolderSelect={setActiveFolderPath}
            onFileSelect={setSelectedAssetId}
            expandedFolders={expandedFolders}
            onToggleFolder={toggleFolder}
            searchQuery={searchQuery}
            totalAssetsCount={Object.keys(ALL_ICONS).length}
          />

          <AssetBrowser
            assetIds={filteredAssetIds}
            selectedAssetId={selectedAssetId}
            onSelectAsset={setSelectedAssetId}
            activeFolderPath={activeFolderPath}
            onFolderSelect={setActiveFolderPath}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showMissingOnly={showMissingOnly}
            onShowMissingOnlyToggle={() => setShowMissingOnly(!showMissingOnly)}
          />

          <AssetInspector
            selectedAssetId={selectedAssetId}
            selectedAsset={selectedAsset}
            selectedMetadata={selectedMetadata}
            onOpenEditor={() => setIsEditorOpen(true)}
          />
        </div>

        {catalogAsset && (
          <AssetEditorWorkspace
            catalogAsset={catalogAsset}
            isOpen={isEditorOpen}
            onClose={() => setIsEditorOpen(false)}
            onSaveSuccess={(savedAsset) => {
              onAssetSaved(savedAsset);
              saveEditedAsset({
                id: savedAsset.id,
                name: savedAsset.name,
                category: 'icon',
                mimeType: 'image/svg+xml',
                data: savedAsset.file,
              });
            }}
          />
        )}
      </div>
    </DndContext>
  );
}
