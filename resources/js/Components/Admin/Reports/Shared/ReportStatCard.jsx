import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const colorMap = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-100', border: 'border-emerald-100' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100', border: 'border-blue-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'bg-amber-100', border: 'border-amber-100' },
  red: { bg: 'bg-red-50', text: 'text-red-600', iconBg: 'bg-red-100', border: 'border-red-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100', border: 'border-purple-100' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', iconBg: 'bg-indigo-100', border: 'border-indigo-100' },
  gray: { bg: 'bg-gray-50', text: 'text-gray-600', iconBg: 'bg-gray-200', border: 'border-gray-200' },
};

export default function ReportStatCard({
  title,
  value,
  sub,
  color = 'emerald',
  icon: Icon,
  trend,
  comparison,
}) {
  const s = colorMap[color] || colorMap.gray;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
          <h4 className="text-2xl font-bold text-gray-900 mt-2 tracking-tight truncate">{value}</h4>
        </div>
        {Icon && (
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', s.iconBg, s.text)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-50/60">
        <div className="flex items-center gap-2 flex-wrap">
          {trend && (
            <div
              className={cn(
                'flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-lg',
                trend.direction === 'up'
                  ? 'bg-emerald-50 text-emerald-700'
                  : trend.direction === 'down'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-gray-50 text-gray-600'
              )}
            >
              {trend.direction === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
              {trend.direction === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
              {trend.direction === 'neutral' && <Minus className="w-3.5 h-3.5" />}
              <span>{trend.value}%</span>
            </div>
          )}
          {comparison ? (
            <span className="text-[11px] text-gray-400 truncate">{comparison.label}</span>
          ) : (
            sub && <span className="text-[11px] text-gray-400 truncate">{sub}</span>
          )}
        </div>
      </div>
    </div>
  );
}
