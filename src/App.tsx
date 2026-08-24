import { useState } from 'react';
import { useAssetVault } from '@/hooks/useAssetVault';
import { AssetVaultHeader } from '@/components/AssetVaultHeader';
import { AssetVaultSidebar } from '@/components/AssetVaultSidebar';
import { AssetBrowser } from '@/components/AssetBrowser';
import { AssetInspector } from '@/components/AssetInspector';
import { AssetEditorModal } from '@/components/AssetEditorModal';
import { ALL_ICONS } from '@/assets/icons';

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

  const [isEditorOpen, setIsEditorOpen] = useState(false);

  return (
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

      <AssetEditorModal
        asset={selectedAsset}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSaveResult={(resultAsset) => {
          saveEditedAsset(resultAsset);
        }}
      />
    </div>
  );
}
