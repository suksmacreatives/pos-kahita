import React from 'react';
import { CreditCard, Wallet, Banknote, Smartphone, Building2 } from 'lucide-react';
import ReportStatCard from '../Shared/ReportStatCard';
import ReportChart from '../Shared/ReportChart';
import ReportTable from '../Shared/ReportTable';

const METODE_ICONS = {
  tunai: Banknote,
  transfer: CreditCard,
  kartu_debit: CreditCard,
  e_wallet: Smartphone,
  transfer_bank: Building2,
  qris: Smartphone,
};

const METODE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444'];
const METODE_COLOR_MAP = ['emerald', 'blue', 'amber', 'purple', 'cyan', 'red'];

const METODE_LABEL = {
  tunai: 'Tunai',
  transfer: 'Transfer',
  kartu_debit: 'Kartu Debit',
  e_wallet: 'E-Wallet',
  transfer_bank: 'Transfer Bank',
  qris: 'QRIS',
};

export default function LaporanMetodeBayar({ metode_bayar }) {
  const formatRupiah = (val) => {
    if (val == null) return 'Rp 0';
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  const entries = Object.entries(metode_bayar || {}).map(([key, val]) => ({
    key,
    label: METODE_LABEL[key] || key,
    ...val,
    nilai: val.nilai || val.total || val.omset || 0,
    jumlah: val.jumlah || val.count || val.transaksi || 0,
  }));

  const totalNilai = entries.reduce((sum, e) => sum + e.nilai, 0);

  const pieData = entries.map((e, i) => ({
    name: e.label,
    value: e.nilai,
    fill: METODE_COLORS[i % METODE_COLORS.length],
  }));

  const columns = [
    { key: 'metode', label: 'Metode Pembayaran', render: (row) => {
      const Icon = METODE_ICONS[row.key] || CreditCard;
      return (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${METODE_COLOR_MAP[entries.indexOf(row)] || 'gray'}-100 text-${METODE_COLOR_MAP[entries.indexOf(row)] || 'gray'}-600`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-medium text-gray-900">{row.label}</span>
        </div>
      );
    }},
    { key: 'jumlah', label: 'Transaksi' },
    { key: 'nilai', label: 'Total Nilai', render: (row) => <span className="font-medium text-emerald-600">{formatRupiah(row.nilai)}</span> },
    {
      key: 'persen',
      label: 'Proporsi',
      render: (row) => {
        const pct = totalNilai > 0 ? ((row.nilai / totalNilai) * 100).toFixed(1) : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-20 bg-gray-100 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{ width: `${pct}%`, backgroundColor: METODE_COLORS[entries.indexOf(row) % METODE_COLORS.length] }}
              />
            </div>
            <span className="text-sm text-gray-600">{pct}%</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {entries.map((e, i) => {
          const Icon = METODE_ICONS[e.key] || CreditCard;
          return (
            <ReportStatCard
              key={e.key}
              title={e.label}
              value={formatRupiah(e.nilai)}
              sub={`${e.jumlah} transaksi`}
              color={METODE_COLOR_MAP[i % METODE_COLOR_MAP.length]}
              icon={Icon}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Proporsi Metode Pembayaran</h3>
          <div className="flex justify-center">
            <ReportChart type="pie" data={pieData} config={{ colors: METODE_COLORS }} height={300} />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Detail Metode Pembayaran</h3>
          <ReportTable columns={columns} data={entries} pagination={false} />
        </div>
      </div>
    </div>
  );
}
