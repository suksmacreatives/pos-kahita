import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, LayoutGrid, List, Store, ChevronDown } from 'lucide-react';
import OutletCard from '../Shared/OutletCard';

export default function OutletGrid({ outlets = [] }) {
    const [viewMode, setViewMode] = useState('card');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [tipeFilter, setTipeFilter] = useState('');
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isTipeOpen, setIsTipeOpen] = useState(false);
    const statusRef = useRef(null);
    const tipeRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (statusRef.current && !statusRef.current.contains(e.target)) setIsStatusOpen(false);
            if (tipeRef.current && !tipeRef.current.contains(e.target)) setIsTipeOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOutlets = useMemo(() => {
        return outlets.filter(o => {
            const matchSearch = (o.nama || '').toLowerCase().includes(search.toLowerCase()) || 
                                (o.kota || '').toLowerCase().includes(search.toLowerCase());
            const matchStatus = statusFilter ? o.status === statusFilter : true;
            const matchTipe = tipeFilter ? o.tipe === tipeFilter : true;
            return matchSearch && matchStatus && matchTipe;
        });
    }, [outlets, search, statusFilter, tipeFilter]);

    const statusOptions = [
        { value: '', label: 'Semua Status' },
        { value: 'aktif', label: 'Aktif' },
        { value: 'nonaktif', label: 'Nonaktif' },
    ];

    const tipeOptions = [
        { value: '', label: 'Semua Tipe' },
        { value: 'flagship', label: 'Flagship' },
        { value: 'cabang', label: 'Cabang' },
        { value: 'kiosk', label: 'Kiosk' },
    ];

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

                    <div className="relative z-20" ref={statusRef}>
                        <button
                            type="button"
                            onClick={() => setIsStatusOpen(!isStatusOpen)}
                            className="flex items-center justify-between w-40 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        >
                            <span className="truncate">{statusOptions.find(o => o.value === statusFilter)?.label || 'Semua Status'}</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isStatusOpen && (
                            <ul className="absolute left-0 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-lg z-40 py-1 text-xs">
                                {statusOptions.map(opt => (
                                    <li key={opt.value}
                                        onClick={() => { setStatusFilter(opt.value); setIsStatusOpen(false); }}
                                        className={`px-3 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${statusFilter === opt.value ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-600'}`}
                                    >
                                        {opt.label}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="relative z-20" ref={tipeRef}>
                        <button
                            type="button"
                            onClick={() => setIsTipeOpen(!isTipeOpen)}
                            className="flex items-center justify-between w-40 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        >
                            <span className="truncate">{tipeOptions.find(o => o.value === tipeFilter)?.label || 'Semua Tipe'}</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isTipeOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isTipeOpen && (
                            <ul className="absolute left-0 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-lg z-40 py-1 text-xs">
                                {tipeOptions.map(opt => (
                                    <li key={opt.value}
                                        onClick={() => { setTipeFilter(opt.value); setIsTipeOpen(false); }}
                                        className={`px-3 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${tipeFilter === opt.value ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-600'}`}
                                    >
                                        {opt.label}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
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
