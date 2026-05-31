import React, { useState, useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, usePage } from '@inertiajs/react';
import { Users, UserCheck, ShoppingBag, UserX, Plus, Tag, Zap, Clock, BarChart2, List, LayoutGrid, Activity, LogIn, AlertCircle, Download } from 'lucide-react';

// Data
import { accounts, promos, activityLogs, akunStats, promoStats, logStats } from '@/data/settingsData';

// Kelola Akun Components
import AkunTable from '@/Components/Admin/Settings/KelolAkun/AkunTable';
import AkunFormModal from '@/Components/Admin/Settings/KelolAkun/AkunFormModal';
import AkunDetailDrawer from '@/Components/Admin/Settings/KelolAkun/AkunDetailDrawer';

// Promo Components
import PromoTable from '@/Components/Admin/Settings/Promo/PromoTable';
import PromoDetailCard from '@/Components/Admin/Settings/Promo/PromoDetailCard';
import PromoFormModal from '@/Components/Admin/Settings/Promo/PromoFormModal';

// Log Aktivitas Components
import LogTable from '@/Components/Admin/Settings/LogAktivitas/LogTable';
import LogDetailModal from '@/Components/Admin/Settings/LogAktivitas/LogDetailModal';

export default function Settings() {
    const { url } = usePage();
    // Top-level states
    const [toast, setToast] = useState(null); // { message: string, type: 'success' | 'error' }
    
    // Get active tab from URL query params
    let activeMenu = 'kelola_akun';
    if (url.includes('tab=promo')) activeMenu = 'promo';
    else if (url.includes('tab=log_aktivitas')) activeMenu = 'log_aktivitas';
    
    // View modes
    const [logViewMode, setLogViewMode] = useState('tabel'); // 'tabel' | 'timeline'
    const [promoViewMode, setPromoViewMode] = useState('list'); // 'list' | 'card'

    // Data states (in a real app this comes from props/api, here we use dummy data)
    const [akunData, setAkunData] = useState(accounts);
    const [promoData, setPromoData] = useState(promos);
    const [logData, setLogData] = useState(activityLogs);

    // Modal/Drawer states
    const [modalState, setModalState] = useState({ isOpen: false, type: null, mode: 'create', data: null });
    const [drawerState, setDrawerState] = useState({ isOpen: false, data: null });

    // Toast helper
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Sub Menu 1: Kelola Akun Handlers
    const handleSaveAkun = (data) => {
        // Mock save
        setModalState({ ...modalState, isOpen: false });
        showToast(modalState.mode === 'create' ? 'Akun berhasil ditambahkan' : 'Perubahan akun disimpan');
    };
    
    const handleToggleStatusAkun = (akun) => {
        showToast(`Status akun ${akun.nama} diubah`, 'success');
    };
    
    const handleSuspendAkun = (id) => {
        showToast('Akun berhasil disuspend', 'success');
    };
    
    const handleDeleteAkun = (id) => {
        showToast('Akun berhasil dihapus', 'success');
    };

    const handleResetPassword = (akun) => {
        showToast(`Password untuk ${akun.nama} berhasil direset`, 'success');
    };

    // Sub Menu 2: Promo Handlers
    const handleSavePromo = (data) => {
        setModalState({ ...modalState, isOpen: false });
        showToast(modalState.mode === 'create' ? 'Promo berhasil dibuat' : 'Perubahan promo disimpan');
    };

    const handleToggleStatusPromo = (promo) => {
        showToast(`Status promo ${promo.kode_promo} diubah`, 'success');
    };

    const handleDuplicatePromo = (promo) => {
        setModalState({ isOpen: true, type: 'promoForm', mode: 'create', data: promo }); // Prefill with existing
        showToast('Duplikat data promo disiapkan');
    };

    const handleDeletePromo = (id) => {
        showToast('Promo berhasil dihapus', 'success');
    };

    // Sub Menu 3: Log Aktivitas Handlers
    const handleExportLog = () => {
        showToast('Mengekspor log aktivitas...', 'success');
    };

    const handleDetailLog = (log) => {
        setModalState({ isOpen: true, type: 'logDetail', mode: 'view', data: log });
    };

    // Render Stats Cards based on activeMenu
    const renderStatCards = () => {
        if (activeMenu === 'kelola_akun') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500"><Users size={24} /></div>
                        <div><div className="text-2xl font-bold text-gray-900 leading-none">{akunStats.total}</div><div className="text-xs text-gray-500 mt-1 font-medium">Total terdaftar</div></div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><UserCheck size={24} /></div>
                        <div><div className="text-2xl font-bold text-gray-900 leading-none">{akunStats.aktif}</div><div className="text-xs text-gray-500 mt-1 font-medium">Sedang aktif</div></div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600"><ShoppingBag size={24} /></div>
                        <div><div className="text-2xl font-bold text-gray-900 leading-none">{akunStats.kasir}</div><div className="text-xs text-gray-500 mt-1 font-medium">Role kasir</div></div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600"><UserX size={24} /></div>
                        <div><div className="text-2xl font-bold text-gray-900 leading-none">{akunStats.nonaktif_suspended}</div><div className="text-xs text-gray-500 mt-1 font-medium">Perlu tindakan</div></div>
                    </div>
                </div>
            );
        } else if (activeMenu === 'promo') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500"><Tag size={24} /></div>
                        <div><div className="text-2xl font-bold text-gray-900 leading-none">{promoStats.total}</div><div className="text-xs text-gray-500 mt-1 font-medium">Total promo</div></div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><Zap size={24} /></div>
                        <div><div className="text-2xl font-bold text-gray-900 leading-none">{promoStats.aktif}</div><div className="text-xs text-gray-500 mt-1 font-medium">Berjalan sekarang</div></div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 relative">
                            {promoStats.hampir_habis > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>}
                            <Clock size={24} />
                        </div>
                        <div><div className="text-2xl font-bold text-gray-900 leading-none">{promoStats.hampir_habis}</div><div className="text-xs text-gray-500 mt-1 font-medium">&lt; 3 hari lagi</div></div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><BarChart2 size={24} /></div>
                        <div><div className="text-2xl font-bold text-gray-900 leading-none">{promoStats.total_terpakai}</div><div className="text-xs text-gray-500 mt-1 font-medium">Total terpakai</div></div>
                    </div>
                </div>
            );
        } else if (activeMenu === 'log_aktivitas') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Activity size={24} /></div>
                        <div><div className="text-2xl font-bold text-gray-900 leading-none">{logStats.total_hari_ini}</div><div className="text-xs text-gray-500 mt-1 font-medium">Aktivitas hari ini</div></div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><LogIn size={24} /></div>
                        <div><div className="text-2xl font-bold text-gray-900 leading-none">{logStats.login_hari_ini}</div><div className="text-xs text-gray-500 mt-1 font-medium">Login hari ini</div></div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 relative">
                        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                            {logStats.gagal_hari_ini > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>}
                            <AlertCircle size={24} />
                        </div>
                        <div><div className="text-2xl font-bold text-gray-900 leading-none">{logStats.gagal_hari_ini}</div><div className="text-xs text-gray-500 mt-1 font-medium">Aksi gagal</div></div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 overflow-hidden">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0"><Zap size={24} /></div>
                        <div className="min-w-0">
                            <div className="text-lg font-bold text-gray-900 leading-tight truncate" title={logStats.user_teraktif.nama}>{logStats.user_teraktif.nama}</div>
                            <div className="text-xs text-gray-500 mt-1 font-medium">{logStats.user_teraktif.count} aksi hari ini</div>
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <Head title="Pengaturan" />
            
            {/* Header Global */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {activeMenu === 'kelola_akun' && 'Atur pengguna, role, dan hak akses sistem'}
                            {activeMenu === 'promo' && 'Atur program promo dan kode diskon'}
                            {activeMenu === 'log_aktivitas' && 'Riwayat semua aksi pengguna di sistem'}
                        </p>
                    </div>
                    <div>
                        {activeMenu === 'kelola_akun' && (
                            <button 
                                onClick={() => setModalState({ isOpen: true, type: 'akunForm', mode: 'create', data: null })}
                                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20"
                            >
                                <Plus size={18} /> Tambah Akun
                            </button>
                        )}
                        {activeMenu === 'promo' && (
                            <button 
                                onClick={() => setModalState({ isOpen: true, type: 'promoForm', mode: 'create', data: null })}
                                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20"
                            >
                                <Plus size={18} /> Buat Promo Baru
                            </button>
                        )}
                        {activeMenu === 'log_aktivitas' && (
                            <button 
                                onClick={handleExportLog}
                                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <Download size={18} /> Export Log
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* Area Konten Utama */}
                <div className="w-full">

                        {renderStatCards()}

                        {/* Konten Kelola Akun */}
                        {activeMenu === 'kelola_akun' && (
                            <AkunTable 
                                data={akunData}
                                onEdit={(row) => setModalState({ isOpen: true, type: 'akunForm', mode: 'edit', data: row })}
                                onDetail={(row) => setDrawerState({ isOpen: true, data: row })}
                                onToggleStatus={handleToggleStatusAkun}
                                onSuspend={handleSuspendAkun}
                                onDelete={handleDeleteAkun}
                                onResetPassword={handleResetPassword}
                            />
                        )}

                        {/* Konten Promo */}
                        {activeMenu === 'promo' && (
                            <>
                                <div className="mb-4 flex items-center justify-end">
                                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                        <button 
                                            onClick={() => setPromoViewMode('list')}
                                            className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${promoViewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-900'}`}
                                            title="Tampilan Tabel"
                                        >
                                            <List size={18} />
                                        </button>
                                        <button 
                                            onClick={() => setPromoViewMode('card')}
                                            className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${promoViewMode === 'card' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-900'}`}
                                            title="Tampilan Card Grid"
                                        >
                                            <LayoutGrid size={18} />
                                        </button>
                                    </div>
                                </div>
                                {promoViewMode === 'list' ? (
                                    <PromoTable 
                                        data={promoData}
                                        onEdit={(row) => setModalState({ isOpen: true, type: 'promoForm', mode: 'edit', data: row })}
                                        onDuplicate={handleDuplicatePromo}
                                        onToggleStatus={handleToggleStatusPromo}
                                        onDelete={handleDeletePromo}
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {promoData.map(promo => (
                                            <PromoDetailCard 
                                                key={promo.id}
                                                data={promo}
                                                onEdit={(row) => setModalState({ isOpen: true, type: 'promoForm', mode: 'edit', data: row })}
                                                onToggleStatus={handleToggleStatusPromo}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Konten Log Aktivitas */}
                        {activeMenu === 'log_aktivitas' && (
                            <>
                                <div className="mb-4 flex items-center justify-end">
                                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                        <button 
                                            onClick={() => setLogViewMode('tabel')}
                                            className={`p-1.5 rounded-md flex items-center justify-center transition-colors px-3 text-xs font-bold uppercase tracking-wider ${logViewMode === 'tabel' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-900'}`}
                                        >
                                            Tabel
                                        </button>
                                        <button 
                                            onClick={() => setLogViewMode('timeline')}
                                            className={`p-1.5 rounded-md flex items-center justify-center transition-colors px-3 text-xs font-bold uppercase tracking-wider ${logViewMode === 'timeline' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-900'}`}
                                        >
                                            Timeline
                                        </button>
                                    </div>
                                </div>
                                <LogTable 
                                    data={logData} 
                                    mode={logViewMode} 
                                    onDetail={handleDetailLog}
                                />
                            </>
                        )}

                    </div>
                </div>

            {/* Modals & Drawers */}
            {modalState.isOpen && modalState.type === 'akunForm' && (
                <AkunFormModal 
                    isOpen={true} 
                    mode={modalState.mode} 
                    data={modalState.data} 
                    onClose={() => setModalState({ ...modalState, isOpen: false })} 
                    onSave={handleSaveAkun} 
                />
            )}

            {modalState.isOpen && modalState.type === 'promoForm' && (
                <PromoFormModal 
                    isOpen={true} 
                    mode={modalState.mode} 
                    data={modalState.data} 
                    onClose={() => setModalState({ ...modalState, isOpen: false })} 
                    onSave={handleSavePromo} 
                />
            )}

            {modalState.isOpen && modalState.type === 'logDetail' && (
                <LogDetailModal 
                    isOpen={true} 
                    data={modalState.data} 
                    onClose={() => setModalState({ ...modalState, isOpen: false })} 
                />
            )}

            <AkunDetailDrawer 
                isOpen={drawerState.isOpen} 
                data={drawerState.data} 
                onClose={() => setDrawerState({ isOpen: false, data: null })} 
                onEdit={(row) => {
                    setDrawerState({ isOpen: false, data: null });
                    setModalState({ isOpen: true, type: 'akunForm', mode: 'edit', data: row });
                }}
            />

            {/* Toast System (Bottom Right) */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
                        toast.type === 'success' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                        }`}>
                            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        </div>
                        {toast.message}
                    </div>
                </div>
            )}
        </div>
    );
}

Settings.layout = (page) => <AdminLayout>{page}</AdminLayout>;

// Dummy icon check circle because lucide-react doesn't have CheckCircle2 without it
const CheckCircle2 = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
