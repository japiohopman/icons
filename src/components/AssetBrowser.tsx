import React, { useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useVirtualizer } from '@tanstack/react-virtual';
import { GameIcon } from '@/assets/game_icons';
import { motion } from 'motion/react';
import { IconDefinition } from '@/types/vault';
import { ALL_ICONS } from '@/assets/icons';

interface DraggableAssetCardProps {
  id: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const DraggableAssetCard: React.FC<DraggableAssetCardProps> = ({ id, isSelected, onSelect }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onSelect(id)}
      className={`group relative p-3 bg-white border rounded-xl flex flex-col items-center justify-between gap-2 transition-all duration-150 cursor-grab active:cursor-grabbing select-none h-28
        ${
          isSelected
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md bg-indigo-50/20'
            : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
        }`}
    >
      <div
        className={`w-12 h-12 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${
          isSelected ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-700'
        }`}
      >
        <GameIcon name={id} size={32} fallbackName="save" />
      </div>
      <div className="w-full text-center">
        <div
          className={`text-[10px] font-mono px-1.5 py-0.5 rounded truncate ${
            isSelected ? 'bg-indigo-100 text-indigo-800 font-semibold' : 'bg-slate-100 text-slate-600'
          }`}
          title={id}
        >
          {id}
        </div>
      </div>
    </div>
  );
};

interface AssetBrowserProps {
  assetIds: string[];
  selectedAssetId: string | null;
  onSelectAsset: (id: string) => void;
  activeFolderPath: string;
  onFolderSelect: (path: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  showMissingOnly: boolean;
  onShowMissingOnlyToggle: () => void;
}

export const AssetBrowser: React.FC<AssetBrowserProps> = ({
  assetIds,
  selectedAssetId,
  onSelectAsset,
  activeFolderPath,
  onFolderSelect,
  viewMode,
  onViewModeChange,
  showMissingOnly,
  onShowMissingOnlyToggle,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Grid Virtualizer (6 items per row)
  const COLUMNS = 6;
  const gridRowCount = Math.ceil(assetIds.length / COLUMNS);

  const gridRowVirtualizer = useVirtualizer({
    count: gridRowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 124,
    overscan: 5,
  });

  // List Virtualizer (1 item per row)
  const listVirtualizer = useVirtualizer({
    count: assetIds.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 8,
  });

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-slate-50/40">
      {/* Header Toolbar */}
      <div className="h-12 bg-white border-b border-slate-200 flex items-center px-6 justify-between shrink-0 z-10">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <button onClick={() => onFolderSelect('all')} className="hover:text-slate-800 transition-colors">
            Vault Root
          </button>
          <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[11px] font-mono">
            {activeFolderPath.toUpperCase()}
          </span>
          <span className="text-slate-400 font-mono text-[11px]">({assetIds.length} assets)</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onShowMissingOnlyToggle}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
              showMissingOnly
                ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${showMissingOnly ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`}></div>
            Filter Missing
          </button>

          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1 rounded-md transition-all ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1 rounded-md transition-all ${
                viewMode === 'list' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div ref={parentRef} className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {viewMode === 'grid' ? (
          <div
            style={{
              height: `${gridRowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
              willChange: 'transform',
            }}
          >
            {gridRowVirtualizer.getVirtualItems().map((virtualRow) => {
              const startIndex = virtualRow.index * COLUMNS;
              const rowItems = assetIds.slice(startIndex, startIndex + COLUMNS);

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
                    willChange: 'transform',
                  }}
                  className="grid grid-cols-6 gap-4 pr-2"
                >
                  {rowItems.map((id) => (
                    <DraggableAssetCard
                      key={id}
                      id={id}
                      isSelected={selectedAssetId === id}
                      onSelect={onSelectAsset}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-12">
            <div className="grid grid-cols-[50px_200px_1fr_120px] gap-4 px-4 py-2.5 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider items-center mb-2">
              <div className="text-center">Preview</div>
              <div>Asset ID</div>
              <div>Description</div>
              <div className="text-right">Action</div>
            </div>

            <div
              style={{
                height: `${listVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
                willChange: 'transform',
              }}
            >
              {listVirtualizer.getVirtualItems().map((virtualRow) => {
                const id = assetIds[virtualRow.index];
                const def = (ALL_ICONS as Record<string, IconDefinition>)[id];
                const isSelected = selectedAssetId === id;

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
                      willChange: 'transform',
                    }}
                    className="pb-2"
                  >
                    <motion.div
                      onClick={() => onSelectAsset(id)}
                      className={`grid grid-cols-[50px_200px_1fr_120px] gap-4 px-4 py-2.5 bg-white border rounded-xl items-center transition-all cursor-pointer h-11 ${
                        isSelected
                          ? 'border-indigo-400 ring-2 ring-indigo-500/10 shadow-xs bg-indigo-50/10'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-center w-7 h-7 bg-slate-50 rounded-lg text-slate-600">
                        <GameIcon name={id} size={20} />
                      </div>
                      <div className="font-bold text-slate-800 text-xs truncate font-mono">{id}</div>
                      <div className="text-xs text-slate-500 truncate italic">
                        {def?.description || 'System icon asset.'}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          Select
                        </span>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {assetIds.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
            <p className="font-semibold text-slate-600">No assets found</p>
            <p className="text-xs">Select a different folder or search query.</p>
          </div>
        )}
      </div>
    </main>
  );
};
