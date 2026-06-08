import React from 'react';
import { Layers } from 'lucide-react';

export default function DataTable({ 
  title, 
  subtitle, 
  headers = [], // Array of { key, label, align: 'left' | 'right' | 'center', render: (row) => ... }
  data = [], 
  emptyMessage = "Data tidak ditemukan",
  headerActions
}) {
  return (
    <div className="bg-white border border-gray-100/80 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
      {/* Table Header Section */}
      {(title || subtitle || headerActions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-gray-50/60">
          <div>
            {title && <h5 className="font-bold text-sm text-gray-900 leading-none tracking-tight">{title}</h5>}
            {subtitle && <p className="text-[11px] text-gray-400 mt-1.5 font-medium">{subtitle}</p>}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2 shrink-0">
              {headerActions}
            </div>
          )}
        </div>
      )}

      {/* Responsive Table Wrapper */}
      <div className="flex-grow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/40">
              {headers.map((header, idx) => (
                <th 
                  key={header.key || idx} 
                  className={`px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider ${
                    header.align === 'right' ? 'text-right' : 
                    header.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50/50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Layers className="w-8 h-8 text-gray-200 stroke-1 mb-3" />
                    <p className="text-xs font-semibold text-gray-500">{emptyMessage}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Coba sesuaikan outlet atau filter periode Anda</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr 
                  key={row.id || rowIdx} 
                  className="hover:bg-gray-50/40 transition-colors group"
                >
                  {headers.map((header, colIdx) => {
                    const value = row[header.key];
                    const align = header.align;
                    return (
                      <td 
                        key={colIdx} 
                        className={`px-5 py-3.5 text-xs text-gray-700 font-medium ${
                          align === 'right' ? 'text-right font-mono' : 
                          align === 'center' ? 'text-center' : 'text-left'
                        }`}
                      >
                        {header.render ? header.render(row) : (
                          // Default Status Badge Formatter
                          value === 'Selesai' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100/40">
                              Selesai
                            </span>
                          ) : value === 'Pending' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100/40">
                              Pending
                            </span>
                          ) : value === 'Batal' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-100/40">
                              Batal
                            </span>
                          ) : (
                            value
                          )
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
