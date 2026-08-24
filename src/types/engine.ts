import { Asset, ExportOptions } from './asset';

/**
 * Lifecycle status of an Editor Engine instance.
 */
export type EngineStatus = 'uninitialized' | 'loading' | 'ready' | 'processing' | 'error';

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
   * Application-level programmatic operation: Resizes the loaded asset to new dimensions.
   */
  resize(width: number, height: number): Promise<Asset>;

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
