import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Info, Users, Activity, Package, Settings } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import DetailHeader from '@/Components/Admin/Outlets/Detail/DetailHeader';
import TabProfil from '@/Components/Admin/Outlets/Detail/TabProfil';
import TabKasir from '@/Components/Admin/Outlets/Detail/TabKasir';
import TabPerforma from '@/Components/Admin/Outlets/Detail/TabPerforma';
import TabStok from '@/Components/Admin/Outlets/Detail/TabStok';
import TabPengaturan from '@/Components/Admin/Outlets/Detail/TabPengaturan';

export default function OutletDetail({ outlet, stats, kasirs, shifts, target, stok, tab }) {
    const initialTab = tab || 'profil';
    const [activeTab, setActiveTab] = useState(initialTab);

    if (!outlet) {
        return (
            <div className="p-12 text-center">
                <p className="text-gray-500">Outlet tidak ditemukan.</p>
            </div>
        );
    }

    const getActiveBorderColor = () => {
        const colorMap = {
            emerald: 'border-emerald-500 text-emerald-700 bg-emerald-50/50',
            blue: 'border-blue-500 text-blue-700 bg-blue-50/50',
            purple: 'border-purple-500 text-purple-700 bg-purple-50/50',
            amber: 'border-amber-500 text-amber-700 bg-amber-50/50',
        };
        return colorMap[outlet.warna] || 'border-emerald-500 text-emerald-700 bg-emerald-50/50';
    };

    const tabs = [
        { id: 'profil', label: 'Profil', icon: Info },
        { id: 'kasir', label: 'Kasir & Staff', icon: Users },
        { id: 'performa', label: 'Performa', icon: Activity },
        { id: 'stok', label: 'Stok', icon: Package },
        { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
    ];

    const outletStats = stats || {
        omset_bulan_ini: 0,
        transaksi_bulan: 0,
        transaksi_hari_ini: 0,
        growth_persen: 0,
        kasir_aktif_count: 0,
        stok_menipis: 0,
        stok_habis: 0,
        rata_transaksi: 0,
        produk_terlaris: { nama: '-', qty_terjual: 0, revenue: 0 },
    };

    const handleDelete = () => {
        router.delete(route('admin.outlets.destroy', outlet.slug || outlet.id));
    };

    const handleSave = (data) => {
        router.put(route('admin.outlets.update', outlet.slug || outlet.id), {
            name: data.nama,
            kode: data.kode,
            tipe: data.tipe,
            status: data.status,
            address: data.alamat,
            kota: data.kota,
            provinsi: data.provinsi,
            kode_pos: data.kode_pos,
            phone: data.telp,
            email: data.email,
            manajer_id: null,
            luas_m2: data.luas_m2 || null,
            konfigurasi: {
                pajak_lokal: Number(data.pajak_lokal) || 0,
                printer_struk: Boolean(data.printer_struk),
            },
        }, {
            onSuccess: () => {
                setActiveTab('profil');
            },
        });
    };

    return (
        <div className="space-y-6">
            <Head title={`Outlet ${outlet.nama || ''}`} />

            <DetailHeader outlet={outlet} stats={outletStats} />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-2 flex overflow-x-auto">
                {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                                isActive 
                                    ? getActiveBorderColor()
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-slate-50'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="pt-2">
                {activeTab === 'profil' && <TabProfil outlet={outlet} />}
                {activeTab === 'kasir' && <TabKasir outlet={outlet} kasirs={kasirs} shifts={shifts} />}
                {activeTab === 'performa' && <TabPerforma outlet={outlet} stats={outletStats} target={target} />}
                {activeTab === 'stok' && <TabStok outlet={outlet} stats={outletStats} stok={stok} />}
                {activeTab === 'pengaturan' && (
                    <TabPengaturan 
                        outlet={outlet} 
                        onSave={handleSave}
                        onDelete={handleDelete}
                    />
                )}
            </div>
            
        </div>
    );
}

OutletDetail.layout = (page) => <AdminLayout>{page}</AdminLayout>;
