/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Asset, EngineStatus } from '../engine/types';
import { PhotopeaEngine } from '../engine/PhotopeaEngine';

interface AssetEditorModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveResult?: (resultAsset: Asset) => void;
}

export const AssetEditorModal: React.FC<AssetEditorModalProps> = ({
  asset,
  isOpen,
  onClose,
  onSaveResult,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<PhotopeaEngine | null>(null);

  const [engineStatus, setEngineStatus] = useState<EngineStatus>('uninitialized');
  const [width, setWidth] = useState<number>(256);
  const [height, setHeight] = useState<number>(256);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultAsset, setResultAsset] = useState<Asset | null>(null);

  useEffect(() => {
    if (!isOpen || !asset || !containerRef.current) {
      return;
    }

    const engine = new PhotopeaEngine();
    engineRef.current = engine;

    const unsubscribe = engine.onStatusChange((status) => {
      setEngineStatus(status);
    });

    let isMounted = true;

    async function initializeEngine() {
      try {
        if (!containerRef.current) return;
        await engine.init(containerRef.current);
        if (isMounted) {
          await engine.loadAsset(asset!);
        }
      } catch (err) {
        console.error('Failed to initialize Photopea engine', err);
      }
    }

    initializeEngine();

    return () => {
      isMounted = false;
      unsubscribe();
      engine.destroy();
      engineRef.current = null;
      setResultAsset(null);
    };
  }, [isOpen, asset]);

  if (!isOpen || !asset) return null;

  const handleResize = async () => {
    if (!engineRef.current) return;
    setIsProcessing(true);
    try {
      const result = await engineRef.current.resize(width, height);
      setResultAsset(result);
    } catch (err) {
      console.error('Resize operation failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    if (!engineRef.current) return;
    setIsProcessing(true);
    try {
      const result = await engineRef.current.exportResult({ format: 'png' });
      setResultAsset(result);
      if (onSaveResult) {
        onSaveResult(result);
      }
    } catch (err) {
      console.error('Export operation failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Application Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>Asset Vault Editor</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100 uppercase">
                {asset.category}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Source Asset: <span className="font-semibold text-slate-700">{asset.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className={`w-2 h-2 rounded-full ${engineStatus === 'ready' ? 'bg-green-500' : engineStatus === 'processing' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="capitalize font-mono text-[11px]">{engineStatus}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Application Workspace Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-hidden">
          {/* Engine Runtime Container (Background / Application-Owned Host) */}
          <div className="md:col-span-2 bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-3 left-3 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-md text-[10px] font-mono text-slate-300 border border-slate-800">
              Photopea Engine Bridge
            </div>

            {/* Hidden Engine Frame Container */}
            <div className="w-full h-full opacity-30 hover:opacity-100 transition-opacity duration-300 rounded-xl overflow-hidden border border-slate-800">
              <div ref={containerRef} className="w-full h-full" />
            </div>
          </div>

          {/* Application Controls & Preview Sidebar */}
          <div className="p-6 flex flex-col gap-6 bg-slate-50/50 overflow-y-auto">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Application Controls
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Target Dimensions (px)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Width</span>
                      <input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:border-indigo-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Height</span>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:border-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {[128, 256, 512].map((dim) => (
                    <button
                      key={dim}
                      type="button"
                      onClick={() => {
                        setWidth(dim);
                        setHeight(dim);
                      }}
                      className="px-2.5 py-1 text-[11px] font-mono bg-white border border-slate-200 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
                    >
                      {dim}x{dim}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleResize}
                  disabled={isProcessing || engineStatus !== 'ready'}
                  className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  {isProcessing ? 'Processing Engine Script...' : 'Apply Resize via Engine'}
                </button>
              </div>
            </div>

            {/* Application Result Preview */}
            <div className="pt-4 border-t border-slate-200 flex-1 flex flex-col">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Edited Asset Result Preview
              </h3>

              {resultAsset ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                  <img
                    src={resultAsset.data}
                    alt={resultAsset.name}
                    className="max-h-36 max-w-full object-contain rounded shadow-xs"
                  />
                  <div className="text-center">
                    <p className="text-xs font-mono font-semibold text-slate-700 truncate max-w-[200px]">
                      {resultAsset.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">Preserved Original Unmodified</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                  Run an operation to see the application result.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Application Footer Actions */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Source asset preserved safely in Asset Vault.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleExport}
              disabled={isProcessing || engineStatus !== 'ready'}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
            >
              Export Edited Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
