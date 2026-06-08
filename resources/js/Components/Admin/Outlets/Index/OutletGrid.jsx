import React, { useState, useMemo } from 'react';
import { Search, LayoutGrid, List, Store } from 'lucide-react';
import OutletCard from '../Shared/OutletCard';

export default function OutletGrid({ outlets = [] }) {
    const [viewMode, setViewMode] = useState('card');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [tipeFilter, setTipeFilter] = useState('');

    const filteredOutlets = useMemo(() => {
        return outlets.filter(o => {
            const matchSearch = (o.nama || '').toLowerCase().includes(search.toLowerCase()) || 
                                (o.kota || '').toLowerCase().includes(search.toLowerCase());
            const matchStatus = statusFilter ? o.status === statusFilter : true;
            const matchTipe = tipeFilter ? o.tipe === tipeFilter : true;
            return matchSearch && matchStatus && matchTipe;
        });
    }, [outlets, search, statusFilter, tipeFilter]);

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex-1 flex items-center gap-3 w-full">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau kota outlet..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>
                    
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-700 outline-none"
                    >
                        <option value="">Semua Status</option>
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Nonaktif</option>
                    </select>

                    <select
                        value={tipeFilter}
                        onChange={(e) => setTipeFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-700 outline-none"
                    >
                        <option value="">Semua Tipe</option>
                        <option value="flagship">Flagship</option>
                        <option value="cabang">Cabang</option>
                        <option value="kiosk">Kiosk</option>
                    </select>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setViewMode('card')}
                        className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors ${viewMode === 'card' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <LayoutGrid className="w-4 h-4" /> Card
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <List className="w-4 h-4" /> List
                    </button>
                </div>
            </div>

            {filteredOutlets.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                    <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-gray-900 font-bold mb-1">Outlet tidak ditemukan</h3>
                    <p className="text-xs text-gray-500">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
                </div>
            ) : (
                <div className={viewMode === 'card' ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "flex flex-col gap-3"}>
                    {filteredOutlets.map(outlet => (
                        <OutletCard
                            key={outlet.id}
                            outlet={outlet}
                            stats={outlet.stats}
                            target={outlet.target}
                            compact={viewMode === 'list'}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
