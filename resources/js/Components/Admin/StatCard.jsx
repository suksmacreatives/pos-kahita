import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function StatCard({ 
  title, 
  value, 
  change, 
  trend = 'up', // 'up' | 'down' | 'neutral'
  comparisonText = 'vs bulan lalu', 
  icon: Icon,
  color = 'emerald' // 'emerald' | 'blue' | 'amber' | 'red' | 'indigo'
}) {
  // Map color schemes for the icon wrapper
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100/30',
      badge: 'bg-emerald-50 text-emerald-700'
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600 border-blue-100/30',
      badge: 'bg-blue-50 text-blue-700'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600 border-amber-100/30',
      badge: 'bg-amber-50 text-amber-700'
    },
    red: {
      bg: 'bg-red-50 text-red-600 border-red-100/30',
      badge: 'bg-red-50 text-red-700'
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600 border-indigo-100/30',
      badge: 'bg-indigo-50 text-indigo-700'
    }
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className="bg-white border border-gray-100/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-full group">
      <div className="flex justify-between items-start">
        {/* Title & value */}
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
          <h4 className="text-2xl font-bold text-gray-900 mt-2.5 tracking-tight truncate group-hover:text-emerald-950 transition-colors">
            {value}
          </h4>
        </div>

        {/* Icon slot */}
        {Icon && (
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${scheme.bg} shadow-inner shrink-0 transition-transform duration-300 group-hover:scale-105`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Footer info: change & subtext */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50/60">
        {change !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-lg shrink-0 ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-700' :
            trend === 'down' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'
          }`}>
            {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
            {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
            {trend === 'neutral' && <Minus className="w-3.5 h-3.5" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
        <span className="text-[11px] text-gray-400 truncate">{comparisonText}</span>
      </div>
    </div>
  );
}
