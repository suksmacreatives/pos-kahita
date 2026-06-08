import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import RolePermissionMatrix from './RolePermissionMatrix';
import { roles as fallbackRoles } from '@/data/settingsData';

export default function AkunFormModal({ isOpen, mode, data, onClose, onSave, roles: propRoles, outletList = [] }) {
    const roles = propRoles || fallbackRoles;
    const isEdit = mode === 'edit';
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        telp: '',
        password: '',
        password_confirmation: '',
        role: 'cashier',
        outlet_id: 'denpasar',
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
                outlet_id: data.outlet_id || 'denpasar',
                status: data.status || 'aktif'
            });
        } else if (isOpen && !isEdit) {
            setFormData({
                nama: '', email: '', telp: '', password: '', password_confirmation: '', role: 'cashier', outlet_id: 'denpasar', status: 'aktif'
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
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const selectedRoleData = roles.find(r => r.id === formData.role);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
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
                
                <form onSubmit={handleSubmit} className="p-6 flex-1 space-y-5">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                            <input 
                                type="text" name="nama" value={formData.nama} onChange={handleChange} required
                                className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input 
                                    type="email" name="email" value={formData.email} onChange={handleChange} required
                                    className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                                />
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
                                        type="password" name="password" value={formData.password} onChange={handleChange} required
                                        className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password *</label>
                                    <input 
                                        type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} required
                                        className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                                <select 
                                    name="role" value={formData.role} onChange={handleChange}
                                    className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    {roles.map(r => (
                                        <option key={r.id} value={r.id}>{r.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Outlet *</label>
                                <select 
                                    name="outlet_id" value={formData.outlet_id} onChange={handleChange}
                                    disabled={formData.role === 'admin'}
                                    className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-500"
                                >
                                    <option value="">Semua Outlet</option>
                                    {outletList.map(o => (
                                        <option key={o.id} value={o.id}>{o.name}</option>
                                    ))}
                                </select>
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
    );
}
