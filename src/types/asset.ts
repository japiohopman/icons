/**
 * Core generic Asset representation for the Asset Vault.
 * Icons are the initial asset category, with support for future asset types.
 */
export type AssetCategory =
  | 'icon'
  | 'image'
  | 'illustration'
  | 'photo'
  | 'game-asset'
  | 'ui'
  | 'background'
  | 'other';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  mimeType: string;
  /** Data URL or SVG string content */
  data: string;
  width?: number;
  height?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Metadata record for assets in the JSON catalog (`src/assets/catalog/icons/*.json`).
 */
export interface CatalogAsset {
  id: string;
  name: string;
  file: string;
  category: string;
  /** Logical folder ID assignment */
  folderId?: string;
  tags: string[];
  description: string;
}

/**
 * Domain category in the catalog.
 */
export interface CatalogCategory {
  id: string;
  name: string;
  description: string;
}

/**
 * Options for exporting edited assets.
 */
export interface ExportOptions {
  format?: 'png' | 'jpg' | 'webp' | 'svg';
  quality?: number;
}

export type CanvasAnchor =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface CropBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type EngineStatus = 'uninitialized' | 'loading' | 'ready' | 'processing' | 'error';
