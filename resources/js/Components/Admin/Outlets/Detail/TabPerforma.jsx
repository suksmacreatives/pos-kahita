import React from 'react';
import { TrendingUp, CreditCard, ShoppingBag, Award, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import PerformaChart from './PerformaChart';
import ProgressBar from '../Shared/ProgressBar';

export default function TabPerforma({ outlet, stats, target }) {
    if (!outlet) return null;

    const formatRupiah = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

    const statsData = {
        omset_bulan_ini: stats?.omset_bulan_ini || 0,
        transaksi_bulan: stats?.transaksi_bulan || 0,
        transaksi_hari_ini: stats?.transaksi_hari_ini || 0,
        growth_persen: stats?.growth_persen || 0,
        kasir_aktif_count: stats?.kasir_aktif_count || 0,
        stok_menipis: stats?.stok_menipis || 0,
        rata_transaksi: stats?.rata_transaksi || 0,
        produk_terlaris: stats?.produk_terlaris || { nama: '-', qty_terjual: 0, revenue: 0 },
        omset_7hari: stats?.omset_7hari || null,
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Omset Bulan Ini</p>
                            <p className="text-xl font-extrabold text-gray-900">{formatRupiah(statsData.omset_bulan_ini)}</p>
                            <div className={`flex items-center gap-1 text-[10px] font-bold mt-1 ${statsData.growth_persen >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {statsData.growth_persen >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {Math.abs(statsData.growth_persen)}% vs bulan lalu
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Transaksi</p>
                            <p className="text-xl font-extrabold text-gray-900">{statsData.transaksi_bulan} <span className="text-sm font-normal text-gray-500">trx</span></p>
                            <p className="text-[10px] text-gray-500 mt-1 font-medium">{statsData.transaksi_hari_ini} trx hari ini</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rata-rata / Trx</p>
                            <p className="text-xl font-extrabold text-gray-900">{formatRupiah(statsData.rata_transaksi)}</p>
                            <p className="text-[10px] text-gray-500 mt-1 font-medium">Bulan ini</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <Award className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Produk Terlaris</p>
                            <p className="text-sm font-extrabold text-gray-900 truncate">{statsData.produk_terlaris.nama}</p>
                            <p className="text-[10px] text-gray-500 mt-1 font-medium truncate">{statsData.produk_terlaris.qty_terjual} terjual</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            Grafik Omset 7 Hari Terakhir
                        </h3>
                    </div>
                    <div className="p-6">
                        <PerformaChart data={statsData.omset_7hari} outletColorHex={outlet.warna_hex || '#10B981'} />
                    </div>
                </div>

                {target && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                Target Pencapaian
                            </h3>
                            <p className="text-[10px] text-gray-500 mt-0.5">Bulan berjalan</p>
                        </div>
                        <div className="p-6 flex-1 flex flex-col gap-6">
                            
                            <ProgressBar 
                                label="Target Omset" 
                                sublabel={`${formatRupiah(statsData.omset_bulan_ini)} / ${formatRupiah(target.target_omset)}`}
                                value={target.persen_omset} 
                                status={target.status} 
                            />

                            <ProgressBar 
                                label="Target Transaksi" 
                                sublabel={`${statsData.transaksi_bulan} / ${target.target_transaksi} trx`}
                                value={target.persen_transaksi} 
                                status={target.status} 
                            />

                            <div className="mt-auto pt-6 border-t border-gray-50">
                                <div className={`px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-xs ${
                                    target.status === 'achieved' ? 'bg-emerald-50 text-emerald-700' :
                                    target.status === 'on_track' ? 'bg-blue-50 text-blue-700' :
                                    target.status === 'at_risk' ? 'bg-amber-50 text-amber-700' :
                                    'bg-red-50 text-red-700'
                                }`}>
                                    {target.status === 'achieved' ? '🏆 Target Tercapai!' :
                                     target.status === 'on_track' ? '📈 Performa Baik, Pertahankan!' :
                                     target.status === 'at_risk' ? '⚠ Butuh Peningkatan Penjualan' :
                                     '🚨 Jauh dari Target Bulan Ini'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            Top Produk Terlaris
                        </h3>
                    </div>
                    <div className="p-0">
                        {(Array.isArray(stats?.top_produk) ? stats.top_produk : (stats?.produk_terlaris ? [{ ...stats.produk_terlaris }] : [])).map((p, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                        idx === 0 ? 'bg-amber-100 text-amber-700' :
                                        idx === 1 ? 'bg-gray-100 text-gray-600' :
                                        'bg-orange-100 text-orange-700'
                                    }`}>
                                        #{idx + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{p.nama}</p>
                                        <p className="text-[10px] text-gray-500">{p.qty_terjual} pcs terjual</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900 text-sm">{formatRupiah(p.revenue)}</p>
                                    <p className="text-[10px] text-emerald-600">Revenue</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Metode Pembayaran (Visual only) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            Distribusi Metode Pembayaran
                        </h3>
                    </div>
                    <div className="p-6 flex flex-col justify-center h-[260px]">
                        {Array.isArray(stats?.metode_bayar) && stats.metode_bayar.length > 0 ? (
                            <div className="space-y-4">
                                {stats.metode_bayar.map((m, i) => {
                                    const warnaList = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500'];
                                    return (
                                        <div key={i}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="font-medium text-gray-700">{m.nama}</span>
                                                <span className="font-bold">{m.persen}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                <div className={`${warnaList[i % warnaList.length]} h-full rounded-full`} style={{ width: `${m.persen}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 text-center">Data distribusi pembayaran tidak tersedia.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
