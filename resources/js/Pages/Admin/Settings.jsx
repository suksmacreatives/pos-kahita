import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { Users, UserCheck, ShoppingBag, UserX, Plus, Tag, Zap, Clock, BarChart2, List, LayoutGrid, Activity, LogIn, AlertCircle, Download, Bell, BellDot, Eye, CheckCheck } from 'lucide-react';

import AkunTable from '@/Components/Admin/Settings/KelolAkun/AkunTable';
import AkunFormModal from '@/Components/Admin/Settings/KelolAkun/AkunFormModal';
import AkunDetailDrawer from '@/Components/Admin/Settings/KelolAkun/AkunDetailDrawer';
import ResetPasswordModal from '@/Components/Admin/Settings/KelolAkun/ResetPasswordModal';

import PromoTable from '@/Components/Admin/Settings/Promo/PromoTable';
import PromoDetailCard from '@/Components/Admin/Settings/Promo/PromoDetailCard';
import PromoFormModal from '@/Components/Admin/Settings/Promo/PromoFormModal';

import LogTable from '@/Components/Admin/Settings/LogAktivitas/LogTable';
import LogDetailModal from '@/Components/Admin/Settings/LogAktivitas/LogDetailModal';

import NotifikasiTable from '@/Components/Admin/Settings/Notifikasi/NotifikasiTable';

