import React from 'react';
import { Eye } from 'lucide-react';
import LogBadge from './LogBadge';
import AvatarInitials from '../KelolAkun/AvatarInitials';
import { format, formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useFilter } from '@/Context/FilterContext';

export default function LogTable({ data, mode, onDetail }) {
    const { state: filterState } = useFilter(); // Consume FilterContext
    
    // Additional filtering based on context outlet if needed, though parent might already filter it.
    // For now we just render what we're given assuming parent handles the contextual filtering,
    // or we can apply it here if data is raw. Let's assume raw data.
    const filteredData = React.useMemo(() => {
        if (!filterState || filterState.outlet === 'semua') return data;
        return data.filter(item => item.outlet_id === filterState.outlet || item.outlet_id === null);
    }, [data, filterState]);

    if (mode === 'timeline') {
        // Group by Date
        const grouped = filteredData.reduce((acc, log) => {
            const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
            if (!acc[date]) acc[date] = [];
            acc[date].push(log);
            return acc;
        }, {});

        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 z-10 relative">
                {Object.keys(grouped).length === 0 ? (
                    <div className="text-center py-12 text-gray-500">Tidak ada log aktivitas sesuai filter.</div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(grouped).map(([date, logs]) => (
                            <div key={date}>
                                <h3 className="text-sm font-bold text-gray-900 mb-4 sticky top-0 bg-white/80 backdrop-blur py-2 z-10 border-b border-gray-100 flex items-center justify-between">
                                    <span>{format(new Date(date), 'dd MMMM yyyy', { locale: localeId })}</span>
                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{logs.length} aktivitas</span>
                                </h3>
                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                                    {logs.map(log => (
                                        <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            {/* Dot marker */}
                                            <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-gray-300 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />
                                            
                                            {/* Card */}
                                            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onDetail(log)}>
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <LogBadge aksi={log.aksi} />
                                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{log.modul}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-400 font-medium whitespace-nowrap">
                                                        {format(new Date(log.timestamp), 'HH:mm')}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <AvatarInitials name={log.user_nama} size={24} />
                                                    <span className="text-sm font-bold text-gray-900">{log.user_nama}</span>
                                                    {log.status === 'sukses' ? 
                                                        <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500" title="Sukses"></span> : 
                                                        <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Gagal"></span>
                                                    }
                                                </div>
                                                <div className="text-sm text-gray-600 truncate">
                                                    {log.target_label || 'Melakukan aktivitas sistem'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible relative z-10">
            <div className="overflow-x-auto min-h-[300px]">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outlet</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modul</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Detail</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {filteredData.length > 0 ? filteredData.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-3 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{format(new Date(row.timestamp), 'dd MMM yyyy, HH:mm', { locale: localeId })}</div>
                                    <div className="text-xs text-gray-500">{formatDistanceToNow(new Date(row.timestamp), { addSuffix: true, locale: localeId })}</div>
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <AvatarInitials name={row.user_nama} size={28} />
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{row.user_nama}</div>
                                            <div className="text-[10px] text-gray-500 capitalize">{row.user_role.replace('_', ' ')}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap">
                                    {row.outlet_id ? (
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                            <span className="text-xs text-gray-700 capitalize">{row.outlet_nama}</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-500">—</span>
                                    )}
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap">
                                    <LogBadge aksi={row.aksi} />
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap">
                                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{row.modul}</span>
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap">
                                    <div className="text-xs text-gray-600 max-w-[150px] truncate" title={row.target_label || '-'}>{row.target_label || '-'}</div>
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap">
                                    {row.status === 'sukses' ? (
                                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Sukses</span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs font-bold text-red-600"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Gagal</span>
                                    )}
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onDetail(row)} className="text-gray-400 hover:text-blue-600 p-1 rounded transition-colors bg-white hover:bg-blue-50 border border-transparent hover:border-blue-100" title="Lihat Detail">
                                        <Eye size={16} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                    Tidak ada log aktivitas
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
