import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconDefinition } from '../types';

interface PhotopeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  iconName: string | null;
  iconDef: IconDefinition | null;
}

export const PhotopeaModal: React.FC<PhotopeaModalProps> = ({
  isOpen,
  onClose,
  iconName,
  iconDef,
}) => {
  const [status, setStatus] = useState<
    'initializing' | 'ready' | 'loading_image' | 'image_loaded' | 'exporting' | 'exported' | 'error'
  >('initializing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [exportedSize, setExportedSize] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const isPhotopeaReadyRef = useRef<boolean>(false);
  const currentBlobUrlRef = useRef<string | null>(null);

  const addLog = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  }, []);

  // Cleanup Blob URL when modal is closed or unmounted
  const cleanupBlobUrl = useCallback(() => {
    if (currentBlobUrlRef.current) {
      URL.revokeObjectURL(currentBlobUrlRef.current);
      currentBlobUrlRef.current = null;
    }
    setExportedUrl(null);
    setExportedSize(null);
  }, []);

  // Construct SVG content string
  const getSvgString = useCallback(() => {
    if (!iconDef) return '';
    if (iconDef.rawHtml) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${iconDef.viewBox || '0 0 512 512'}" width="512" height="512">${iconDef.rawHtml}</svg>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><path d="${iconDef.path || ''}" fill="#000000" /></svg>`;
  }, [iconDef]);

  // Send SVG image ArrayBuffer to Photopea
  const sendImageToPhotopea = useCallback(() => {
    const svgStr = getSvgString();
    if (!svgStr || !iframeRef.current || !iframeRef.current.contentWindow) {
      setErrorMessage('Failed to generate SVG data or iframe is unattached.');
      return;
    }

    try {
      setStatus('loading_image');
      addLog(`Sending "${iconName}" SVG to Photopea via postMessage...`);
      const encoder = new TextEncoder();
      const arrayBuffer = encoder.encode(svgStr).buffer;

      iframeRef.current.contentWindow.postMessage(arrayBuffer, '*');
      setStatus('image_loaded');
      addLog(`Successfully sent ArrayBuffer (${arrayBuffer.byteLength} bytes) to Photopea.`);
    } catch (err: any) {
      console.error('Error sending image to Photopea:', err);
      setErrorMessage(`Failed to send image: ${err.message || err}`);
      setStatus('error');
      addLog(`Error: ${err.message || err}`);
    }
  }, [getSvgString, iconName, addLog]);

  // Execute a script string in Photopea
  const runScript = useCallback((script: string, label: string) => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) {
      setErrorMessage('Photopea iframe is not available.');
      return;
    }

    try {
      addLog(`Executing script (${label}): ${script}`);
      iframeRef.current.contentWindow.postMessage(script, '*');
    } catch (err: any) {
      console.error('Error running script in Photopea:', err);
      setErrorMessage(`Failed to run script: ${err.message || err}`);
      addLog(`Script Error: ${err.message || err}`);
    }
  }, [addLog]);

  // Trigger export from Photopea to App
  const handleExport = useCallback(() => {
    setStatus('exporting');
    addLog('Requesting PNG export via app.activeDocument.saveToOE("png")...');
    runScript('app.activeDocument.saveToOE("png");', 'Export PNG');
  }, [addLog, runScript]);

  // Handle incoming postMessage events from Photopea
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (e: MessageEvent) => {
      // Photopea postMessage response handling
      if (e.data === 'done') {
        if (!isPhotopeaReadyRef.current) {
          isPhotopeaReadyRef.current = true;
          setStatus('ready');
          addLog('Photopea API initialized and ready ("done" signal received).');
          // Auto load selected icon into Photopea
          sendImageToPhotopea();
        } else {
          addLog('Photopea finished executing command ("done").');
        }
        return;
      }

      if (e.data instanceof ArrayBuffer) {
        addLog(`Received binary export from Photopea (${e.data.byteLength} bytes).`);
        try {
          cleanupBlobUrl();
          const blob = new Blob([e.data], { type: 'image/png' });
          const url = URL.createObjectURL(blob);
          currentBlobUrlRef.current = url;
          setExportedUrl(url);
          setExportedSize(blob.size);
          setStatus('exported');
          addLog('Export complete! Result preview updated.');
        } catch (err: any) {
          setErrorMessage(`Error parsing exported data: ${err.message || err}`);
          setStatus('error');
        }
        return;
      }

      if (typeof e.data === 'string') {
        addLog(`Photopea message: ${e.data}`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, addLog, sendImageToPhotopea, cleanupBlobUrl]);

  // Reset state on open/close or icon change
  useEffect(() => {
    if (isOpen) {
      isPhotopeaReadyRef.current = false;
      setStatus('initializing');
      setErrorMessage(null);
      setLogs([]);
      cleanupBlobUrl();
      addLog('Opening Photopea workspace iframe...');
    } else {
      cleanupBlobUrl();
    }
  }, [isOpen, iconName, addLog, cleanupBlobUrl]);

  if (!isOpen) return null;

  const svgPreviewUrl = iconDef
    ? `data:image/svg+xml;utf8,${encodeURIComponent(getSvgString())}`
    : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[92vh] overflow-hidden flex flex-col border border-slate-200"
        >
          {/* Header Bar */}
          <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white font-bold text-xs shadow-sm">
                PP
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                  Photopea API Proof of Concept
                  <span className="text-[10px] bg-indigo-500/30 text-indigo-200 font-mono px-2 py-0.5 rounded-full border border-indigo-400/30 uppercase">
                    Live Integration
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Editing <span className="text-slate-200 font-semibold">{iconName}</span> via embedded iframe and Web Messaging API
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Status Indicator */}
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700 text-xs">
                <div
                  className={`w-2 h-2 rounded-full ${
                    status === 'exported' || status === 'image_loaded' || status === 'ready'
                      ? 'bg-emerald-400 animate-pulse'
                      : status === 'error'
                      ? 'bg-rose-500'
                      : 'bg-amber-400 animate-ping'
                  }`}
                />
                <span className="text-[11px] font-medium text-slate-300 capitalize">
                  {status.replace(/_/g, ' ')}
                </span>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Close Modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l18 18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                API Script Operations:
              </span>

              <button
                onClick={sendImageToPhotopea}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-medium rounded-lg shadow-xs hover:bg-slate-50 transition-all flex items-center gap-1.5"
                title="Reload Icon into Photopea Canvas"
              >
                <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reload SVG
              </button>

              <button
                onClick={() => runScript('app.activeDocument.activeLayer.rotate(45);', 'Rotate 45°')}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-medium rounded-lg shadow-xs hover:bg-slate-50 transition-all flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9" />
                </svg>
                Rotate 45°
              </button>

              <button
                onClick={() => runScript('app.activeDocument.activeLayer.invert();', 'Invert Layer')}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-medium rounded-lg shadow-xs hover:bg-slate-50 transition-all flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                Invert Layer
              </button>

              <button
                onClick={() => runScript('app.activeDocument.resizeCanvas(600, 600, AnchorPosition.MIDDLECENTER);', 'Resize Canvas 600x600')}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-medium rounded-lg shadow-xs hover:bg-slate-50 transition-all flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-2V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Resize Canvas 600x600
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md shadow-indigo-100 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 10l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Result PNG
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="px-6 py-2 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-700 font-bold">
                Dismiss
              </button>
            </div>
          )}

          {/* Main Layout Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 min-h-0 divide-x divide-slate-200 overflow-hidden">
            {/* Left 2 Cols: Photopea Iframe Workspace */}
            <div className="lg:col-span-2 bg-slate-900 relative flex flex-col min-h-0">
              <iframe
                ref={iframeRef}
                src="https://www.photopea.com"
                className="w-full h-full border-none"
                title="Photopea Embedded Workspace"
                allow="clipboard-read; clipboard-write"
              />
              {status === 'initializing' && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 z-10">
                  <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                  <p className="font-semibold text-sm">Connecting to Photopea Live API...</p>
                  <p className="text-xs text-slate-400 mt-1">Waiting for initial "done" message from Photopea iframe</p>
                </div>
              )}
            </div>

            {/* Right Col: Comparison & Export Result Sidebar */}
            <div className="bg-slate-50 flex flex-col min-h-0 overflow-y-auto custom-scrollbar p-6 space-y-6">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Workflow Comparison
                </h3>
                <p className="text-xs text-slate-600">
                  Compare original icon asset with edited image returned from Photopea API.
                </p>
              </div>

              {/* Side-by-Side Comparison Cards */}
              <div className="grid grid-cols-2 gap-4">
                {/* Original Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center text-center shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                    Original (SVG)
                  </span>
                  <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center p-2 mb-2 border border-slate-200/60 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] opacity-40"></div>
                    {svgPreviewUrl && (
                      <img src={svgPreviewUrl} alt="Original SVG" className="max-w-full max-h-full object-contain relative z-10" />
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 truncate w-full" title={iconName || ''}>
                    {iconName}.svg
                  </span>
                </div>

                {/* Photopea Result Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center text-center shadow-xs relative">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-2 flex items-center gap-1">
                    Photopea Result
                  </span>
                  <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center p-2 mb-2 border border-slate-200/60 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] opacity-40"></div>
                    {exportedUrl ? (
                      <img src={exportedUrl} alt="Photopea Exported Result" className="max-w-full max-h-full object-contain relative z-10" />
                    ) : (
                      <div className="text-[10px] text-slate-400 px-2 text-center">
                        {status === 'exporting' ? 'Exporting...' : 'Click "Export Result PNG" to capture image'}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {exportedSize ? `${(exportedSize / 1024).toFixed(1)} KB (PNG)` : 'No export yet'}
                  </span>
                </div>
              </div>

              {/* Download / Copy Result Controls */}
              {exportedUrl && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Edited Result Received Successfully!</span>
                  </div>
                  <p className="text-[11px] text-indigo-700 leading-relaxed">
                    The exported PNG was transferred from Photopea to the application as a binary ArrayBuffer via postMessage.
                  </p>
                  <a
                    href={exportedUrl}
                    download={`${iconName}-photopea-edited.png`}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 10l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Exported PNG
                  </a>
                </div>
              )}

              {/* Event & Messaging Log Console */}
              <div className="flex-1 flex flex-col min-h-0 bg-slate-900 rounded-xl p-4 text-[11px] font-mono text-slate-300 space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider">
                  <span>API Event Log</span>
                  <span className="text-slate-500">{logs.length} messages</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar text-[10px] leading-relaxed pr-1 max-h-[180px]">
                  {logs.map((log, i) => (
                    <div key={i} className="text-slate-300 break-words border-b border-slate-800/40 pb-1">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
