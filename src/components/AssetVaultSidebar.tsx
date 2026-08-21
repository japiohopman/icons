import React, { useMemo } from 'react';
import { ExplorerNode, FolderNode } from '@/types/vault';

interface TreeNodeProps {
  node: ExplorerNode;
  depth: number;
  activeFolderPath: string;
  selectedAssetId: string | null;
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
  selectedAssetId,
  onFolderSelect,
  onFileSelect,
  expandedFolders,
  onToggleFolder,
  searchQuery,
}) => {
  const isFolder = node.type === 'folder';
  const isExpanded = !!expandedFolders[node.path];
  const isActive = isFolder ? activeFolderPath === node.path : selectedAssetId === node.iconId;

  const totalFiles = useMemo(() => {
    if (!isFolder) return 1;
    let count = 0;
    const traverse = (n: ExplorerNode) => {
      if (n.type === 'file') count++;
      else (n as FolderNode).children.forEach(traverse);
    };
    traverse(node);
    return count;
  }, [node, isFolder]);

  const hasSearchMatch = useMemo(() => {
    if (!searchQuery) return true;
    const traverse = (n: ExplorerNode): boolean => {
      if (n.type === 'file') {
        return n.iconId.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return (n as FolderNode).children.some(traverse);
    };
    return traverse(node);
  }, [node, searchQuery]);

  if (!hasSearchMatch) return null;

  if (isFolder) {
    const folderNode = node as FolderNode;
    return (
      <div className="select-none">
        <button
          onClick={() => {
            onToggleFolder(folderNode.path);
            onFolderSelect(folderNode.path);
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
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          </span>

          <span className="truncate">{folderNode.name}</span>

          <span
            className={`ml-auto text-[9px] font-mono px-1.5 py-0.25 rounded transition-all ${
              isActive ? 'bg-white text-indigo-600 border border-slate-200' : 'opacity-40 group-hover:opacity-60'
            }`}
          >
            {totalFiles}
          </span>
        </button>

        {isExpanded && folderNode.children.length > 0 && (
          <div className="mt-0.5 space-y-0.5">
            {folderNode.children.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                activeFolderPath={activeFolderPath}
                selectedAssetId={selectedAssetId}
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

interface AssetVaultSidebarProps {
  explorerTree: FolderNode;
  activeFolderPath: string;
  selectedAssetId: string | null;
  onFolderSelect: (path: string) => void;
  onFileSelect: (assetId: string) => void;
  expandedFolders: Record<string, boolean>;
  onToggleFolder: (path: string) => void;
  searchQuery: string;
  totalAssetsCount: number;
}

export const AssetVaultSidebar: React.FC<AssetVaultSidebarProps> = ({
  explorerTree,
  activeFolderPath,
  selectedAssetId,
  onFolderSelect,
  onFileSelect,
  expandedFolders,
  onToggleFolder,
  searchQuery,
  totalAssetsCount,
}) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
      <div className="p-4 border-b border-slate-50">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 mb-3 mt-1">Explorer</div>
        <button
          onClick={() => onFolderSelect('all')}
          className={`w-full flex items-center px-2 py-1.5 text-sm rounded-md transition-colors ${
            activeFolderPath === 'all'
              ? 'bg-slate-100 text-slate-900 font-semibold'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}
        >
          <svg
            className={`w-4 h-4 mr-2.5 ${activeFolderPath === 'all' ? 'text-indigo-500' : 'text-slate-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          All Assets
          <span className="ml-auto text-[10px] font-mono opacity-50">{totalAssetsCount}</span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 custom-scrollbar">
        {explorerTree.children.map((child) => (
          <TreeNode
            key={child.path}
            node={child}
            depth={0}
            activeFolderPath={activeFolderPath}
            selectedAssetId={selectedAssetId}
            onFolderSelect={onFolderSelect}
            onFileSelect={onFileSelect}
            expandedFolders={expandedFolders}
            onToggleFolder={onToggleFolder}
            searchQuery={searchQuery}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50/30">
        <div className="flex items-center gap-2 px-2 py-2 text-[11px] text-slate-400 font-medium">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span>Asset Vault Operational</span>
        </div>
      </div>
    </aside>
  );
};
