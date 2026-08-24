import { useEffect, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useAssetVaultStore } from '@/store/assetVaultStore';
import { AssetVaultHeader } from '@/components/AssetVaultHeader';
import { AssetVaultSidebar } from '@/components/AssetVaultSidebar';
import { AssetBrowser } from '@/components/AssetBrowser';
import { AssetInspector } from '@/components/AssetInspector';
import { AssetEditorWorkspace } from '@/components/AssetEditorWorkspace';

export default function App() {
  const {
    assets,
    selectedAssetIds,
    searchQuery,
    setSearchQuery,
    loadCatalog,
    loadFolders,
    moveAssetToFolder,
    moveFolderToFolder,
    isEditorOpen,
    setIsEditorOpen,
    editorAssetId,
    setEditorAssetId,
    updateAsset,
  } = useAssetVaultStore();

  useEffect(() => {
    loadCatalog();
    loadFolders();
  }, [loadCatalog, loadFolders]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    const targetFolderId = overData.folderId || null;

    if (activeData.type === 'asset' && activeData.assetId) {
      moveAssetToFolder(activeData.assetId, targetFolderId === 'all' ? null : targetFolderId);
    }

    if (activeData.type === 'folder' && activeData.folderId) {
      if (activeData.folderId !== targetFolderId) {
        moveFolderToFolder(activeData.folderId, targetFolderId === 'all' ? null : targetFolderId);
      }
    }
  };

  const selectedAssetId = selectedAssetIds[0] || null;

  const selectedAsset = useMemo(() => {
    if (!selectedAssetId) return null;
    return assets.find((a) => a.id === selectedAssetId) || null;
  }, [assets, selectedAssetId]);

  const selectedMetadata = useMemo(() => {
    if (!selectedAsset) return null;
    return {
      id: selectedAsset.id,
      label: selectedAsset.name,
      description: selectedAsset.description,
      category: selectedAsset.category,
      tags: selectedAsset.tags,
    };
  }, [selectedAsset]);

  const editingCatalogAsset = useMemo(() => {
    if (!editorAssetId) return null;
    return assets.find((a) => a.id === editorAssetId) || null;
  }, [assets, editorAssetId]);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden text-[13px]">
        <AssetVaultHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalAssetsCount={assets.length}
        />

        <div className="flex flex-1 overflow-hidden">
          <AssetVaultSidebar />

          <AssetBrowser />

          <AssetInspector
            selectedAssetId={selectedAssetId}
            selectedAsset={selectedAsset}
            selectedMetadata={selectedMetadata}
            onOpenEditor={() => {
              if (selectedAssetId) {
                setEditorAssetId(selectedAssetId);
                setIsEditorOpen(true);
              }
            }}
          />
        </div>

        <AssetEditorWorkspace
          isOpen={isEditorOpen}
          catalogAsset={editingCatalogAsset}
          onClose={() => setIsEditorOpen(false)}
          onSaveSuccess={(savedAsset) => {
            updateAsset(savedAsset);
          }}
        />
      </div>
    </DndContext>
  );
}
