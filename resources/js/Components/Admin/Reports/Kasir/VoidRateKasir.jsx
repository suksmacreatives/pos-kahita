import React from 'react';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import ReportChart from '../Shared/ReportChart';
import ReportTable from '../Shared/ReportTable';

export default function VoidRateKasir({ void_stats }) {
  const formatRupiah = (val) => {
    if (val == null) return 'Rp 0';
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  const data = (void_stats || []).map((k) => ({
    ...k,
    void_rate: k.void_rate || k.rate || 0,
    total_trx: k.total_trx || k.transaksi || k.trx || 0,
    void_count: k.void_count || k.void || 0,
  }));

  const highVoid = data.filter((k) => k.void_rate > 5);

  const chartData = data.map((k) => ({
    name: k.nama || k.kasir || '-',
    rate: k.void_rate,
    fill: k.void_rate > 5 ? '#ef4444' : k.void_rate > 2 ? '#f59e0b' : '#10b981',
  }));

  const columns = [
    {
      key: 'kasir',
      label: 'Kasir',
      render: (row) => <span className="font-medium text-gray-900">{row.nama || row.kasir || '-'}</span>,
    },
    { key: 'outlet', label: 'Outlet', render: (row) => <span className="text-sm text-gray-600">{row.outlet || '-'}</span> },
    { key: 'total_trx', label: 'Total Transaksi' },
    { key: 'void_count', label: 'Void' },
    {
      key: 'void_rate',
      label: 'Void Rate',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-20 bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${row.void_rate > 5 ? 'bg-red-500' : row.void_rate > 2 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(row.void_rate * 10, 100)}%` }}
            />
          </div>
          <span className={`text-sm font-medium ${
            row.void_rate > 5 ? 'text-red-600' : row.void_rate > 2 ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            {row.void_rate}%
          </span>
        </div>
      ),
    },
    {
      key: 'trend',
      label: 'Trend',
      render: (row) => {
        if (row.trend === 'up') return <TrendingUp className="w-4 h-4 text-red-500" />;
        if (row.trend === 'down') return <TrendingDown className="w-4 h-4 text-emerald-500" />;
        return <span className="text-gray-400">-</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {highVoid.length > 0 && (
        <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-red-800">
              {highVoid.length} kasir memiliki void rate di atas 5%!
            </h4>
            <p className="text-sm text-red-600 mt-1">
              {highVoid.map((k) => k.nama || k.kasir).join(', ')} — perlu evaluasi dan pelatihan.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Void Rate per Kasir</h3>
            <p className="text-sm text-gray-500">Garis merah menunjukkan threshold 5%</p>
          </div>
        </div>
        <div className="relative">
          <ReportChart
            type="bar"
            data={chartData}
            config={{ xKey: 'name', bars: [{ dataKey: 'rate', fill: '#ef4444', name: 'Void Rate' }] }}
            height={300}
          />
          <div
            className="absolute top-0 left-0 right-0 border-t-2 border-dashed border-red-400 z-10"
            style={{ top: `${(1 - 5 / Math.max(...chartData.map((d) => d.rate), 5)) * 100 * 0.85 + 8}%` }}
          >
            <span className="absolute -top-4 right-0 text-xs text-red-500 font-medium">Threshold 5%</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Detail Void Rate Kasir</h3>
        <ReportTable columns={columns} data={data} pagination={false} />
      </div>
    </div>
  );
}
