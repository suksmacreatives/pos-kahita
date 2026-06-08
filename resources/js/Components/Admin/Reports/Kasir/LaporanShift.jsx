import React from 'react';
import { Sun, Moon, Sunrise } from 'lucide-react';
import ReportTable from '../Shared/ReportTable';

const SHIFT_LABELS = { pagi: 'Pagi (06-14)', siang: 'Siang (14-22)', malam: 'Malam (22-06)' };
const SHIFT_ICONS = { pagi: Sunrise, siang: Sun, malam: Moon };
const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export default function LaporanShift({ shift_stats }) {
  const formatRupiah = (val) => {
    if (val == null) return 'Rp 0';
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  const data = shift_stats || {};

  const heatmap = data.heatmap || data.matrix || [];
  const shifts = data.shifts || data.detail || [];

  const maxValue = heatmap.length > 0
    ? Math.max(...heatmap.flatMap((r) => (r.data || r.values || []).map((v) => (typeof v === 'object' ? v.value : v) || 0)), 1)
    : 1;

  const shiftProduktif = data.shift_terproduktif || data.shift_paling_produktif || '';

  const columns = [
    {
      key: 'shift',
      label: 'Shift',
      render: (row) => {
        const Icon = SHIFT_ICONS[row.shift] || Sunrise;
        return (
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-900">{SHIFT_LABELS[row.shift] || row.shift}</span>
          </div>
        );
      },
    },
    { key: 'hari', label: 'Hari', render: (row) => <span className="text-sm text-gray-600">{row.hari || '-'}</span> },
    { key: 'kasir', label: 'Kasir', render: (row) => <span className="font-medium">{row.kasir || row.nama || '-'}</span> },
    { key: 'transaksi', label: 'Transaksi' },
    {
      key: 'omset',
      label: 'Omset',
      render: (row) => <span className="font-medium text-emerald-600">{formatRupiah(row.omset || row.total || 0)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {shiftProduktif && (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3">
            <Sun className="w-8 h-8 text-emerald-100" />
            <div>
              <p className="text-emerald-100 text-sm font-medium">Shift Paling Produktif</p>
              <h3 className="text-xl font-bold mt-1">{shiftProduktif}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Heatmap Shift</h3>
        {heatmap.length > 0 && HARI.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase w-24">Shift / Hari</th>
                  {HARI.map((h) => (
                    <th key={h} className="p-2 text-center text-xs font-medium text-gray-500 uppercase min-w-[70px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['pagi', 'siang', 'malam'].map((shift, rowIdx) => {
                  const row = heatmap.find((r) => r.shift === shift || r.label === shift) || heatmap[rowIdx] || {};
                  const values = row.data || row.values || [];
                  return (
                    <tr key={shift}>
                      <td className="p-2 text-sm font-medium text-gray-700 whitespace-nowrap">
                        {SHIFT_LABELS[shift] || shift}
                      </td>
                      {HARI.map((_, colIdx) => {
                        const cell = typeof values[colIdx] === 'object' ? values[colIdx].value : values[colIdx] || 0;
                        const intensity = cell / maxValue;
                        const bgColor = intensity > 0
                          ? `rgba(16, 185, 129, ${Math.min(intensity + 0.15, 0.95)})`
                          : '#f9fafb';
                        const textColor = intensity > 0.5 ? 'white' : '#374151';
                        return (
                          <td
                            key={colIdx}
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
          <div className="text-center py-8 text-gray-400">Tidak ada data shift</div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Detail per Shift</h3>
        <ReportTable columns={columns} data={shifts} pagination pageSize={10} />
      </div>
    </div>
  );
}
