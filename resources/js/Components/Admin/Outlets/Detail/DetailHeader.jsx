import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Phone, MoreVertical, AlertTriangle } from 'lucide-react';

export default function DetailHeader({ outlet, stats }) {
    if (!outlet) return null;

    const formatRupiah = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

    const statsData = {
        omset_bulan_ini: stats?.omset_bulan_ini || 0,
        transaksi_hari_ini: stats?.transaksi_hari_ini || 0,
        kasir_aktif_count: stats?.kasir_aktif_count || 0,
        stok_menipis: stats?.stok_menipis || 0,
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-medium">
                <Link href={route('admin.outlets.index')} className="text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5" /> Outlets
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900">{outlet.nama}</span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: outlet.warna_hex || '#10B981' }} />
                        <h1 className="text-2xl font-extrabold text-gray-900 uppercase tracking-tight">
                            {outlet.nama}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {outlet.tipe && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 capitalize border border-slate-200">
                                Tipe {outlet.tipe}
                            </span>
                        )}
                        {outlet.status === 'aktif' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Aktif
                            </span>
                        ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                                Nonaktif
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap md:flex-nowrap gap-4 shrink-0 bg-slate-50 p-2 rounded-xl border border-gray-100">
                    <div className="px-4 py-2 bg-white rounded-lg border border-gray-100 shadow-sm min-w-[120px]">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Omset Bulan</p>
                        <p className="text-sm font-extrabold text-gray-900">{formatRupiah(statsData.omset_bulan_ini)}</p>
                    </div>
                    <div className="px-4 py-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Transaksi Harian</p>
                        <p className="text-sm font-extrabold text-gray-900">{statsData.transaksi_hari_ini} <span className="text-[10px] font-medium text-gray-400">hari ini</span></p>
                    </div>
                    <div className="px-4 py-2 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center gap-3">
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Kasir Aktif</p>
                            <p className="text-sm font-extrabold text-gray-900">{statsData.kasir_aktif_count}</p>
                        </div>
                        {statsData.stok_menipis > 0 && (
                            <div className="bg-amber-50 text-amber-700 p-1.5 rounded-md border border-amber-200 flex flex-col items-center justify-center ml-2" title="Stok Menipis">
                                <AlertTriangle className="w-3.5 h-3.5 mb-0.5" />
                                <span className="text-[9px] font-bold">{statsData.stok_menipis}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button 
                        onClick={() => alert(`Hubungi ${outlet.manajer_nama || '-'}: ${outlet.telp || '-'}`)}
                        className="p-2.5 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 rounded-xl text-gray-600 transition-colors shadow-sm"
                        title="Hubungi Outlet"
                    >
                        <Phone className="w-4 h-4" />
                    </button>
                    <div className="relative group">
                        <button className="p-2.5 bg-white border border-gray-200 hover:bg-slate-50 rounded-xl text-gray-600 transition-colors shadow-sm">
                            <MoreVertical className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                            <div className="py-1">
                                <button className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-slate-50 font-medium">Nonaktifkan Outlet</button>
                                <div className="border-t border-gray-50 my-1" />
                                <button className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-bold">Hapus Outlet</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
