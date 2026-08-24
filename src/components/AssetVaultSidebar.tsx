import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useAssetVaultStore } from '@/store/assetVaultStore';
import { FolderTree } from './FolderTree';

export const AssetVaultSidebar: React.FC = () => {
  const {
    assets,
    activeFolderId,
    setActiveFolderId,
    createFolder,
  } = useAssetVaultStore();

  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const { setNodeRef: setRootDroppableRef, isOver: isOverRoot } = useDroppable({
    id: 'folder-drop-all',
    data: {
      type: 'folder',
      folderId: 'all',
    },
  });

  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName.trim());
    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 select-none">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navigation</div>
          <h2 className="text-xs font-bold text-slate-800">Virtual Folders</h2>
        </div>
        <button
          onClick={() => setShowNewFolderModal(true)}
          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 border border-indigo-200/60 shadow-xs cursor-pointer"
          title="Create New Virtual Folder"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Folder
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        <div
          ref={setRootDroppableRef}
          onClick={() => setActiveFolderId('all')}
          className={`w-full flex items-center px-2.5 py-2 text-xs rounded-lg cursor-pointer transition-all ${
            isOverRoot
              ? 'bg-indigo-100 ring-2 ring-indigo-500/40 font-semibold'
              : activeFolderId === 'all'
              ? 'bg-slate-900 text-white font-semibold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <svg
            className={`w-4 h-4 mr-2.5 ${activeFolderId === 'all' ? 'text-indigo-400' : 'text-slate-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span>All Assets</span>
          <span
            className={`ml-auto text-[10px] font-mono px-1.5 py-0.25 rounded ${
              activeFolderId === 'all' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {assets.length}
          </span>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Folders</div>
          <FolderTree />
        </div>
      </nav>

      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 px-2 py-1 text-[11px] text-slate-400 font-medium">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>Virtual Folder System Operational</span>
        </div>
      </div>

      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateFolderSubmit}
            className="bg-white border border-slate-200 rounded-xl p-5 w-full max-w-sm shadow-xl space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-800">Create New Virtual Folder</h3>
            <p className="text-xs text-slate-500">
              Folders organize assets logically in catalog metadata while keeping physical files flat in public/assets/icons/.
            </p>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Folder Name</label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. Legendary Weapons"
                autoFocus
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-xs focus:bg-white focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewFolderModal(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newFolderName.trim()}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                Create Folder
              </button>
            </div>
          </form>
        </div>
      )}
    </aside>
  );
};
