export interface IconDefinition {
  path?: string;
  description?: string;
  usage?: string;
  usedIn?: string;
  label?: string;
}

export interface FileNode {
  type: 'file';
  name: string;
  path: string;
  iconId: string;
}

export interface FolderNode {
  type: 'folder';
  name: string;
  path: string;
  children: ExplorerNode[];
}

export type ExplorerNode = FileNode | FolderNode;

export interface VaultFilterOptions {
  searchQuery?: string;
  folderPath?: string;
  folderId?: string;
  category?: string;
  showMissingOnly?: boolean;
}

/**
 * Logical virtual folder model for Asset Vault organization.
 * Physical icon asset storage remains flat in `public/assets/icons/`.
 * Logical folders exist strictly in application catalog metadata.
 */
export interface VirtualFolder {
  id: string;
  name: string;
  /** Null or parent VirtualFolder ID */
  parentId: string | null;
  /** Optional icon or category association */
  category?: string;
}
