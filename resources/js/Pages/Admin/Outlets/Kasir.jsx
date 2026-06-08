import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Users, UserPlus, Zap, Trophy, AlertTriangle, ChevronRight, LayoutGrid, Calendar } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import KasirTable from '@/Components/Admin/Outlets/Kasir/KasirTable';
import KasirFormModal from '@/Components/Admin/Outlets/Kasir/KasirFormModal';
import KasirDetailDrawer from '@/Components/Admin/Outlets/Kasir/KasirDetailDrawer';
import ShiftTable from '@/Components/Admin/Outlets/Kasir/ShiftTable';
import ShiftFormModal from '@/Components/Admin/Outlets/Kasir/ShiftFormModal';

export default function OutletKasir({ kasirs = [], outlets = [], stats }) {
    const [viewMode, setViewMode] = useState('tabel');
    const [selectedKasir, setSelectedKasir] = useState(null);
    const [isKasirModalOpen, setKasirModalOpen] = useState(false);
    const [isShiftModalOpen, setShiftModalOpen] = useState(false);

    const totalKasir = kasirs.length;
    const statOnline = stats?.online || 0;
    
    const sortedByOmset = [...kasirs].sort((a, b) => (b.stats?.total_omset_bulan || 0) - (a.stats?.total_omset_bulan || 0));
    const topPerformer = sortedByOmset[0];
    
    const sortedByVoid = [...kasirs].sort((a, b) => (b.stats?.void_rate || 0) - (a.stats?.void_rate || 0));
    const highVoid = sortedByVoid[0];

    const formatRupiah = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Head title="Manajemen Kasir" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
                        <Link href={route('admin.outlets.index')} className="hover:text-gray-900">Dashboard</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span>Outlets</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-gray-900">Kasir</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                        <Users className="w-7 h-7 text-indigo-500" /> Manajemen Kasir
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">{totalKasir} kasir aktif di {outlets.length} outlet</p>
                </div>
                
                <button 
                    onClick={() => setKasirModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow"
                >
                    <UserPlus className="w-4 h-4" /> Tambah Kasir
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Kasir</p>
                        <p className="text-xl font-extrabold text-gray-900">{totalKasir} <span className="text-xs font-normal text-gray-500">orang</span></p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Online Sekarang</p>
                        <p className="text-xl font-extrabold text-gray-900">{statOnline} <span className="text-xs font-normal text-gray-500">aktif shift</span></p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-100 bg-amber-50/10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-amber-600/70 uppercase tracking-wider mb-0.5">Top Performer</p>
                        <p className="text-sm font-extrabold text-gray-900 truncate">{topPerformer?.nama || '-'}</p>
                        <p className="text-[10px] text-amber-700 font-medium truncate">{formatRupiah(topPerformer?.stats?.total_omset_bulan)} omset</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-100 bg-red-50/10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-red-600/70 uppercase tracking-wider mb-0.5">Void Rate Tertinggi</p>
                        <p className="text-sm font-extrabold text-gray-900 truncate">{highVoid?.nama || '-'}</p>
                        <p className="text-[10px] text-red-700 font-medium truncate">{highVoid?.stats?.void_rate || 0}% · perlu perhatian</p>
                    </div>
                </div>
            </div>

            <div className="flex bg-slate-200/50 p-1 rounded-xl w-max border border-slate-200">
                <button
                    onClick={() => setViewMode('tabel')}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${
                        viewMode === 'tabel' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <LayoutGrid className="w-4 h-4" /> Tabel Kasir
                </button>
                <button
                    onClick={() => setViewMode('shift')}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${
                        viewMode === 'shift' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Calendar className="w-4 h-4" /> Jadwal Shift
                </button>
            </div>

            <div>
                {viewMode === 'tabel' ? (
                    <KasirTable 
                        kasirs={kasirs}
                        outletId={null}
                        onOpenDetail={(kasir) => setSelectedKasir(kasir)} 
                        onEditKasir={(kasir) => {
                            setSelectedKasir(kasir);
                            setKasirModalOpen(true);
                        }} 
                    />
                ) : (
                    <ShiftTable 
                        mode="global"
                        kasirs={kasirs}
                        shifts={[]}
                        outlets={outlets}
                        onEditShift={() => setShiftModalOpen(true)}
                    />
                )}
            </div>

            <KasirFormModal 
                isOpen={isKasirModalOpen} 
                onClose={() => setKasirModalOpen(false)} 
                kasir={selectedKasir}
                outlets={outlets}
            />

            <ShiftFormModal 
                isOpen={isShiftModalOpen} 
                onClose={() => setShiftModalOpen(false)}
                kasirs={kasirs}
            />

            <KasirDetailDrawer 
                isOpen={!!selectedKasir && !isKasirModalOpen} 
                onClose={() => setSelectedKasir(null)} 
                kasir={selectedKasir} 
            />
            
        </div>
    );
}

OutletKasir.layout = (page) => <AdminLayout>{page}</AdminLayout>;
