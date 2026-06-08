import React, { useState } from 'react';
import { Save, AlertTriangle } from 'lucide-react';

export default function TabPengaturan({ outlet, onSave, onDelete }) {
    if (!outlet) return null;

    const [isSaving, setIsSaving] = useState(false);
    const konfig = outlet.konfigurasi || {};
    const [formData, setFormData] = useState({
        nama: outlet.nama,
        kode: outlet.kode,
        tipe: outlet.tipe,
        status: outlet.status,
        alamat: outlet.alamat,
        kota: outlet.kota,
        provinsi: outlet.provinsi,
        kode_pos: outlet.kode_pos,
        telp: outlet.telp,
        email: outlet.email,
        manajer_nama: outlet.manajer_nama,
        manajer_telp: outlet.manajer_telp,
        pajak_lokal: konfig.pajak_lokal || 0,
        printer_struk: konfig.printer_struk || false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            onSave(formData);
            setIsSaving(false);
        }, 800);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-gray-900">Informasi Dasar</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">Nama Outlet *</label>
                        <input
                            type="text"
                            name="nama"
                            value={formData.nama}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">Kode Outlet *</label>
                        <input
                            type="text"
                            name="kode"
                            value={formData.kode}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono bg-slate-50 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">Tipe Outlet</label>
                        <select
                            name="tipe"
                            value={formData.tipe}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        >
                            <option value="flagship">Flagship</option>
                            <option value="cabang">Cabang</option>
                            <option value="kiosk">Kiosk</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">Status Operasional</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        >
                            <option value="aktif">Aktif</option>
                            <option value="nonaktif">Nonaktif</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-gray-900">Lokasi & Kontak</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">Alamat Lengkap</label>
                        <textarea
                            name="alamat"
                            value={formData.alamat}
                            onChange={handleChange}
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Kota</label>
                            <input
                                type="text"
                                name="kota"
                                value={formData.kota}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Provinsi</label>
                            <input
                                type="text"
                                name="provinsi"
                                value={formData.provinsi}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Kode Pos</label>
                            <input
                                type="text"
                                name="kode_pos"
                                value={formData.kode_pos}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Nomor Telepon</label>
                            <input
                                type="text"
                                name="telp"
                                value={formData.telp}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Email Outlet</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-gray-900">Manajer & Konfigurasi</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Nama Manajer</label>
                            <input
                                type="text"
                                name="manajer_nama"
                                value={formData.manajer_nama}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Telepon Manajer</label>
                            <input
                                type="text"
                                name="manajer_telp"
                                value={formData.manajer_telp}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Pajak Lokal (%)</label>
                            <input
                                type="number"
                                name="pajak_lokal"
                                value={formData.pajak_lokal}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                        </div>
                        <div className="pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="printer_struk"
                                    checked={formData.printer_struk}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                />
                                <span className="text-[11px] font-bold text-gray-700">Aktifkan Printer Struk Default</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-red-50 rounded-2xl border border-red-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-red-100 flex justify-between items-center">
                    <h3 className="font-bold text-red-800 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Zona Bahaya
                    </h3>
                </div>
                <div className="p-6 flex items-center justify-between">
                    <div>
                        <p className="font-bold text-red-900 text-sm">Hapus Outlet Permanen</p>
                        <p className="text-xs text-red-700 mt-0.5">Tindakan ini tidak dapat dibatalkan. Semua data terkait outlet akan dinonaktifkan atau dihapus.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            if (window.confirm(`Yakin ingin menghapus outlet "${outlet.nama}"? Tindakan ini tidak dapat dibatalkan.`)) {
                                onDelete?.();
                            }
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
                    >
                        Hapus Outlet
                    </button>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                >
                    {isSaving ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" /> Simpan Perubahan
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
