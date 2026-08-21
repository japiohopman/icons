import React, { useState, useEffect, useRef } from 'react';
import { Asset } from '@/types/asset';
import { EditorEngine, EngineStatus } from '@/types/engine';
import { PhotopeaEngine } from '@/engine/PhotopeaEngine';

interface AssetEditorModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveResult: (resultAsset: Asset) => void;
}

export const AssetEditorModal: React.FC<AssetEditorModalProps> = ({
  asset,
  isOpen,
  onClose,
  onSaveResult,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<EditorEngine | null>(null);

  const [status, setStatus] = useState<EngineStatus>('uninitialized');
  const [width, setWidth] = useState<number>(256);
  const [height, setHeight] = useState<number>(256);
  const [resultAsset, setResultAsset] = useState<Asset | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !asset) {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
      setStatus('uninitialized');
      setResultAsset(null);
      setErrorMessage(null);
      return;
    }

    let isMounted = true;

    async function initEditor() {
      if (!containerRef.current) return;

      try {
        setErrorMessage(null);
        const engine = new PhotopeaEngine();
        engineRef.current = engine;

        engine.onStatusChange((newStatus) => {
          if (isMounted) {
            setStatus(newStatus);
          }
        });

        await engine.init(containerRef.current);
        if (isMounted && asset) {
          await engine.loadAsset(asset);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err?.message || 'Failed to initialize Photopea Engine');
        }
      }
    }

    initEditor();

    return () => {
      isMounted = false;
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [isOpen, asset]);

  if (!isOpen || !asset) return null;

  const handleResizeAction = async () => {
    if (!engineRef.current) return;
    try {
      setErrorMessage(null);
      const res = await engineRef.current.resize(width, height);
      setResultAsset(res);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Resize operation failed.');
    }
  };

  const handleExportAction = async () => {
    if (!engineRef.current) return;
    try {
      setErrorMessage(null);
      const res = await engineRef.current.exportResult({ format: 'png' });
      setResultAsset(res);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Export operation failed.');
    }
  };

  const handleSaveToVault = () => {
    if (resultAsset) {
      onSaveResult(resultAsset);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="h-14 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-800 text-sm">Asset Editor Engine</span>
            <span className="text-xs text-slate-400 font-mono">({asset.name})</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider ${
                status === 'ready'
                  ? 'bg-emerald-100 text-emerald-700'
                  : status === 'processing' || status === 'loading'
                  ? 'bg-amber-100 text-amber-700 animate-pulse'
                  : status === 'error'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Photopea Engine Container */}
          <div className="flex-1 bg-slate-100 relative">
            <div ref={containerRef} className="w-full h-full" />
            {status === 'loading' && (
              <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center pointer-events-none">
                <div className="bg-white px-4 py-2 rounded-lg shadow-md text-xs font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                  Initializing Editor Engine...
                </div>
              </div>
            )}
          </div>

          {/* Application UI Controls Sidebar */}
          <div className="w-80 border-l border-slate-200 bg-white p-5 flex flex-col gap-5 overflow-y-auto shrink-0">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Application Controls</h4>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs mb-4">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Dimensions (px)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Width</span>
                      <input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(Number(e.target.value))}
                        className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Height</span>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleResizeAction}
                    disabled={status !== 'ready'}
                    className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
                  >
                    Resize Asset
                  </button>
                  <button
                    onClick={handleExportAction}
                    disabled={status !== 'ready'}
                    className="w-full py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 disabled:opacity-50 transition-colors"
                  >
                    Export PNG Result
                  </button>
                </div>
              </div>
            </div>

            {/* Output Result Preview */}
            {resultAsset && (
              <div className="pt-4 border-t border-slate-200 flex flex-col gap-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Output Result</h4>
                <div className="aspect-square bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center justify-center overflow-hidden">
                  <img src={resultAsset.data} alt="Result Preview" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="text-[11px] text-slate-500 font-mono truncate">{resultAsset.name}</div>
                <button
                  onClick={handleSaveToVault}
                  className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Save Result to Vault
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
