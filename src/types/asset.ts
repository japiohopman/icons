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

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  mimeType: string;
  data: string;
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
