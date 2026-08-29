import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown, CheckCircle2 } from 'lucide-react';
import RolePermissionMatrix from './RolePermissionMatrix';
import { roles as fallbackRoles } from '@/data/settingsData';

export default function AkunFormModal({ isOpen, mode, data, onClose, onSave, roles: propRoles, outletList = [] }) {
    const roles = propRoles || fallbackRoles;
    const isEdit = mode === 'edit';
    const defaultOutletId = outletList[0]?.id || '';
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        telp: '',
        password: '',
        password_confirmation: '',
        role: 'cashier',
        outlet_id: defaultOutletId,
        status: 'aktif'
    });

    useEffect(() => {
        if (isOpen && isEdit && data) {
            setFormData({
                nama: data.nama || '',
                email: data.email || '',
                telp: data.telp || '',
                password: '',
                password_confirmation: '',
                role: data.role || 'cashier',
                outlet_id: data.outlet_id || defaultOutletId,
                status: data.status || 'aktif'
            });
        } else if (isOpen && !isEdit) {
            setFormData({
                nama: '', email: '', telp: '', password: '', password_confirmation: '', role: 'cashier', outlet_id: defaultOutletId, status: 'aktif'
            });
        }
    }, [isOpen, isEdit, data]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const next = { ...prev, [name]: value };
            // Auto reset outlet logic
            if (name === 'role') {
                if (value === 'admin') {
                    next.outlet_id = '';
                } else if (prev.outlet_id === '') {
                    next.outlet_id = outletList[0]?.id || '';
                }
            }
            return next;
        });

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
                if (name === 'role' && value === 'admin') delete next.outlet_id;
            }
            return next;
        });
    };

    const computeErrors = (fd) => {
        const errs = {};
        if (!fd.nama.trim()) errs.nama = 'Nama lengkap wajib diisi';
        if (!fd.email.trim()) errs.email = 'Email wajib diisi';
        else if (!/\S+@\S+\.\S+/.test(fd.email)) errs.email = 'Format email tidak valid';
        if (!isEdit) {
            if (!fd.password) errs.password = 'Password wajib diisi';
            else if (fd.password.length < 6) errs.password = 'Password minimal 6 karakter';
            if (!fd.password_confirmation) errs.password_confirmation = 'Konfirmasi password wajib diisi';
            else if (fd.password !== fd.password_confirmation) errs.password_confirmation = 'Konfirmasi password tidak cocok';
        }
        if (!fd.role) errs.role = 'Role wajib dipilih';
        if (fd.role === 'cashier' && !fd.outlet_id) errs.outlet_id = 'Outlet wajib dipilih untuk kasir';
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
        onSave(formData);
    };

    const selectedRoleData = roles.find(r => r.id === formData.role);

    const [isRoleOpen, setIsRoleOpen] = useState(false);
    const [isOutletOpen, setIsOutletOpen] = useState(false);
    const roleRef = useRef(null);
    const outletRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (roleRef.current && !roleRef.current.contains(e.target)) setIsRoleOpen(false);
            if (outletRef.current && !outletRef.current.contains(e.target)) setIsOutletOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (name, value) => {
        setFormData(prev => {
            const next = { ...prev, [name]: value };
            if (name === 'role') {
                if (value === 'admin') {
                    next.outlet_id = '';
                } else if (prev.outlet_id === '') {
                    next.outlet_id = outletList[0]?.id || '';
                }
            }
            return next;
        });
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">
                        {isEdit ? 'Edit Akun' : 'Tambah Akun Baru'}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} noValidate className="p-6 flex-1 space-y-5">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                            <input 
                                type="text" name="nama" value={formData.nama} onChange={handleChange}
                                className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {errors.nama && <p className="text-xs text-red-500 mt-1">{errors.nama}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input 
                                    type="email" name="email" value={formData.email} onChange={handleChange}
                                    className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                                <input 
                                    type="text" name="telp" value={formData.telp} onChange={handleChange}
                                    className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                        </div>

                        {!isEdit && (
                            <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-100 py-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                    <input 
                                        type="password" name="password" value={formData.password} onChange={handleChange}
                                        className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Minimal 6 karakter</p>
                                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password *</label>
                                    <input 
                                        type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange}
                                        className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                                <div className="relative" ref={roleRef}>
                                    <button
                                        type="button"
                                        onClick={() => setIsRoleOpen(!isRoleOpen)}
                                        className="flex items-center justify-between w-full rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    >
                                        <span className="truncate text-gray-700 font-medium">{roles.find(r => r.id === formData.role)?.label || 'Pilih Role'}</span>
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isRoleOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
                                    {isRoleOpen && (
                                        <ul className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-40 py-1 text-sm">
                                            {roles.map(r => (
                                                <li key={r.id}
                                                    onClick={() => { handleSelect('role', r.id); setIsRoleOpen(false); }}
                                                    className={`px-3 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${formData.role === r.id ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-600'}`}
                                                >
                                                    {r.label}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Outlet *</label>
                                <div className="relative" ref={outletRef}>
                                    <button
                                        type="button"
                                        onClick={() => formData.role !== 'admin' && setIsOutletOpen(!isOutletOpen)}
                                        className="flex items-center justify-between w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-500"
                                        style={{ pointerEvents: formData.role === 'admin' ? 'none' : 'auto', opacity: formData.role === 'admin' ? 0.5 : 1 }}
                                    >
                                        <span className="truncate text-gray-700 font-medium">{formData.outlet_id ? (outletList.find(o => o.id === formData.outlet_id)?.name || formData.outlet_id) : 'Semua Outlet'}</span>
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOutletOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {errors.outlet_id && <p className="text-xs text-red-500 mt-1">{errors.outlet_id}</p>}
                                    {isOutletOpen && formData.role !== 'admin' && (
                                        <ul className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-40 py-1 text-sm">
                                            <li
                                                onClick={() => { handleSelect('outlet_id', ''); setIsOutletOpen(false); }}
                                                className={`px-3 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${formData.outlet_id === '' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-600'}`}
                                            >
                                                Semua Outlet
                                            </li>
                                            {outletList.map(o => (
                                                <li key={o.id}
                                                    onClick={() => { handleSelect('outlet_id', o.id); setIsOutletOpen(false); }}
                                                    className={`px-3 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${formData.outlet_id === o.id ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-600'}`}
                                                >
                                                    {o.name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Preview Hak Akses */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <h4 className="text-sm font-bold text-gray-900 mb-1">Preview Hak Akses: {selectedRoleData?.label}</h4>
                            <p className="text-xs text-gray-500 mb-3">{selectedRoleData?.deskripsi}</p>
                            <RolePermissionMatrix permissions={selectedRoleData?.permissions} />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white">
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Status Akun</h4>
                                <p className="text-xs text-gray-500">Akun nonaktif tidak bisa login</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={formData.status === 'aktif'} 
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'aktif' : 'nonaktif' }))} 
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                        <button 
                            type="button" onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-emerald-600 rounded-lg text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
                        >
                            {isEdit ? 'Simpan Perubahan' : 'Simpan Akun'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        , document.body
    );
}

