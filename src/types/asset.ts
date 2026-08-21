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
 * Options for exporting edited assets.
 */
export interface ExportOptions {
  format?: 'png' | 'jpg' | 'webp' | 'svg';
  quality?: number;
}
