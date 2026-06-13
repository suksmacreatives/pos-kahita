import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Store, Plus, ChevronRight } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import OutletStatBar from '@/Components/Admin/Outlets/Index/OutletStatBar';
import OutletMap from '@/Components/Admin/Outlets/Index/OutletMap';
import OutletGrid from '@/Components/Admin/Outlets/Index/OutletGrid';
import OutletFormModal from '@/Components/Admin/Outlets/Index/OutletFormModal';

export default function OutletIndex({ outlets, stats }) {
    const [outletList, setOutletList] = useState(outlets || []);
    const [isFormOpen, setFormOpen] = useState(false);

    const outletData = outlets || [];
    const outletStats = stats || {
        totalAktif: 0,
        totalOmset: 0,
        transaksiHariIni: 0,
        stokMenipis: 0,
    };

    const totalAktif = outletStats.totalAktif || outletData.filter(o => o.status === 'aktif').length;
    const totalOmset = outletStats.totalOmset || 0;
    const totalTrxHariIni = outletStats.transaksiHariIni || 0;
    const totalStokMenipis = outletStats.stokMenipis || 0;

    const handleSave = (data) => {
        router.post(route('admin.outlets.store'), {
            kode: data.kode,
            name: data.nama,
            address: data.alamat,
            kota: data.kota,
            provinsi: data.provinsi,
            kode_pos: data.kode_pos,
            phone: data.telp,
            email: data.email,
            manajer_id: null,
            warna: data.warna,
            tipe: data.tipe,
            luas_m2: data.luas_m2 || null,
            latitude: data.latitude || null,
            longitude: data.longitude || null,
        }, {
            onSuccess: () => {
                setFormOpen(false);
            },
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Head title="Manajemen Outlet" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
                        <span>Dashboard</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-gray-900">Outlets</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                        <Store className="w-7 h-7 text-emerald-500" /> Manajemen Outlet
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">{totalAktif} outlet aktif · Kahita Busana</p>
                </div>

                <button 
                    onClick={() => setFormOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow"
                >
                    <Plus className="w-4 h-4" /> Tambah Outlet Baru
                </button>
            </div>

            <OutletStatBar 
                totalAktif={totalAktif}
                totalOmset={totalOmset}
                transaksiHariIni={totalTrxHariIni}
                stokMenipis={totalStokMenipis}
            />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <OutletMap outlets={outletData} />
            </div>

            <OutletGrid outlets={outletData} />

            <OutletFormModal 
                isOpen={isFormOpen}
                onClose={() => setFormOpen(false)}
                onSave={(data) => { handleSave(data); }}
            />
        </div>
    );
}

OutletIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
