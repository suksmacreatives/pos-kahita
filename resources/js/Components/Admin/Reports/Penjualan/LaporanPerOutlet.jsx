import React from 'react';
import { Store, TrendingUp, DollarSign, ShoppingCart, Target } from 'lucide-react';
import ReportStatCard from '../Shared/ReportStatCard';
import ReportChart from '../Shared/ReportChart';
import ReportTable from '../Shared/ReportTable';

const OUTLET_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4'];
const OUTLET_COLOR_MAP = ['emerald', 'blue', 'amber', 'purple', 'cyan'];

export default function LaporanPerOutlet({ per_outlet, omset_perbandingan }) {
  const formatRupiah = (val) => {
    if (val == null) return 'Rp 0';
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  const data = per_outlet || [];
  const comparisonData = omset_perbandingan || [];

  const topOutlet = data.length > 0 ? data.reduce((a, b) => (a.omset > b.omset ? a : b)) : null;

  const chartData = data.map((o, i) => ({
    name: o.nama || o.outlet,
    omset: o.omset || 0,
    transaksi: o.transaksi || 0,
    fill: OUTLET_COLORS[i % OUTLET_COLORS.length],
  }));

  const columns = [
    {
      key: 'rank',
      label: 'Rank',
      render: (row, i) => (
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
          row.rank === 1 ? 'bg-amber-100 text-amber-700' :
          row.rank === 2 ? 'bg-gray-200 text-gray-700' :
          row.rank === 3 ? 'bg-orange-100 text-orange-800' :
          'bg-gray-50 text-gray-500'
        }`}>
          {row.rank}
        </span>
      ),
    },
    { key: 'nama', label: 'Outlet', render: (row) => <span className="font-medium text-gray-900">{row.nama || row.outlet}</span> },
    { key: 'omset', label: 'Omset', render: (row) => <span className="font-medium text-emerald-600">{formatRupiah(row.omset)}</span> },
    {
      key: 'growth',
      label: 'Growth',
      render: (row) => (
        <span className={`font-medium ${row.growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {row.growth != null ? `${row.growth >= 0 ? '+' : ''}${row.growth}%` : '-'}
        </span>
      ),
    },
    {
      key: 'avg_transaksi',
      label: 'Avg/Trx',
      render: (row) => formatRupiah(Math.round((row.omset || 0) / (row.transaksi || 1))),
    },
  ];

  return (
    <div className="space-y-6">
      {topOutlet && (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Outlet Terbaik</p>
              <h3 className="text-2xl font-bold mt-1">{topOutlet.nama || topOutlet.outlet}</h3>
              <p className="text-emerald-100 text-sm mt-1">
                {formatRupiah(topOutlet.omset)} · {topOutlet.transaksi} transaksi
              </p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <Store className="w-7 h-7" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.map((o, i) => (
          <ReportStatCard
            key={i}
            title={o.nama || o.outlet}
            value={formatRupiah(o.omset)}
            sub={`${o.transaksi || 0} transaksi`}
            color={OUTLET_COLOR_MAP[i % OUTLET_COLOR_MAP.length]}
            icon={Store}
            trend={
              o.growth != null
                ? { value: Math.abs(o.growth), direction: o.growth >= 0 ? 'up' : 'down', label: 'growth' }
                : undefined
            }
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Perbandingan Omset</h3>
          <ReportChart
            type="bar"
            data={chartData}
            config={{
              xKey: 'name',
              bars: [
                { dataKey: 'omset', fill: '#10b981', name: 'Omset' },
                { dataKey: 'transaksi', fill: '#3b82f6', name: 'Transaksi' },
              ],
            }}
            height={300}
          />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Target Progress</h3>
          {data.map((o, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{o.nama || o.outlet}</span>
                <span className="text-sm text-gray-500">
                  {o.target != null
                    ? `${((o.omset / o.target) * 100).toFixed(0)}%`
                    : '-'}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all"
                  style={{
                    width: o.target ? `${Math.min((o.omset / o.target) * 100, 100)}%` : '0%',
                    backgroundColor: OUTLET_COLORS[i % OUTLET_COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Ranking Outlet</h3>
        <ReportTable
          columns={columns}
          data={data.map((o, i) => ({ ...o, rank: i + 1 }))}
          pagination={false}
        />
      </div>
    </div>
  );
}
