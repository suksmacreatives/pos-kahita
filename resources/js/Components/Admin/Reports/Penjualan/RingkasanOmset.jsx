import React, { useState } from 'react';
import { DollarSign, TrendingUp, PiggyBank, Receipt } from 'lucide-react';
import ReportStatCard from '../Shared/ReportStatCard';
import ReportChart from '../Shared/ReportChart';
import ReportTable from '../Shared/ReportTable';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function RingkasanOmset({ ringkasan, omset_harian }) {
  const [chartMode, setChartMode] = useState('keduanya');

  const formatRupiah = (val) => {
    if (val == null) return 'Rp 0';
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  const growthOmset = ringkasan?.total_pendapatan_lalu
    ? (((ringkasan.total_pendapatan - ringkasan.total_pendapatan_lalu) / ringkasan.total_pendapatan_lalu) * 100).toFixed(1)
    : null;

  const growthTransaksi = ringkasan?.jumlah_transaksi_lalu
    ? (((ringkasan.jumlah_transaksi - ringkasan.jumlah_transaksi_lalu) / ringkasan.jumlah_transaksi_lalu) * 100).toFixed(1)
    : null;

  const marginKotor = ringkasan?.total_pendapatan
    ? ((ringkasan.laba_kotor / ringkasan.total_pendapatan) * 100).toFixed(1)
    : '0.0';

  const chartData = (omset_harian || []).map((d) => ({
    ...d,
    tanggal: d.tanggal ? format(new Date(d.tanggal), 'dd MMM', { locale: id }) : d.tanggal,
  }));

  const tableColumns = [
    {
      key: 'tanggal',
      label: 'Tanggal',
      render: (row) => (row.tanggal ? format(new Date(row.tanggal), 'dd MMM yyyy', { locale: id }) : '-'),
    },
    { key: 'transaksi', label: 'Transaksi' },
    {
      key: 'omset',
      label: 'Omset',
      render: (row) => <span className="font-medium text-emerald-600">{formatRupiah(row.omset)}</span>,
    },
    {
      key: 'diskon',
      label: 'Diskon',
      render: (row) => <span className="text-red-500">{formatRupiah(row.diskon)}</span>,
    },
    {
      key: 'laba',
      label: 'Laba',
      render: (row) => <span className="font-medium text-blue-600">{formatRupiah(row.laba)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportStatCard
          title="Total Pendapatan"
          value={formatRupiah(ringkasan?.total_pendapatan)}
          sub={`${ringkasan?.jumlah_transaksi || 0} transaksi`}
          color="emerald"
          icon={DollarSign}
          trend={
            growthOmset
              ? {
                  value: growthOmset,
                  direction: growthOmset >= 0 ? 'up' : 'down',
                  label: 'vs periode lalu',
                }
              : undefined
          }
        />
        <ReportStatCard
          title="Laba Kotor"
          value={formatRupiah(ringkasan?.laba_kotor)}
          sub={`Margin ${marginKotor}%`}
          color="blue"
          icon={TrendingUp}
        />
        <ReportStatCard
          title="Laba Bersih"
          value={formatRupiah(ringkasan?.laba_bersih)}
          sub={`${ringkasan?.diskon_total ? formatRupiah(ringkasan.diskon_total) : 'Rp 0'} diskon`}
          color="purple"
          icon={PiggyBank}
        />
        <ReportStatCard
          title="Rata-rata Transaksi"
          value={formatRupiah(ringkasan?.rata_transaksi)}
          sub={`${growthTransaksi ? `${growthTransaksi}% transaksi` : '-'}`}
          color="amber"
          icon={Receipt}
          trend={
            growthTransaksi
              ? {
                  value: growthTransaksi,
                  direction: growthTransaksi >= 0 ? 'up' : 'down',
                  label: 'vs periode lalu',
                }
              : undefined
          }
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Tren Omset & Transaksi</h3>
            <p className="text-sm text-gray-500">Pergerakan pendapatan dan volume transaksi harian</p>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['omset', 'transaksi', 'keduanya'].map((mode) => (
              <button
                key={mode}
                onClick={() => setChartMode(mode)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                  chartMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {mode === 'keduanya' ? 'Keduanya' : mode}
              </button>
            ))}
          </div>
        </div>
        {chartMode === 'omset' ? (
          <ReportChart
            type="bar"
            data={chartData}
            config={{ xKey: 'tanggal', bars: [{ dataKey: 'omset', fill: '#10b981', name: 'Omset' }] }}
            height={280}
          />
        ) : chartMode === 'transaksi' ? (
          <ReportChart
            type="line"
            data={chartData}
            config={{ xKey: 'tanggal', lines: [{ dataKey: 'transaksi', stroke: '#3b82f6', name: 'Transaksi' }] }}
            height={280}
          />
        ) : (
          <ReportChart
            type="composed"
            data={chartData}
            config={{
              xKey: 'tanggal',
              bars: [{ dataKey: 'omset', fill: '#10b981', name: 'Omset' }],
              lines: [{ dataKey: 'transaksi', stroke: '#3b82f6', name: 'Transaksi' }],
            }}
            height={280}
          />
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Detail Transaksi Harian</h3>
        <ReportTable columns={tableColumns} data={chartData} pagination pageSize={10} />
      </div>
    </div>
  );
}
