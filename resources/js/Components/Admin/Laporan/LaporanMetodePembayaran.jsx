import React, { useState } from 'react';
import { Banknote, QrCode, ArrowLeftRight, CreditCard } from 'lucide-react';
import LaporanStatCard from './LaporanStatCard';
import MetodePembayaranChart from './MetodePembayaranChart';
import LaporanTable from './LaporanTable';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function LaporanMetodePembayaran({ metodeBayarStats, filteredTransaksi, outletFilter }) {
    const [metodeFilter, setMetodeFilter] = useState('Semua Metode');

    const formatRupiah = (val) => `Rp ${val.toLocaleString('id-ID')}`;

    // Filter data untuk tabel
    const tableData = filteredTransaksi.filter(t => 
        metodeFilter === 'Semua Metode' || t.metode_bayar === metodeFilter.toLowerCase()
    );

    const tableColumns = [
        { 
            key: 'tanggal', 
            label: 'Tanggal', 
            sortable: true,
            render: (row) => format(new Date(row.tanggal), 'dd MMM yyyy', { locale: id })
        },
        { key: 'outlet_nama', label: 'Outlet', sortable: true },
        { key: 'kasir_nama', label: 'Kasir', sortable: true },
        { 
            key: 'total', 
            label: 'Total', 
            sortable: true,
            render: (row) => <span className="font-medium text-gray-900">{formatRupiah(row.total)}</span>
        },
        { 
            key: 'metode_bayar', 
            label: 'Metode', 
            sortable: true,
            render: (row) => {
                const metode = row.metode_bayar;
                const colors = {
                    cash: 'bg-emerald-100 text-emerald-800',
                    qris: 'bg-purple-100 text-purple-800',
                    transfer: 'bg-blue-100 text-blue-800',
                    debit: 'bg-amber-100 text-amber-800',
                    kredit: 'bg-rose-100 text-rose-800'
                };
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colors[metode]}`}>
                        {metode}
                    </span>
                );
            }
        },
        { 
            key: 'status', 
            label: 'Status', 
            sortable: true,
            render: (row) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 capitalize">
                    {row.status}
                </span>
            )
        }
    ];

    const getStatColor = (key) => {
        const mapping = {
            cash: 'emerald',
            qris: 'blue',
            transfer: 'purple',
            debit: 'amber',
            kredit: 'rose'
        };
        return mapping[key] || 'gray';
    };

    const getStatIcon = (key) => {
        const mapping = {
            cash: Banknote,
            qris: QrCode,
            transfer: ArrowLeftRight,
            debit: CreditCard,
            kredit: CreditCard
        };
        return mapping[key] || Banknote;
    };

    return (
        <div className="space-y-6">
            {/* 5 Cards Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {['cash', 'qris', 'transfer', 'debit', 'kredit'].map(key => {
                    const stats = metodeBayarStats[key] || { total: 0, count: 0, persentase: 0 };
                    return (
                        <LaporanStatCard
                            key={key}
                            icon={getStatIcon(key)}
                            title={key.charAt(0).toUpperCase() + key.slice(1)}
                            value={formatRupiah(stats.total)}
                            sub={`${stats.count} transaksi (${stats.persentase}%)`}
                            color={getStatColor(key)}
                        />
                    );
                })}
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Proporsi Metode Pembayaran</h3>
                    <p className="text-sm text-gray-500">Distribusi penggunaan metode pembayaran oleh pelanggan</p>
                </div>
                <MetodePembayaranChart data={metodeBayarStats} />
            </div>

            {/* Tabel Detail */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-gray-900">Detail Transaksi Pembayaran</h3>
                    <div className="flex items-center space-x-2">
                        <select
                            value={metodeFilter}
                            onChange={(e) => setMetodeFilter(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5"
                        >
                            <option value="Semua Metode">Semua Metode</option>
                            <option value="Cash">Cash</option>
                            <option value="QRIS">QRIS</option>
                            <option value="Transfer">Transfer</option>
                            <option value="Debit">Debit</option>
                            <option value="Kredit">Kredit</option>
                        </select>
                        {/* Fake outlet filter for UI consistency with mockup, but it uses the global one actually */}
                        <div className="bg-gray-50 border border-gray-200 text-sm rounded-lg p-2.5 text-gray-500">
                            {outletFilter}
                        </div>
                    </div>
                </div>
                <LaporanTable
                    columns={tableColumns}
                    data={tableData}
                    pagination={true}
                    pageSize={15}
                />
            </div>
        </div>
    );
}
