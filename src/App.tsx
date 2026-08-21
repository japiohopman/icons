/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { ALL_ICONS, EXPLORER_TREE } from './assets/icons';
import { IconDefinition, FolderNode, FileNode, ExplorerNode } from './types/index';
import { AssetBrowser } from './components/AssetBrowser';
import { AssetInspector } from './components/AssetInspector';
import { AssetUploader } from './components/AssetUploader';
import { AssetEditorModal } from './components/AssetEditorModal';
import { Asset } from './types/asset';

function findFolderByPath(node: FolderNode, path: string): FolderNode | null {
  if (node.path === path) return node;
  for (const child of node.children) {
    if (child.type === 'folder') {
      const found = findFolderByPath(child, path);
      if (found) return found;
    }
  }
  return null;
}

function getIconNamesInFolder(node: ExplorerNode): string[] {
  if (node.type === 'file') {
    return [node.iconId];
  }
  const names: string[] = [];
  node.children.forEach(child => {
    names.push(...getIconNamesInFolder(child));
  });
  return names;
}

function findFileNodeByIconId(node: ExplorerNode, iconId: string): FileNode | null {
  if (node.type === 'file') {
    return node.iconId === iconId ? node : null;
  }
  for (const child of node.children) {
    const found = findFileNodeByIconId(child, iconId);
    if (found) return found;
  }
  return null;
}

function getParentPaths(filePath: string): string[] {
  const parts = filePath.split('/');
  const paths: string[] = [];
  let current = '';
  for (let i = 0; i < parts.length - 1; i++) {
    current = current ? `${current}/${parts[i]}` : parts[i];
    paths.push(current);
  }
  return paths;
}

