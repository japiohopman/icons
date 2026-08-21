/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './asset';

export interface IconDefinition {
  label?: string;
  description?: string;
  category?: string;
  tags?: string[];
  usage?: string;
  usedIn?: string;
  path?: string;
  rawHtml?: string;
  viewBox?: string;
  rotate?: number;
  animation?: 'none' | 'bounce' | 'pulse' | 'spin' | 'ping' | 'float';
  color?: string;
}

export interface IconCategory {
  id: string;
  name: string;
  label?: string;
  description: string;
  iconName?: string;
  file: string;
  icons?: Record<string, IconDefinition>;
  isComplete?: boolean;
}

export interface BaseExplorerNode {
  name: string;
  path: string;
}

export interface FolderNode extends BaseExplorerNode {
  type: 'folder';
  children: ExplorerNode[];
}

export interface FileNode extends BaseExplorerNode {
  type: 'file';
  iconId: string;
  fullPath?: string;
}

export type ExplorerNode = FolderNode | FileNode;
