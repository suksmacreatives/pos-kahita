import React from 'react';
import { Info } from 'lucide-react';

export default function AnalisisVarian({ varian_stats }) {
  const data = varian_stats || {};

  const ukuranList = data.ukuran || data.sizes || [];
  const warnaList = data.warna || data.colors || [];
  const heatmapData = data.heatmap || data.matrix || [];
  const insights = data.insights || [];

  const maxValue = Math.max(
    ...heatmapData.flatMap((row) =>
      (row.data || row.values || []).map((v) => (typeof v === 'object' ? v.value : v) || 0)
    ),
    1
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Heatmap Ukuran & Warna</h3>

        {ukuranList.length > 0 && warnaList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase w-24">Warna / Ukuran</th>
                  {ukuranList.map((u) => (
                    <th key={u} className="p-2 text-center text-xs font-medium text-gray-500 uppercase min-w-[60px]">
                      {u}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {warnaList.map((warna, rowIdx) => {
                  const rowData = heatmapData.find((r) => r.warna === warna || r.label === warna) ||
                    heatmapData[rowIdx] || {};
                  const values = rowData.data || rowData.values || [];
                  return (
                    <tr key={warna}>
                      <td className="p-2 text-sm font-medium text-gray-700 whitespace-nowrap">{warna}</td>
                      {ukuranList.map((ukuran, colIdx) => {
                        const cell =
                          typeof values[colIdx] === 'object'
                            ? values[colIdx].value
                            : values[colIdx] || 0;
                        const intensity = cell / maxValue;
                        const bgColor = intensity > 0
                          ? `rgba(16, 185, 129, ${Math.min(intensity + 0.15, 0.95)})`
                          : '#f9fafb';
                        const textColor = intensity > 0.5 ? 'white' : '#374151';
                        return (
                          <td
                            key={`${warna}-${ukuran}`}
                            className="p-2 text-center text-sm font-medium rounded-lg"
                            style={{ backgroundColor: bgColor, color: textColor }}
                          >
                            {cell || '-'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>Tidak ada data varian untuk ditampilkan</p>
          </div>
        )}

        {insights.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              Insight
            </h4>
            {insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-800">{insight}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
