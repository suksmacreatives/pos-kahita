import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import ReportChart from '../Shared/ReportChart';
import ReportTable from '../Shared/ReportTable';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#ec4899', '#14b8a6'];

const KATEGORI_COLORS = {
  Atasan: '#10b981',
  Bawahan: '#3b82f6',
  Dress: '#f59e0b',
  Outer: '#8b5cf6',
  Gamis: '#06b6d4',
  Hijab: '#ec4899',
  Aksesoris: '#14b8a6',
};

export default function AnalisisKategori({ kategori_stats }) {
  const formatRupiah = (val) => {
    if (val == null) return 'Rp 0';
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  const data = (kategori_stats || []).map((k) => ({
    ...k,
    label: k.nama || k.kategori,
    margin: k.margin_rata || k.margin || 0,
    terjual: k.terjual || k.qty || 0,
    revenue: k.revenue || k.omset || 0,
    trend: k.trend || 'neutral',
  }));

  const barData = data.map((k, i) => ({
    name: k.label,
    revenue: k.revenue,
    terjual: k.terjual,
    fill: KATEGORI_COLORS[k.label] || COLORS[i % COLORS.length],
  }));

  const columns = [
    {
      key: 'kategori',
      label: 'Kategori',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: KATEGORI_COLORS[row.label] || COLORS[0] }}
          />
          <span className="font-medium text-gray-900">{row.label}</span>
        </div>
      ),
    },
    {
      key: 'revenue',
      label: 'Revenue',
      render: (row) => <span className="font-medium text-emerald-600">{formatRupiah(row.revenue)}</span>,
    },
    { key: 'terjual', label: 'Qty Terjual' },
    {
      key: 'margin',
      label: 'Margin Rata-rata',
      render: (row) => (
        <span className={`font-medium ${row.margin >= 30 ? 'text-emerald-600' : row.margin >= 20 ? 'text-amber-500' : 'text-red-500'}`}>
          {row.margin}%
        </span>
      ),
    },
    {
      key: 'trend',
      label: 'Trend',
      render: (row) => {
        if (row.trend === 'up') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
        if (row.trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
        return <Minus className="w-4 h-4 text-gray-400" />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue per Kategori</h3>
        <ReportChart
          type="bar"
          data={barData}
          config={{
            xKey: 'name',
            bars: [
              { dataKey: 'revenue', fill: '#10b981', name: 'Revenue' },
              { dataKey: 'terjual', fill: '#93c5fd', name: 'Terjual' },
            ],
          }}
          height={320}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((k, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: KATEGORI_COLORS[k.label] || COLORS[i % COLORS.length] }}
                />
                <h4 className="font-bold text-gray-900">{k.label}</h4>
              </div>
              {k.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
              {k.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Revenue</span>
                <span className="font-semibold text-gray-900">{formatRupiah(k.revenue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Terjual</span>
                <span className="font-semibold text-gray-900">{k.terjual}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Margin</span>
                <span className={`font-semibold ${k.margin >= 30 ? 'text-emerald-600' : k.margin >= 20 ? 'text-amber-500' : 'text-red-500'}`}>
                  {k.margin}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <ReportTable columns={columns} data={data} pagination={false} />
      </div>
    </div>
  );
}
