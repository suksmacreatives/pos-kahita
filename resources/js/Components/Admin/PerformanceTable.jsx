import React from 'react';
import { TrendingUp, TrendingDown, Award } from 'lucide-react';

export default function PerformanceTable({ data = [] }) {
  // Format currency helper (Indonesian Rupiah)
  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="bg-white border border-gray-100/80 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-50/60 flex items-center justify-between">
        <div>
          <h5 className="font-bold text-sm text-gray-900 leading-none tracking-tight">Kinerja Penjualan Cabang</h5>
          <p className="text-[11px] text-gray-400 mt-1.5 font-medium">Peringkat & performa finansial per outlet</p>
        </div>
      </div>

      {/* Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/40">
              <th className="pl-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-16 text-center">Rank</th>
              <th className="px-4 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Outlet</th>
              <th className="px-4 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Pendapatan</th>
              <th className="px-4 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Transaksi</th>
              <th className="px-4 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Rata-Rata Tiket (AOV)</th>
              <th className="pr-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Pertumbuhan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50/50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-xs text-gray-400">
                  Data kinerja outlet tidak tersedia.
                </td>
              </tr>
            ) : (
              data.map((outlet, index) => {
                const rank = index + 1;
                const isTop1 = rank === 1;

                return (
                  <tr key={outlet.name} className="hover:bg-gray-50/40 transition-colors group">
                    {/* Rank Badge */}
                    <td className="pl-5 py-3.5 text-center">
                      {isTop1 ? (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-600 border border-amber-200/50 shadow-sm animate-pulse">
                          <Award className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-gray-400 font-mono">{rank}</span>
                      )}
                    </td>

                    {/* Outlet Name */}
                    <td className="px-4 py-3.5 text-xs text-gray-800 font-bold group-hover:text-emerald-600 transition-colors">
                      {outlet.name}
                    </td>

                    {/* Revenue */}
                    <td className="px-4 py-3.5 text-xs font-semibold text-gray-900 text-right font-mono">
                      {formatIDR(outlet.revenue)}
                    </td>

                    {/* Transactions */}
                    <td className="px-4 py-3.5 text-xs text-gray-600 text-center font-mono font-medium">
                      {outlet.transactions}
                    </td>

                    {/* AOV */}
                    <td className="px-4 py-3.5 text-xs text-gray-600 text-right font-mono">
                      {formatIDR(outlet.aov)}
                    </td>

                    {/* Growth indicator */}
                    <td className="pr-5 py-3.5 text-xs text-right">
                      <span className={`inline-flex items-center gap-0.5 font-bold ${
                        outlet.growth >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {outlet.growth >= 0 ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        <span>{Math.abs(outlet.growth)}%</span>
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
