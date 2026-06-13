import React from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Phone, Calendar, AlertTriangle, KeyRound, Edit } from 'lucide-react';
import AvatarInitials from './AvatarInitials';
import RolePermissionMatrix from './RolePermissionMatrix';
import { roles as fallbackRoles } from '@/data/settingsData';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function AkunDetailDrawer({ isOpen, data, onClose, onEdit, roles: propRoles, userLogs: propLogs }) {
    if (!isOpen || !data) return null;

    const roles = propRoles || fallbackRoles;
    const roleData = roles.find(r => r.id === data.role);
    const userLogs = propLogs || [];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'aktif': return <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Aktif</span>;
            case 'nonaktif': return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Nonaktif</span>;
            case 'suspended': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1"><AlertTriangle size={12} /> Suspended</span>;
            default: return null;
        }
    };

    const getRoleColor = (roleId) => {
        const mapping = { admin: 'bg-blue-100 text-blue-800', cashier: 'bg-amber-100 text-amber-800' };
        return mapping[roleId] || 'bg-gray-100 text-gray-800';
    };

    return createPortal(
        <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 w-full max-w-[420px] bg-white h-full shadow-2xl z-[70] flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Detail Akun</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Profil */}
                    <div className="flex flex-col items-center text-center">
                        <AvatarInitials name={data.nama} color={data.foto_color} size={64} />
                        <h3 className="mt-3 text-xl font-bold text-gray-900">{data.nama}</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase ${getRoleColor(data.role)}`}>
                                {roleData?.label}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                                {data.outlet_id ? data.outlet_nama : 'Semua Outlet'}
                            </span>
                        </div>
                        
                        <div className="mt-5 w-full space-y-3 text-sm text-gray-600 bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <Mail size={16} className="text-gray-400" />
                                <span>{data.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone size={16} className="text-gray-400" />
                                <span>{data.telp || '-'}</span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-gray-400" />
                                    <span className="text-xs">Dibuat: {format(new Date(data.created_at), 'dd MMM yyyy', { locale: localeId })}</span>
                                </div>
                                {getStatusBadge(data.status)}
                            </div>
                        </div>
                    </div>

                    {/* Hak Akses */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Hak Akses Sistem</h4>
                        <RolePermissionMatrix permissions={roleData?.permissions} />
                    </div>

                    {/* Aktivitas Terakhir */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Aktivitas Terakhir</h4>
                        {userLogs.length > 0 ? (
                            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                {userLogs.map((log, idx) => (
                                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-slate-300 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />
                                        <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-3 rounded border border-slate-200 shadow-sm">
                                            <div className="flex items-center justify-between space-x-2 mb-1">
                                                <div className="font-bold text-slate-900 text-xs">{log.aksi}</div>
                                                <div className="text-[10px] text-slate-500">{format(new Date(log.timestamp), 'dd MMM HH:mm')}</div>
                                            </div>
                                            <div className="text-slate-500 text-xs truncate" title={log.target_label}>{log.modul} - {log.target_label || 'Sistem'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                Belum ada aktivitas
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                    <button 
                        onClick={() => { onClose(); onEdit(data); }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        <Edit size={16} /> Edit Akun
                    </button>
                    <button 
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => alert('Fitur reset password belum tersedia')}
                    >
                        <KeyRound size={16} /> Reset Password
                    </button>
                </div>
            </div>
        </>,
        document.body
    );
}
