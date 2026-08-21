/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Core generic Asset representation for the Asset Vault.
 * Supports icons now, and future creative assets (images, photos, illustrations, etc.)
 */
export type AssetCategory = 'icon' | 'image' | 'illustration' | 'photo' | 'game-asset' | 'ui' | 'background' | 'other';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  mimeType: string;
  /** Data URL (e.g. data:image/svg+xml;utf8,... or data:image/png;base64,...) or raw content string */
  data: string;
  width?: number;
  height?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Lifecycle status of an Editor Engine instance.
 */
export type EngineStatus = 'uninitialized' | 'loading' | 'ready' | 'processing' | 'error';

/**
 * Options for exporting edited assets.
 */
export interface ExportOptions {
  format?: 'png' | 'jpg' | 'webp' | 'svg';
  quality?: number;
}

/**
 * Canvas anchor positions for canvas resize operations.
 */
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

/**
 * Bounds definition for cropping operations.
 */
export interface CropBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * The Editor Engine abstraction interface.
 * Decouples the application UI from Photopea or any underlying graphics processing engine.
 */
export interface EditorEngine {
  /**
   * Initializes the engine and mounts any required runtime element (e.g., iframe) in container.
   */
  init(container: HTMLElement): Promise<void>;

  /**
   * Loads an asset into the editor document workspace.
   */
  loadAsset(asset: Asset): Promise<void>;

  /**
   * Executes a programmatic script against the open asset/document in the engine.
   */
  executeScript(script: string): Promise<unknown>;

  /**
   * Application-level programmatic operation: Resizes the loaded asset (image scale) to new dimensions.
   */
  resize(width: number, height: number): Promise<Asset>;

  /**
   * Application-level programmatic operation: Resizes the canvas dimensions relative to an anchor point.
   */
  resizeCanvas(width: number, height: number, anchor?: CanvasAnchor): Promise<Asset>;

  /**
   * Application-level programmatic operation: Crops the document to the specified region bounds.
   */
  crop(bounds: CropBounds): Promise<Asset>;

  /**
   * Exports the current document state as a new Asset result without modifying the source asset.
   */
  exportResult(options?: ExportOptions): Promise<Asset>;

  /**
   * Returns current lifecycle status.
   */
  getStatus(): EngineStatus;

  /**
   * Subscribes to status changes. Returns an unsubscribe function.
   */
  onStatusChange(callback: (status: EngineStatus) => void): () => void;

  /**
   * Cleans up event listeners, message handlers, and DOM nodes created by the engine.
   */
  destroy(): void;
}