export default function Settings() {
    const { url } = usePage();
    const props = usePage().props;

    const [toast, setToast] = useState(null);

    let activeMenu = 'kelola_akun';
    if (url.includes('tab=promo')) activeMenu = 'promo';
    else if (url.includes('tab=log_aktivitas')) activeMenu = 'log_aktivitas';
    else if (url.includes('tab=notifikasi')) activeMenu = 'notifikasi';

    const [logViewMode, setLogViewMode] = useState('tabel');
    const [promoViewMode, setPromoViewMode] = useState('list');

    const accounts = props.accounts || [];
    const promos = props.promos || [];
    const logs = props.logs || [];
    const notifications = props.notifications || { data: [], links: [] };
    const akunStats = props.akun_stats || { total: 0, aktif: 0, kasir: 0, nonaktif_suspended: 0 };
    const promoStats = props.promo_stats || { total: 0, aktif: 0, hampir_habis: 0, total_terpakai: 0 };
    const logStats = props.log_stats || { total_hari_ini: 0, login_hari_ini: 0, gagal_hari_ini: 0, user_teraktif: { nama: 'Tidak ada', count: 0 } };
    const notifStats = props.notif_stats || { total: 0, unread: 0, hari_ini: 0, danger: 0, warning: 0 };
    const outletList = props.outlet_list || [];

    const [modalState, setModalState] = useState({ isOpen: false, type: null, mode: 'create', data: null });
    const [drawerState, setDrawerState] = useState({ isOpen: false, data: null });
    const [resetModal, setResetModal] = useState({ isOpen: false, data: null });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const flash = props.flash;
        if (flash?.success) showToast(flash.success);
        else if (flash?.error) showToast(flash.error, 'error');
    }, [props.flash]);

    const handleSaveAkun = (formData) => {
        const isEdit = modalState.mode === 'edit' && modalState.data?.id;
        const url = isEdit
            ? route('admin.settings.akun.update', modalState.data.id)
            : route('admin.settings.akun.store');
        const method = isEdit ? 'patch' : 'post';

        const payload = {
            name: formData.nama,
            email: formData.email,
            telp: formData.telp || null,
            role: formData.role,
            outlet_id: formData.outlet_id || null,
            status: formData.status,
        };

        if (!isEdit) {
            payload.password = formData.password || 'password';
        }

        router[method](url, payload, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setModalState({ ...modalState, isOpen: false });
            },
            onError: (errors) => {
                showToast(Object.values(errors).join(', '), 'error');
            },
        });
    };

    const handleToggleStatusAkun = (akun) => {
        router.patch(route('admin.settings.akun.toggle-status', akun.id), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSuspendAkun = (id) => {
        router.patch(route('admin.settings.akun.suspend', id), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDeleteAkun = (id) => {
        router.delete(route('admin.settings.akun.destroy', id), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleResetPassword = (akun) => {
        setResetModal({ isOpen: true, data: akun });
    };

    const handleSubmitResetPassword = (akun, payload) => {
        router.post(route('admin.settings.akun.reset-password', akun.id), payload, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setResetModal({ isOpen: false, data: null });
            },
            onError: (errors) => {
                showToast(Object.values(errors).join(', '), 'error');
                setResetModal((prev) => ({ ...prev, isOpen: true }));
            },
        });
    };

    const handleSavePromo = (data) => {
        const isEdit = modalState.mode === 'edit' && modalState.data?.id;
        const url = isEdit
            ? route('admin.settings.promo.update', modalState.data.id)
            : route('admin.settings.promo.store');
        const method = isEdit ? 'patch' : 'post';

        router[method](url, data, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setModalState({ ...modalState, isOpen: false });
            },
            onError: (errors) => {
                showToast(Object.values(errors).join(', '), 'error');
            },
        });
    };

    const handleToggleStatusPromo = (promo) => {
        router.patch(route('admin.settings.promo.toggle-status', promo.id), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDuplicatePromo = (promo) => {
        router.post(route('admin.settings.promo.duplicate', promo.id), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDeletePromo = (id) => {
        router.delete(route('admin.settings.promo.destroy', id), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleExportLog = () => {
        window.open(route('admin.settings.log.export'), '_blank');
    };

    const handleDetailLog = (log) => {
        setModalState({ isOpen: true, type: 'logDetail', mode: 'view', data: log });
    };

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
        } else if (activeMenu === 'notifikasi') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500"><Bell size={24} /></div>
                        <div><div className="text-2xl font-bold text-gray-900 leading-none">{notifStats.total}</div><div className="text-xs text-gray-500 mt-1 font-medium">Total notifikasi</div></div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 relative">
                            {notifStats.unread > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>}
                            <BellDot size={24} />
                        </div>
                        <div><div className="text-2xl font-bold text-gray-900 leading-none">{notifStats.unread}</div><div className="text-xs text-gray-500 mt-1 font-medium">Belum dibaca</div></div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Activity size={24} /></div>
                        <div><div className="text-2xl font-bold text-gray-900 leading-none">{notifStats.hari_ini}</div><div className="text-xs text-gray-500 mt-1 font-medium">Hari ini</div></div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                            {notifStats.danger > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>}
                            <AlertCircle size={24} />
                        </div>
                        <div><div className="text-2xl font-bold text-gray-900 leading-none">{notifStats.danger}</div><div className="text-xs text-gray-500 mt-1 font-medium">Kritis</div></div>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <Head title="Pengaturan" />

            <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {activeMenu === 'kelola_akun' && 'Atur pengguna, role, dan hak akses sistem'}
                            {activeMenu === 'promo' && 'Atur program promo dan kode diskon'}
                            {activeMenu === 'log_aktivitas' && 'Riwayat semua aksi pengguna di sistem'}
                            {activeMenu === 'notifikasi' && 'Riwayat semua notifikasi sistem'}
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
                        {activeMenu === 'notifikasi' && notifStats.unread > 0 && (
                            <button
                                onClick={() => router.post(route('admin.notifications.read-all'), {}, { preserveState: true, preserveScroll: true })}
                                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20"
                            >
                                <CheckCheck size={18} /> Tandai Semua Dibaca
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="w-full">
                    {renderStatCards()}

                    {activeMenu === 'kelola_akun' && (
                        <AkunTable
                            data={accounts}
                            onEdit={(row) => setModalState({ isOpen: true, type: 'akunForm', mode: 'edit', data: row })}
                            onDetail={(row) => setDrawerState({ isOpen: true, data: row })}
                            onToggleStatus={handleToggleStatusAkun}
                            onSuspend={handleSuspendAkun}
                            onDelete={handleDeleteAkun}
                            onResetPassword={handleResetPassword}
                        />
                    )}

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
                                    data={promos}
                                    onEdit={(row) => setModalState({ isOpen: true, type: 'promoForm', mode: 'edit', data: row })}
                                    onDuplicate={handleDuplicatePromo}
                                    onToggleStatus={handleToggleStatusPromo}
                                    onDelete={handleDeletePromo}
                                />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {promos.map(promo => (
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
                                data={logs}
                                mode={logViewMode}
                                onDetail={handleDetailLog}
                            />
                        </>
                    )}

                    {activeMenu === 'notifikasi' && (
                        <NotifikasiTable data={notifications} />
                    )}
                </div>
            </div>

            {modalState.isOpen && modalState.type === 'akunForm' && (
                <AkunFormModal
                    isOpen={true}
                    mode={modalState.mode}
                    data={modalState.data}
                    roles={props.roles || []}
                    outletList={outletList}
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
                roles={props.roles}
                userLogs={logs.filter(l => l.user_id == drawerState.data?.id).slice(0, 5)}
                onClose={() => setDrawerState({ isOpen: false, data: null })}
                onEdit={(row) => {
                    setDrawerState({ isOpen: false, data: null });
                    setModalState({ isOpen: true, type: 'akunForm', mode: 'edit', data: row });
                }}
                onResetPassword={(row) => {
                    setDrawerState({ isOpen: false, data: null });
                    setResetModal({ isOpen: true, data: row });
                }}
            />

            <ResetPasswordModal
                isOpen={resetModal.isOpen}
                data={resetModal.data}
                onClose={() => setResetModal({ isOpen: false, data: null })}
                onSubmit={handleSubmitResetPassword}
            />

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

const CheckCircle2 = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
