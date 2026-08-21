/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameIcon } from './GameIcon';
import { ALL_ICONS } from '../assets/icons';
import { IconDefinition } from '../types/index';

interface AssetBrowserProps {
  icons: string[];
  selectedIcon: string | null;
  onSelectIcon: (iconName: string) => void;
  viewMode: 'grid' | 'list';
}

export const AssetBrowser: React.FC<AssetBrowserProps> = ({
  icons,
  selectedIcon,
  onSelectIcon,
  viewMode,
}) => {
  if (icons.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
        <div className="p-4 bg-white rounded-full border border-slate-100 shadow-xs">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="font-semibold text-slate-600">No assets match your search</p>
          <p className="text-sm">Try clearing your filters or searching for another term.</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-5 pb-12">
        <AnimatePresence mode="popLayout">
          {icons.map((name) => (
            <motion.button
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={name}
              onClick={() => onSelectIcon(name)}
              className={`group relative p-4 bg-white border rounded-xl flex flex-col items-center gap-4 transition-all duration-200 ${
                selectedIcon === name
                  ? 'border-indigo-400 ring-4 ring-indigo-500/5 shadow-lg shadow-indigo-500/10'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-md active:scale-95'
              }`}
            >
              <div className={`w-14 h-14 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                selectedIcon === name ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
              }`}>
                <GameIcon name={name} size={36} fallbackName="save" />
              </div>
              <div className="w-full text-center">
                <div className={`text-[10px] font-mono px-2 py-1 rounded truncate transition-all ${
                  selectedIcon === name ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-500'
                }`}>
                  {name}
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pb-12">
      <div className="grid grid-cols-[64px_200px_1fr_1fr_120px] gap-4 px-6 py-3 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest items-center">
        <div className="text-center">Preview</div>
        <div>Asset Name</div>
        <div>Description</div>
        <div>Usage Context</div>
        <div className="text-right">Select</div>
      </div>
      <AnimatePresence mode="popLayout">
        {icons.map((name) => {
          const def = (ALL_ICONS as Record<string, IconDefinition>)[name];
          const meta = typeof def === 'object' ? def : null;
          return (
            <motion.div
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              key={name}
              onClick={() => onSelectIcon(name)}
              className={`grid grid-cols-[64px_200px_1fr_1fr_120px] gap-4 px-4 py-3 bg-white border rounded-xl items-center transition-all cursor-pointer ${
                selectedIcon === name ? 'border-indigo-300 shadow-xs ring-2 ring-indigo-500/5 shadow-indigo-100' : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className={`flex items-center justify-center w-12 h-12 bg-slate-50 rounded-lg ${selectedIcon === name ? 'text-indigo-600' : 'text-slate-400'}`}>
                <GameIcon name={name} size={28} />
              </div>
              <div>
                <div className="font-bold text-slate-700 truncate">{name}</div>
                <div className="text-[10px] font-mono text-slate-400">#{(ALL_ICONS as any)[name]?.length || '0'} path bits</div>
              </div>
              <div>
                <p className="text-xs text-slate-500 line-clamp-2 italic pr-4">
                  {meta?.description || 'No description provided.'}
                </p>
              </div>
              <div>
                <p className="text-xs text-indigo-700/80 line-clamp-2 font-medium pr-4">
                  {meta?.usedIn || meta?.usage || 'Universal System Asset'}
                </p>
              </div>
              <div className="flex justify-end">
                <button className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition-colors">
                  View
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
