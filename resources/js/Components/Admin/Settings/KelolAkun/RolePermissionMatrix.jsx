import React from 'react';
import { Check, Minus } from 'lucide-react';

export default function RolePermissionMatrix({ permissions }) {
    if (!permissions) return null;

    const modules = [
        { key: 'dashboard', label: 'Dashboard' },
        { key: 'products', label: 'Products' },
        { key: 'inventory', label: 'Inventory' },
        { key: 'transactions', label: 'Transaksi' },
        { key: 'reports', label: 'Reports' },
        { key: 'settings', label: 'Settings' }
    ];

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modul</th>
                        <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Lihat</th>
                        <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Edit</th>
                        <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Khusus</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {modules.map((mod, idx) => {
                        const perm = permissions[mod.key] || {};
                        const canView = perm.view === true;
                        const canEdit = perm.edit === true;
                        
                        // Handle khusus
                        let khususLabel = '-';
                        let canKhusus = false;
                        if (mod.key === 'transactions') {
                            if (perm.void || perm.refund) {
                                canKhusus = true;
                                khususLabel = [perm.void && 'Void', perm.refund && 'Refund'].filter(Boolean).join(', ');
                            }
                        } else if (mod.key === 'reports') {
                            if (perm.export) {
                                canKhusus = true;
                                khususLabel = 'Export';
                            }
                        }

                        return (
                            <tr key={idx} className="hover:bg-gray-50/50">
                                <td className="px-3 py-2.5 whitespace-nowrap text-sm font-medium text-gray-700">
                                    {mod.label}
                                </td>
                                <td className="px-3 py-2.5 text-center">
                                    {canView ? <Check size={16} className="text-emerald-500 mx-auto" /> : <Minus size={16} className="text-gray-300 mx-auto" />}
                                </td>
                                <td className="px-3 py-2.5 text-center">
                                    {canEdit ? <Check size={16} className="text-emerald-500 mx-auto" /> : <Minus size={16} className="text-gray-300 mx-auto" />}
                                </td>
                                <td className="px-3 py-2.5 text-center text-xs font-medium">
                                    {canKhusus ? (
                                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center justify-center gap-1 w-max mx-auto">
                                            <Check size={12} /> {khususLabel}
                                        </span>
                                    ) : (
                                        <Minus size={16} className="text-gray-300 mx-auto" />
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
