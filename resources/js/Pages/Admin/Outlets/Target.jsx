import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Target, ChevronRight, ChevronLeft, Settings } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import TargetCard from '@/Components/Admin/Outlets/Target/TargetCard';
import LeaderboardTable from '@/Components/Admin/Outlets/Target/LeaderboardTable';
import TargetFormModal from '@/Components/Admin/Outlets/Target/TargetFormModal';

export default function OutletTarget({ targets = [], leaderboard = [], outlets = [], filters }) {
    const [isTargetModalOpen, setTargetModalOpen] = useState(false);
    
    const currentDate = filters || { bulan: new Date().getMonth() + 1, tahun: new Date().getFullYear() };
    const [bulan, setBulan] = useState(currentDate.bulan);
    const [tahun, setTahun] = useState(currentDate.tahun);

    const namaBulan = new Date(tahun, bulan - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    const goToMonth = (newBulan, newTahun) => {
        router.get(route('admin.outlets.target'), { bulan: newBulan, tahun: newTahun }, { preserveState: true, replace: true });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Head title="Target & Performa Outlet" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
                        <Link href={route('admin.outlets.index')} className="hover:text-gray-900">Dashboard</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span>Outlets</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-gray-900">Target</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                        <Target className="w-7 h-7 text-rose-500" /> Target & Performa Outlet
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm p-1">
                        <button onClick={() => goToMonth(bulan - 1 < 1 ? 12 : bulan - 1, bulan - 1 < 1 ? tahun - 1 : tahun)} className="p-1.5 hover:bg-slate-100 rounded-lg text-gray-500 transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-bold px-3 min-w-[120px] text-center">{namaBulan}</span>
                        <button onClick={() => goToMonth(bulan + 1 > 12 ? 1 : bulan + 1, bulan + 1 > 12 ? tahun + 1 : tahun)} className="p-1.5 hover:bg-slate-100 rounded-lg text-gray-500 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <button 
                        onClick={() => setTargetModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow"
                    >
                        <Settings className="w-4 h-4" /> Set Target Semua Outlet
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {targets.map(tg => (
                    <TargetCard 
                        key={tg.id || tg.outlet_id} 
                        target={tg}
                        outlets={outlets}
                    />
                ))}
            </div>

            <div className="pt-4">
                <LeaderboardTable leaderboard={leaderboard} />
            </div>

            <TargetFormModal 
                isOpen={isTargetModalOpen} 
                onClose={() => setTargetModalOpen(false)}
                outlets={outlets}
            />

        </div>
    );
}

OutletTarget.layout = (page) => <AdminLayout>{page}</AdminLayout>;
