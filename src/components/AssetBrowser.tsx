import React from 'react';
import { GameIcon } from '@/assets/game_icons';
import { motion, AnimatePresence } from 'motion/react';
import { IconDefinition } from '@/types/vault';
import { ALL_ICONS } from '@/assets/icons';

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
  return (
    <main className="flex-1 flex flex-col min-w-0 bg-slate-50/30">
      {/* Navigation / Filter Bar */}
      <div className="h-12 bg-white border-b border-slate-200 flex items-center px-6 justify-between shrink-0">
        <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
          <button onClick={() => onFolderSelect('all')} className="hover:text-slate-800 transition-colors">
            Artificer Vault
          </button>
          <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          {activeFolderPath !== 'all' ? (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-mono">svg</span>
              {activeFolderPath.split('/').map((segment, idx, arr) => (
                <React.Fragment key={segment}>
                  <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                  <button
                    onClick={() => {
                      const targetPath = arr.slice(0, idx + 1).join('/');
                      onFolderSelect(targetPath);
                    }}
                    className={`font-mono px-1.5 py-0.5 rounded transition-all hover:bg-slate-100 ${
                      idx === arr.length - 1 ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'text-slate-500'
                    }`}
                  >
                    {segment}
                  </button>
                </React.Fragment>
              ))}
            </div>
          ) : (
            <span className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">ALL ASSETS</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onShowMissingOnlyToggle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
              showMissingOnly
                ? 'bg-orange-100 text-orange-600 ring-1 ring-orange-200'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${showMissingOnly ? 'bg-orange-500 animate-pulse' : 'bg-slate-300'}`}></div>
            {showMissingOnly ? 'Missing Paths Only' : 'Filter Missing'}
          </button>

          <div className="flex bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-md transition-all ${
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

      {/* Grid or List Content */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-5 pb-12">
            <AnimatePresence mode="popLayout">
              {assetIds.map((id) => (
                <motion.button
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={id}
                  onClick={() => onSelectAsset(id)}
                  className={`group relative p-4 bg-white border rounded-xl flex flex-col items-center gap-4 transition-all duration-200
                    ${
                      selectedAssetId === id
                        ? 'border-indigo-400 ring-4 ring-indigo-500/5 shadow-lg shadow-indigo-500/10'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md active:scale-95'
                    }`}
                >
                  <div
                    className={`w-14 h-14 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                      selectedAssetId === id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  >
                    <GameIcon name={id} size={36} fallbackName="save" />
                  </div>
                  <div className="w-full text-center">
                    <div
                      className={`text-[10px] font-mono px-2 py-1 rounded truncate transition-all ${
                        selectedAssetId === id ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-500'
                      }`}
                    >
                      {id}
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-12">
            <div className="grid grid-cols-[64px_200px_1fr_1fr_120px] gap-4 px-6 py-3 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest items-center">
              <div className="text-center">Preview</div>
              <div>Asset Name</div>
              <div>Description</div>
              <div>Usage</div>
              <div className="text-right">Actions</div>
            </div>
            <AnimatePresence mode="popLayout">
              {assetIds.map((id) => {
                const def = (ALL_ICONS as Record<string, IconDefinition>)[id];
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    key={id}
                    onClick={() => onSelectAsset(id)}
                    className={`grid grid-cols-[64px_200px_1fr_1fr_120px] gap-4 px-4 py-3 bg-white border rounded-xl items-center transition-all cursor-pointer ${
                      selectedAssetId === id
                        ? 'border-indigo-300 shadow-sm ring-2 ring-indigo-500/5 shadow-indigo-100'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-12 h-12 bg-slate-50 rounded-lg ${
                        selectedAssetId === id ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    >
                      <GameIcon name={id} size={28} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-700 truncate">{id}</div>
                      <div className="text-[10px] font-mono text-slate-400">Icon Asset</div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 line-clamp-2 italic pr-4">
                        {def?.description || 'No description provided.'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-indigo-700/80 line-clamp-2 font-medium pr-4">
                        {def?.usage || 'Universal System Asset'}
                      </p>
                    </div>
                    <div className="flex gap-1 justify-end">
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {assetIds.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
            <div className="p-4 bg-white rounded-full border border-slate-100 shadow-sm">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-600">No assets found</p>
              <p className="text-sm">Try clearing your filters or searching for another asset term.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
