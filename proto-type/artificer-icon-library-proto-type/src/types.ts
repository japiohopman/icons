/**
 * Artificer Icon System Types
 */

export interface IconMetadata {
  path: string;
  label?: string;
  description?: string;
  usage?: string;
  usedIn?: string;
  tags?: string[];
  // Optimization properties
  rotate?: number;
  color?: string;
  animation?: 'bounce' | 'pulse' | 'spin' | 'ping' | 'none' | 'float';
  rawHtml?: string;
  viewBox?: string;
}

export type IconDefinition = string | IconMetadata;

export interface IconCategory {
  id: string;
  name: string;
  file: string;
  icons: Record<string, IconDefinition>;
  description?: string;
  isComplete?: boolean;
}

export interface FileNode {
  type: 'file';
  name: string;
  iconId: string;
  path: string;
  fullPath: string;
}

export interface FolderNode {
  type: 'folder';
  name: string;
  path: string;
  children: (FolderNode | FileNode)[];
}

export type ExplorerNode = FolderNode | FileNode;

export interface IconLibrary {
  categories: IconCategory[];
}
