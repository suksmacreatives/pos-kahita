import React, { useState } from 'react';
import { XCircle, CornerUpLeft, AlertTriangle, User, DollarSign, X } from 'lucide-react';
import ReportStatCard from '../Shared/ReportStatCard';
import ReportChart from '../Shared/ReportChart';
import ReportTable from '../Shared/ReportTable';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function LaporanVoidRefund({ void_list, refund_list }) {
  const [activeTab, setActiveTab] = useState('void');
  const [modalDetail, setModalDetail] = useState(null);

  const formatRupiah = (val) => {
    if (val == null) return 'Rp 0';
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  const voids = void_list || [];
  const refunds = refund_list || [];

  const totalVoid = voids.reduce((sum, v) => sum + (v.total_void || v.nilai || v.total || 0), 0);
  const totalRefund = refunds.reduce((sum, r) => sum + (r.total_refund || r.nilai || r.total || 0), 0);

  const alasanVoidMap = {};
  voids.forEach((v) => {
    const alasan = v.alasan_void || v.alasan || 'Lainnya';
    alasanVoidMap[alasan] = (alasanVoidMap[alasan] || 0) + (v.total_void || v.nilai || v.total || 0);
  });
  const alasanChartData = Object.entries(alasanVoidMap).map(([name, value]) => ({ name, value }));

  const voidColumns = [
    {
      key: 'tanggal',
      label: 'Waktu',
      render: (row) => format(new Date(row.tanggal_transaksi || row.tanggal || row.created_at), 'dd MMM yyyy HH:mm', { locale: id }),
    },
    {
      key: 'nomor',
      label: 'No. Transaksi',
      render: (row) => (
        <button
          onClick={() => setModalDetail({ type: 'void', data: row })}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          {row.nomor_transaksi || row.nomor || '-'}
        </button>
      ),
    },
    { key: 'kasir', label: 'Kasir', render: (row) => row.kasir_nama || row.kasir || '-' },
    { key: 'outlet', label: 'Outlet', render: (row) => row.outlet_nama || row.outlet || '-' },
    {
      key: 'nilai',
      label: 'Nilai Void',
      render: (row) => <span className="font-medium text-red-500">{formatRupiah(row.total_void || row.nilai || row.total)}</span>,
    },
    {
      key: 'alasan',
      label: 'Alasan',
      render: (row) => (
        <span className="text-xs text-gray-500 max-w-[150px] truncate block">{row.alasan_void || row.alasan || '-'}</span>
      ),
    },
  ];

  const refundColumns = [
    {
      key: 'tanggal',
      label: 'Waktu',
      render: (row) => format(new Date(row.tanggal_refund || row.tanggal || row.created_at), 'dd MMM yyyy HH:mm', { locale: id }),
    },
    {
      key: 'nomor',
      label: 'No. Refund',
      render: (row) => (
        <button
          onClick={() => setModalDetail({ type: 'refund', data: row })}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          {row.nomor_refund || row.nomor || '-'}
        </button>
      ),
    },
    { key: 'kasir', label: 'Kasir', render: (row) => row.kasir_nama || row.kasir || '-' },
    {
      key: 'nilai',
      label: 'Nilai Refund',
      render: (row) => <span className="font-medium text-orange-500">{formatRupiah(row.total_refund || row.nilai || row.total)}</span>,
    },
    {
      key: 'metode',
      label: 'Metode',
      render: (row) => (
        <span className="capitalize text-sm">{row.metode_refund || row.metode || '-'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ReportStatCard
          title="Total Void"
          value={voids.length.toString()}
          sub={`${formatRupiah(totalVoid)} nilai void`}
          color="red"
          icon={XCircle}
        />
        <ReportStatCard
          title="Total Refund"
          value={refunds.length.toString()}
          sub={`${formatRupiah(totalRefund)} nilai refund`}
          color="orange"
          icon={CornerUpLeft}
        />
        <ReportStatCard
          title="Total Kerugian"
          value={formatRupiah(totalVoid + totalRefund)}
          sub={`${voids.length + refunds.length} transaksi`}
          color="amber"
          icon={DollarSign}
        />
        <ReportStatCard
          title="Kasir Tertinggi Void"
          value="-"
          sub="Lihat detail di tabel"
          color="gray"
          icon={User}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Distribusi Alasan Void</h3>
          {alasanChartData.length > 0 ? (
            <ReportChart
              type="bar"
              data={alasanChartData}
              config={{ xKey: 'name', bars: [{ dataKey: 'value', fill: '#ef4444', name: 'Nilai Void' }] }}
              height={250}
            />
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">Tidak ada data void</div>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Ringkasan</h3>
          <div className="space-y-4">
            {Object.entries(alasanVoidMap).length > 0 ? (
              Object.entries(alasanVoidMap).map(([alasan, nilai], i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-700 capitalize">{alasan}</span>
                  <span className="text-sm font-semibold text-red-500">{formatRupiah(nilai)}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-sm">Tidak ada void/refund pada periode ini</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('void')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'void'
                ? 'border-red-500 text-red-600 bg-red-50/30'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <XCircle size={18} />
            <span>Void</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">{voids.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('refund')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'refund'
                ? 'border-orange-500 text-orange-600 bg-orange-50/30'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <CornerUpLeft size={18} />
            <span>Refund</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-600">{refunds.length}</span>
          </button>
        </div>
        <div className="p-6">
          {activeTab === 'void' ? (
            <ReportTable columns={voidColumns} data={voids} pagination pageSize={10} />
          ) : (
            <ReportTable columns={refundColumns} data={refunds} pagination pageSize={10} />
          )}
        </div>
      </div>

      {modalDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {modalDetail.type === 'void' ? <XCircle className="text-red-500" /> : <CornerUpLeft className="text-orange-500" />}
                Detail {modalDetail.type === 'void' ? 'Void' : 'Refund'}
              </h2>
              <button
                onClick={() => setModalDetail(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <div className="text-xs text-gray-500 mb-1">No. Transaksi</div>
                  <div className="font-medium text-gray-900">{modalDetail.data.nomor_transaksi || modalDetail.data.nomor || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Outlet</div>
                  <div className="font-medium text-gray-900">{modalDetail.data.outlet_nama || modalDetail.data.outlet || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Kasir</div>
                  <div className="font-medium text-gray-900">{modalDetail.data.kasir_nama || modalDetail.data.kasir || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Tanggal</div>
                  <div className="font-medium text-gray-900">
                    {format(new Date(modalDetail.data.tanggal_transaksi || modalDetail.data.tanggal || modalDetail.data.created_at || new Date()), 'dd MMM yyyy')}
                  </div>
                </div>
              </div>
              {(modalDetail.data.items || modalDetail.data.items_refund || []).length > 0 && (
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-3">Item</h3>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(modalDetail.type === 'void' ? modalDetail.data.items : modalDetail.data.items_refund || []).map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3">
                              <div className="font-medium text-sm text-gray-900">{item.nama_produk || item.produk || '-'}</div>
                              {item.warna && <div className="text-xs text-gray-500">{item.warna}{item.ukuran ? ` - ${item.ukuran}` : ''}</div>}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.qty}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatRupiah(item.harga_jual || item.harga || 0)}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatRupiah(item.subtotal || item.total_refund || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <div className={`p-4 rounded-xl border ${modalDetail.type === 'void' ? 'bg-red-50/50 border-red-100' : 'bg-orange-50/50 border-orange-100'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Alasan</div>
                    <div className="font-medium text-gray-900">{modalDetail.data.alasan_void || modalDetail.data.alasan_refund || modalDetail.data.alasan || '-'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-500 mb-1">Total {modalDetail.type === 'void' ? 'Void' : 'Refund'}</div>
                    <div className={`text-3xl font-bold ${modalDetail.type === 'void' ? 'text-red-600' : 'text-orange-600'}`}>
                      {formatRupiah(modalDetail.data.total_void || modalDetail.data.total_refund || modalDetail.data.nilai || modalDetail.data.total || 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
              <button
                onClick={() => setModalDetail(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
