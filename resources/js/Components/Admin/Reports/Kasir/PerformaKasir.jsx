import React, { useState } from 'react';
import { Award, DollarSign, ShoppingCart, XCircle, TrendingUp } from 'lucide-react';
import ReportChart from '../Shared/ReportChart';
import ReportTable from '../Shared/ReportTable';

export default function PerformaKasir({ kasir_stats }) {
  const [sortMode, setSortMode] = useState('omset');

  const formatRupiah = (val) => {
    if (val == null) return 'Rp 0';
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  const data = (kasir_stats || [])
    .map((k) => ({
      ...k,
      omset: k.omset || k.total || 0,
      transaksi: k.transaksi || k.trx || k.count || 0,
      void_rate: k.void_rate || k.rate || 0,
      avg_transaksi: k.avg_transaksi || k.avg || Math.round((k.omset || 0) / (k.transaksi || 1)),
    }))
    .sort((a, b) => {
      if (sortMode === 'omset') return b.omset - a.omset;
      if (sortMode === 'transaksi') return b.transaksi - a.transaksi;
      return b.void_rate - a.void_rate;
    });

  const chartBar = data.slice(0, 10).map((k, i) => ({
    name: k.nama || k.kasir || `Kasir ${i + 1}`,
    value: sortMode === 'omset' ? k.omset : sortMode === 'transaksi' ? k.transaksi : k.void_rate,
    fill: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#6366f1'][i],
  }));

  const columns = [
    {
      key: 'rank',
      label: 'Rank',
      render: (row, idx) => {
        const rank = idx + 1;
        return (
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
            rank === 1 ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-300' :
            rank === 2 ? 'bg-gray-200 text-gray-700 ring-2 ring-gray-300' :
            rank === 3 ? 'bg-orange-100 text-orange-800 ring-2 ring-orange-300' :
            'bg-gray-50 text-gray-500'
          }`}>
            {rank <= 3 ? <Award size={14} /> : rank}
          </span>
        );
      },
    },
    {
      key: 'kasir',
      label: 'Kasir',
      render: (row) => (
        <div>
          <span className="font-medium text-gray-900">{row.nama || row.kasir || '-'}</span>
          {row.outlet && <div className="text-xs text-gray-500">{row.outlet}</div>}
        </div>
      ),
    },
    { key: 'outlet', label: 'Outlet', render: (row) => <span className="text-sm text-gray-600">{row.outlet || '-'}</span> },
    { key: 'transaksi', label: 'Transaksi' },
    {
      key: 'omset',
      label: 'Omset',
      render: (row) => <span className="font-medium text-emerald-600">{formatRupiah(row.omset)}</span>,
    },
    {
      key: 'void_rate',
      label: 'Void Rate',
      render: (row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          row.void_rate <= 2 ? 'bg-emerald-50 text-emerald-700' :
          row.void_rate <= 5 ? 'bg-amber-50 text-amber-700' :
          'bg-red-50 text-red-700'
        }`}>
          {row.void_rate}%
        </span>
      ),
    },
    {
      key: 'avg_transaksi',
      label: 'Avg/Trx',
      render: (row) => <span className="text-sm text-gray-600">{formatRupiah(row.avg_transaksi)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center justify-between gap-4">
        <h3 className="font-bold text-gray-900">Leaderboard Kasir</h3>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { key: 'omset', label: 'Omset', icon: DollarSign },
            { key: 'transaksi', label: 'Transaksi', icon: ShoppingCart },
            { key: 'void', label: 'Void Rate', icon: XCircle },
          ].map((o) => (
            <button
              key={o.key}
              onClick={() => setSortMode(o.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                sortMode === o.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <o.icon size={16} />
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {sortMode === 'omset' ? 'Omset per Kasir' : sortMode === 'transaksi' ? 'Transaksi per Kasir' : 'Void Rate per Kasir'}
        </h3>
        <ReportChart
          type="bar"
          data={chartBar}
          config={{
            xKey: 'name',
            bars: [{
              dataKey: 'value',
              fill: sortMode === 'void' ? '#ef4444' : '#10b981',
              name: sortMode === 'omset' ? 'Omset' : sortMode === 'transaksi' ? 'Transaksi' : 'Void Rate',
            }],
          }}
          height={300}
        />
      </div>

      <div>
        <ReportTable columns={columns} data={data} pagination={false} />
      </div>
    </div>
  );
}
