import React from 'react';
import { GameIcon } from '@/assets/game_icons';
import { motion } from 'motion/react';
import { Asset, CatalogAsset } from '@/types/asset';
import { IconDefinition } from '@/types/vault';
import { useAssetVaultStore } from '@/store/assetVaultStore';

interface AssetInspectorProps {
  selectedAssetId: string | null;
  selectedAsset: CatalogAsset | Asset | null;
  selectedMetadata: IconDefinition | null;
  onOpenEditor: () => void;
}

export const AssetInspector: React.FC<AssetInspectorProps> = ({
  selectedAssetId,
  selectedAsset,
  selectedMetadata,
  onOpenEditor,
}) => {
  const { folders, moveAssetToFolder } = useAssetVaultStore();
  const currentFolderId = selectedAsset && 'folderId' in selectedAsset ? selectedAsset.folderId || '' : '';
  return (
    <aside className="w-80 bg-white border-l border-slate-200 shrink-0 hidden lg:flex flex-col z-10 shadow-[-4px_0_12px_rgba(0,0,0,0.02)]">
      {selectedAssetId ? (
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="p-6 pb-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metadata Inspector</h3>
            </div>

            <div className="aspect-square bg-slate-50 rounded-2xl flex items-center justify-center mb-8 border border-slate-100 relative group overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
              <motion.div
                key={selectedAssetId}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-slate-800 relative z-10"
              >
                <GameIcon name={selectedAssetId} size={128} fallbackName="save" />
              </motion.div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
                  {selectedMetadata?.label || selectedAssetId.replace(/_/g, ' ')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-tighter">
                    Production
                  </span>
                  <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100/50 uppercase tracking-tighter">
                    SVG Asset
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Description</label>
                  <p className="text-slate-600 leading-relaxed text-xs">
                    {selectedMetadata?.description || `A symbolic icon asset representing ${selectedAssetId.replace(/_/g, ' ')}.`}
                  </p>
                </div>

                {selectedMetadata?.usage && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Usage Context</label>
                    <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100/50 text-[11px] text-indigo-800 leading-snug">
                      {selectedMetadata.usage}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Viewbox</label>
                      <span className="font-mono text-xs text-slate-600">0 0 512 512</span>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Asset Key</label>
                      <span className="font-mono text-xs text-slate-600 truncate block max-w-[140px]" title={selectedAssetId}>
                        {selectedAssetId}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="folder-assignment-select" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Virtual Folder Location
                    </label>
                    <select
                      id="folder-assignment-select"
                      value={currentFolderId}
                      onChange={(e) => {
                        const targetId = e.target.value || null;
                        moveAssetToFolder(selectedAssetId, targetId);
                      }}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:border-indigo-400 transition-colors cursor-pointer"
                      aria-label="Assign to Virtual Folder"
                    >
                      <option value="">Unassigned (All Assets / Root)</option>
                      {folders.map((f) => (
                        <option key={f.id} value={f.id}>
                          📁 {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto p-6 space-y-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(selectedAssetId);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 border border-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-all shadow-md shadow-slate-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy Asset Key
            </button>
            <button
              onClick={onOpenEditor}
              className="w-full py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002 2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Open in Asset Editor
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-4">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2 animate-pulse">
            <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-slate-500">No Asset Selected</p>
            <p className="text-xs">Select an asset from the vault to inspect its properties and metadata.</p>
          </div>
        </div>
      )}
    </aside>
  );
};
