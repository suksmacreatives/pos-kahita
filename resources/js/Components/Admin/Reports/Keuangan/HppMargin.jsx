import React from 'react';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import ReportChart from '../Shared/ReportChart';
import ReportTable from '../Shared/ReportTable';

export default function HppMargin({ hpp_stats, margin_per_produk }) {
  const formatRupiah = (val) => {
    if (val == null) return 'Rp 0';
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  const marginData = margin_per_produk || hpp_stats?.margin_per_produk || hpp_stats?.detail || [];
  const kategoriData = hpp_stats?.per_kategori || hpp_stats?.kategori || [];

  const lowMargin = marginData.filter(
    (p) => (p.margin_persen || p.margin || 0) < 20
  );

  const chartData = (kategoriData.length > 0 ? kategoriData : []).map((k, i) => ({
    name: k.nama || k.kategori,
    margin: k.margin_persen || k.margin || 0,
    fill: k.margin >= 30 ? '#10b981' : k.margin >= 20 ? '#f59e0b' : '#ef4444',
  }));

  const columns = [
    {
      key: 'produk',
      label: 'Produk',
      render: (row) => (
        <div>
          <div className="font-medium text-sm text-gray-900">{row.nama || row.produk || '-'}</div>
          <div className="text-xs text-gray-500">{row.kategori || '-'}</div>
        </div>
      ),
    },
    {
      key: 'harga_beli',
      label: 'Harga Beli',
      render: (row) => <span className="text-sm text-gray-600">{formatRupiah(row.harga_beli || row.hpp || row.beli || 0)}</span>,
    },
    {
      key: 'harga_jual',
      label: 'Harga Jual',
      render: (row) => <span className="text-sm text-gray-600">{formatRupiah(row.harga_jual || row.jual || 0)}</span>,
    },
    {
      key: 'margin_rp',
      label: 'Margin Rp',
      render: (row) => {
        const marginRp = row.margin_rp || row.margin_rupiah || (row.harga_jual - row.harga_beli) || 0;
        return <span className="font-medium text-gray-900">{formatRupiah(marginRp)}</span>;
      },
    },
    {
      key: 'margin_persen',
      label: 'Margin %',
      render: (row) => {
        const margin = row.margin_persen || row.margin || 0;
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            margin >= 30 ? 'bg-emerald-50 text-emerald-700' :
            margin >= 20 ? 'bg-amber-50 text-amber-700' :
            'bg-red-50 text-red-700'
          }`}>
            {margin}%
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {lowMargin.length > 0 && (
        <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-800">
              {lowMargin.length} produk memiliki margin di bawah 20%
            </h4>
            <p className="text-sm text-amber-600 mt-1">Perlu evaluasi harga jual atau negosiasi ulang harga beli.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase">Rata-rata Margin</p>
          <p className="text-3xl font-bold mt-2 text-emerald-600">
            {hpp_stats?.rata_margin || hpp_stats?.avg_margin || 0}%
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase">Total HPP</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{formatRupiah(hpp_stats?.total_hpp || hpp_stats?.total || 0)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase">Produk dengan Margin Terendah</p>
          <p className="text-3xl font-bold mt-2 text-red-500">{lowMargin.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Margin per Kategori</h3>
          {chartData.length > 0 ? (
            <ReportChart
              type="bar"
              data={chartData}
              config={{ xKey: 'name', bars: [{ dataKey: 'margin', fill: '#10b981', name: 'Margin %' }] }}
              height={300}
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">Belum ada data</div>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            Produk Margin Rendah (Perlu Review)
          </h3>
          {lowMargin.length > 0 ? (
            <div className="space-y-3">
              {lowMargin.slice(0, 10).map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{p.nama || p.produk || '-'}</div>
                    <div className="text-xs text-gray-500">{p.kategori || '-'}</div>
                  </div>
                  <span className="text-sm font-bold text-red-500">
                    {p.margin_persen || p.margin || 0}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Semua produk memiliki margin yang baik
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Detail Margin Produk</h3>
        <ReportTable columns={columns} data={marginData} pagination pageSize={10} />
      </div>
    </div>
  );
}
