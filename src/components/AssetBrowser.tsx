import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDraggable } from '@dnd-kit/core';
import { CatalogAsset } from '@/types/asset';
import { useAssetVaultStore } from '@/store/assetVaultStore';

interface AssetBrowserProps {
  onOpenEditor?: (asset: CatalogAsset) => void;
}

interface DraggableAssetCardProps {
  asset: CatalogAsset;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onDoubleClick?: () => void;
}

const DraggableAssetCard: React.FC<DraggableAssetCardProps> = ({
  asset,
  isSelected,
  onSelect,
  onDoubleClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `asset-${asset.id}`,
    data: {
      type: 'asset',
      assetId: asset.id,
      asset,
    },
  });

  const style: React.CSSProperties = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
      }
    : {};

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      className={`group relative p-3.5 bg-white border rounded-xl flex flex-col items-center justify-between transition-all duration-150 cursor-pointer select-none ${
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md bg-indigo-50/20'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="w-12 h-12 flex items-center justify-center p-1 transition-transform group-hover:scale-105">
        <img
          src={asset.file}
          alt={asset.name}
          loading="lazy"
          className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-xs"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
      <div className="w-full text-center mt-2">
        <div
          className={`text-[11px] font-medium truncate px-1 py-0.5 rounded ${
            isSelected ? 'text-indigo-900 font-semibold' : 'text-slate-700'
          }`}
          title={asset.name}
        >
          {asset.name}
        </div>
        <div className="text-[9px] font-mono text-slate-400 truncate" title={asset.id}>
          {asset.id}
        </div>
      </div>
    </div>
  );
};

const DraggableAssetRow: React.FC<DraggableAssetCardProps> = ({
  asset,
  isSelected,
  onSelect,
  onDoubleClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `asset-row-${asset.id}`,
    data: {
      type: 'asset',
      assetId: asset.id,
      asset,
    },
  });

  const style: React.CSSProperties = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
      }
    : {};

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      className={`grid grid-cols-[48px_1.5fr_1fr_1.5fr_80px] gap-4 px-4 py-2.5 bg-white border rounded-xl items-center cursor-pointer transition-all select-none ${
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500/10 shadow-xs bg-indigo-50/20'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      <div className="w-9 h-9 flex items-center justify-center bg-slate-50 rounded-lg p-1">
        <img src={asset.file} alt={asset.name} loading="lazy" className="max-w-full max-h-full object-contain pointer-events-none" />
      </div>
      <div className="min-w-0">
        <div className="font-bold text-slate-800 text-xs truncate">{asset.name}</div>
        <div className="text-[10px] font-mono text-slate-400 truncate">{asset.id}</div>
      </div>
      <div>
        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">
          {asset.category}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 truncate">{asset.description}</p>
      </div>
      <div className="text-right">
        <span className="text-[10px] font-mono text-slate-400">SVG</span>
      </div>
    </div>
  );
};

export const AssetBrowser: React.FC<AssetBrowserProps> = ({ onOpenEditor }) => {
  const {
    assets,
    folders,
    activeFolderId,
    selectedAssetIds,
    toggleAssetSelection,
    setSelectedAssetIds,
    searchQuery,
    viewMode,
    setViewMode,
    showMissingOnly,
    setShowMissingOnly,
    setIsEditorOpen,
    setEditorAssetId,
  } = useAssetVaultStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState<number>(6);

  useEffect(() => {
    const updateColumns = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      if (width < 400) setColumnCount(2);
      else if (width < 640) setColumnCount(3);
      else if (width < 800) setColumnCount(4);
      else if (width < 1100) setColumnCount(6);
      else setColumnCount(8);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const filteredAssets = useMemo(() => {
    let result = assets;

    if (activeFolderId !== 'all') {
      const activeFolder = folders.find((f) => f.id === activeFolderId);
      if (activeFolder) {
        result = result.filter(
          (a) => a.folderId === activeFolderId || a.category === activeFolder.category || a.category === activeFolderId
        );
      } else {
        result = result.filter((a) => a.folderId === activeFolderId || a.category === activeFolderId);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)) ||
          a.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [assets, folders, activeFolderId, searchQuery]);

  const gridRowsCount = Math.ceil(filteredAssets.length / columnCount);

  const rowVirtualizer = useVirtualizer({
    count: viewMode === 'grid' ? gridRowsCount : filteredAssets.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => (viewMode === 'grid' ? 140 : 56),
    overscan: 5,
  });

  const activeFolder = useMemo(
    () => folders.find((f) => f.id === activeFolderId),
    [folders, activeFolderId]
  );

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
      {/* Navigation / Filter Bar */}
      <div className="h-12 bg-white border-b border-slate-200 flex items-center px-6 justify-between shrink-0 z-10">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="text-slate-400">Location:</span>
          <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
            {activeFolderId === 'all' ? 'ALL ASSETS' : activeFolder?.name || activeFolderId}
          </span>
          <span className="text-slate-400 font-mono text-[11px]">({filteredAssets.length} items)</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMissingOnly(!showMissingOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
              showMissingOnly
                ? 'bg-orange-100 text-orange-600 ring-1 ring-orange-200'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${showMissingOnly ? 'bg-orange-500 animate-pulse' : 'bg-slate-300'}`} />
            {showMissingOnly ? 'Missing Paths Only' : 'Filter Missing'}
          </button>

          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'list' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Virtualized Asset Content */}
      <div ref={containerRef} className="flex-1 p-6 overflow-y-auto custom-scrollbar relative">
        {filteredAssets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
            <div className="p-4 bg-white rounded-full border border-slate-200 shadow-xs">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-600">No assets found</p>
              <p className="text-xs text-slate-400">Try adjusting search query or clearing folder filter.</p>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const startIndex = virtualRow.index * columnCount;
              const rowAssets = filteredAssets.slice(startIndex, startIndex + columnCount);

              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                    gap: '1rem',
                  }}
                >
                  {rowAssets.map((asset) => {
                    const isSelected = selectedAssetIds.includes(asset.id);
                    return (
                      <DraggableAssetCard
                        key={asset.id}
                        asset={asset}
                        isSelected={isSelected}
                        onSelect={(e) => toggleAssetSelection(asset.id, e.ctrlKey || e.metaKey)}
                        onDoubleClick={() => {
                          setSelectedAssetIds([asset.id]);
                          setEditorAssetId(asset.id);
                          setIsEditorOpen(true);
                          if (onOpenEditor) onOpenEditor(asset);
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const asset = filteredAssets[virtualItem.index];
              const isSelected = selectedAssetIds.includes(asset.id);

              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  className="py-1"
                >
                  <DraggableAssetRow
                    asset={asset}
                    isSelected={isSelected}
                    onSelect={(e) => toggleAssetSelection(asset.id, e.ctrlKey || e.metaKey)}
                    onDoubleClick={() => {
                      setSelectedAssetIds([asset.id]);
                      setEditorAssetId(asset.id);
                      setIsEditorOpen(true);
                      if (onOpenEditor) onOpenEditor(asset);
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};
