/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  getIconCatalog,
  getCatalogCategories,
  getAssetsByCategory,
  getAssetById,
  addOrUpdateCatalogAsset,
} from './lib/catalog';
import { CatalogAsset, CatalogCategory } from './types/asset';
import { AssetBrowser } from './components/AssetBrowser';
import { AssetInspector } from './components/AssetInspector';
import { AssetEditorWorkspace } from './components/AssetEditorWorkspace';

export default function App() {
  const [selectedAssetId, setSelectedAssetId] = useState<string>('combat.attack');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState<boolean>(false);
  const [catalogVersion, setCatalogVersion] = useState<number>(0);

  const allAssets = useMemo(() => getIconCatalog(), [catalogVersion]);
  const categories = useMemo(() => getCatalogCategories(), []);

  const filteredAssets = useMemo(() => {
    let assets = getAssetsByCategory(selectedCategoryId);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      assets = assets.filter(
        (asset) =>
          asset.name.toLowerCase().includes(q) ||
          asset.id.toLowerCase().includes(q) ||
          (asset.tags && asset.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    return assets;
  }, [selectedCategoryId, searchQuery, catalogVersion]);

  const selectedAsset = useMemo<CatalogAsset | null>(() => {
    if (!selectedAssetId) return null;
    return getAssetById(selectedAssetId) || allAssets[0] || null;
  }, [selectedAssetId, allAssets, catalogVersion]);

  const handleOpenWorkspace = () => {
    if (selectedAsset) {
      setIsWorkspaceOpen(true);
    }
  };

  const handleSaveSuccess = (savedAsset: CatalogAsset) => {
    addOrUpdateCatalogAsset(savedAsset);
    setSelectedAssetId(savedAsset.id);
    setCatalogVersion((v) => v + 1);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden text-[13px]">
      {/* Header */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-1.5 rounded-md">
            <svg className="w-5 h-5 text-white" viewBox="0 0 512 512" fill="currentColor">
              <path d="M256 16c-132.6 0-240 107.4-240 240s107.4 240 240 240 240-107.4 240-240S388.6 16 256 16zm0 60c99.4 0 180 80.6 180 180s-80.6 180-180 180-180-80.6-180-180 80.6-180 180-180zm0 60c-66.3 0-120 53.7-120 120s53.7 120 120 120 120-53.7 120-120-53.7-120-120-120z" />
            </svg>
          </div>
          <h1 className="text-sm font-bold tracking-tight text-slate-800 flex items-center gap-2">
            Asset Vault <span className="text-slate-300 font-normal">/</span>{' '}
            <span className="text-slate-500 font-medium">Integrated Editor</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-600 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={`Search ${allAssets.length} assets...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-slate-100 border border-transparent focus:bg-white focus:border-slate-200 rounded-md text-sm w-72 transition-all outline-hidden"
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Category Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-50">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 mb-3 mt-1">Catalog Categories</div>
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`w-full flex items-center px-2 py-1.5 text-sm rounded-md transition-colors ${
                selectedCategoryId === 'all'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <svg
                className={`w-4 h-4 mr-2.5 ${selectedCategoryId === 'all' ? 'text-indigo-500' : 'text-slate-400'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              All Assets
              <span className="ml-auto text-[10px] font-mono opacity-50">{allAssets.length}</span>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
            {categories.map((cat: CatalogCategory) => {
              const count = getAssetsByCategory(cat.id).length;
              const isActive = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-md transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-900 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.25 rounded transition-all ml-2 shrink-0 ${
                      isActive ? 'bg-white text-indigo-600 border border-indigo-100' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-2 px-2 py-2 text-[11px] text-slate-400 font-medium">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Catalog Operational</span>
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50/30">
          <div className="h-12 bg-white border-b border-slate-200 flex items-center px-6 justify-between shrink-0">
            <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
              <button onClick={() => setSelectedCategoryId('all')} className="hover:text-slate-800 transition-colors">
                Vault Catalog
              </button>
              <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              {selectedCategoryId !== 'all' ? (
                <span className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold uppercase">
                  {selectedCategoryId}
                </span>
              ) : (
                <span className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">ALL ASSETS</span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex bg-slate-100 p-0.5 rounded-lg mr-6">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'grid' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
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

          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            <AssetBrowser
              assets={filteredAssets}
              selectedAssetId={selectedAsset?.id || null}
              onSelectAsset={(asset) => setSelectedAssetId(asset.id)}
              viewMode={viewMode}
            />
          </div>
        </main>

        <AssetInspector selectedAsset={selectedAsset} onOpenEditor={handleOpenWorkspace} />
      </div>

      <AssetEditorWorkspace
        catalogAsset={selectedAsset}
        isOpen={isWorkspaceOpen}
        onClose={() => setIsWorkspaceOpen(false)}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}
