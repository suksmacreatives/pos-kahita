import React, { useState, useMemo } from 'react';
import { CornerUpLeft, ArrowDownCircle, AlertCircle, PackageX } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import LaporanStatCard from './LaporanStatCard';
import LaporanTable from './LaporanTable';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function LaporanRefund({ filteredRefund, modalDetail, setModalDetail }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua Status');

    const formatRupiah = (val) => `Rp ${val.toLocaleString('id-ID')}`;

    const totalNilaiRefund = filteredRefund.reduce((sum, item) => sum + item.total_refund, 0);
    
    // Alasan Terbanyak
    const alasanCount = {};
    filteredRefund.forEach(r => {
        alasanCount[r.alasan_refund] = (alasanCount[r.alasan_refund] || 0) + 1;
    });
    const topAlasan = Object.entries(alasanCount).sort((a, b) => b[1] - a[1])[0] || ['-', 0];

    // Produk Refund Terbanyak
    const produkCount = {};
    filteredRefund.forEach(r => {
        r.items_refund.forEach(item => {
            produkCount[item.nama_produk] = (produkCount[item.nama_produk] || 0) + item.qty;
        });
    });
    const topProduk = Object.entries(produkCount).sort((a, b) => b[1] - a[1])[0] || ['-', 0];

    const tableData = useMemo(() => {
        return filteredRefund.filter(r => {
            const matchStatus = statusFilter === 'Semua Status' || r.status === statusFilter.toLowerCase();
            const matchSearch = r.nomor_refund.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                r.nomor_transaksi_asal.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                r.pelanggan_nama.toLowerCase().includes(searchQuery.toLowerCase());
            return matchStatus && matchSearch;
        });
    }, [filteredRefund, statusFilter, searchQuery]);

    const ALASAN_COLORS = {
        'Produk cacat/rusak': '#EF4444', // red
        'Ukuran tidak sesuai': '#F59E0B', // amber
        'Warna tidak sesuai': '#F97316', // orange
        'Produk tidak seperti deskripsi': '#6B7280' // gray
    };

    const chartData = Object.entries(alasanCount).map(([name, value]) => ({ name, value }));

    const getAlasanColorClass = (alasan) => {
        if (alasan.includes('cacat')) return 'bg-red-100 text-red-800';
        if (alasan.includes('Ukuran')) return 'bg-amber-100 text-amber-800';
        if (alasan.includes('Warna')) return 'bg-orange-100 text-orange-800';
        return 'bg-gray-100 text-gray-800';
    };

    const tableColumns = [
        { 
            key: 'nomor_refund', 
            label: 'No. Refund', 
            sortable: true,
            render: (row) => (
                <button 
                    onClick={() => setModalDetail({ isOpen: true, type: 'refund', data: row })}
                    className="font-mono text-emerald-600 hover:text-emerald-800 font-medium"
                >
                    {row.nomor_refund}
                </button>
            )
        },
        { 
            key: 'tanggal_refund', 
            label: 'Tgl Refund', 
            sortable: true,
            render: (row) => format(new Date(row.tanggal_refund), 'dd MMM yyyy', { locale: id })
        },
        { key: 'outlet_nama', label: 'Outlet', sortable: true },
        { key: 'pelanggan_nama', label: 'Pelanggan', sortable: true },
        { 
            key: 'produk', 
            label: 'Produk',
            render: (row) => {
                const item1 = row.items_refund[0];
                const others = row.items_refund.length - 1;
                return (
                    <div className="text-sm">
                        <span className="font-medium">{item1.nama_produk}</span>
                        {others > 0 && <span className="text-gray-500 ml-1">+{others} lainnya</span>}
                    </div>
                );
            }
        },
        { 
            key: 'alasan_refund', 
            label: 'Alasan', 
            sortable: true,
            render: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAlasanColorClass(row.alasan_refund)}`}>
                    {row.alasan_refund}
                </span>
            )
        },
        { 
            key: 'metode_refund', 
            label: 'Metode', 
            sortable: true,
            render: (row) => (
                <span className="capitalize font-medium text-gray-700 flex items-center gap-1">
                    {row.metode_refund === 'cash' ? <span className="w-2 h-2 rounded-full bg-emerald-500"></span> : <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                    {row.metode_refund}
                </span>
            )
        },
        { 
            key: 'total_refund', 
            label: 'Total', 
            sortable: true,
            render: (row) => <span className="font-medium text-orange-600">{formatRupiah(row.total_refund)}</span>
        },
        { 
            key: 'status', 
            label: 'Status', 
            sortable: true,
            render: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                    row.status === 'selesai' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                    {row.status}
                </span>
            )
        },
        {
            key: 'action',
            label: 'Detail',
            render: (row) => (
                <button
                    onClick={() => setModalDetail({ isOpen: true, type: 'refund', data: row })}
                    className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                >
                    Lihat
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* 4 Cards Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <LaporanStatCard
                    icon={CornerUpLeft}
                    title="Total Refund"
                    value={filteredRefund.length.toString()}
                    sub="transaksi direfund"
                    color="orange"
                />
                <LaporanStatCard
                    icon={ArrowDownCircle}
                    title="Nilai Refund"
                    value={formatRupiah(totalNilaiRefund)}
                    sub="total dikembalikan ke pelanggan"
                    color="orange"
                />
                <LaporanStatCard
                    icon={AlertCircle}
                    title="Alasan Terbanyak"
                    value={topAlasan[0]}
                    sub={`${topAlasan[1]} transaksi`}
                    color="amber"
                />
                <LaporanStatCard
                    icon={PackageX}
                    title="Produk Refund Terbanyak"
                    value={topProduk[0]}
                    sub={`${topProduk[1]} kali direfund`}
                    color="gray"
                />
            </div>

            {/* Grafik Alasan Refund */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-full md:w-1/3">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Alasan Refund</h3>
                    <p className="text-sm text-gray-500">Distribusi alasan pengembalian dana</p>
                </div>
                <div className="w-full md:w-2/3 flex items-center h-[160px]">
                    <div className="w-1/2 h-full relative">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={ALASAN_COLORS[entry.name] || '#9CA3AF'} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Tidak ada data</div>
                        )}
                    </div>
                    <div className="w-1/2 pl-4 space-y-2">
                        {chartData.map((entry, idx) => (
                            <div key={idx} className="flex items-center text-sm">
                                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: ALASAN_COLORS[entry.name] || '#9CA3AF' }} />
                                <span className="text-gray-700 truncate" title={entry.name}>{entry.name}</span>
                                <span className="ml-auto font-medium text-gray-900">{entry.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabel Refund */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
                    <input
                        type="text"
                        placeholder="Cari no refund, trx asal, pelanggan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full sm:w-72 pl-3 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white border border-gray-200 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:w-48 p-2"
                    >
                        <option value="Semua Status">Semua Status</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Selesai">Selesai</option>
                    </select>
                </div>
                <LaporanTable
                    columns={tableColumns}
                    data={tableData}
                    pagination={true}
                    pageSize={10}
                />
            </div>
        </div>
    );
}
