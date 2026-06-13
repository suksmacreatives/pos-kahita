import React from 'react';
import { Package, AlertTriangle, ArrowRight, XCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function TabStok({ outlet, stats, stok }) {
    if (!outlet) return null;

    const statsData = {
        total_stok: stats?.total_stok || stok?.total_stok || 0,
        stok_menipis: stats?.stok_menipis || stok?.stok_menipis || 0,
        stok_habis: stats?.stok_habis || stok?.stok_habis || 0,
    };

    const produkMenipis = stok?.produk_menipis || [];
    const produkHabis = stok?.produk_habis || [];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Stok Item</p>
                        <p className="text-2xl font-extrabold text-gray-900">{statsData.total_stok.toLocaleString('id-ID')} <span className="text-sm font-normal text-gray-500">pcs</span></p>
                    </div>
                </div>

                <div className={`bg-white p-5 rounded-2xl shadow-sm border ${statsData.stok_menipis > 0 ? 'border-amber-200 bg-amber-50/10' : 'border-gray-100'} flex items-center gap-4`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statsData.stok_menipis > 0 ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-gray-50 text-gray-400'}`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Stok Menipis</p>
                        <p className={`text-2xl font-extrabold ${statsData.stok_menipis > 0 ? 'text-amber-700' : 'text-gray-900'}`}>{statsData.stok_menipis} <span className="text-sm font-normal text-gray-500">produk</span></p>
                    </div>
                </div>

                <div className={`bg-white p-5 rounded-2xl shadow-sm border ${statsData.stok_habis > 0 ? 'border-red-200 bg-red-50/10' : 'border-gray-100'} flex items-center gap-4`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statsData.stok_habis > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
                        <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Stok Habis</p>
                        <p className={`text-2xl font-extrabold ${statsData.stok_habis > 0 ? 'text-red-600' : 'text-gray-900'}`}>{statsData.stok_habis} <span className="text-sm font-normal text-gray-500">produk</span></p>
                    </div>
                </div>
            </div>

            {/* Content Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Stok Menipis */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-50 bg-amber-50/30 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Perlu Restock
                        </h3>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">{statsData.stok_menipis} item</span>
                    </div>
                    
                    <div className="flex-1 overflow-x-auto">
                        {produkMenipis.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">Tidak ada produk menipis.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-gray-500 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Produk</th>
                                        <th className="px-4 py-3 font-semibold text-center w-24">Stok</th>
                                        <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {produkMenipis.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg ${p.img} flex items-center justify-center shrink-0`}>
                                                        <Package className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{p.nama}</p>
                                                        <p className="text-[10px] text-gray-500">{p.ukuran} · {p.warna}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="inline-flex flex-col items-center">
                                                    <span className="font-bold text-amber-600 text-sm">{p.stok}</span>
                                                    <span className="text-[9px] text-gray-400">Min: {p.min}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-lg transition-colors border border-amber-200">
                                                    Minta
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Stok Habis */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-50 bg-red-50/30 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500" /> Produk Habis
                        </h3>
                        <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">{statsData.stok_habis} item</span>
                    </div>
                    
                    <div className="flex-1 overflow-x-auto">
                        {produkHabis.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <XCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">Tidak ada produk habis.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-gray-500 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Produk</th>
                                        <th className="px-4 py-3 font-semibold text-center w-24">Stok</th>
                                        <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {produkHabis.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg ${p.img} flex items-center justify-center shrink-0`}>
                                                        <Package className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{p.nama}</p>
                                                        <p className="text-[10px] text-gray-500">{p.ukuran} · {p.warna}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded font-bold">0</span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors border border-slate-900">
                                                    Prioritas
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </div>

            {/* Footer Action */}
            <Link 
                href={route('admin.inventory.outlet', { outlet: outlet.slug || outlet.id })}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100 border border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-slate-700 font-bold transition-all hover:border-slate-300 group"
            >
                Kelola Inventory Lengkap {outlet.nama}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
}
