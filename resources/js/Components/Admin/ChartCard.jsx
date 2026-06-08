import React from 'react';

export default function ChartCard({ 
  title, 
  subtitle, 
  children, 
  headerActions 
}) {
  return (
    <div className="bg-white border border-gray-100/80 rounded-2xl p-5 shadow-sm flex flex-col h-full">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-6 pb-4 border-b border-gray-50/60">
        <div>
          <h5 className="font-bold text-sm text-gray-900 leading-none tracking-tight">{title}</h5>
          {subtitle && <p className="text-[11px] text-gray-400 mt-1.5 font-medium">{subtitle}</p>}
        </div>
        
        {headerActions && (
          <div className="flex items-center gap-2 shrink-0">
            {headerActions}
          </div>
        )}
      </div>

      {/* Chart Canvas Area */}
      <div className="flex-1 w-full min-h-[280px] md:min-h-[300px] relative">
        {children}
      </div>
    </div>
  );
}
