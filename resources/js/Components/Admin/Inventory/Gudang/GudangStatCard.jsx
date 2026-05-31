import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpDown, AlertCircle } from 'lucide-react';

export default function GudangStatCard({ title, value, sub, icon, color = 'emerald', trend, percentage, alert }) {
  const colorMap = {
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', iconBg: 'bg-emerald-100' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', iconBg: 'bg-blue-100' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600', iconBg: 'bg-amber-100' },
    rose: { bg: 'bg-rose-100', text: 'text-rose-600', iconBg: 'bg-rose-100' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', iconBg: 'bg-purple-100' },
  };
  const c = colorMap[color] || colorMap.emerald;
  const IconComponent = icon || ArrowUpDown;
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex items-start space-x-4 relative overflow-hidden">
      {alert && (
        <span className="absolute top-2 right-2 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
        </span>
      )}
      <div className={`p-3 ${c.iconBg} rounded-xl shrink-0`}>
        <IconComponent className={`h-6 w-6 ${c.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
        <p className={`text-2xl font-bold text-gray-900 mt-0.5 ${c.text}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
        {TrendIcon && percentage != null && !isNaN(percentage) && (
          <div className={`flex items-center text-sm mt-1 ${percentage >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            <TrendIcon className="h-4 w-4 mr-1" />
            <span className="font-semibold">{Math.abs(percentage)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
