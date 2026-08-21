/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Asset, CanvasAnchor, EngineStatus } from '../engine/types';
import { PhotopeaEngine } from '../engine/PhotopeaEngine';

interface AssetEditorModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveResult?: (resultAsset: Asset) => void;
}

type TabType = 'resize' | 'canvas' | 'crop';

const ANCHOR_GRID: { label: string; value: CanvasAnchor; icon: string }[] = [
  { label: 'Top Left', value: 'top-left', icon: '↖' },
  { label: 'Top Center', value: 'top-center', icon: '↑' },
  { label: 'Top Right', value: 'top-right', icon: '↗' },
  { label: 'Center Left', value: 'center-left', icon: '←' },
  { label: 'Center', value: 'center', icon: '•' },
  { label: 'Center Right', value: 'center-right', icon: '→' },
  { label: 'Bottom Left', value: 'bottom-left', icon: '↙' },
  { label: 'Bottom Center', value: 'bottom-center', icon: '↓' },
  { label: 'Bottom Right', value: 'bottom-right', icon: '↘' },
];

export const AssetEditorModal: React.FC<AssetEditorModalProps> = ({
  asset,
  isOpen,
  onClose,
  onSaveResult,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<PhotopeaEngine | null>(null);

  const [engineStatus, setEngineStatus] = useState<EngineStatus>('uninitialized');
  const [activeTab, setActiveTab] = useState<TabType>('canvas');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Resize states
  const [resizeWidth, setResizeWidth] = useState<number>(256);
  const [resizeHeight, setResizeHeight] = useState<number>(256);

  // Canvas Resize states
  const [canvasWidth, setCanvasWidth] = useState<number>(512);
  const [canvasHeight, setCanvasHeight] = useState<number>(512);
  const [canvasAnchor, setCanvasAnchor] = useState<CanvasAnchor>('center');

  // Crop states
  const [cropX, setCropX] = useState<number>(0);
  const [cropY, setCropY] = useState<number>(0);
  const [cropWidth, setCropWidth] = useState<number>(256);
  const [cropHeight, setCropHeight] = useState<number>(256);

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

  const validateDimensions = (w: number, h: number): boolean => {
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
      setValidationError('Width and Height must be positive numbers greater than 0.');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const validateCropBounds = (x: number, y: number, w: number, h: number): boolean => {
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0) {
      setValidationError('X and Y coordinates must be non-negative numbers.');
      return false;
    }
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
      setValidationError('Width and Height must be positive numbers greater than 0.');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleResize = async () => {
    if (!engineRef.current) return;
    if (!validateDimensions(resizeWidth, resizeHeight)) return;

    setIsProcessing(true);
    try {
      const result = await engineRef.current.resize(resizeWidth, resizeHeight);
      setResultAsset(result);
    } catch (err) {
      console.error('Resize operation failed', err);
      setValidationError(err instanceof Error ? err.message : 'Resize operation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCanvasResize = async () => {
    if (!engineRef.current) return;
    if (!validateDimensions(canvasWidth, canvasHeight)) return;

    setIsProcessing(true);
    try {
      const result = await engineRef.current.resizeCanvas(canvasWidth, canvasHeight, canvasAnchor);
      setResultAsset(result);
    } catch (err) {
      console.error('Canvas resize operation failed', err);
      setValidationError(err instanceof Error ? err.message : 'Canvas resize operation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCrop = async () => {
    if (!engineRef.current) return;
    if (!validateCropBounds(cropX, cropY, cropWidth, cropHeight)) return;

    setIsProcessing(true);
    try {
      const result = await engineRef.current.crop({
        x: cropX,
        y: cropY,
        width: cropWidth,
        height: cropHeight,
      });
      setResultAsset(result);
    } catch (err) {
      console.error('Crop operation failed', err);
      setValidationError(err instanceof Error ? err.message : 'Crop operation failed.');
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Application Controls
                </h3>
              </div>

              {/* Navigation Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/60 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('resize');
                    setValidationError(null);
                  }}
                  className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                    activeTab === 'resize'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Resize
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('canvas');
                    setValidationError(null);
                  }}
                  className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                    activeTab === 'canvas'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Canvas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('crop');
                    setValidationError(null);
                  }}
                  className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                    activeTab === 'crop'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Crop
                </button>
              </div>

              {/* Validation Error Message */}
              {validationError && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
                  {validationError}
                </div>
              )}

              {/* TAB 1: Image Resize */}
              {activeTab === 'resize' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Scale Dimensions (px)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Width</span>
                        <input
                          type="number"
                          value={resizeWidth}
                          onChange={(e) => {
                            setResizeWidth(Number(e.target.value));
                            setValidationError(null);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:border-indigo-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Height</span>
                        <input
                          type="number"
                          value={resizeHeight}
                          onChange={(e) => {
                            setResizeHeight(Number(e.target.value));
                            setValidationError(null);
                          }}
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
                          setResizeWidth(dim);
                          setResizeHeight(dim);
                          setValidationError(null);
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
                    {isProcessing ? 'Processing Engine Script...' : 'Apply Image Resize'}
                  </button>
                </div>
              )}

              {/* TAB 2: Canvas Resize */}
              {activeTab === 'canvas' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Canvas Dimensions (px)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Width</span>
                        <input
                          type="number"
                          value={canvasWidth}
                          onChange={(e) => {
                            setCanvasWidth(Number(e.target.value));
                            setValidationError(null);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:border-indigo-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Height</span>
                        <input
                          type="number"
                          value={canvasHeight}
                          onChange={(e) => {
                            setCanvasHeight(Number(e.target.value));
                            setValidationError(null);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:border-indigo-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {[256, 512, 1024].map((dim) => (
                      <button
                        key={dim}
                        type="button"
                        onClick={() => {
                          setCanvasWidth(dim);
                          setCanvasHeight(dim);
                          setValidationError(null);
                        }}
                        className="px-2.5 py-1 text-[11px] font-mono bg-white border border-slate-200 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        {dim}x{dim}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1.5">Anchor Point</label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1.5 rounded-lg border border-slate-200 w-36 mx-auto">
                      {ANCHOR_GRID.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          title={item.label}
                          onClick={() => setCanvasAnchor(item.value)}
                          className={`h-8 text-xs font-bold rounded flex items-center justify-center transition-all ${
                            canvasAnchor === item.value
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {item.icon}
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 block text-center mt-1 font-mono capitalize">
                      Anchor: {canvasAnchor}
                    </span>
                  </div>

                  <button
                    onClick={handleCanvasResize}
                    disabled={isProcessing || engineStatus !== 'ready'}
                    className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    {isProcessing ? 'Processing Engine Script...' : 'Apply Canvas Resize'}
                  </button>
                </div>
              )}

              {/* TAB 3: Crop */}
              {activeTab === 'crop' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Crop Origin (px)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">X Position</span>
                        <input
                          type="number"
                          value={cropX}
                          onChange={(e) => {
                            setCropX(Number(e.target.value));
                            setValidationError(null);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:border-indigo-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Y Position</span>
                        <input
                          type="number"
                          value={cropY}
                          onChange={(e) => {
                            setCropY(Number(e.target.value));
                            setValidationError(null);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:border-indigo-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Crop Size (px)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Width</span>
                        <input
                          type="number"
                          value={cropWidth}
                          onChange={(e) => {
                            setCropWidth(Number(e.target.value));
                            setValidationError(null);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:border-indigo-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Height</span>
                        <input
                          type="number"
                          value={cropHeight}
                          onChange={(e) => {
                            setCropHeight(Number(e.target.value));
                            setValidationError(null);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:border-indigo-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block">Quick Presets</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setCropX(0);
                          setCropY(0);
                          setCropWidth(512);
                          setCropHeight(512);
                          setValidationError(null);
                        }}
                        className="px-2 py-1 text-[10px] font-mono bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        Full (0,0,512,512)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCropX(128);
                          setCropY(128);
                          setCropWidth(256);
                          setCropHeight(256);
                          setValidationError(null);
                        }}
                        className="px-2 py-1 text-[10px] font-mono bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        Center 256
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCropX(0);
                          setCropY(0);
                          setCropWidth(256);
                          setCropHeight(256);
                          setValidationError(null);
                        }}
                        className="px-2 py-1 text-[10px] font-mono bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        Top Left 256
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleCrop}
                    disabled={isProcessing || engineStatus !== 'ready'}
                    className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    {isProcessing ? 'Processing Engine Script...' : 'Apply Crop Region'}
                  </button>
                </div>
              )}
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
