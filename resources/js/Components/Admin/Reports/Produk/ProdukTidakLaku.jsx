import React, { useState } from 'react';
import { Clock, PackageX, Tag, Percent } from 'lucide-react';
import ReportTable from '../Shared/ReportTable';

export default function ProdukTidakLaku({ slow_moving, dead_stock }) {
  const [activeTab, setActiveTab] = useState('slow');

  const formatRupiah = (val) => {
    if (val == null) return 'Rp 0';
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  const slow = slow_moving || [];
  const dead = dead_stock || [];

  const slowColumns = [
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
    { key: 'stok', label: 'Stok', render: (row) => <span className="font-medium">{row.stok || row.qty || 0}</span> },
    {
      key: 'terakhir_terjual',
      label: 'Terakhir Terjual',
      render: (row) => <span className="text-sm text-gray-600">{row.terakhir_terjual || row.terjual_terakhir || '-'}</span>,
    },
    {
      key: 'hari_tanpa_penjualan',
      label: 'Hari Tanpa Penjualan',
      render: (row) => (
        <span className={`text-sm font-medium ${(row.hari_tanpa_penjualan || 0) > 60 ? 'text-red-500' : 'text-amber-500'}`}>
          {row.hari_tanpa_penjualan || row.hari || 0} hari
        </span>
      ),
    },
    {
      key: 'aksi',
      label: 'Aksi',
      render: () => (
        <button className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors">
          Rekomendasikan Diskon
        </button>
      ),
    },
  ];

  const deadColumns = [
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
    { key: 'stok', label: 'Stok', render: (row) => <span className="font-medium">{row.stok || row.qty || 0}</span> },
    {
      key: 'nilai_stok',
      label: 'Nilai Stok',
      render: (row) => <span className="font-medium text-red-500">{formatRupiah(row.nilai_stok || row.nilai || 0)}</span>,
    },
    {
      key: 'tersedia_di',
      label: 'Tersedia di Outlet',
      render: (row) => (
        <span className="text-sm text-gray-600">{row.tersedia_di || row.outlet || '-'}</span>
      ),
    },
    {
      key: 'aksi',
      label: 'Aksi',
      render: () => (
        <button className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
          Tandai untuk Clearance
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('slow')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'slow'
                ? 'border-amber-500 text-amber-600 bg-amber-50/30'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock size={18} />
            <span>Slow Moving</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-600">{slow.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('dead')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'dead'
                ? 'border-red-500 text-red-600 bg-red-50/30'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <PackageX size={18} />
            <span>Dead Stock</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">{dead.length}</span>
          </button>
        </div>
        <div className="p-6">
          {activeTab === 'slow' ? (
            slow.length > 0 ? (
              <ReportTable columns={slowColumns} data={slow} pagination pageSize={10} />
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-base font-medium text-gray-500">Tidak ada produk slow moving</p>
                <p className="text-sm mt-1">Semua produk bergerak dengan baik</p>
              </div>
            )
          ) : dead.length > 0 ? (
            <ReportTable columns={deadColumns} data={dead} pagination pageSize={10} />
          ) : (
            <div className="text-center py-12 text-gray-400">
              <PackageX className="w-12 h-12 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-base font-medium text-gray-500">Tidak ada dead stock</p>
              <p className="text-sm mt-1">Semua produk pernah terjual</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
