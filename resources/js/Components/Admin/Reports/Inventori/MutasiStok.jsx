import React, { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowLeftRight, RotateCcw } from 'lucide-react';
import ReportStatCard from '../Shared/ReportStatCard';
import ReportChart from '../Shared/ReportChart';
import ReportTable from '../Shared/ReportTable';

const TIPE_MUTASI = ['all', 'masuk', 'keluar', 'transfer', 'retur'];
const TIPE_LABEL = { all: 'Semua Tipe', masuk: 'Masuk', keluar: 'Keluar', transfer: 'Transfer', retur: 'Retur' };
const TIPE_ICONS = { masuk: ArrowDown, keluar: ArrowUp, transfer: ArrowLeftRight, retur: RotateCcw };
const TIPE_COLORS = { masuk: 'emerald', keluar: 'red', transfer: 'blue', retur: 'amber' };

export default function MutasiStok({ mutasi_log, mutasi_summary }) {
  const [filterTipe, setFilterTipe] = useState('all');

  const formatRupiah = (val) => {
    if (val == null) return 'Rp 0';
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  const summary = mutasi_summary || {};
  const logs = (mutasi_log || []).filter(
    (m) => filterTipe === 'all' || (m.tipe || m.type) === filterTipe
  );

  const summaryCards = [
    { title: 'Stok Masuk', value: summary.masuk || summary.masuk_qty || 0, sub: `${summary.masuk_trx || 0} transaksi`, color: 'emerald', icon: ArrowDown, key: 'masuk' },
    { title: 'Stok Keluar', value: summary.keluar || summary.keluar_qty || 0, sub: `${summary.keluar_trx || 0} transaksi`, color: 'red', icon: ArrowUp, key: 'keluar' },
    { title: 'Transfer', value: summary.transfer || summary.transfer_qty || 0, sub: `${summary.transfer_trx || 0} transaksi`, color: 'blue', icon: ArrowLeftRight, key: 'transfer' },
    { title: 'Retur', value: summary.retur || summary.retur_qty || 0, sub: `${summary.retur_trx || 0} transaksi`, color: 'amber', icon: RotateCcw, key: 'retur' },
  ];

  const chartData = logs.length > 0
    ? logs.reduce((acc, log) => {
        const tgl = log.tanggal || log.date || log.created_at;
        if (!tgl) return acc;
        const key = typeof tgl === 'string' ? tgl.slice(0, 10) : tgl;
        if (!acc.find((d) => d.tanggal === key)) {
          acc.push({ tanggal: key, masuk: 0, keluar: 0, transfer: 0, retur: 0 });
        }
        const entry = acc.find((d) => d.tanggal === key);
        const tipe = log.tipe || log.type;
        const qty = log.qty || log.quantity || 0;
        if (entry) entry[tipe] = (entry[tipe] || 0) + qty;
        return acc;
      }, [])
    : [];

  const columns = [
    {
      key: 'waktu',
      label: 'Waktu',
      render: (row) => {
        const tgl = row.tanggal || row.date || row.created_at || '';
        return <span className="text-sm text-gray-600">{tgl ? String(tgl).slice(0, 16) : '-'}</span>;
      },
    },
    {
      key: 'tipe',
      label: 'Tipe',
      render: (row) => {
        const tipe = row.tipe || row.type || '';
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            tipe === 'masuk' ? 'bg-emerald-50 text-emerald-700' :
            tipe === 'keluar' ? 'bg-red-50 text-red-700' :
            tipe === 'transfer' ? 'bg-blue-50 text-blue-700' :
            tipe === 'retur' ? 'bg-amber-50 text-amber-700' :
            'bg-gray-50 text-gray-600'
          }`}>
            {tipe}
          </span>
        );
      },
    },
    {
      key: 'produk',
      label: 'Produk',
      render: (row) => <span className="font-medium text-gray-900">{row.nama_produk || row.produk || row.nama || '-'}</span>,
    },
    { key: 'qty', label: 'Qty', render: (row) => <span className="font-medium">{row.qty || row.quantity || 0}</span> },
    { key: 'dari', label: 'Dari', render: (row) => <span className="text-sm text-gray-600">{row.dari || row.sumber || '-'}</span> },
    { key: 'ke', label: 'Ke', render: (row) => <span className="text-sm text-gray-600">{row.ke || row.tujuan || '-'}</span> },
    { key: 'referensi', label: 'Referensi', render: (row) => <span className="text-xs text-gray-400">{row.referensi || row.ref || '-'}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, i) => (
          <ReportStatCard
            key={i}
            title={card.title}
            value={card.value}
            sub={card.sub}
            color={card.color}
            icon={card.icon}
          />
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Tren Mutasi Stok</h3>
        {chartData.length > 0 ? (
          <ReportChart
            type="line"
            data={chartData}
            config={{
              xKey: 'tanggal',
              lines: [
                { dataKey: 'masuk', stroke: '#10b981', name: 'Masuk' },
                { dataKey: 'keluar', stroke: '#ef4444', name: 'Keluar' },
                { dataKey: 'transfer', stroke: '#3b82f6', name: 'Transfer' },
              ],
            }}
            height={280}
          />
        ) : (
          <div className="h-[280px] flex items-center justify-center text-gray-400">Belum ada data mutasi</div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-4">
          {TIPE_MUTASI.map((tipe) => (
            <button
              key={tipe}
              onClick={() => setFilterTipe(tipe)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filterTipe === tipe ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {TIPE_LABEL[tipe]}
            </button>
          ))}
        </div>
        <ReportTable columns={columns} data={logs} pagination pageSize={10} />
      </div>
    </div>
  );
}
