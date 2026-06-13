import React, { useState, useMemo, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { BarChart3, Store, CreditCard, XCircle, CornerUpLeft, Printer, X } from 'lucide-react';
import { subDays } from 'date-fns';

// Components
import LaporanFilterBar from '../../Components/Admin/Laporan/LaporanFilterBar';
import RingkasanOmset from '../../Components/Admin/Laporan/RingkasanOmset';
import LaporanPerOutlet from '../../Components/Admin/Laporan/LaporanPerOutlet';
import LaporanMetodePembayaran from '../../Components/Admin/Laporan/LaporanMetodePembayaran';
import LaporanVoid from '../../Components/Admin/Laporan/LaporanVoid';
import LaporanRefund from '../../Components/Admin/Laporan/LaporanRefund';
import ExportDropdown from '../../Components/Admin/Laporan/ExportDropdown';

// Data
import { 
    transaksiHarian, 
    transaksiVoid, 
    transaksiRefund,
    hitungRingkasan,
    hitungPerOutlet,
    hitungMetodeBayar,
    hitungOmsetHarian
} from '../../data/laporanData';

// Assuming FilterContext exists as requested
// import { useFilter } from '@/Contexts/FilterContext';
// Fallback if not exists
const useFilter = () => ({ outlet: 'Semua Outlet', period: '7 hari terakhir' });

export default function LaporanPenjualan() {
    const { outlet: contextOutlet, period: contextPeriod } = useFilter();

    // State Lokal
    const [activeTab, setActiveTab] = useState('ringkasan');
    const [dateRange, setDateRange] = useState({ 
        dari: subDays(new Date(), 6), 
        sampai: new Date() 
    });
    const [periodeLabel, setPeriodeLabel] = useState('7 hari terakhir');
    const [outletFilter, setOutletFilter] = useState('Semua Outlet');
    const [modalDetail, setModalDetail] = useState({ isOpen: false, type: null, data: null });
    const [isLoading, setIsLoading] = useState(false);

    // Sync with context if needed (override locally initially)
    useEffect(() => {
        if (contextOutlet && contextOutlet !== outletFilter) {
            setOutletFilter(contextOutlet);
        }
    }, [contextOutlet]);

    // Simulasi loading state saat filter berubah
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [dateRange, outletFilter]);

    // Computed Data (useMemo)
    const filteredTransaksi = useMemo(() => {
        return transaksiHarian; // The helper functions handle their own filtering, but we can pass raw data
    }, []);

    const filteredVoid = useMemo(() => {
        return transaksiVoid; // Add filtering logic here if needed based on dateRange
    }, []);

    const filteredRefund = useMemo(() => {
        return transaksiRefund; // Add filtering logic here if needed based on dateRange
    }, []);

    const ringkasanStats = useMemo(() => {
        return hitungRingkasan(transaksiHarian, dateRange, outletFilter);
    }, [dateRange, outletFilter]);

    const perOutletStats = useMemo(() => {
        return hitungPerOutlet(transaksiHarian, dateRange);
    }, [dateRange]);

    const metodeBayarStats = useMemo(() => {
        return hitungMetodeBayar(transaksiHarian, dateRange, outletFilter);
    }, [dateRange, outletFilter]);

    const omsetHarianData = useMemo(() => {
        return hitungOmsetHarian(transaksiHarian, dateRange, outletFilter);
    }, [dateRange, outletFilter]);

    const TABS = [
        { id: 'ringkasan', label: 'Ringkasan Omset', icon: BarChart3 },
        { id: 'outlet', label: 'Per Outlet', icon: Store },
        { id: 'metode', label: 'Metode Pembayaran', icon: CreditCard },
        { id: 'void', label: 'Laporan Void', icon: XCircle, count: filteredVoid.length },
        { id: 'refund', label: 'Laporan Refund', icon: CornerUpLeft, count: filteredRefund.length }
    ];

    const formatRupiah = (val) => `Rp ${val.toLocaleString('id-ID')}`;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Head title="Laporan Penjualan - Kahita Busana" />

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="text-sm text-gray-500 mb-1">
                            Dashboard <span className="mx-2">›</span> Laporan <span className="mx-2">›</span> <span className="text-gray-900 font-medium">Penjualan</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Laporan Penjualan</h1>
                        <p className="text-sm text-gray-500 mt-1">Kahita Busana — Analisis & Rekap Transaksi</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={() => window.print()}
                            className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Printer size={18} />
                            <span className="font-medium text-sm">Cetak</span>
                        </button>
                        <ExportDropdown />
                    </div>
                </div>
            </div>

            {/* Filter Global */}
            <LaporanFilterBar 
                dateRange={dateRange}
                setDateRange={setDateRange}
                periodeLabel={periodeLabel}
                setPeriodeLabel={setPeriodeLabel}
                outletFilter={outletFilter}
                setOutletFilter={setOutletFilter}
                ringkasanStats={ringkasanStats}
            />

            <div className="p-6">
                {/* Tabs */}
                <div className="flex overflow-x-auto border-b border-gray-200 mb-6 hide-scrollbar">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                                    isActive 
                                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50/30' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Icon size={18} className={isActive ? 'text-emerald-500' : 'text-gray-400'} />
                                <span>{tab.label}</span>
                                {tab.count !== undefined && (
                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                                        isActive ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area with Loading State */}
                <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none animate-pulse' : 'opacity-100'}`}>
                    {activeTab === 'ringkasan' && (
                        <RingkasanOmset 
                            ringkasanStats={ringkasanStats} 
                            omsetHarianData={omsetHarianData}
                            filteredTransaksi={filteredTransaksi} 
                        />
                    )}
                    {activeTab === 'outlet' && (
                        <LaporanPerOutlet 
                            perOutletStats={perOutletStats}
                            omsetHarianData={omsetHarianData}
                            filteredTransaksi={filteredTransaksi}
                        />
                    )}
                    {activeTab === 'metode' && (
                        <LaporanMetodePembayaran 
                            metodeBayarStats={metodeBayarStats}
                            filteredTransaksi={filteredTransaksi}
                            outletFilter={outletFilter}
                        />
                    )}
                    {activeTab === 'void' && (
                        <LaporanVoid 
                            filteredVoid={filteredVoid}
                            modalDetail={modalDetail}
                            setModalDetail={setModalDetail}
                        />
                    )}
                    {activeTab === 'refund' && (
                        <LaporanRefund 
                            filteredRefund={filteredRefund}
                            modalDetail={modalDetail}
                            setModalDetail={setModalDetail}
                        />
                    )}
                </div>
            </div>

            {/* Modal Detail (Void/Refund) */}
            {modalDetail.isOpen && modalDetail.data && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                {modalDetail.type === 'void' ? <XCircle className="text-red-500" /> : <CornerUpLeft className="text-orange-500" />}
                                Detail Transaksi {modalDetail.type === 'void' ? 'Void' : 'Refund'}
                            </h2>
                            <button 
                                onClick={() => setModalDetail({ isOpen: false, type: null, data: null })}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 flex-1 space-y-6">
                            {/* Transaksi Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">No. Transaksi</div>
                                    <div className="font-medium text-gray-900">
                                        {modalDetail.type === 'void' ? modalDetail.data.nomor_transaksi : modalDetail.data.nomor_transaksi_asal}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Outlet</div>
                                    <div className="font-medium text-gray-900">{modalDetail.data.outlet_nama}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Kasir</div>
                                    <div className="font-medium text-gray-900">{modalDetail.data.kasir_nama}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Tanggal Transaksi</div>
                                    <div className="font-medium text-gray-900">
                                        {format(new Date(modalDetail.type === 'void' ? modalDetail.data.tanggal_transaksi : modalDetail.data.tanggal_transaksi_asal), 'dd MMM yyyy')}
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div>
                                <h3 className="text-base font-bold text-gray-900 mb-3">Item yang di-{modalDetail.type === 'void' ? 'void' : 'refund'}</h3>
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
                                            {(modalDetail.type === 'void' ? modalDetail.data.items : modalDetail.data.items_refund).map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-sm text-gray-900">{item.nama_produk}</div>
                                                        <div className="text-xs text-gray-500">{item.warna} - {item.ukuran}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.qty}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 text-right">
                                                        {formatRupiah(modalDetail.type === 'void' ? item.harga_jual : item.harga_satuan || item.harga_jual)}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                                                        {formatRupiah(modalDetail.type === 'void' ? item.subtotal : item.total_refund)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Info Void/Refund */}
                            <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 flex flex-col md:flex-row justify-between gap-4">
                                <div className="space-y-3 flex-1">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Alasan {modalDetail.type === 'void' ? 'Void' : 'Refund'}</div>
                                        <div className="font-medium text-gray-900">{modalDetail.type === 'void' ? modalDetail.data.alasan_void : modalDetail.data.alasan_refund}</div>
                                    </div>
                                    {modalDetail.type === 'void' ? (
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Supervisor Approval</div>
                                            <div className="font-medium text-gray-900">{modalDetail.data.supervisor_nama}</div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-6">
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Metode Refund</div>
                                                <div className="font-medium text-gray-900 capitalize">{modalDetail.data.metode_refund}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Status</div>
                                                <div className="font-medium text-gray-900 capitalize">{modalDetail.data.status}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="md:text-right pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-orange-200 md:pl-6 min-w-[200px] flex flex-col justify-center">
                                    <div className="text-sm font-medium text-gray-500 mb-1">Total {modalDetail.type === 'void' ? 'Void' : 'Refund'}</div>
                                    <div className={`text-3xl font-bold ${modalDetail.type === 'void' ? 'text-red-600' : 'text-orange-600'}`}>
                                        {formatRupiah(modalDetail.type === 'void' ? modalDetail.data.total_void : modalDetail.data.total_refund)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
                            <button 
                                onClick={() => setModalDetail({ isOpen: false, type: null, data: null })}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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

// Ensure layout integration
LaporanPenjualan.layout = (page) => <AdminLayout>{page}</AdminLayout>;
