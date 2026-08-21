/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Asset, EditorEngine, EngineStatus, ExportOptions } from './types';

export class PhotopeaEngine implements EditorEngine {
  private iframe: HTMLIFrameElement | null = null;
  private container: HTMLElement | null = null;
  private status: EngineStatus = 'uninitialized';
  private statusListeners: Set<(status: EngineStatus) => void> = new Set();
  private currentAsset: Asset | null = null;
  private messageHandler: ((event: MessageEvent) => void) | null = null;

  private pendingScriptResolve: ((value: unknown) => void) | null = null;
  private pendingScriptReject: ((reason?: unknown) => void) | null = null;
  private pendingArrayBufferResolve: ((buffer: ArrayBuffer) => void) | null = null;

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

  public async init(container: HTMLElement): Promise<void> {
    if (this.iframe) {
      return;
    }

    this.container = container;
    this.setStatus('loading');

    // Create Photopea iframe configured for Live Messaging API
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';

    // Photopea API configuration object in hash
    const photopeaConfig = {
      environment: {
        theme: 2,
        showbranding: false,
      },
    };

    iframe.src = `https://www.photopea.com#${encodeURIComponent(JSON.stringify(photopeaConfig))}`;

    this.iframe = iframe;

    // Attach message listener for Photopea responses
    this.messageHandler = (event: MessageEvent) => {
      if (event.origin !== 'https://www.photopea.com') {
        return;
      }

      const data = event.data;

      // Handle binary file result from Photopea (e.g. app.activeDocument.saveToOE("png"))
      if (data instanceof ArrayBuffer) {
        if (this.pendingArrayBufferResolve) {
          const resolve = this.pendingArrayBufferResolve;
          this.pendingArrayBufferResolve = null;
          resolve(data);
        }
        return;
      }

      // Handle completion string signal from Photopea
      if (data === 'done') {
        if (this.pendingScriptResolve) {
          const resolve = this.pendingScriptResolve;
          this.pendingScriptResolve = null;
          this.pendingScriptReject = null;
          resolve(data);
        }
        return;
      }

      // Handle standard string message
      if (typeof data === 'string') {
        if (this.pendingScriptResolve) {
          const resolve = this.pendingScriptResolve;
          this.pendingScriptResolve = null;
          this.pendingScriptReject = null;
          resolve(data);
        }
      }
    };

    window.addEventListener('message', this.messageHandler);

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.setStatus('ready');
        resolve();
      }, 3000);

      iframe.onload = () => {
        clearTimeout(timeout);
        this.setStatus('ready');
        resolve();
      };

      iframe.onerror = (err) => {
        clearTimeout(timeout);
        this.setStatus('error');
        reject(err);
      };

      container.appendChild(iframe);
    });
  }

  public async loadAsset(asset: Asset): Promise<void> {
    if (!this.iframe || !this.iframe.contentWindow) {
      throw new Error('PhotopeaEngine is not initialized.');
    }

    this.setStatus('processing');
    this.currentAsset = asset;

    // Load asset via Photopea scripting API: app.openDocument(data, name)
    const script = `app.openDocument(${JSON.stringify(asset.data)}, ${JSON.stringify(asset.name)});`;
    await this.executeScript(script);
    this.setStatus('ready');
  }

  public async executeScript(script: string): Promise<unknown> {
    if (!this.iframe || !this.iframe.contentWindow) {
      throw new Error('PhotopeaEngine is not initialized.');
    }

    return new Promise((resolve, reject) => {
      this.pendingScriptResolve = resolve;
      this.pendingScriptReject = reject;

      this.iframe!.contentWindow!.postMessage(script, '*');

      // Safety timeout if Photopea does not reply
      setTimeout(() => {
        if (this.pendingScriptResolve === resolve) {
          this.pendingScriptResolve = null;
          this.pendingScriptReject = null;
          resolve('done');
        }
      }, 2000);
    });
  }

  public async resize(width: number, height: number): Promise<Asset> {
    if (!this.currentAsset) {
      throw new Error('No asset loaded in PhotopeaEngine.');
    }

    this.setStatus('processing');

    // Execute Photopea DOM Script to resize document image
    const script = `app.activeDocument.resizeImage(${width}, ${height});`;
    await this.executeScript(script);

    // Export updated document result
    const resultAsset = await this.exportResult({ format: 'png' });
    this.setStatus('ready');
    return resultAsset;
  }

  public async exportResult(options: ExportOptions = {}): Promise<Asset> {
    if (!this.currentAsset) {
      throw new Error('No active asset to export.');
    }

    const format = options.format || 'png';

    const arrayBufferPromise = new Promise<ArrayBuffer>((resolve) => {
      this.pendingArrayBufferResolve = resolve;
    });

    // Ask Photopea to send current document back to Output Element/Parent Window
    const script = `app.activeDocument.saveToOE("${format}");`;
    this.iframe?.contentWindow?.postMessage(script, '*');

    const buffer = await arrayBufferPromise;

    // Convert ArrayBuffer result to Data URL
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
    this.pendingScriptResolve = null;
    this.pendingScriptReject = null;
    this.pendingArrayBufferResolve = null;
    this.setStatus('uninitialized');
  }
}
