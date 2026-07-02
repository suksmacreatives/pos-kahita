import React from 'react';
import { router } from '@inertiajs/react';
import { Bell, BellDot, Package, Clock, AlertTriangle, Info, CheckCircle } from 'lucide-react';

const NOTIF_ICONS = { package: Package, clock: Clock, 'alert-triangle': AlertTriangle, bell: Bell, info: Info };
const SEVERITY_COLORS = { danger: 'bg-red-500', warning: 'bg-amber-500', info: 'bg-blue-500', success: 'bg-emerald-500' };

export default function NotifikasiTable({ data }) {
    const notifications = data?.data || [];
    const pagination = data?.links || [];

    const markAsRead = (id) => {
        router.post(route('admin.notifications.read', id), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const markAllAsRead = () => {
        router.post(route('admin.notifications.read-all'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    if (notifications.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">Tidak ada notifikasi</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-10">#</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pesan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Waktu</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {notifications.map((n, idx) => {
                            const IconComp = NOTIF_ICONS[n.icon] || Bell;
                            const dotColor = SEVERITY_COLORS[n.severity] || 'bg-gray-400';
                            return (
                                <tr key={n.id} className={`hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-emerald-50/30' : ''}`}>
                                    <td className="px-6 py-3 whitespace-nowrap text-xs text-gray-400 font-mono">
                                        {data.from + idx}
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-start gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-gray-100 text-gray-500">
                                                <IconComp size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`text-sm leading-normal ${n.is_read ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                                                    {n.message}
                                                </p>
                                                {n.link && n.link !== '#' && (
                                                    <a href={n.link} className="text-[10px] text-blue-600 hover:underline mt-0.5 inline-block">
                                                        Lihat detail
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap">
                                        <div className="text-xs text-gray-900">{n.created_at ? new Date(n.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</div>
                                        <div className="text-[10px] text-gray-500 mt-0.5">{n.time_ago}</div>
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap">
                                        {n.is_read ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                <CheckCircle size={10} /> Dibaca
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                                                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                                                Baru
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap text-right">
                                        {!n.is_read ? (
                                            <button
                                                onClick={() => markAsRead(n.id)}
                                                className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                Tandai dibaca
                                            </button>
                                        ) : (
                                            <span className="text-[10px] text-gray-400">—</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {pagination.length > 2 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="text-[10px] text-gray-500 font-medium">
                        Menampilkan {data.from}–{data.to} dari {data.total}
                    </div>
                    <div className="flex items-center gap-1">
                        {data.links.map((link, i) => {
                            if (!link.url) {
                                return (
                                    <span
                                        key={i}
                                        className="px-2.5 py-1.5 text-[10px] text-gray-300 rounded-lg cursor-not-allowed"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            }
                            const isActive = link.active;
                            return (
                                <button
                                    key={i}
                                    onClick={() => router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                    className={`px-2.5 py-1.5 text-[10px] font-semibold rounded-lg transition-colors ${
                                        isActive
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
