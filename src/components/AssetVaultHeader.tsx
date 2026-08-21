import React from 'react';

interface AssetVaultHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalAssetsCount: number;
}

export const AssetVaultHeader: React.FC<AssetVaultHeaderProps> = ({
  searchQuery,
  onSearchChange,
  totalAssetsCount,
}) => {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
      <div className="flex items-center gap-3">
        <div className="bg-slate-900 p-1.5 rounded-md">
          <svg className="w-5 h-5 text-white" viewBox="0 0 512 512" fill="currentColor">
            <path d="M256 16c-132.6 0-240 107.4-240 240s107.4 240 240 240 240-107.4 240-240S388.6 16 256 16zm0 60c99.4 0 180 80.6 180 180s-80.6 180-180 180-180-80.6-180-180 80.6-180 180-180zm0 60c-66.3 0-120 53.7-120 120s53.7 120 120 120 120-53.7 120-120-53.7-120-120-120z" />
          </svg>
        </div>
        <h1 className="text-sm font-bold tracking-tight text-slate-800 flex items-center gap-2">
          Artificer <span className="text-slate-300 font-normal">/</span> <span className="text-slate-500 font-medium">Asset Vault</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-600 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={`Search ${totalAssetsCount} assets...`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-slate-100 border border-transparent focus:bg-white focus:border-slate-200 rounded-md text-sm w-72 transition-all outline-hidden"
          />
        </div>
      </div>
    </header>
  );
};
