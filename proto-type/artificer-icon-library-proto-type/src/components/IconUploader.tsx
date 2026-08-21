import React, { useState } from 'react';
import { ICON_CATEGORIES } from '../assets/icons';
import { motion, AnimatePresence } from 'motion/react';

interface IconUploaderProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IconUploader({ isOpen, onClose }: IconUploaderProps) {
  const [categoryId, setCategoryId] = useState(ICON_CATEGORIES[0].id);
  const [iconId, setIconId] = useState('');
  const [path, setPath] = useState('');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [usage, setUsage] = useState('');
  const [usedIn, setUsedIn] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [mode, setMode] = useState<'svg' | 'md'>('svg');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const selectedCategory = ICON_CATEGORIES.find(c => c.id === categoryId);

  // Construct standard SVG XML with embedded metadata
  let attrs: string[] = [];
  if (label || iconId) attrs.push(`data-label="${(label || iconId).replace(/"/g, '&quot;')}"`);
  if (description) attrs.push(`data-description="${description.replace(/"/g, '&quot;')}"`);
  if (usage) attrs.push(`data-usage="${usage.replace(/"/g, '&quot;')}"`);
  if (usedIn) attrs.push(`data-used-in="${usedIn.replace(/"/g, '&quot;')}"`);

  const finalSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"${attrs.length ? '\n  ' + attrs.join('\n  ') : ''}>
  <path d="${path}" />
</svg>`;

  const markdownRow = `| ${selectedCategory?.name} | \`${iconId}\` | ${label || iconId} | ${description} | ${usedIn} | ✅ Path OK |`;

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadStatus('idle');
    try {
      const response = await fetch('/api/icons/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId,
          file: selectedCategory?.file,
          iconId,
          svgContent: finalSvgContent,
          markdownRow
        }),
      });
      
      if (response.ok) {
        setUploadStatus('success');
        setShowCode(true); // Still show code as confirmation
      } else {
        setUploadStatus('error');
      }
    } catch (err) {
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCode(true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold text-slate-800">Import New Icon</h2>
              <p className="text-xs text-slate-500">Add an icon to the Artificer library as an SVG file</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l18 18" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            {!showCode ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Target Category</label>
                    <select 
                      value={categoryId} 
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    >
                      {ICON_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name} ({cat.file})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Icon ID (Code Name)</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. fire_ball"
                      value={iconId} 
                      onChange={(e) => setIconId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">SVG Path String</label>
                  <textarea 
                    required
                    rows={3}
                    placeholder="M12 2C6.48 2 2 6.48 2 12..."
                    value={path} 
                    onChange={(e) => setPath(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Display Label</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Fire Ball"
                      value={label} 
                      onChange={(e) => setLabel(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Used In</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Spells, Combat Log"
                      value={usedIn} 
                      onChange={(e) => setUsedIn(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Description</label>
                  <input 
                    type="text" 
                    placeholder="Brief description of the icon..."
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Usage Instructions</label>
                  <textarea 
                    rows={2}
                    placeholder="Context for when to use this icon..."
                    value={usage} 
                    onChange={(e) => setUsage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={isUploading}
                    onClick={handleUpload}
                    type="button"
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2"
                  >
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 11l-4 4m0 0l-4-4m4 4V4" /></svg>
                    )}
                    Upload to File
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    Preview Code
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-emerald-900">
                        {uploadStatus === 'success' ? 'Icon uploaded successfully!' : 'Import ready!'}
                      </h4>
                      <div className="flex bg-emerald-100 p-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider">
                        <button 
                          onClick={() => setMode('svg')}
                          className={`px-2 py-1 rounded-sm transition-all ${mode === 'svg' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-500 hover:text-emerald-600'}`}
                        >
                          SVG
                        </button>
                        <button 
                          onClick={() => setMode('md')}
                          className={`px-2 py-1 rounded-sm transition-all ${mode === 'md' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-500 hover:text-emerald-600'}`}
                        >
                          Markdown
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-emerald-700 mt-1">
                      {mode === 'svg' 
                        ? `Saved inside src/assets/icons/${selectedCategory?.file}${iconId}.svg`
                        : `Add this row to your ASSETS.md register`}
                    </p>
                  </div>
                </div>

                <div className="relative group">
                  <pre className="bg-slate-900 text-slate-100 p-6 rounded-xl overflow-x-auto text-[13px] font-mono leading-relaxed min-h-[100px]">
                    <code>{mode === 'svg' ? finalSvgContent : markdownRow}</code>
                  </pre>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(mode === 'svg' ? finalSvgContent : markdownRow);
                    }}
                    className="absolute top-4 right-4 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] uppercase tracking-widest font-bold rounded-md backdrop-blur-sm transition-all flex items-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    Copy Snippet
                  </button>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5">
                   <h5 className="text-[11px] font-bold text-indigo-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     Agent Shortcut
                   </h5>
                   <p className="text-xs text-indigo-800 leading-relaxed">
                     You can also tell the AI agent: <br/>
                     <span className="italic">"Add the {iconId} icon with this path: {path.substring(0, 20)}..."</span>
                   </p>
                </div>

                <div className="flex justify-center">
                  <button 
                    onClick={() => {
                        setShowCode(false);
                        setIconId('');
                        setPath('');
                        setLabel('');
                        setDescription('');
                        setUsage('');
                        setUsedIn('');
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center gap-2 transition-all p-2 rounded-lg hover:bg-indigo-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Import Another Icon
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
