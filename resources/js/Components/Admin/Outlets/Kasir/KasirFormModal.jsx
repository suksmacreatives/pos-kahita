import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function KasirFormModal({ isOpen, onClose, kasir, outlets = [] }) {
    if (!isOpen) return null;

    const isEditMode = !!kasir;
    const [isSaving, setIsSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        telp: '',
        outlet_id: '',
        shift_default: 'pagi',
        status: 'aktif',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (isEditMode && kasir) {
            setFormData({
                nama: kasir.nama || '',
                email: kasir.email || '',
                telp: kasir.telp || '',
                outlet_id: kasir.outlet_id || '',
                shift_default: kasir.shift_default || 'pagi',
                status: kasir.status || 'aktif',
                password: '',
                password_confirmation: '',
            });
        } else {
            setFormData({
                nama: '',
                email: '',
                telp: '',
                outlet_id: outlets.length > 0 ? outlets[0].id : '',
                shift_default: 'pagi',
                status: 'aktif',
                password: '',
                password_confirmation: '',
            });
        }
    }, [kasir, isEditMode, isOpen, outlets]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        if (isEditMode) {
            router.put(route('admin.outlets.kasir.update', kasir.id), formData, {
                onFinish: () => { setIsSaving(false); onClose(); },
                onError: () => setIsSaving(false),
            });
        } else {
            router.post(route('admin.outlets.kasir.store'), formData, {
                onFinish: () => { setIsSaving(false); onClose(); },
                onError: () => setIsSaving(false),
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-extrabold text-gray-900">
                        {isEditMode ? 'Edit Data Kasir' : 'Tambah Kasir Baru'}
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">Nama Lengkap *</label>
                        <input
                            type="text"
                            name="nama"
                            required
                            value={formData.nama}
                            onChange={handleChange}
                            placeholder="Misal: Dewi Ayu"
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Email *</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="email@kahita.com"
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">No. Telp</label>
                            <input
                                type="text"
                                name="telp"
                                value={formData.telp}
                                onChange={handleChange}
                                placeholder="08..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                        </div>
                    </div>

                    {!isEditMode && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1">Password *</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1">Konfirmasi Password *</label>
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    required
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-2">
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">Tugaskan ke Outlet *</label>
                        <select
                            name="outlet_id"
                            required
                            value={formData.outlet_id}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-slate-50 font-medium text-slate-800"
                        >
                                        <option value="">Pilih Outlet</option>
                                        {outlets.map(out => (
                                            <option key={out.id} value={out.id}>{out.nama || out.name}</option>
                                        ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Shift Default</label>
                            <select
                                name="shift_default"
                                value={formData.shift_default}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            >
                                <option value="pagi">Pagi (08:00 - 15:00)</option>
                                <option value="siang">Siang (14:00 - 21:00)</option>
                                <option value="malam">Malam (20:00 - 23:00)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Status Akun</label>
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

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
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
                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" /> {isEditMode ? 'Simpan' : 'Tambah Kasir'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
