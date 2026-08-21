/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Asset, EditorEngine, EngineStatus, ExportOptions } from './types';

interface QueuedTask<T = unknown> {
  action: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
}

export class PhotopeaEngine implements EditorEngine {
  private iframe: HTMLIFrameElement | null = null;
  private container: HTMLElement | null = null;
  private status: EngineStatus = 'uninitialized';
  private statusListeners: Set<(status: EngineStatus) => void> = new Set();
  private currentAsset: Asset | null = null;
  private messageHandler: ((event: MessageEvent) => void) | null = null;

  private taskQueue: QueuedTask[] = [];
  private isProcessingQueue = false;

  private activeScriptResolve: ((value: unknown) => void) | null = null;
  private activeScriptReject: ((reason?: unknown) => void) | null = null;
  private activeArrayBufferResolve: ((buffer: ArrayBuffer) => void) | null = null;
  private activeArrayBufferReject: ((reason?: unknown) => void) | null = null;

  private setStatus(newStatus: EngineStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.statusListeners.forEach((listener) => listener(newStatus));
    }
  }

  public getStatus(): EngineStatus {
    return this.status;
  }

  public onStatusChange(callback: (status: EngineStatus) => void): () => void {
    this.statusListeners.add(callback);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  /**
   * Enqueues an operation to ensure sequential execution and avoid race conditions.
   */
  private enqueue<T>(action: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.taskQueue.push({ action: action as () => Promise<unknown>, resolve: resolve as (val: unknown) => void, reject });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.taskQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    const task = this.taskQueue.shift();

    if (task) {
      try {
        const result = await task.action();
        task.resolve(result);
      } catch (err) {
        task.reject(err);
      }
    }

    this.isProcessingQueue = false;
    if (this.taskQueue.length > 0) {
      this.processQueue();
    }
  }

  public async init(container: HTMLElement): Promise<void> {
    if (this.iframe) {
      return;
    }

    this.container = container;
    this.setStatus('loading');

    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';

    // Photopea Live API configuration object in hash
    const photopeaConfig = {
      environment: {
        theme: 2,
        showbranding: false,
      },
    };

    iframe.src = `https://www.photopea.com#${encodeURIComponent(JSON.stringify(photopeaConfig))}`;
    this.iframe = iframe;

    return new Promise<void>((resolve, reject) => {
      let isReady = false;

      const timeout = setTimeout(() => {
        if (!isReady) {
          this.setStatus('error');
          reject(new Error('Photopea Engine initialization timed out.'));
        }
      }, 10000);

      this.messageHandler = (event: MessageEvent) => {
        // Strict origin check as mandated by security rules
        if (event.origin !== 'https://www.photopea.com') {
          return;
        }

        const data = event.data;

        // Handle initial readiness handshake signal ("done" sent by Photopea when ready)
        if (!isReady && data === 'done') {
          isReady = true;
          clearTimeout(timeout);
          this.setStatus('ready');
          resolve();
          return;
        }

        // Handle ArrayBuffer message (e.g. from saveToOE)
        if (data instanceof ArrayBuffer) {
          if (this.activeArrayBufferResolve) {
            const res = this.activeArrayBufferResolve;
            this.activeArrayBufferResolve = null;
            this.activeArrayBufferReject = null;
            res(data);
          }
          return;
        }

        // Handle string response message from Photopea
        if (typeof data === 'string') {
          if (this.activeScriptResolve) {
            const res = this.activeScriptResolve;
            this.activeScriptResolve = null;
            this.activeScriptReject = null;
            res(data);
          }
        }
      };

      window.addEventListener('message', this.messageHandler);

      iframe.onerror = (err) => {
        clearTimeout(timeout);
        this.setStatus('error');
        reject(err);
      };

      container.appendChild(iframe);
    });
  }

  public async loadAsset(asset: Asset): Promise<void> {
    return this.enqueue(async () => {
      if (!this.iframe || !this.iframe.contentWindow) {
        throw new Error('PhotopeaEngine is not initialized.');
      }

      this.setStatus('processing');
      this.currentAsset = asset;

      // Convert asset data (Data URL or SVG string) into ArrayBuffer as expected by Photopea postMessage API
      let arrayBuffer: ArrayBuffer;
      if (asset.data.startsWith('data:')) {
        const base64Parts = asset.data.split(',');
        const mimeMatch = base64Parts[0].match(/:(.*?);/);
        const isBase64 = base64Parts[0].includes('base64');

        let binaryString: string;
        if (isBase64) {
          binaryString = atob(base64Parts[1]);
        } else {
          binaryString = decodeURIComponent(base64Parts[1]);
        }

        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        arrayBuffer = bytes.buffer;
      } else {
        const encoder = new TextEncoder();
        arrayBuffer = encoder.encode(asset.data).buffer;
      }

      // Send ArrayBuffer directly to Photopea to load file document
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.activeScriptResolve = null;
          this.activeScriptReject = null;
          reject(new Error('Timed out loading asset into Photopea.'));
        }, 8000);

        this.activeScriptResolve = () => {
          clearTimeout(timeout);
          resolve();
        };

        this.activeScriptReject = (err) => {
          clearTimeout(timeout);
          reject(err);
        };

        this.iframe!.contentWindow!.postMessage(arrayBuffer, '*');
      });

      this.setStatus('ready');
    });
  }

  public async executeScript(script: string): Promise<unknown> {
    return this.enqueue(async () => {
      if (!this.iframe || !this.iframe.contentWindow) {
        throw new Error('PhotopeaEngine is not initialized.');
      }

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          if (this.activeScriptReject) {
            const rej = this.activeScriptReject;
            this.activeScriptResolve = null;
            this.activeScriptReject = null;
            rej(new Error(`Photopea script execution timed out: ${script}`));
          }
        }, 8000);

        this.activeScriptResolve = (res) => {
          clearTimeout(timeout);
          resolve(res);
        };

        this.activeScriptReject = (err) => {
          clearTimeout(timeout);
          reject(err);
        };

        this.iframe!.contentWindow!.postMessage(script, '*');
      });
    });
  }

  public async resize(width: number, height: number): Promise<Asset> {
    if (!this.currentAsset) {
      throw new Error('No asset loaded in PhotopeaEngine.');
    }

    this.setStatus('processing');

    // Execute Photopea ExtendScript to resize current active document
    const script = `app.activeDocument.resizeImage(${width}, ${height});`;
    await this.executeScript(script);

    // Export result without mutating source asset
    const resultAsset = await this.exportResult({ format: 'png' });
    this.setStatus('ready');
    return resultAsset;
  }

  public async exportResult(options: ExportOptions = {}): Promise<Asset> {
    if (!this.currentAsset) {
      throw new Error('No active asset to export.');
    }

    const format = options.format || 'png';

    const buffer = await this.enqueue<ArrayBuffer>(() => {
      if (!this.iframe || !this.iframe.contentWindow) {
        throw new Error('PhotopeaEngine is not initialized.');
      }

      return new Promise<ArrayBuffer>((resolve, reject) => {
        const timeout = setTimeout(() => {
          if (this.activeArrayBufferReject) {
            const rej = this.activeArrayBufferReject;
            this.activeArrayBufferResolve = null;
            this.activeArrayBufferReject = null;
            rej(new Error(`Export operation (${format}) timed out waiting for ArrayBuffer response.`));
          }
        }, 8000);

        this.activeArrayBufferResolve = (buf) => {
          clearTimeout(timeout);
          resolve(buf);
        };

        this.activeArrayBufferReject = (err) => {
          clearTimeout(timeout);
          reject(err);
        };

        // Command Photopea to output document as binary ArrayBuffer to OE (Output Element)
        const script = `app.activeDocument.saveToOE("${format}");`;
        this.iframe!.contentWindow!.postMessage(script, '*');
      });
    });

    const blob = new Blob([buffer], { type: `image/${format}` });
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    return {
      id: `${this.currentAsset.id}-edited-${Date.now()}`,
      name: `${this.currentAsset.name}-edited.${format}`,
      category: this.currentAsset.category,
      mimeType: `image/${format}`,
      data: dataUrl,
      metadata: {
        originalId: this.currentAsset.id,
        exportedAt: new Date().toISOString(),
      },
    };
  }

  public destroy(): void {
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }

    if (this.iframe && this.iframe.parentNode) {
      this.iframe.parentNode.removeChild(this.iframe);
      this.iframe = null;
    }

    this.container = null;
    this.currentAsset = null;
    this.taskQueue = [];
    this.isProcessingQueue = false;
    this.activeScriptResolve = null;
    this.activeScriptReject = null;
    this.activeArrayBufferResolve = null;
    this.activeArrayBufferReject = null;
    this.setStatus('uninitialized');
  }
}
