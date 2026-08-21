/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { GameIcon } from './game_icons';
import { ALL_ICONS, ICON_CATEGORIES, EXPLORER_TREE } from './assets/icons';
import { motion, AnimatePresence } from 'motion/react';
import { IconDefinition, IconCategory, FolderNode, FileNode, ExplorerNode } from './types';
import { IconUploader } from './components/IconUploader';

// Directory Tree Helper Functions
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

// Tree Node Component
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
  searchQuery
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

    // Filter folder out if we are searching and none of the folder's children match
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
          {/* Chevron */}
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

          {/* Folder Icon */}
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

          {/* Folder Name */}
          <span className="truncate">{node.name}</span>

          {/* Icon count */}
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
    // Hide files that don't match the search query
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
        {/* SVG File Icon */}
        <span className={`mr-2 shrink-0 ${isActive ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-500'}`}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </span>

        {/* File Name */}
        <span className="truncate text-slate-600 group-hover:text-slate-900">{node.name}</span>
      </button>
    );
  }
}

export default function App() {
  const [selectedIcon, setSelectedIcon] = useState<string | null>('save');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolderPath, setActiveFolderPath] = useState<string>('all');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingIcon, setEditingIcon] = useState<string | null>(null);
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  
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

    if (showMissingOnly) {
      icons = icons.filter(name => {
        const def = (ALL_ICONS as any)[name];
        return typeof def === 'string' ? !def : !def.path;
      });
    }
    
    return icons;
  }, [activeFolderPath, activeFolderNode, allIconNames, searchQuery, showMissingOnly]);

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

  // Auto-expand folder when an icon is selected (Auto-Reveal)
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
      {/* Header Navigation */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-1.5 rounded-md">
            <svg className="w-5 h-5 text-white" viewBox="0 0 512 512" fill="currentColor">
              <path d="M256 16c-132.6 0-240 107.4-240 240s107.4 240 240 240 240-107.4 240-240S388.6 16 256 16zm0 60c99.4 0 180 80.6 180 180s-80.6 180-180 180-180-80.6-180-180 80.6-180 180-180zm0 60c-66.3 0-120 53.7-120 120s53.7 120 120 120 120-53.7 120-120-53.7-120-120-120z" />
            </svg>
          </div>
          <h1 className="text-sm font-bold tracking-tight text-slate-800 flex items-center gap-2">
            Artificer <span className="text-slate-300 font-normal">/</span> <span className="text-slate-500 font-medium">Icon Library</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder={`Search ${allIconNames.length} icons...`} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-slate-100 border border-transparent focus:bg-white focus:border-slate-200 rounded-md text-sm w-72 transition-all outline-hidden"
            />
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <button 
            onClick={() => setShowUploader(true)}
            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-100 flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Import Icon
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
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span>System Operational</span>
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50/30">
          {/* Breadcrumbs / Filter Bar */}
          <div className="h-12 bg-white border-b border-slate-200 flex items-center px-6 justify-between shrink-0">
            <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
              <button onClick={() => setActiveFolderPath('all')} className="hover:text-slate-800 transition-colors">Artificer</button>
              <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              {activeFolderPath !== 'all' ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-mono">svg</span>
                  {activeFolderPath.split('/').map((segment, idx, arr) => (
                    <React.Fragment key={segment}>
                      <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                      <button 
                        onClick={() => {
                          const targetPath = arr.slice(0, idx + 1).join('/');
                          setActiveFolderPath(targetPath);
                        }}
                        className={`font-mono px-1.5 py-0.5 rounded transition-all hover:bg-slate-100 ${
                          idx === arr.length - 1 
                            ? 'text-indigo-600 bg-indigo-50 font-semibold' 
                            : 'text-slate-500'
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
                onClick={() => setShowMissingOnly(!showMissingOnly)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${showMissingOnly ? 'bg-orange-100 text-orange-600 ring-1 ring-orange-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${showMissingOnly ? 'bg-orange-500 animate-pulse' : 'bg-slate-300'}`}></div>
                {showMissingOnly ? 'Missing Paths Only' : 'Filter Missing'}
              </button>

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

          {/* Icon Grid Viewer */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-5 pb-12">
                <AnimatePresence mode="popLayout">
                  {filteredIcons.map((name) => (
                    <motion.button
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={name}
                      onClick={() => setSelectedIcon(name)}
                      className={`group relative p-4 bg-white border rounded-xl flex flex-col items-center gap-4 transition-all duration-200
                        ${selectedIcon === name 
                          ? 'border-indigo-400 ring-4 ring-indigo-500/5 shadow-lg shadow-indigo-500/10' 
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-md active:scale-95'}`}
                    >
                      <div className={`w-14 h-14 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${selectedIcon === name ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                        <GameIcon name={name} size={36} fallbackName="save" />
                      </div>
                      <div className="w-full text-center">
                        <div className={`text-[10px] font-mono px-2 py-1 rounded truncate transition-all
                          ${selectedIcon === name ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-500'}`}>
                          {name}
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
                  <div>Used In / Usage</div>
                  <div className="text-right">Actions</div>
                </div>
                <AnimatePresence mode="popLayout">
                  {filteredIcons.map((name) => {
                    const def = (ALL_ICONS as Record<string, IconDefinition>)[name];
                    const meta = typeof def === 'string' ? null : def;
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        key={name}
                        onClick={() => setSelectedIcon(name)}
                        className={`grid grid-cols-[64px_200px_1fr_1fr_120px] gap-4 px-4 py-3 bg-white border rounded-xl items-center transition-all cursor-pointer
                          ${selectedIcon === name ? 'border-indigo-300 shadow-sm ring-2 ring-indigo-500/5 shadow-indigo-100' : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'}`}
                      >
                        <div className={`flex items-center justify-center w-12 h-12 bg-slate-50 rounded-lg ${selectedIcon === name ? 'text-indigo-600' : 'text-slate-400'}`}>
                          <GameIcon name={name} size={28} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-700 truncate">{name}</div>
                          <div className="text-[10px] font-mono text-slate-400">#{(ALL_ICONS as any)[name].length || '0'} path bits</div>
                        </div>
                        <div className="group relative">
                          {editingIcon === name ? (
                            <textarea 
                              autoFocus
                              className="w-full text-xs p-1 border border-indigo-300 rounded bg-white focus:ring-1 focus:ring-indigo-500 outline-hidden"
                              defaultValue={meta?.description || ''}
                              onBlur={() => setEditingIcon(null)}
                            />
                          ) : (
                            <>
                              <p className="text-xs text-slate-500 line-clamp-2 italic pr-4">
                                {meta?.description || 'No description provided.'}
                              </p>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setEditingIcon(name); }}
                                className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-indigo-500 transition-all font-bold"
                              >
                                Edit
                              </button>
                            </>
                          )}
                        </div>
                        <div className="group relative overflow-hidden">
                          <div className="text-[10px] text-indigo-400 font-bold uppercase mb-1">{meta?.usedIn ? 'Used In' : 'Usage'}</div>
                          {editingIcon === name ? (
                            <input 
                              className="w-full text-xs p-1 border border-indigo-300 rounded bg-white focus:ring-1 focus:ring-indigo-500 outline-hidden"
                              defaultValue={meta?.usedIn || meta?.usage || ''}
                              onBlur={() => setEditingIcon(null)}
                            />
                          ) : (
                            <p className="text-xs text-indigo-700/80 line-clamp-2 font-medium pr-4">
                              {meta?.usedIn || meta?.usage || 'Universal System Asset'}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 justify-end">
                          <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
            
            {filteredIcons.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
                <div className="p-4 bg-white rounded-full border border-slate-100 shadow-sm">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-600">No icons match your search</p>
                  <p className="text-sm">Try clearing your filters or searching for something else.</p>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Inspector Panel */}
        <aside className="w-80 bg-white border-l border-slate-200 shrink-0 hidden lg:flex flex-col z-10 shadow-[-4px_0_12px_rgba(0,0,0,0.02)]">
          {selectedIcon ? (
            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
              <div className="p-6 pb-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metadata Inspector</h3>
                  <div className="flex gap-1">
                    <button className="p-1.5 text-slate-300 hover:text-slate-500 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button>
                  </div>
                </div>
                
                <div className="aspect-square bg-slate-50 rounded-2xl flex items-center justify-center mb-8 border border-slate-100 relative group overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
                  <motion.div
                    key={selectedIcon}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-slate-800 relative z-10"
                  >
                    <GameIcon name={selectedIcon} size={128} fallbackName="save" />
                  </motion.div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1">{metadata?.label || selectedIcon.replace(/_/g, ' ')}</h2>
                    <div className="flex flex-wrap gap-2">
                       <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-tighter">Production</span>
                       <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100/50 uppercase tracking-tighter">SVG Path</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Description</label>
                      <p className="text-slate-600 leading-relaxed text-xs">
                        {metadata?.description || `A symbolic icon representing ${selectedIcon.replace(/_/g, ' ')} for use in the Artificer RPG system.`}
                      </p>
                    </div>

                    {metadata?.usage && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Usage Context</label>
                        <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100/50 text-[11px] text-indigo-800 leading-snug">
                          {metadata.usage}
                        </div>
                      </div>
                    )}

                    {metadata?.usedIn && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Used In</label>
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-snug">
                          {metadata.usedIn}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Viewbox</label>
                          <span className="font-mono text-xs text-slate-600">0 0 512 512</span>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">File Source</label>
                          <span className="font-mono text-xs text-slate-600 truncate block max-w-[140px]" title={fileNode ? `src/assets/icons/svg/${fileNode.path}` : 'index.ts'}>
                            {fileNode ? `src/assets/icons/svg/${fileNode.path}` : 'index.ts'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto p-6 space-y-3">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(selectedIcon);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 border border-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-all shadow-md shadow-slate-200"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  Copy Asset Key
                </button>
                <button className="w-full py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-all">
                  Request Modification
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2 animate-pulse">
                <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </div>
              <div>
                <p className="font-semibold text-slate-500">No Asset Selected</p>
                <p className="text-xs">Select an icon from the library to inspect its properties and metadata.</p>
              </div>
            </div>
          )}
        </aside>
      </div>

      <IconUploader isOpen={showUploader} onClose={() => setShowUploader(false)} />
    </div>
  );
}

