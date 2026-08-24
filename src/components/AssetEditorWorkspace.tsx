/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Asset, EngineStatus, CatalogAsset } from '@/types';
import { PhotopeaEngine } from '@/engine/PhotopeaEngine';
import { CATALOG_CATEGORIES } from '@/lib/catalog';

interface AssetEditorWorkspaceProps {
  catalogAsset: CatalogAsset | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess?: (savedAsset: CatalogAsset) => void;
}

export const AssetEditorWorkspace: React.FC<AssetEditorWorkspaceProps> = ({
  catalogAsset,
  isOpen,
  onClose,
  onSaveSuccess,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<PhotopeaEngine | null>(null);

  const [engineStatus, setEngineStatus] = useState<EngineStatus>('uninitialized');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [displayName, setDisplayName] = useState<string>('');
  const [saveAsCategory, setSaveAsCategory] = useState<string>('combat');
  const [saveAsSlug, setSaveAsSlug] = useState<string>('');
  const [showSaveAsDialog, setShowSaveAsDialog] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'jpg' | 'webp'>('png');

  // Initialize values when catalogAsset changes
  useEffect(() => {
    if (catalogAsset) {
      setDisplayName(catalogAsset.name);
      setSaveAsCategory(catalogAsset.category);
      setSaveAsSlug(`${catalogAsset.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-copy`);
      setHasUnsavedChanges(false);
      setMessage(null);
    }
  }, [catalogAsset]);

  // Initialize Photopea Engine
  useEffect(() => {
    if (!isOpen || !catalogAsset || !containerRef.current) {
      return;
    }

    const engine = new PhotopeaEngine();
    engineRef.current = engine;

    const unsubscribe = engine.onStatusChange((status) => {
      setEngineStatus(status);
      if (status === 'processing') {
        setHasUnsavedChanges(true);
      }
    });

    let isMounted = true;

    async function initializeEngine() {
      try {
        if (!containerRef.current) return;
        await engine.init(containerRef.current);
        if (isMounted) {
          // Fetch the SVG content or file
          const res = await fetch(catalogAsset!.file);
          let dataUrl: string;
          if (res.ok) {
            const svgText = await res.text();
            dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgText)}`;
          } else {
            dataUrl = catalogAsset!.file;
          }

          const assetToLoad: Asset = {
            id: catalogAsset!.id,
            name: `${catalogAsset!.name}.svg`,
            category: 'icon',
            mimeType: 'image/svg+xml',
            data: dataUrl,
            width: 512,
            height: 512,
          };

          await engine.loadAsset(assetToLoad);
        }
      } catch (err) {
        console.error('Failed to initialize Photopea engine in workspace:', err);
      }
    }

    initializeEngine();

    return () => {
      isMounted = false;
      unsubscribe();
      engine.destroy();
      engineRef.current = null;
    };
  }, [isOpen, catalogAsset]);

  if (!isOpen || !catalogAsset) return null;

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes in the editor. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Perform Save (Updates existing vault asset in its category)
  const handleSave = async () => {
    if (!engineRef.current) return;
    setIsProcessing(true);
    setMessage(null);

    try {
      // Export genuine SVG from Photopea engine
      const exportedResult = await engineRef.current.exportResult({ format: 'svg' });

      const response = await fetch('/api/assets/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          assetId: catalogAsset.id,
          originalAssetId: catalogAsset.id,
          name: displayName || catalogAsset.name,
          category: catalogAsset.category, // Category remains immutable during normal Save
          file: catalogAsset.file,
          content: exportedResult.data,
          tags: catalogAsset.tags,
          description: catalogAsset.description,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMessage({ type: 'success', text: `Saved '${displayName || catalogAsset.name}' successfully!` });
        setHasUnsavedChanges(false);
        if (onSaveSuccess) {
          onSaveSuccess(data.asset);
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save asset.' });
      }
    } catch (err: any) {
      console.error('Save failed:', err);
      setMessage({ type: 'error', text: err.message || 'Save operation failed.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Perform Save As (Creates new vault asset with new ID and physical file)
  const handleSaveAs = async () => {
    if (!engineRef.current) return;

    const cleanSlug = saveAsSlug.toLowerCase().replace(/[^a-z0-9_.-]/g, '-').replace(/^-+|-+$/g, '');
    if (!cleanSlug) {
      setMessage({ type: 'error', text: 'Please provide a valid slug/ID for Save As.' });
      return;
    }

    const newAssetId = `${saveAsCategory}.${cleanSlug}`;

    if (newAssetId === catalogAsset.id) {
      setMessage({ type: 'error', text: 'Save As asset ID must be strictly different from the original asset ID.' });
      return;
    }

    const newFilename = `${cleanSlug}.svg`;
    const newFilePath = `/assets/icons/${newFilename}`;

    setIsProcessing(true);
    setMessage(null);

    try {
      const exportedResult = await engineRef.current.exportResult({ format: 'svg' });

      const response = await fetch('/api/assets/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-as',
          assetId: newAssetId,
          originalAssetId: catalogAsset.id,
          name: displayName || cleanSlug,
          category: saveAsCategory,
          file: newFilePath,
          content: exportedResult.data,
          tags: [saveAsCategory, cleanSlug],
          description: `A canonical ${saveAsCategory} asset representing ${displayName || cleanSlug}.`,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMessage({ type: 'success', text: `Created new asset '${newAssetId}'!` });
        setShowSaveAsDialog(false);
        setHasUnsavedChanges(false);
        if (onSaveSuccess) {
          onSaveSuccess(data.asset);
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create new asset.' });
      }
    } catch (err: any) {
      console.error('Save As failed:', err);
      setMessage({ type: 'error', text: err.message || 'Save As operation failed.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Export derivative file (PNG / JPG / WebP / SVG) for browser download
  const handleExport = async () => {
    if (!engineRef.current) return;
    setIsProcessing(true);
    setMessage(null);

    try {
      const result = await engineRef.current.exportResult({ format: exportFormat });

      // Trigger browser file download
      const link = document.createElement('a');
      link.href = result.data;
      link.download = `${displayName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_export.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage({ type: 'success', text: `Exported ${exportFormat.toUpperCase()} file!` });
    } catch (err: any) {
      console.error('Export failed:', err);
      setMessage({ type: 'error', text: err.message || 'Export failed.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* Workspace Header */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-1.5 rounded-md">
            <svg className="w-5 h-5 text-white" viewBox="0 0 512 512" fill="currentColor">
              <path d="M256 16c-132.6 0-240 107.4-240 240s107.4 240 240 240 240-107.4 240-240S388.6 16 256 16zm0 60c99.4 0 180 80.6 180 180s-80.6 180-180 180-180-80.6-180-180 80.6-180 180-180zm0 60c-66.3 0-120 53.7-120 120s53.7 120 120 120 120-53.7 120-120-53.7-120-120-120z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Asset Vault Editor <span className="text-slate-600">/</span> <span className="text-indigo-400 font-mono text-xs">{catalogAsset.id}</span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Editing: <span className="text-slate-200 font-medium">{catalogAsset.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 mr-2">
            <span className={`w-2 h-2 rounded-full ${engineStatus === 'ready' ? 'bg-green-500' : engineStatus === 'processing' ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'}`} />
            <span className="capitalize font-mono text-[11px]">{engineStatus}</span>
            {hasUnsavedChanges && (
              <span className="ml-1 text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                Unsaved
              </span>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={isProcessing || engineStatus !== 'ready'}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md transition-colors shadow-xs flex items-center gap-1.5 font-sans"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save
          </button>

          <button
            onClick={() => setShowSaveAsDialog(true)}
            disabled={isProcessing || engineStatus !== 'ready'}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-md transition-colors border border-slate-700 flex items-center gap-1.5 font-sans"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Save As...
          </button>

          <div className="h-6 w-px bg-slate-800" />

          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Full-Size Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Full Photopea Editor Engine Surface */}
        <main className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col">
          <div ref={containerRef} className="w-full h-full" />
        </main>

        {/* Asset Information & Controls Sidebar Panel */}
        <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
          <div className="p-5 space-y-6">
            {message && (
              <div
                className={`p-3 rounded-lg text-xs font-medium ${
                  message.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                    : 'bg-red-500/10 border border-red-500/30 text-red-300'
                }`}
              >
                {message.text}
              </div>
            )}

            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Asset Information</h3>
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Category (Immutable for Save)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={catalogAsset.category}
                    className="w-full px-3 py-1.5 bg-slate-900/50 border border-slate-800 text-slate-400 rounded-lg text-xs cursor-not-allowed uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Stable Asset ID
                  </label>
                  <span className="font-mono text-xs text-indigo-400 block bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 select-all">
                    {catalogAsset.id}
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Physical File Path
                  </label>
                  <span className="font-mono text-[11px] text-slate-400 block truncate bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800" title={catalogAsset.file}>
                    public{catalogAsset.file}
                  </span>
                </div>
              </div>
            </div>

            {/* Export Derivative Section */}
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Export Derivative File</h3>
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Export Format
                  </label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg text-xs focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="png">PNG Image</option>
                    <option value="svg">SVG Vector</option>
                    <option value="webp">WebP Image</option>
                    <option value="jpg">JPG Image</option>
                  </select>
                </div>

                <button
                  onClick={handleExport}
                  disabled={isProcessing || engineStatus !== 'ready'}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-100 font-semibold rounded-lg text-xs transition-colors border border-slate-700 flex items-center justify-center gap-2 shadow-xs"
                >
                  Download {exportFormat.toUpperCase()}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Save As Modal Dialog */}
      {showSaveAsDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">Save As New Asset</h3>
            <p className="text-xs text-slate-400">
              Creates a new physical asset file and catalog entry without mutating the original ({catalogAsset.id}).
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">New Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Critical Hit"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-xs focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">New Asset Category</label>
                <select
                  value={saveAsCategory}
                  onChange={(e) => setSaveAsCategory(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-xs focus:border-indigo-500 focus:outline-hidden"
                >
                  {CATALOG_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Asset ID Slug</label>
                <input
                  type="text"
                  value={saveAsSlug}
                  onChange={(e) => setSaveAsSlug(e.target.value)}
                  placeholder="e.g. critical-hit"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 font-mono text-slate-100 rounded-lg text-xs focus:border-indigo-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Resulting ID: <code className="text-indigo-400">{saveAsCategory}.{saveAsSlug || 'slug'}</code>
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSaveAsDialog(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAs}
                disabled={isProcessing}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg text-xs shadow-xs"
              >
                Create New Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
