import React, { useState } from 'react';
import { Search, Edit, Eye, MoreVertical, AlertTriangle, ShieldOff, Trash2, KeyRound } from 'lucide-react';
import AvatarInitials from './AvatarInitials';
import { roles } from '@/data/settingsData';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function AkunTable({ data, onEdit, onDetail, onToggleStatus, onSuspend, onDelete, onResetPassword }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('Semua Role');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null); // { type: 'delete'|'suspend', id: string }

    const filteredData = data.filter(item => {
        const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchRole = roleFilter === 'Semua Role' || item.role === roleFilter;
        const matchStatus = statusFilter === 'Semua Status' || item.status === statusFilter;
        return matchSearch && matchRole && matchStatus;
    });

    const getRoleBadge = (roleId) => {
        const role = roles.find(r => r.id === roleId);
        if (!role) return null;
        const colors = {
            super_admin: 'bg-purple-100 text-purple-800',
            admin: 'bg-blue-100 text-blue-800',
            manajer: 'bg-emerald-100 text-emerald-800',
            kasir: 'bg-amber-100 text-amber-800'
        };
        return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colors[roleId] || 'bg-gray-100 text-gray-800'}`}>{role.label}</span>;
    };

    const toggleDropdown = (id) => {
        if (activeDropdown === id) setActiveDropdown(null);
        else setActiveDropdown(id);
        setConfirmAction(null);
    };

    const handleConfirm = (actionType, id) => {
        if (actionType === 'delete') onDelete(id);
        if (actionType === 'suspend') onSuspend(id);
        setConfirmAction(null);
        setActiveDropdown(null);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible relative z-10">
            {/* Filter Bar */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50 rounded-t-2xl">
                <div className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari nama / email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-white border border-gray-200 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2"
                    >
                        <option value="Semua Role">Semua Role</option>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white border border-gray-200 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2"
                    >
                        <option value="Semua Status">Semua Status</option>
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Nonaktif</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto min-h-[300px]">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akun</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outlet</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {filteredData.length > 0 ? filteredData.map((row, idx) => (
                            <tr key={row.id} className="hover:bg-gray-50 transition-colors relative">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{idx + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <AvatarInitials name={row.nama} color={row.foto_color} size={36} />
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{row.nama}</div>
                                            <div className="text-xs text-gray-500">{row.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getRoleBadge(row.role)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {row.outlet_id ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span className="text-sm text-gray-700 font-medium capitalize">{row.outlet_nama}</span>
                                        </div>
                                    ) : (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">Semua Outlet</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-700" title={row.last_login}>
                                        {formatDistanceToNow(new Date(row.last_login), { addSuffix: true, locale: localeId })}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {row.status === 'aktif' && <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Aktif</span>}
                                    {row.status === 'nonaktif' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Nonaktif</span>}
                                    {row.status === 'suspended' && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertTriangle size={12} /> Suspended</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2 relative">
                                        <button onClick={() => onEdit(row)} className="text-gray-400 hover:text-amber-600 p-1 rounded transition-colors" title="Edit">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => onDetail(row)} className="text-gray-400 hover:text-blue-600 p-1 rounded transition-colors" title="Detail">
                                            <Eye size={18} />
                                        </button>
                                        <div className="relative">
                                            <button 
                                                onClick={() => toggleDropdown(row.id)} 
                                                className={`p-1 rounded transition-colors ${activeDropdown === row.id ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {activeDropdown === row.id && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                                                    {!confirmAction ? (
                                                        <>
                                                            <button onClick={() => { setActiveDropdown(null); onResetPassword(row); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                                <KeyRound size={16} className="text-blue-500" /> Reset Password
                                                            </button>
                                                            <button onClick={() => { setActiveDropdown(null); onToggleStatus(row); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                                <ShieldOff size={16} className={row.status === 'aktif' ? 'text-amber-500' : 'text-emerald-500'} /> {row.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                                                            </button>
                                                            {row.status !== 'suspended' && (
                                                                <button onClick={() => setConfirmAction({ type: 'suspend', id: row.id })} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                                    <AlertTriangle size={16} className="text-orange-500" /> Suspend Akun
                                                                </button>
                                                            )}
                                                            <button onClick={() => setConfirmAction({ type: 'delete', id: row.id })} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                                <Trash2 size={16} className="text-red-500" /> Hapus Akun
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="p-3 text-left">
                                                            <div className="text-xs text-gray-900 font-bold mb-2 text-wrap">
                                                                {confirmAction.type === 'delete' ? `Yakin hapus akun ${row.nama}? Tindakan ini tidak dapat dibatalkan.` : `Yakin suspend akun ${row.nama}?`}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => setConfirmAction(null)} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50">Batal</button>
                                                                <button onClick={() => handleConfirm(confirmAction.type, row.id)} className={`flex-1 px-2 py-1.5 rounded text-xs font-medium text-white ${confirmAction.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'}`}>Ya</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                    Tidak ada data akun yang sesuai
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
