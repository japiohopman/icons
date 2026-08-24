import React, { useState, useMemo } from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { VirtualFolder } from '@/types/vault';
import { useAssetVaultStore } from '@/store/assetVaultStore';

interface FolderNodeItemProps {
  folder: VirtualFolder;
  depth: number;
}

export const FolderNodeItem: React.FC<FolderNodeItemProps> = ({ folder, depth }) => {
  const {
    folders,
    assets,
    activeFolderId,
    setActiveFolderId,
    expandedFolderIds,
    toggleFolderExpanded,
    renameFolder,
  } = useAssetVaultStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);

  const isActive = activeFolderId === folder.id;
  const isExpanded = !!expandedFolderIds[folder.id];

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `folder-drop-${folder.id}`,
    data: {
      type: 'folder',
      folderId: folder.id,
      folder,
    },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `folder-drag-${folder.id}`,
    data: {
      type: 'folder',
      folderId: folder.id,
      folder,
    },
  });

  const childFolders = useMemo(
    () => folders.filter((f) => f.parentId === folder.id),
    [folders, folder.id]
  );

  const assetCount = useMemo(() => {
    return assets.filter((a) => a.folderId === folder.id || (a.category === folder.category && !a.folderId)).length;
  }, [assets, folder]);

  const handleSaveRename = async () => {
    if (editName.trim() && editName.trim() !== folder.name) {
      await renameFolder(folder.id, editName.trim());
    }
    setIsEditing(false);
  };

  const combinedRef = (node: HTMLDivElement | null) => {
    setDroppableRef(node);
    setDraggableRef(node);
  };

  const style: React.CSSProperties = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.4 : 1,
      }
    : {};

  return (
    <div className="select-none">
      <div
        ref={combinedRef}
        style={{ ...style, paddingLeft: `${depth * 14 + 8}px` }}
        className={`group flex items-center py-1.5 pr-2 rounded-lg text-xs transition-all ${
          isOver
            ? 'bg-indigo-100 ring-2 ring-indigo-500/40 font-semibold'
            : isActive
            ? 'bg-indigo-50 text-indigo-900 font-bold shadow-xs'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFolderExpanded(folder.id);
          }}
          className={`w-4 h-4 flex items-center justify-center text-slate-400 hover:text-slate-600 mr-1 ${
            childFolders.length === 0 ? 'invisible' : ''
          }`}
        >
          <svg
            className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <span {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing mr-2 text-indigo-500 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
        </span>

        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            autoFocus
            className="flex-1 px-1.5 py-0.5 bg-white border border-indigo-400 rounded text-xs focus:outline-hidden"
          />
        ) : (
          <span
            onClick={() => setActiveFolderId(folder.id)}
            className="flex-1 truncate cursor-pointer font-medium"
            title={folder.name}
          >
            {folder.name}
          </span>
        )}

        <div className="ml-auto flex items-center gap-1.5 opacity-60 group-hover:opacity-100">
          {!isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              title="Rename folder"
              aria-label={`Rename ${folder.name}`}
              className="p-1 hover:text-indigo-600 hover:bg-white rounded transition-colors cursor-pointer"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002 2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}

          <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.25 rounded">
            {assetCount}
          </span>
        </div>
      </div>

      {isExpanded && childFolders.length > 0 && (
        <div className="mt-0.5 space-y-0.5">
          {childFolders.map((child) => (
            <FolderNodeItem key={child.id} folder={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const FolderTree: React.FC = () => {
  const { folders } = useAssetVaultStore();

  const rootFolders = useMemo(() => {
    return folders.filter((f) => !f.parentId);
  }, [folders]);

  return (
    <div className="space-y-1">
      {rootFolders.map((folder) => (
        <FolderNodeItem key={folder.id} folder={folder} depth={0} />
      ))}
    </div>
  );
};
