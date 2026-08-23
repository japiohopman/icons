/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
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

export interface CatalogAsset {
  id: string;
  name: string;
  file: string; // e.g. "/assets/icons/attack.svg"
  category: string; // e.g. "combat"
  tags?: string[];
  description?: string;
  usage?: string;
  usedIn?: string;
}

export interface CatalogCategory {
  id: string;
  name: string;
  description: string;
}

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  mimeType: string;
  data: string; // data URL or SVG content or fetchable path
  width?: number;
  height?: number;
  metadata?: Record<string, unknown>;
}

export type EngineStatus = 'uninitialized' | 'loading' | 'ready' | 'processing' | 'error';

export interface ExportOptions {
  format?: 'png' | 'jpg' | 'webp' | 'svg';
  quality?: number;
}

export type CanvasAnchor =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface CropBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
