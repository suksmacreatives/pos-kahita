import React, { useState } from 'react';
import { Eye, Edit, Power, Search, AlertTriangle } from 'lucide-react';
import KasirAvatar from '../Shared/KasirAvatar';
import OutletBadge from '../Shared/OutletBadge';

export default function KasirTable({ kasirs = [], outletId = null, onOpenDetail, onEditKasir }) {
    const [search, setSearch] = useState('');
    
    const formatRupiah = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

    // Filter by outlet if provided (Tab Kasir detail), or all (Kasir Index)
    let filteredKasirs = outletId 
        ? kasirs.filter(k => String(k.outlet_id) === String(outletId))
        : kasirs;

    // Filter search
    if (search) {
        const q = search.toLowerCase();
        filteredKasirs = filteredKasirs.filter(k => 
            (k.nama || '').toLowerCase().includes(q) || 
            (k.email || '').toLowerCase().includes(q)
        );
    }

    filteredKasirs = filteredKasirs.sort((a, b) => (b.stats?.total_omset_bulan || 0) - (a.stats?.total_omset_bulan || 0));

    const shiftBadges = {
        pagi: 'bg-blue-100 text-blue-700',
        siang: 'bg-amber-100 text-amber-700',
        malam: 'bg-purple-100 text-purple-700'
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Search Bar for Kasir Table */}
            <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-4 bg-slate-50/50">
                <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari kasir atau email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                    <thead className="bg-slate-50 border-b border-gray-100 text-gray-500 font-semibold">
                        <tr>
                            <th className="px-5 py-3 w-12 text-center">#</th>
                            <th className="px-5 py-3">Kasir</th>
                            {!outletId && <th className="px-5 py-3">Outlet</th>}
                            <th className="px-5 py-3">Shift Default</th>
                            <th className="px-5 py-3">Transaksi</th>
                            <th className="px-5 py-3">Omset Bulan</th>
                            <th className="px-5 py-3">Void Rate</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3 text-center w-28">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredKasirs.length === 0 ? (
                            <tr>
                                <td colSpan={!outletId ? 9 : 8} className="py-10 text-center text-gray-400 font-medium">
                                    Tidak ada kasir ditemukan.
                                </td>
                            </tr>
                        ) : (
                            filteredKasirs.map((kasir, index) => {
                                const maxOmset = Math.max(...filteredKasirs.map(k => k.stats?.total_omset_bulan || 0));
                                const omsetPercent = maxOmset > 0 ? ((kasir.stats?.total_omset_bulan || 0) / maxOmset) * 100 : 0;

                                return (
                                    <tr key={kasir.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-5 py-3 text-center text-gray-400 font-medium">{index + 1}</td>
                                        
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <KasirAvatar nama={kasir.nama} fotoColor={kasir.foto_color} size="md" />
                                                <div>
                                                    <p className="font-bold text-gray-900 leading-tight group-hover:text-emerald-600 transition-colors">{kasir.nama}</p>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">{kasir.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        {!outletId && (
                                            <td className="px-5 py-3">
                                                <OutletBadge outlet={{ id: kasir.outlet_id, nama: kasir.outlet_nama }} showDot={true} />
                                            </td>
                                        )}
                                        
                                        <td className="px-5 py-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${shiftBadges[kasir.shift_default]}`}>
                                                {kasir.shift_default}
                                            </span>
                                        </td>
                                        
                                        <td className="px-5 py-3">
                                            <div className="font-bold text-gray-900">{kasir.stats?.total_transaksi_bulan || 0}</div>
                                            <div className="w-16 bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden">
                                                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${omsetPercent}%` }} />
                                            </div>
                                        </td>
                                        
                                        <td className="px-5 py-3">
                                            <div className="font-bold text-gray-900">{formatRupiah(kasir.stats?.total_omset_bulan || 0)}</div>
                                            <div className="text-[10px] text-gray-400 font-medium">Avg: {formatRupiah(kasir.stats?.rata_transaksi || 0)}</div>
                                        </td>
                                        
                                        <td className="px-5 py-3">
                                            <div className={`flex items-center gap-1 font-bold ${(kasir.stats?.void_rate || 0) > 5 ? 'text-red-600' : (kasir.stats?.void_rate || 0) > 3 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                {kasir.stats?.void_rate || 0}%
                                                {(kasir.stats?.void_rate || 0) > 5 && <AlertTriangle className="w-3 h-3" />}
                                            </div>
                                        </td>
                                        
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-2 h-2 rounded-full ${kasir.status === 'aktif' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                                                <span className={`font-medium ${kasir.status === 'aktif' ? 'text-emerald-700' : 'text-gray-500'}`}>
                                                    {kasir.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </div>
                                        </td>
                                        
                                        <td className="px-5 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => onOpenDetail(kasir)}
                                                    className="p-1.5 rounded bg-white hover:bg-slate-100 text-gray-600 transition-colors border border-transparent hover:border-gray-200" title="Detail"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    onClick={() => onEditKasir(kasir)}
                                                    className="p-1.5 rounded bg-white hover:bg-blue-50 text-blue-600 transition-colors border border-transparent hover:border-blue-200" title="Edit"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button className="p-1.5 rounded bg-white hover:bg-red-50 text-red-600 transition-colors border border-transparent hover:border-red-200" title="Nonaktifkan">
                                                    <Power className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