interface TreeNodeProps {
  node: ExplorerNode;
  depth: number;
  activeFolderPath: string;
  selectedIcon: string | null;
  onFolderSelect: (path: string) => void;
  onFileSelect: (iconId: string) => void;
  expandedFolders: Record<string, boolean>;
  onToggleFolder: (path: string) => void;
  searchQuery: string;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  depth,
  activeFolderPath,
  selectedIcon,
  onFolderSelect,
  onFileSelect,
  expandedFolders,
  onToggleFolder,
  searchQuery,
}) => {
  const isFolder = node.type === 'folder';
  const isExpanded = !!expandedFolders[node.path];
  const isActive = isFolder ? activeFolderPath === node.path : selectedIcon === node.iconId;

  if (isFolder) {
    const totalFiles = useMemo(() => {
      let count = 0;
      const traverse = (n: ExplorerNode) => {
        if (n.type === 'file') count++;
        else n.children.forEach(traverse);
      };
      traverse(node);
      return count;
    }, [node]);

    const hasSearchMatch = useMemo(() => {
      if (!searchQuery) return true;
      const traverse = (n: ExplorerNode): boolean => {
        if (n.type === 'file') {
          return n.iconId.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return n.children.some(traverse);
      };
      return traverse(node);
    }, [node, searchQuery]);

    if (!hasSearchMatch) return null;

    return (
      <div className="select-none">
        <button
          onClick={() => {
            onToggleFolder(node.path);
            onFolderSelect(node.path);
          }}
          style={{ paddingLeft: `${depth * 12 + 6}px` }}
          className={`w-full flex items-center py-1.5 text-[11.5px] rounded-md transition-all group ${
            isActive
              ? 'bg-indigo-50 text-indigo-900 font-semibold shadow-xs'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}
        >
          <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0 mr-1 text-slate-400 group-hover:text-slate-600 transition-colors">
            <svg
              className={`w-2.5 h-2.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </span>

          <span className={`mr-2 shrink-0 ${isActive ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-500'}`}>
            {isExpanded ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9l-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            )}
          </span>

          <span className="truncate">{node.name}</span>

          <span className={`ml-auto text-[9px] font-mono px-1.5 py-0.25 rounded transition-all ${
            isActive ? 'bg-white text-indigo-600 border border-slate-200' : 'opacity-40 group-hover:opacity-60'
          }`}>
            {totalFiles}
          </span>
        </button>

        {isExpanded && node.children.length > 0 && (
          <div className="mt-0.5 space-y-0.5">
            {node.children.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                activeFolderPath={activeFolderPath}
                selectedIcon={selectedIcon}
                onFolderSelect={onFolderSelect}
                onFileSelect={onFileSelect}
                expandedFolders={expandedFolders}
                onToggleFolder={onToggleFolder}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        )}
      </div>
    );
  } else {
    if (searchQuery && !node.iconId.toLowerCase().includes(searchQuery.toLowerCase())) {
      return null;
    }

    return (
      <button
        onClick={() => onFileSelect(node.iconId)}
        style={{ paddingLeft: `${depth * 12 + 18}px` }}
        className={`w-full flex items-center py-1 pr-2 text-[11px] rounded-md transition-all group ${
          isActive
            ? 'bg-indigo-50 text-indigo-900 font-semibold shadow-xs'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
        }`}
      >
        <span className={`mr-2 shrink-0 ${isActive ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-500'}`}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </span>
        <span className="truncate text-slate-600 group-hover:text-slate-900">{node.name}</span>
      </button>
    );
  }
};

export default function App() {
  const [selectedIcon, setSelectedIcon] = useState<string | null>('save');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolderPath, setActiveFolderPath] = useState<string>('all');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploader, setShowUploader] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [vaultAssets, setVaultAssets] = useState<Record<string, Asset>>({});

  const allIconNames = useMemo(() => Object.keys(ALL_ICONS), []);

  const activeFolderNode = useMemo(() => {
    if (activeFolderPath === 'all') return EXPLORER_TREE;
    return findFolderByPath(EXPLORER_TREE, activeFolderPath);
  }, [activeFolderPath]);

  const filteredIcons = useMemo(() => {
    let icons: string[] = [];
    if (activeFolderPath === 'all') {
      icons = allIconNames;
    } else if (activeFolderNode) {
      icons = getIconNamesInFolder(activeFolderNode);
    } else {
      icons = allIconNames;
    }

    if (searchQuery) {
      icons = icons.filter(name =>
        name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return icons;
  }, [activeFolderPath, activeFolderNode, allIconNames, searchQuery]);

  const selectedIconDef = useMemo(() => {
    if (!selectedIcon) return null;
    return (ALL_ICONS as Record<string, IconDefinition>)[selectedIcon];
  }, [selectedIcon]);

  const metadata = useMemo(() => {
    if (!selectedIconDef || typeof selectedIconDef === 'string') return null;
    return selectedIconDef;
  }, [selectedIconDef]);

  const fileNode = useMemo(() => {
    if (!selectedIcon) return null;
    return findFileNodeByIconId(EXPLORER_TREE, selectedIcon);
  }, [selectedIcon]);

  const selectedAsset = useMemo<Asset | null>(() => {
    if (!selectedIcon) return null;
    if (vaultAssets[selectedIcon]) return vaultAssets[selectedIcon];

    const def = (ALL_ICONS as Record<string, IconDefinition>)[selectedIcon];
    const pathStr = typeof def === 'string' ? def : def?.path || '';
    const svgData = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="${pathStr}"/></svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgData)}`;

    return {
      id: selectedIcon,
      name: `${selectedIcon}.svg`,
      category: 'icon',
      mimeType: 'image/svg+xml',
      data: dataUrl,
      width: 512,
      height: 512,
    };
  }, [selectedIcon, vaultAssets]);

  useEffect(() => {
    if (fileNode) {
      const paths = getParentPaths(fileNode.path);
      if (paths.length > 0) {
        setExpandedFolders(prev => {
          const next = { ...prev };
          let changed = false;
          paths.forEach(p => {
            if (!next[p]) {
              next[p] = true;
              changed = true;
            }
          });
          return changed ? next : prev;
        });
      }
    }
  }, [fileNode]);

  const handleToggleFolder = (path: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
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
            Asset Vault <span className="text-slate-300 font-normal">/</span> <span className="text-slate-500 font-medium">Integrated Editor</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={`Search ${allIconNames.length} assets...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-slate-100 border border-transparent focus:bg-white focus:border-slate-200 rounded-md text-sm w-72 transition-all outline-hidden"
            />
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <button
            onClick={() => setShowUploader(true)}
            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 transition-colors shadow-xs shadow-indigo-100 flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Import Asset
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Explorer Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-50">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 mb-3 mt-1">Explorer</div>
            <button
              onClick={() => setActiveFolderPath('all')}
              className={`w-full flex items-center px-2 py-1.5 text-sm rounded-md transition-colors ${activeFolderPath === 'all' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
            >
              <svg className={`w-4 h-4 mr-2.5 ${activeFolderPath === 'all' ? 'text-indigo-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              All Assets
              <span className="ml-auto text-[10px] font-mono opacity-50">{allIconNames.length}</span>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 custom-scrollbar">
            {EXPLORER_TREE.children.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                depth={0}
                activeFolderPath={activeFolderPath}
                selectedIcon={selectedIcon}
                onFolderSelect={setActiveFolderPath}
                onFileSelect={setSelectedIcon}
                expandedFolders={expandedFolders}
                onToggleFolder={handleToggleFolder}
                searchQuery={searchQuery}
              />
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-2 px-2 py-2 text-[11px] text-slate-400 font-medium">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Vault Operational</span>
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50/30">
          <div className="h-12 bg-white border-b border-slate-200 flex items-center px-6 justify-between shrink-0">
            <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
              <button onClick={() => setActiveFolderPath('all')} className="hover:text-slate-800 transition-colors">Vault</button>
              <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              {activeFolderPath !== 'all' ? (
                <span className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold">{activeFolderPath}</span>
              ) : (
                <span className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">ALL ASSETS</span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex bg-slate-100 p-0.5 rounded-lg mr-6">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            <AssetBrowser
              icons={filteredIcons}
              selectedIcon={selectedIcon}
              onSelectIcon={setSelectedIcon}
              viewMode={viewMode}
            />
          </div>
        </main>

        <AssetInspector
          selectedIcon={selectedIcon}
          metadata={metadata}
          fileNode={fileNode}
          onOpenEditor={() => setIsEditorOpen(true)}
        />
      </div>

      <AssetUploader isOpen={showUploader} onClose={() => setShowUploader(false)} />

      <AssetEditorModal
        asset={selectedAsset}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSaveResult={(resultAsset) => {
          setVaultAssets(prev => ({
            ...prev,
            [resultAsset.id]: resultAsset,
          }));
        }}
      />
    </div>
  );
}
