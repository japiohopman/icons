import React, { useEffect, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useAssetVaultStore, VirtualFolder } from '@/store/assetVaultStore';
import { FolderNode } from '@/types/vault';

interface VirtualFolderTreeItemProps {
  folder: VirtualFolder;
  allFolders: VirtualFolder[];
  depth?: number;
  activeFolderPath: string;
  expandedFolders: Record<string, boolean>;
  onToggleFolder: (id: string) => void;
  onSelect: (id: string) => void;
  onAddSubfolder: (parentId: string) => void;
  onRename: (id: string, oldName: string) => void;
  onDelete: (id: string) => void;
}

const VirtualFolderTreeItem: React.FC<VirtualFolderTreeItemProps> = ({
  folder,
  allFolders,
  depth = 0,
  activeFolderPath,
  expandedFolders,
  onToggleFolder,
  onSelect,
  onAddSubfolder,
  onRename,
  onDelete,
}) => {
  const children = allFolders.filter((f) => f.parentId === folder.id);
  const hasChildren = children.length > 0;
  const isExpanded = expandedFolders[folder.id] ?? true;
  const isActive = activeFolderPath === folder.id;

  const { isOver, setNodeRef } = useDroppable({
    id: folder.id,
  });

  return (
    <div className="select-none">
      <div
        ref={setNodeRef}
        style={{ paddingLeft: `${depth * 14 + 10}px` }}
        className={`group flex items-center justify-between py-1.5 pr-2 text-[11.5px] rounded-lg transition-all cursor-pointer ${
          isOver
            ? 'bg-indigo-100 text-indigo-900 ring-2 ring-indigo-500 scale-[1.02]'
            : isActive
            ? 'bg-indigo-50 text-indigo-900 font-semibold border border-indigo-200/60 shadow-xs'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
        onClick={() => onSelect(folder.id)}
      >
        <div className="flex items-center gap-1.5 truncate min-w-0">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFolder(folder.id);
              }}
              className="p-0.5 text-slate-400 hover:text-slate-600 rounded shrink-0"
            >
              <svg
                className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <span className="w-4 shrink-0" />
          )}

          <svg
            className={`w-3.5 h-3.5 shrink-0 ${
              isOver ? 'text-indigo-600 animate-bounce' : isActive ? 'text-indigo-500' : 'text-slate-400'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          <span className="truncate">{folder.name}</span>
        </div>

        <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddSubfolder(folder.id);
            }}
            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 rounded"
            title="Create Subfolder"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRename(folder.id, folder.name);
            }}
            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 rounded"
            title="Rename Folder"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(folder.id);
            }}
            className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-200/60 rounded"
            title="Delete Folder"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="space-y-0.5">
          {children.map((child) => (
            <VirtualFolderTreeItem
              key={child.id}
              folder={child}
              allFolders={allFolders}
              depth={depth + 1}
              activeFolderPath={activeFolderPath}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              onSelect={onSelect}
              onAddSubfolder={onAddSubfolder}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface AssetVaultSidebarProps {
  explorerTree?: FolderNode;
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
  activeFolderPath,
  onFolderSelect,
  expandedFolders: parentExpandedFolders,
  onToggleFolder: parentToggleFolder,
  totalAssetsCount,
}) => {
  const { folders, fetchFolders, createFolder, renameFolder, deleteFolder } = useAssetVaultStore();
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [targetParentId, setTargetParentId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [localExpandedFolders, setLocalExpandedFolders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const expandedFolders = parentExpandedFolders || localExpandedFolders;

  const toggleFolder = (id: string) => {
    if (parentToggleFolder) {
      parentToggleFolder(id);
    } else {
      setLocalExpandedFolders((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    }
  };

  const handleOpenRootModal = () => {
    setTargetParentId(null);
    setNewFolderName('');
    setShowNewFolderModal(true);
  };

  const handleOpenSubfolderModal = (parentId: string) => {
    setTargetParentId(parentId);
    setNewFolderName('');
    setShowNewFolderModal(true);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName.trim(), targetParentId);
    if (targetParentId && !expandedFolders[targetParentId]) {
      toggleFolder(targetParentId);
    }
    setNewFolderName('');
    setTargetParentId(null);
    setShowNewFolderModal(false);
  };

  const handleRename = async (id: string, oldName: string) => {
    const newName = window.prompt('Enter new folder name:', oldName);
    if (newName && newName.trim() && newName !== oldName) {
      await renameFolder(id, newName.trim());
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this folder and its subfolders? Assets inside will return to general vault.')) {
      await deleteFolder(id);
    }
  };

  const rootFolders = folders.filter((f) => !f.parentId);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
      {/* Header Controls */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
          Logical Folders
        </span>
        <button
          onClick={handleOpenRootModal}
          className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Folder
        </button>
      </div>

      {/* Main Folder Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        <button
          onClick={() => onFolderSelect('all')}
          className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg transition-colors ${
            activeFolderPath === 'all'
              ? 'bg-slate-100 text-slate-900 font-semibold'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg
              className={`w-4 h-4 ${activeFolderPath === 'all' ? 'text-indigo-600' : 'text-slate-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span>All Vault Assets</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
            {totalAssetsCount}
          </span>
        </button>

        <div className="pt-2 pb-1">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
            Categories & Folders
          </div>
          <div className="space-y-0.5">
            {rootFolders.map((folder) => (
              <VirtualFolderTreeItem
                key={folder.id}
                folder={folder}
                allFolders={folders}
                depth={0}
                activeFolderPath={activeFolderPath}
                expandedFolders={expandedFolders}
                onToggleFolder={toggleFolder}
                onSelect={onFolderSelect}
                onAddSubfolder={handleOpenSubfolderModal}
                onRename={handleRename}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Footer Status Indicator */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 px-1 text-[11px] text-slate-500 font-medium">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>Desktop Engine Ready</span>
        </div>
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl p-5 w-full max-w-sm space-y-4 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              {targetParentId ? 'Create New Subfolder' : 'Create New Folder'}
            </h3>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Folder Name</label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. Combat Effects"
                className="w-full px-3 py-1.5 border border-slate-300 text-slate-900 rounded-lg text-xs focus:border-indigo-500 focus:outline-hidden"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
