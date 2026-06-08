import React from 'react';
import { Warehouse, Package, DollarSign } from 'lucide-react';
import ReportStatCard from '../Shared/ReportStatCard';
import ReportChart from '../Shared/ReportChart';
import ReportTable from '../Shared/ReportTable';

const LOKASI_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4'];

export default function NilaiInventori({ nilai_per_lokasi, nilai_per_kategori }) {
  const formatRupiah = (val) => {
    if (val == null) return 'Rp 0';
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  const lokasi = nilai_per_lokasi || [];
  const kategori = nilai_per_kategori || [];

  const totalNilai = lokasi.reduce((sum, l) => sum + (l.nilai || l.total || 0), 0);
  const totalSKU = lokasi.reduce((sum, l) => sum + (l.total_sku || l.sku || 0), 0);
  const totalQty = lokasi.reduce((sum, l) => sum + (l.total_qty || l.qty || 0), 0);

  const chartData = kategori.map((k, i) => ({
    name: k.nama || k.kategori,
    nilai: k.nilai || k.total || 0,
    fill: LOKASI_COLORS[i % LOKASI_COLORS.length],
  }));

  const columns = [
    {
      key: 'produk',
      label: 'Produk',
      render: (row) => <span className="font-medium text-gray-900">{row.nama || row.produk || '-'}</span>,
    },
    { key: 'kategori', label: 'Kategori', render: (row) => <span className="text-sm text-gray-600">{row.kategori || '-'}</span> },
    { key: 'qty', label: 'Qty', render: (row) => <span className="font-medium">{row.qty || row.stok || 0}</span> },
    {
      key: 'harga_beli',
      label: 'Harga Beli',
      render: (row) => <span className="text-sm text-gray-600">{formatRupiah(row.harga_beli || row.hpp || 0)}</span>,
    },
    {
      key: 'nilai_total',
      label: 'Nilai Total',
      render: (row) => <span className="font-medium text-emerald-600">{formatRupiah(row.nilai_total || row.nilai || 0)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm font-medium">Total Nilai Inventori</p>
            <h2 className="text-3xl font-bold mt-1">{formatRupiah(totalNilai)}</h2>
            <p className="text-emerald-100 text-sm mt-1">
              {totalSKU} SKU · {totalQty} unit
            </p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Warehouse className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {lokasi.map((l, i) => (
          <ReportStatCard
            key={i}
            title={l.nama || l.lokasi || `Lokasi ${i + 1}`}
            value={formatRupiah(l.nilai || l.total || 0)}
            sub={`${l.total_sku || l.sku || 0} SKU`}
            color={['emerald', 'blue', 'amber', 'purple', 'cyan'][i % 5]}
            icon={Package}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Nilai per Kategori</h3>
          <ReportChart
            type="bar"
            data={chartData}
            config={{ xKey: 'name', bars: [{ dataKey: 'nilai', fill: '#10b981', name: 'Nilai' }] }}
            height={300}
          />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Nilai per Lokasi</h3>
          <ReportChart
            type="pie"
            data={lokasi.map((l, i) => ({ name: l.nama || l.lokasi, value: l.nilai || l.total || 0 }))}
            config={{ colors: LOKASI_COLORS }}
            height={300}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Detail Nilai Inventori</h3>
        <ReportTable columns={columns} data={nilai_per_kategori || []} pagination pageSize={10} />
      </div>
    </div>
  );
}
