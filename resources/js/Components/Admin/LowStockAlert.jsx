import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';

export default function LowStockAlert({ items = [] }) {
  return (
    <div className="bg-white border border-gray-100/80 rounded-2xl p-5 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="pb-4 border-b border-gray-50/60 mb-5 flex items-center justify-between">
        <div>
          <h5 className="font-bold text-sm text-gray-900 leading-none tracking-tight">Peringatan Stok Kritis</h5>
          <p className="text-[11px] text-gray-400 mt-1.5 font-medium">Bahan & produk di bawah batas minimum</p>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100/40">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{items.length} Barang</span>
        </span>
      </div>

      {/* Content list */}
      <div className="flex-grow overflow-y-auto max-h-[350px] scrollbar-thin space-y-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xs text-gray-800 font-bold">Semua Stok Aman</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Tidak ada item di bawah batas minimum</p>
          </div>
        ) : (
          items.map((item) => {
            const percentage = Math.min(100, Math.round((item.stock / item.minStock) * 100));
            const isCritical = percentage < 25;

            return (
              <div key={item.id} className="group p-3 border border-gray-50 hover:border-gray-100 rounded-xl hover:bg-gray-50/20 transition-all duration-200">
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate leading-none">{item.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-1 tracking-wider uppercase">{item.sku}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-bold ${isCritical ? 'text-rose-600' : 'text-amber-600'}`}>
                      {item.stock}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium"> / {item.minStock} pcs</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCritical ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-medium">{item.category} &bull; {item.outlet ? item.outlet.toUpperCase() : 'Pusat'}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isCritical ? 'text-rose-600' : 'text-amber-600'}`}>
                    {percentage}% Tersisa
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
