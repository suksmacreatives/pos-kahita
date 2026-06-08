import React from 'react';
import { Link } from '@inertiajs/react';
import OutletBadge from './OutletBadge';
import ProgressBar from './ProgressBar';
import { Phone, MapPin, Users, Info } from 'lucide-react';

export default function OutletCard({ outlet, stats, target, compact = false }) {
    if (!outlet || !stats) return null;

    const formatRupiah = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

    const statsData = {
        omset_bulan_ini: stats.omset_bulan_ini || 0,
        transaksi_bulan: stats.transaksi_bulan || 0,
        transaksi_hari_ini: stats.transaksi_hari_ini || 0,
        growth_persen: stats.growth_persen || 0,
        kasir_aktif_count: stats.kasir_aktif_count || 0,
        stok_menipis: stats.stok_menipis || 0,
        stok_habis: stats.stok_habis || 0,
        rata_transaksi: stats.rata_transaksi || 0,
        produk_terlaris: stats.produk_terlaris || { nama: '-', qty_terjual: 0, revenue: 0 },
    };

    // Badge Tipe
    const tipeColors = {
        flagship: 'bg-purple-100 text-purple-700',
        cabang: 'bg-blue-100 text-blue-700',
        kiosk: 'bg-amber-100 text-amber-700'
    };
    const tipeLabel = outlet.tipe ? outlet.tipe.charAt(0).toUpperCase() + outlet.tipe.slice(1) : '-';

    const borderColors = {
        emerald: 'border-emerald-500',
        blue: 'border-blue-500',
        purple: 'border-purple-500',
        amber: 'border-amber-500'
    };
    const borderClass = borderColors[outlet.warna] || 'border-gray-500';

    if (compact) {
        return (
            <div className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden border-l-4 ${borderClass}`}>
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4 min-w-[200px]">
                        <OutletBadge outlet={outlet} />
                        {outlet.tipe && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tipeColors[outlet.tipe]}`}>
                                {tipeLabel}
                            </span>
                        )}
                    </div>
                    
                    <div className="flex-1 grid grid-cols-4 gap-4 text-xs">
                        <div>
                            <p className="text-gray-400 text-[10px]">Kota</p>
                            <p className="font-semibold text-gray-800">{outlet.kota || '-'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px]">Omset Bulan</p>
                            <p className="font-semibold text-gray-800">{formatRupiah(statsData.omset_bulan_ini)}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px]">Transaksi</p>
                            <p className="font-semibold text-gray-800">{statsData.transaksi_bulan} trx</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px]">Status</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                {outlet.status === 'aktif' ? (
                                    <>
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-emerald-700 font-medium">Aktif</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                        <span className="text-gray-500 font-medium">Nonaktif</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('admin.outlets.detail', outlet.slug || outlet.id)}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                            Detail
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col border-l-4 ${borderClass}`}>
            
            <div className="p-5 border-b border-gray-50 space-y-3">
                <div className="flex items-start justify-between">
                    {outlet.tipe && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tipeColors[outlet.tipe]}`}>
                            {tipeLabel}
                        </span>
                    )}
                    <div className="flex items-center gap-1.5">
                        {outlet.status === 'aktif' ? (
                            <>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] text-emerald-700 font-bold">Aktif</span>
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 rounded-full bg-gray-400" />
                                <span className="text-[10px] text-gray-500 font-bold">Nonaktif</span>
                            </>
                        )}
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: outlet.warna_hex || '#10B981' }} />
                        <h3 className="font-extrabold text-gray-900 uppercase tracking-wide text-sm">
                            {outlet.nama}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {outlet.provinsi || '-'}</span>
                        <span>·</span>
                        <span>{outlet.luas_m2 || 0}m²</span>
                    </div>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 rounded-xl p-2.5">
                        <p className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">Omset Bulan</p>
                        <p className="text-xs font-bold text-gray-900">{formatRupiah(statsData.omset_bulan_ini)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2.5">
                        <p className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">Transaksi</p>
                        <p className="text-xs font-bold text-gray-900">{statsData.transaksi_bulan} trx</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2.5">
                        <p className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">Kasir</p>
                        <p className="text-xs font-bold text-gray-900">{statsData.kasir_aktif_count} aktif</p>
                    </div>
                </div>

                {target && (
                    <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                        <ProgressBar 
                            label="Progress Target Omset" 
                            value={target.persen_omset} 
                            status={target.status} 
                        />
                    </div>
                )}

                <div className="space-y-1.5 text-[11px]">
                    {statsData.stok_menipis > 0 && (
                        <div className="flex justify-between items-center bg-red-50 text-red-700 px-2 py-1.5 rounded-lg border border-red-100">
                            <span className="font-medium">Stok Menipis: {statsData.stok_menipis} produk</span>
                            <span>⚠</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center text-gray-600 px-1">
                        <span>Produk Terlaris:</span>
                        <span className="font-semibold text-gray-800">{statsData.produk_terlaris.nama}</span>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-gray-50/50 border-t border-gray-100 grid grid-cols-2 gap-3 mt-auto">
                <Link
                    href={route('admin.outlets.detail', outlet.slug || outlet.id)}
                    className="flex justify-center items-center gap-1.5 py-2 px-3 bg-white border border-gray-200 hover:border-emerald-300 hover:text-emerald-600 rounded-xl text-xs font-semibold text-gray-700 transition-colors shadow-sm"
                >
                    <Info className="w-3.5 h-3.5" /> Lihat Detail
                </Link>
                <button
                    onClick={() => alert(`Hubungi ${outlet.manajer_nama || '-'}: ${outlet.telp || '-'}`)}
                    className="flex justify-center items-center gap-1.5 py-2 px-3 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 rounded-xl text-xs font-semibold text-gray-700 transition-colors shadow-sm"
                >
                    <Phone className="w-3.5 h-3.5" /> Hubungi
                </button>
            </div>
        </div>
    );
}
