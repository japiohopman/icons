/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CATALOG_CATEGORIES } from '../lib/catalog';

interface AssetUploaderProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssetUploader: React.FC<AssetUploaderProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [iconId, setIconId] = useState<string>('');
  const [label, setLabel] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ui');
  const [isSubmitting, setIsProcessing] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const generatedId = selectedFile.name.replace(/\.svg$/i, '').toLowerCase().replace(/[^a-z0-9]/g, '_');
      setIconId(generatedId);
      setLabel(generatedId.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()));

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setSvgContent(content);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !svgContent || !iconId) {
      setMessage({ type: 'error', text: 'Please select an SVG file and provide an ID.' });
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    const filename = `${iconId}.svg`;
    const publicPath = `/assets/icons/${filename}`;

    try {
      const response = await fetch('/api/icons/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: selectedCategory,
          filename,
          iconId: `${selectedCategory}.${iconId}`,
          label: label || iconId,
          description: description || `A canonical ${selectedCategory} icon.`,
          publicPath,
          svgContent,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMessage({ type: 'success', text: `Asset ${iconId} imported successfully into Vault!` });
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1200);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to import asset.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Server connection error.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-base font-bold text-slate-800">Import Asset into Vault</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message && (
            <div
              className={`p-3 rounded-lg text-xs font-medium ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">SVG File</label>
            <input
              type="file"
              accept=".svg"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Asset ID Slug</label>
              <input
                type="text"
                value={iconId}
                onChange={(e) => setIconId(e.target.value)}
                placeholder="e.g. fire_shield"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Catalog Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:border-indigo-500 focus:outline-hidden"
              >
                {CATALOG_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Display Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Human readable title"
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Short description of the asset"
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !file}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs"
            >
              {isSubmitting ? 'Importing...' : 'Import Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
