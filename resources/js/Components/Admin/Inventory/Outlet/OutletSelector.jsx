import React from 'react';
import { useFilter } from '@/Context/FilterContext';
import { Store, AlertTriangle } from 'lucide-react';

export default function OutletSelector({ outlets = [], outletStatsAll = {} }) {
  const { outlet, setOutlet } = useFilter();

  // Helper to count issues per outlet (menipis + habis)
  const getOutletIssuesCount = (outletId) => {
    const stats = outletStatsAll[outletId];
    if (!stats) return 0;
    return (stats.menipis || 0) + (stats.habis || 0);
  };

  const colorSchemes = [
    { active: 'bg-emerald-500 text-white shadow-emerald-500/20', dot: 'bg-emerald-400', hover: 'hover:bg-emerald-50 text-gray-700 hover:text-emerald-700' },
    { active: 'bg-blue-500 text-white shadow-blue-500/20', dot: 'bg-blue-400', hover: 'hover:bg-blue-50 text-gray-700 hover:text-blue-700' },
    { active: 'bg-purple-500 text-white shadow-purple-500/20', dot: 'bg-purple-400', hover: 'hover:bg-purple-50 text-gray-700 hover:text-purple-700' },
    { active: 'bg-amber-500 text-white shadow-amber-500/20', dot: 'bg-amber-400', hover: 'hover:bg-amber-50 text-gray-700 hover:text-amber-700' },
    { active: 'bg-rose-500 text-white shadow-rose-500/20', dot: 'bg-rose-400', hover: 'hover:bg-rose-50 text-gray-700 hover:text-rose-700' },
    { active: 'bg-cyan-500 text-white shadow-cyan-500/20', dot: 'bg-cyan-400', hover: 'hover:bg-cyan-50 text-gray-700 hover:text-cyan-700' },
    { active: 'bg-orange-500 text-white shadow-orange-500/20', dot: 'bg-orange-400', hover: 'hover:bg-orange-50 text-gray-700 hover:text-orange-700' },
    { active: 'bg-pink-500 text-white shadow-pink-500/20', dot: 'bg-pink-400', hover: 'hover:bg-pink-50 text-gray-700 hover:text-pink-700' },
  ];

  const allColor = { active: 'bg-emerald-600 text-white shadow-emerald-500/20', dot: 'bg-emerald-400', hover: 'hover:bg-emerald-50 text-gray-700 hover:text-emerald-700' };

  return (
    <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-2 items-center">
      {/* 🏪 Semua Outlet Tab */}
      <button
        onClick={() => setOutlet('all')}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 shadow-sm cursor-pointer border ${
          outlet === 'all'
            ? `${allColor.active} border-transparent`
            : `${allColor.hover} border-gray-100 bg-white`
        }`}
      >
        <Store className="w-4 h-4 shrink-0" />
        <span>Semua Outlet</span>
      </button>

      {/* Specific Outlet Tabs */}
      {outlets.map((item, idx) => {
        const slug = item.slug || item.id;
        const isActive = outlet === slug;
        const colorCfg = colorSchemes[idx % colorSchemes.length];
        const issues = getOutletIssuesCount(slug);

        return (
          <button
            key={slug}
            onClick={() => setOutlet(slug)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 shadow-sm cursor-pointer border ${
              isActive
                ? `${colorCfg.active} border-transparent`
                : `${colorCfg.hover} border-gray-100 bg-white`
            }`}
          >
            {/* Color indicator dot */}
            <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-white' : colorCfg.dot}`} />
            <span>{item.nama}</span>

            {/* Warning warning badge if low/out of stock items exist */}
            {issues > 0 && (
              <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse'
              }`}>
                <AlertTriangle className="w-3 h-3 shrink-0" />
                {issues}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
