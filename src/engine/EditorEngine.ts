/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Asset, CanvasAnchor, CropBounds, EngineStatus, ExportOptions } from '../types/asset';

export interface EditorEngine {
  init(container: HTMLElement): Promise<void>;
  loadAsset(asset: Asset): Promise<void>;
  executeScript(script: string): Promise<unknown>;
  resize(width: number, height: number): Promise<Asset>;
  resizeCanvas(width: number, height: number, anchor?: CanvasAnchor): Promise<Asset>;
  crop(bounds: CropBounds): Promise<Asset>;
  exportResult(options?: ExportOptions): Promise<Asset>;
  getStatus(): EngineStatus;
  onStatusChange(callback: (status: EngineStatus) => void): () => void;
  destroy(): void;
}
