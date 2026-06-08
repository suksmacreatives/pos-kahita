import React, { useState } from 'react';
import { Award, TrendingUp, DollarSign, Package } from 'lucide-react';
import ReportChart from '../Shared/ReportChart';
import ReportTable from '../Shared/ReportTable';

export default function ProdukTerlaris({ top_products, per_kategori }) {
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('qty');
  const [filterKategori, setFilterKategori] = useState('all');

  const formatRupiah = (val) => {
    if (val == null) return 'Rp 0';
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  const kategoriList = per_kategori || [];
  const products = (top_products || []).filter(
    (p) => filterKategori === 'all' || p.kategori === filterKategori
  );

  const sorted = [...products]
    .sort((a, b) => {
      const aVal = sortBy === 'qty' ? (a.terjual || a.qty || 0) : (a.revenue || a.omset || 0);
      const bVal = sortBy === 'qty' ? (b.terjual || b.qty || 0) : (b.revenue || b.omset || 0);
      return bVal - aVal;
    })
    .slice(0, limit);

  const barChartData = sorted.slice(0, 10).map((p, i) => ({
    name: (p.nama || p.produk || '').length > 15
      ? (p.nama || p.produk || '').slice(0, 15) + '...'
      : p.nama || p.produk,
    value: sortBy === 'qty' ? (p.terjual || p.qty || 0) : (p.revenue || p.omset || 0),
    fill: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#6366f1'][i],
  }));

  const pieData = (kategoriList.length > 0 ? kategoriList : []).map((k, i) => ({
    name: k.nama || k.kategori || `Kategori ${i + 1}`,
    value: k.revenue || k.omset || k.total || 0,
  }));

  const avgHarga = (row) => {
    const qty = row.terjual || row.qty || 0;
    const rev = row.revenue || row.omset || 0;
    return qty > 0 ? formatRupiah(Math.round(rev / qty)) : '-';
  };

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
            {rank <= 3 ? (
              <Award size={14} />
            ) : rank}
          </span>
        );
      },
    },
    {
      key: 'produk',
      label: 'Produk',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {row.foto ? (
              <img src={row.foto} alt="" className="w-full h-full object-cover" />
            ) : (
              <Package className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <div className="font-medium text-sm text-gray-900">{row.nama || row.produk || '-'}</div>
            <div className="text-xs text-gray-500">{row.kategori || '-'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'kategori',
      label: 'Kategori',
      render: (row) => <span className="text-sm text-gray-600">{row.kategori || '-'}</span>,
    },
    {
      key: 'terjual',
      label: 'Terjual',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
          {row.terjual || row.qty || 0}
        </span>
      ),
    },
    {
      key: 'revenue',
      label: 'Revenue',
      render: (row) => <span className="font-medium text-gray-900">{formatRupiah(row.revenue || row.omset)}</span>,
    },
    {
      key: 'avg_harga',
      label: 'Avg Harga',
      render: (row) => <span className="text-sm text-gray-500">{avgHarga(row)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[10, 20, 50].map((n) => (
              <button
                key={n}
                onClick={() => setLimit(n)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  limit === n ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Top {n}
              </button>
            ))}
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'qty', label: 'By Qty' },
              { key: 'revenue', label: 'By Revenue' },
            ].map((o) => (
              <button
                key={o.key}
                onClick={() => setSortBy(o.key)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  sortBy === o.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="bg-white border border-gray-200 text-sm font-medium rounded-lg px-3 py-1.5 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">Semua Kategori</option>
            {kategoriList.map((k, i) => (
              <option key={i} value={k.nama || k.kategori}>
                {k.nama || k.kategori}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top 10 Produk</h3>
          <ReportChart
            type="bar"
            data={barChartData}
            config={{ xKey: 'name', bars: [{ dataKey: 'value', fill: '#10b981', name: sortBy === 'qty' ? 'Terjual' : 'Revenue' }] }}
            height={300}
          />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Kontribusi per Kategori</h3>
          <div className="flex justify-center">
            <ReportChart type="pie" data={pieData} height={300} />
          </div>
        </div>
      </div>

      <div>
        <ReportTable columns={columns} data={sorted} pagination={false} />
      </div>
    </div>
  );
}
