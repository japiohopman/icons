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
  category?: string;
  showMissingOnly?: boolean;
}
