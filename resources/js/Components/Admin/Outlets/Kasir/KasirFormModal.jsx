import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, ChevronDown, CheckCircle2 } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function KasirFormModal({ isOpen, onClose, kasir, outlets = [] }) {
    if (!isOpen) return null;

    const isEditMode = !!kasir;
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [isOutletOpen, setIsOutletOpen] = useState(false);
    const [isShiftOpen, setIsShiftOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const outletRef = useRef(null);
    const shiftRef = useRef(null);
    const statusRef = useRef(null);
    
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

    useEffect(() => {
        function handleClickOutside(e) {
            if (outletRef.current && !outletRef.current.contains(e.target)) setIsOutletOpen(false);
            if (shiftRef.current && !shiftRef.current.contains(e.target)) setIsShiftOpen(false);
            if (statusRef.current && !statusRef.current.contains(e.target)) setIsStatusOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        setErrors(prev => {
            const next = { ...prev };
            if (name === 'password' || name === 'password_confirmation') {
                if (name === 'password') {
                    if (value && value.length < 6) next.password = 'Password minimal 6 karakter';
                    else if (value) delete next.password;
                    const cf = formData.password_confirmation;
                    if (cf) {
                        if (value !== cf) next.password_confirmation = 'Konfirmasi password tidak cocok';
                        else delete next.password_confirmation;
                    }
                } else {
                    if (value) {
                        if (value !== formData.password) next.password_confirmation = 'Konfirmasi password tidak cocok';
                        else delete next.password_confirmation;
                    } else if (next.password_confirmation === 'Konfirmasi password tidak cocok') {
                        delete next.password_confirmation;
                    }
                }
            } else {
                delete next[name];
            }
            return next;
        });
    };

    const handleSelect = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => {
            const next = { ...prev };
            delete next[name];
            return next;
        });
    };

    const computeErrors = (fd) => {
        const errs = {};
        if (!fd.nama.trim()) errs.nama = 'Nama lengkap wajib diisi';
        if (!fd.email.trim()) errs.email = 'Email wajib diisi';
        else if (!/\S+@\S+\.\S+/.test(fd.email)) errs.email = 'Format email tidak valid';
        if (!isEditMode) {
            if (!fd.password) errs.password = 'Password wajib diisi';
            else if (fd.password.length < 6) errs.password = 'Password minimal 6 karakter';
            if (!fd.password_confirmation) errs.password_confirmation = 'Konfirmasi password wajib diisi';
            else if (fd.password !== fd.password_confirmation) errs.password_confirmation = 'Konfirmasi password tidak cocok';
        }
        if (!fd.outlet_id) errs.outlet_id = 'Outlet wajib dipilih';
        return errs;
    };

    const validate = () => {
        const errs = computeErrors(formData);
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        if (!validate()) return;
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

    const shiftOptions = [
        { value: 'pagi', label: 'Pagi (08:00 - 15:00)' },
        { value: 'siang', label: 'Siang (14:00 - 21:00)' },
        { value: 'malam', label: 'Malam (20:00 - 23:00)' },
    ];

    const statusOptions = [
        { value: 'aktif', label: 'Aktif' },
        { value: 'nonaktif', label: 'Nonaktif' },
    ];

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
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

                <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">Nama Lengkap *</label>
                        <input
                            type="text"
                            name="nama"
                            value={formData.nama}
                            onChange={handleChange}
                            placeholder="Misal: Dewi Ayu"
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        />
                        {errors.nama && <p className="text-xs text-red-500 mt-1">{errors.nama}</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="email@kahita.com"
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
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
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">Minimal 6 karakter</p>
                                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1">Konfirmasi Password *</label>
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                />
                                {formData.password && formData.password_confirmation && formData.password === formData.password_confirmation ? (
                                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                        <CheckCircle2 size={14} /> Password cocok
                                    </p>
                                ) : (
                                    errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="pt-2">
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">Tugaskan ke Outlet *</label>
                        <div className="relative z-10" ref={outletRef}>
                            <button
                                type="button"
                                onClick={() => setIsOutletOpen(!isOutletOpen)}
                                className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            >
                                <span className="truncate">{outlets.find(o => o.id == formData.outlet_id)?.nama || outlets.find(o => o.id == formData.outlet_id)?.name || 'Pilih Outlet'}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOutletOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {errors.outlet_id && <p className="text-xs text-red-500 mt-1">{errors.outlet_id}</p>}
                            {isOutletOpen && (
                                <ul className="absolute left-0 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-lg z-40 py-1 text-xs max-h-48 overflow-y-auto">
                                    {outlets.map(out => (
                                        <li key={out.id}
                                            onClick={() => { handleSelect('outlet_id', out.id); setIsOutletOpen(false); }}
                                            className={`px-3 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${formData.outlet_id == out.id ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-600'}`}
                                        >
                                            {out.nama || out.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Shift Default</label>
                            <div className="relative z-10" ref={shiftRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsShiftOpen(!isShiftOpen)}
                                    className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                >
                                    <span className="truncate">{shiftOptions.find(o => o.value === formData.shift_default)?.label || 'Pilih Shift'}</span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isShiftOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isShiftOpen && (
                                    <ul className="absolute left-0 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-lg z-40 py-1 text-xs">
                                        {shiftOptions.map(opt => (
                                            <li key={opt.value}
                                                onClick={() => { handleSelect('shift_default', opt.value); setIsShiftOpen(false); }}
                                                className={`px-3 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${formData.shift_default === opt.value ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-600'}`}
                                            >
                                                {opt.label}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Status Akun</label>
                            <div className="relative z-10" ref={statusRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                                    className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                >
                                    <span className="truncate">{statusOptions.find(o => o.value === formData.status)?.label || 'Pilih Status'}</span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isStatusOpen && (
                                    <ul className="absolute left-0 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-lg z-40 py-1 text-xs">
                                        {statusOptions.map(opt => (
                                            <li key={opt.value}
                                                onClick={() => { handleSelect('status', opt.value); setIsStatusOpen(false); }}
                                                className={`px-3 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${formData.status === opt.value ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-600'}`}
                                            >
                                                {opt.label}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
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
        , document.body
    );
}
