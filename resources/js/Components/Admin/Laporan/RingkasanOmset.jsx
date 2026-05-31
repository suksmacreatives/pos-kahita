import React, { useState } from 'react';
import { DollarSign, TrendingUp, PiggyBank, Receipt, Award } from 'lucide-react';
import LaporanStatCard from './LaporanStatCard';
import OmsetChart from './OmsetChart';
import LaporanTable from './LaporanTable';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function RingkasanOmset({ ringkasanStats, omsetHarianData, filteredTransaksi }) {
    const [chartMode, setChartMode] = useState('keduanya'); // 'omset', 'transaksi', 'keduanya'

    const marginPersen = ringkasanStats.total_pendapatan > 0 
        ? ((ringkasanStats.laba_kotor / ringkasanStats.total_pendapatan) * 100).toFixed(1) 
        : 0;

    // Hitung produk terlaris dari filteredTransaksi
    const produkTerlarisMap = {};
    const kategoriMap = {};
    let totalItemsTerjual = 0;

    filteredTransaksi.forEach(t => {
        t.items.forEach(item => {
            if (!produkTerlarisMap[item.nama_produk]) {
                produkTerlarisMap[item.nama_produk] = {
                    nama: item.nama_produk,
                    kategori: item.kategori,
                    qty: 0,
                    revenue: 0
                };
            }
            produkTerlarisMap[item.nama_produk].qty += item.qty;
            produkTerlarisMap[item.nama_produk].revenue += item.subtotal;

            if (!kategoriMap[item.kategori]) {
                kategoriMap[item.kategori] = { qty: 0, revenue: 0 };
            }
            kategoriMap[item.kategori].qty += item.qty;
            kategoriMap[item.kategori].revenue += item.subtotal;
            totalItemsTerjual += item.qty;
        });
    });

    const topProduk = Object.values(produkTerlarisMap)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 10);

    const topKategori = Object.entries(kategoriMap)
        .map(([nama, data]) => ({ nama, ...data, persen: totalItemsTerjual > 0 ? (data.qty / totalItemsTerjual) * 100 : 0 }))
        .sort((a, b) => b.qty - a.qty);

    const formatRupiah = (val) => `Rp ${val.toLocaleString('id-ID')}`;

    // Format tabel detail harian
    const tableColumns = [
        { 
            key: 'tanggal', 
            label: 'Tanggal', 
            sortable: true,
            render: (row) => format(new Date(row.tanggal), 'dd MMM yyyy', { locale: id })
        },
        { key: 'transaksi_count', label: 'Transaksi', sortable: true },
        { 
            key: 'omset', 
            label: 'Omset', 
            sortable: true,
            render: (row) => <span className="font-medium text-emerald-600">{formatRupiah(row.omset)}</span>
        },
        { 
            key: 'avg', 
            label: 'Avg/Transaksi', 
            sortable: false,
            render: (row) => row.transaksi_count > 0 ? formatRupiah(Math.round(row.omset / row.transaksi_count)) : 'Rp 0'
        }
    ];

    const getKategoriColor = (index) => {
        const colors = ['bg-indigo-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-cyan-500'];
        return colors[index % colors.length];
    };

    return (
        <div className="space-y-6">
            {/* 4 Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <LaporanStatCard
                    icon={DollarSign}
                    title="Total Pendapatan"
                    value={formatRupiah(ringkasanStats.total_pendapatan)}
                    sub={`${ringkasanStats.jumlah_transaksi} transaksi`}
                    color="emerald"
                    trend={{ value: 12.5, label: 'vs periode lalu' }}
                />
                <LaporanStatCard
                    icon={TrendingUp}
                    title="Laba Kotor"
                    value={formatRupiah(ringkasanStats.laba_kotor)}
                    sub={`Margin ${marginPersen}%`}
                    color="blue"
                    trend={{ value: 8.2, label: 'vs periode lalu' }}
                />
                <LaporanStatCard
                    icon={PiggyBank}
                    title="Laba Bersih (Est)"
                    value={formatRupiah(ringkasanStats.laba_bersih)}
                    sub="Setelah diskon & op"
                    color="purple"
                    trend={{ value: 5.4, label: 'vs periode lalu' }}
                />
                <LaporanStatCard
                    icon={Receipt}
                    title="Rata-rata Transaksi"
                    value={formatRupiah(Math.round(ringkasanStats.rata_rata_transaksi))}
                    sub={`${ringkasanStats.transaksi_per_hari} transaksi/hari`}
                    color="amber"
                />
            </div>

            {/* Grafik */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Tren Omset & Transaksi</h3>
                        <p className="text-sm text-gray-500">Pergerakan pendapatan dan volume transaksi harian</p>
                    </div>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {['omset', 'transaksi', 'keduanya'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setChartMode(mode)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${chartMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>
                <OmsetChart data={omsetHarianData} mode={chartMode} />
            </div>

            {/* Produk Terlaris & Kategori */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Produk Terlaris */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <Award className="mr-2 text-amber-500" size={20} />
                            Produk Terlaris Periode Ini
                        </h3>
                    </div>
                    <div className="p-0">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Terjual</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {topProduk.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                                idx === 0 ? 'bg-amber-100 text-amber-700' :
                                                idx === 1 ? 'bg-gray-200 text-gray-700' :
                                                idx === 2 ? 'bg-orange-100 text-orange-800' :
                                                'bg-gray-50 text-gray-500'
                                            }`}>
                                                {idx + 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="font-medium text-sm text-gray-900">{item.nama}</div>
                                            <div className="text-xs text-gray-500">{item.kategori}</div>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                                {item.qty} pcs
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                                            {formatRupiah(item.revenue)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Ringkasan Kategori */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Penjualan per Kategori</h3>
                    <div className="space-y-6">
                        {topKategori.map((kat, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <div className="font-medium text-gray-900 text-sm">{kat.nama}</div>
                                        <div className="text-xs text-gray-500">{kat.qty} produk terjual</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900 text-sm">{formatRupiah(kat.revenue)}</div>
                                        <div className="text-xs text-gray-500">{kat.persen.toFixed(1)}%</div>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full ${getKategoriColor(idx)}`}
                                        style={{ width: `${kat.persen}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabel Detail Harian */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Detail Transaksi Harian</h3>
                <LaporanTable
                    columns={tableColumns}
                    data={[...omsetHarianData].reverse()} // Show newest first
                    pagination={true}
                    pageSize={10}
                />
            </div>
        </div>
    );
}
