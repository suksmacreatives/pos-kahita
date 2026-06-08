import React from 'react';
import { Percent, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import ReportStatCard from '../Shared/ReportStatCard';
import ReportChart from '../Shared/ReportChart';
import ReportTable from '../Shared/ReportTable';

export default function AnalisisDiskon({ diskon_stats, promo_performance }) {
  const formatRupiah = (val) => {
    if (val == null) return 'Rp 0';
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  const stats = diskon_stats || {};
  const promos = promo_performance || [];

  const totalDiskon = stats.total_diskon || stats.total || 0;
  const revenueImpact = stats.revenue_impact || stats.dampak_revenue || 0;
  const totalPemakaian = stats.total_pemakaian || stats.pemakaian || 0;
  const efektivitas = stats.efektivitas || stats.effectiveness || 0;

  const chartData = promos.map((p, i) => ({
    name: (p.nama || p.promo || p.kode || '').length > 12
      ? (p.nama || p.promo || p.kode || '').slice(0, 12) + '...'
      : p.nama || p.promo || p.kode || '',
    diskon: p.nilai_diskon || p.diskon || 0,
    revenue: p.revenue || p.pendapatan || 0,
    fill: (p.roi || 0) >= 3 ? '#10b981' : (p.roi || 0) >= 1 ? '#f59e0b' : '#ef4444',
  }));

  const columns = [
    {
      key: 'promo',
      label: 'Promo',
      render: (row) => (
        <div>
          <div className="font-medium text-sm text-gray-900">{row.nama || row.promo || '-'}</div>
          {row.kode && <div className="text-xs text-gray-400">Kode: {row.kode}</div>}
        </div>
      ),
    },
    { key: 'kode', label: 'Kode', render: (row) => <span className="text-sm text-gray-600">{row.kode || '-'}</span> },
    { key: 'pemakaian', label: 'Pemakaian', render: (row) => <span className="font-medium">{row.pemakaian || row.count || 0}</span> },
    {
      key: 'nilai_diskon',
      label: 'Nilai Diskon',
      render: (row) => <span className="text-sm text-red-500">{formatRupiah(row.nilai_diskon || row.diskon || 0)}</span>,
    },
    {
      key: 'revenue',
      label: 'Revenue',
      render: (row) => <span className="font-medium text-emerald-600">{formatRupiah(row.revenue || row.pendapatan || 0)}</span>,
    },
    {
      key: 'roi',
      label: 'ROI',
      render: (row) => {
        const roi = row.roi || 0;
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            roi >= 3 ? 'bg-emerald-50 text-emerald-700' :
            roi >= 1 ? 'bg-amber-50 text-amber-700' :
            'bg-red-50 text-red-700'
          }`}>
            {roi.toFixed(1)}x
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportStatCard
          title="Total Diskon Diberikan"
          value={formatRupiah(totalDiskon)}
          sub={`${totalPemakaian} kali pemakaian`}
          color="red"
          icon={Percent}
        />
        <ReportStatCard
          title="Revenue Impact"
          value={formatRupiah(revenueImpact)}
          sub="dampak terhadap penjualan"
          color="emerald"
          icon={DollarSign}
        />
        <ReportStatCard
          title="Efektivitas Diskon"
          value={`${efektivitas}%`}
          sub="rasio diskon vs revenue"
          color={efektivitas >= 30 ? 'emerald' : efektivitas >= 15 ? 'amber' : 'red'}
          icon={TrendingUp}
          trend={
            stats.trend_efektivitas
              ? { value: Math.abs(stats.trend_efektivitas), direction: stats.trend_efektivitas >= 0 ? 'up' : 'down', label: 'vs periode lalu' }
              : undefined
          }
        />
        <ReportStatCard
          title="ROI Rata-rata"
          value={`${stats.roi_rata || stats.avg_roi || 0}x`}
          sub="revenue tambahan / diskon"
          color={(stats.roi_rata || stats.avg_roi || 0) >= 3 ? 'emerald' : (stats.roi_rata || stats.avg_roi || 0) >= 1 ? 'amber' : 'red'}
          icon={TrendingUp}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Performa Promo & Diskon</h3>
        {promos.length > 0 ? (
          <ReportChart
            type="bar"
            data={chartData}
            config={{
              xKey: 'name',
              bars: [
                { dataKey: 'diskon', fill: '#ef4444', name: 'Nilai Diskon' },
                { dataKey: 'revenue', fill: '#10b981', name: 'Revenue' },
              ],
            }}
            height={300}
          />
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-400">Belum ada data promo</div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Detail Promo</h3>
        <ReportTable columns={columns} data={promos} pagination pageSize={10} />
      </div>
    </div>
  );
}
