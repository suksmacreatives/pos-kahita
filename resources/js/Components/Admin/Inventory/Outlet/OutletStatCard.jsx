import React from 'react';
import { ArrowUpDown } from 'lucide-react';

export default function OutletStatCard({ title, value, icon: IconComponent, color = 'emerald', subtext }) {
  // Color theme definitions matching design specification
  const themes = {
    emerald: {
      bg: 'bg-emerald-50 border-emerald-100',
      iconBg: 'bg-emerald-500/10 text-emerald-600',
      accent: 'border-l-4 border-l-emerald-500',
    },
    blue: {
      bg: 'bg-blue-50 border-blue-100',
      iconBg: 'bg-blue-500/10 text-blue-600',
      accent: 'border-l-4 border-l-blue-500',
    },
    purple: {
      bg: 'bg-purple-50 border-purple-100',
      iconBg: 'bg-purple-500/10 text-purple-600',
      accent: 'border-l-4 border-l-purple-500',
    },
    amber: {
      bg: 'bg-amber-50 border-amber-100',
      iconBg: 'bg-amber-500/10 text-amber-600',
      accent: 'border-l-4 border-l-amber-500',
    },
  };

  const theme = themes[color] || themes.emerald;
  const ActiveIcon = IconComponent || ArrowUpDown;

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-300 ${theme.accent} relative overflow-hidden group`}>
      {/* Absolute background accent on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10 ${theme.bg}`} />
      
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">{title}</p>
          <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight transition-transform duration-300 group-hover:translate-x-1">{value}</h3>
          {subtext && (
            <p className="text-xs text-gray-500 font-medium">{subtext}</p>
          )}
        </div>

        <div className={`p-3.5 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-sm ${theme.iconBg}`}>
          <ActiveIcon className="w-6 h-6 stroke-[2]" />
        </div>
      </div>
    </div>
  );
}
