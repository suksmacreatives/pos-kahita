import React from 'react';
import { AlertTriangle, AlertOctagon, Package, ShoppingCart } from 'lucide-react';
import ReportTable from '../Shared/ReportTable';

export default function StokMenipisReport({ stok_menipis, stok_habis }) {
  const formatRupiah = (val) => {
    if (val == null) return 'Rp 0';
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  const menipis = stok_menipis || [];
  const habis = stok_habis || [];

  const menipisColumns = [
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
    { key: 'outlet', label: 'Outlet', render: (row) => <span className="text-sm text-gray-600">{row.outlet || row.lokasi || '-'}</span> },
    {
      key: 'stok',
      label: 'Stok',
      render: (row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          (row.stok || row.qty || 0) <= 3 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
        }`}>
          {row.stok || row.qty || 0}
        </span>
      ),
    },
    { key: 'min', label: 'Min. Stok', render: (row) => <span className="text-sm text-gray-600">{row.min || row.minimum || row.min_stok || '-'}</span> },
    {
      key: 'estimasi_habis',
      label: 'Estimasi Habis',
      render: (row) => (
        <span className="text-sm text-red-500 font-medium">{row.estimasi_habis || row.estimasi || '-'}</span>
      ),
    },
    {
      key: 'aksi',
      label: 'Aksi',
      render: () => (
        <button className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors flex items-center gap-1">
          <ShoppingCart size={14} />
          Request Restock
        </button>
      ),
    },
  ];

  const habisColumns = [
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
    { key: 'outlet', label: 'Outlet', render: (row) => <span className="text-sm text-gray-600">{row.outlet || row.lokasi || '-'}</span> },
    {
      key: 'terakhir_ada',
      label: 'Terakhir Ada',
      render: (row) => <span className="text-sm text-gray-600">{row.terakhir_ada || row.terakhir || '-'}</span>,
    },
    {
      key: 'hari_habis',
      label: 'Sudah Habis',
      render: (row) => (
        <span className="text-sm font-medium text-red-500">{row.hari_habis || row.hari || 0} hari</span>
      ),
    },
    {
      key: 'aksi',
      label: 'Aksi',
      render: () => (
        <button className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors flex items-center gap-1">
          <ShoppingCart size={14} />
          Request Restock
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {habis.length > 0 && (
        <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <AlertOctagon className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-red-800">Ada {habis.length} produk yang stoknya habis!</h4>
            <p className="text-sm text-red-600 mt-1">Segera lakukan restock untuk menghindari kehilangan penjualan.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-gray-900">Stok Menipis</h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">{menipis.length}</span>
        </div>
        <div className="p-6">
          {menipis.length > 0 ? (
            <ReportTable columns={menipisColumns} data={menipis} pagination pageSize={10} />
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Package className="w-10 h-10 mx-auto mb-2" strokeWidth={1.5} />
              <p>Tidak ada stok yang menipis</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-red-500" />
          <h3 className="font-bold text-gray-900">Stok Habis</h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">{habis.length}</span>
        </div>
        <div className="p-6">
          {habis.length > 0 ? (
            <ReportTable columns={habisColumns} data={habis} pagination pageSize={10} />
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Package className="w-10 h-10 mx-auto mb-2" strokeWidth={1.5} />
              <p>Tidak ada stok yang habis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
