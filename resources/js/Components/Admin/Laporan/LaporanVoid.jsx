import React, { useState, useMemo } from 'react';
import { XCircle, AlertTriangle, AlertCircle, UserMinus } from 'lucide-react';
import LaporanStatCard from './LaporanStatCard';
import LaporanTable from './LaporanTable';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function LaporanVoid({ filteredVoid, modalDetail, setModalDetail }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [alasanFilter, setAlasanFilter] = useState('Semua Alasan');

    const formatRupiah = (val) => `Rp ${val.toLocaleString('id-ID')}`;

    const totalNilaiVoid = filteredVoid.reduce((sum, item) => sum + item.total_void, 0);
    
    // Alasan Terbanyak
    const alasanCount = {};
    filteredVoid.forEach(v => {
        alasanCount[v.alasan_void] = (alasanCount[v.alasan_void] || 0) + 1;
    });
    const topAlasan = Object.entries(alasanCount).sort((a, b) => b[1] - a[1])[0] || ['-', 0];

    // Kasir Terbanyak
    const kasirCount = {};
    filteredVoid.forEach(v => {
        kasirCount[v.kasir_nama] = (kasirCount[v.kasir_nama] || 0) + 1;
    });
    const topKasir = Object.entries(kasirCount).sort((a, b) => b[1] - a[1])[0] || ['-', 0];

    const tableData = useMemo(() => {
        return filteredVoid.filter(v => {
            const matchAlasan = alasanFilter === 'Semua Alasan' || v.alasan_void === alasanFilter;
            const matchSearch = v.nomor_transaksi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                v.kasir_nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                v.supervisor_nama.toLowerCase().includes(searchQuery.toLowerCase());
            return matchAlasan && matchSearch;
        });
    }, [filteredVoid, alasanFilter, searchQuery]);

    const getAlasanColor = (alasan) => {
        if (alasan.includes('harga')) return 'bg-amber-100 text-amber-800';
        if (alasan.includes('batal')) return 'bg-blue-100 text-blue-800';
        if (alasan.includes('gagal')) return 'bg-red-100 text-red-800';
        if (alasan.includes('Stok')) return 'bg-orange-100 text-orange-800';
        return 'bg-gray-100 text-gray-800';
    };

    const tableColumns = [
        { 
            key: 'nomor_transaksi', 
            label: 'No. Transaksi', 
            sortable: true,
            render: (row) => (
                <button 
                    onClick={() => setModalDetail({ isOpen: true, type: 'void', data: row })}
                    className="font-mono text-emerald-600 hover:text-emerald-800 font-medium"
                >
                    {row.nomor_transaksi}
                </button>
            )
        },
        { key: 'outlet_nama', label: 'Outlet', sortable: true },
        { key: 'kasir_nama', label: 'Kasir', sortable: true },
        { key: 'supervisor_nama', label: 'Supervisor', sortable: true },
        { 
            key: 'tanggal_void', 
            label: 'Tgl Void', 
            sortable: true,
            render: (row) => format(new Date(row.tanggal_void), 'dd MMM yyyy', { locale: id })
        },
        { 
            key: 'total_void', 
            label: 'Total', 
            sortable: true,
            render: (row) => <span className="font-medium text-red-600">-{formatRupiah(row.total_void)}</span>
        },
        { 
            key: 'alasan_void', 
            label: 'Alasan', 
            sortable: true,
            render: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAlasanColor(row.alasan_void)}`}>
                    {row.alasan_void}
                </span>
            )
        },
        {
            key: 'action',
            label: 'Detail',
            render: (row) => (
                <button
                    onClick={() => setModalDetail({ isOpen: true, type: 'void', data: row })}
                    className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                >
                    Lihat
                </button>
            )
        }
    ];

    const uniqueAlasanList = ['Semua Alasan', ...new Set(filteredVoid.map(v => v.alasan_void))];

    return (
        <div className="space-y-6">
            {/* 4 Cards Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <LaporanStatCard
                    icon={XCircle}
                    title="Total Void"
                    value={filteredVoid.length.toString()}
                    sub="transaksi dibatalkan"
                    color="red"
                />
                <LaporanStatCard
                    icon={AlertTriangle}
                    title="Nilai Void"
                    value={formatRupiah(totalNilaiVoid)}
                    sub="potensi pendapatan hilang"
                    color="red"
                />
                <LaporanStatCard
                    icon={AlertCircle}
                    title="Alasan Terbanyak"
                    value={topAlasan[0]}
                    sub={`${topAlasan[1]} transaksi`}
                    color="amber"
                />
                <LaporanStatCard
                    icon={UserMinus}
                    title="Kasir Void Terbanyak"
                    value={topKasir[0]}
                    sub={`${topKasir[1]} void`}
                    color="gray"
                />
            </div>

            {/* Grafik Distribusi Alasan */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Distribusi Alasan Void</h3>
                <div className="space-y-4">
                    {Object.entries(alasanCount).sort((a, b) => b[1] - a[1]).map(([alasan, count], idx) => {
                        const persen = filteredVoid.length > 0 ? (count / filteredVoid.length) * 100 : 0;
                        return (
                            <div key={idx}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700">{alasan}</span>
                                    <span className="text-gray-500">{count} ({persen.toFixed(1)}%)</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div 
                                        className="bg-red-400 h-2 rounded-full" 
                                        style={{ width: `${persen}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Tabel Void */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
                    <input
                        type="text"
                        placeholder="Cari no trx, kasir, supervisor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full sm:w-64 pl-3 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white"
                    />
                    <select
                        value={alasanFilter}
                        onChange={(e) => setAlasanFilter(e.target.value)}
                        className="bg-white border border-gray-200 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:w-48 p-2"
                    >
                        {uniqueAlasanList.map(a => (
                            <option key={a} value={a}>{a}</option>
                        ))}
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
