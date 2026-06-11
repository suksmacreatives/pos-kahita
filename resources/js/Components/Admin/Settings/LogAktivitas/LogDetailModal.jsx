import React from 'react';
import { createPortal } from 'react-dom';
import { X, Globe, Monitor, MapPin, Hash, User, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import LogBadge from './LogBadge';

export default function LogDetailModal({ isOpen, data, onClose }) {
    if (!isOpen || !data) return null;

    const renderDetail = () => {
        if (!data.detail) return <div className="text-sm text-gray-500 italic">Tidak ada detail perubahan tercatat.</div>;

        if (data.aksi === 'EDIT' && data.detail.sebelum && data.detail.sesudah) {
            const keys = Array.from(new Set([...Object.keys(data.detail.sebelum), ...Object.keys(data.detail.sesudah)]));
            return (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden text-sm">
                    <div className="grid grid-cols-2 bg-gray-50 border-b border-gray-200">
                        <div className="px-4 py-2 font-bold text-gray-500 border-r border-gray-200">SEBELUM</div>
                        <div className="px-4 py-2 font-bold text-gray-500">SESUDAH</div>
                    </div>
                    {keys.map(k => {
                        const sB = data.detail.sebelum[k];
                        const sS = data.detail.sesudah[k];
                        const isChanged = sB !== sS;
                        return (
                            <div key={k} className={`grid grid-cols-2 border-b border-gray-100 last:border-0 ${isChanged ? 'bg-amber-50/30' : ''}`}>
                                <div className="px-4 py-3 border-r border-gray-200">
                                    <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">{k}</div>
                                    <div className={`font-medium ${isChanged ? 'text-red-500 line-through opacity-70' : 'text-gray-900'}`}>{sB !== undefined ? String(sB) : '-'}</div>
                                </div>
                                <div className="px-4 py-3">
                                    <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">{k}</div>
                                    <div className={`font-medium ${isChanged ? 'text-emerald-600' : 'text-gray-900'}`}>{sS !== undefined ? String(sS) : '-'}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        }

        // For non edit (e.g. TAMBAH/HAPUS)
        return (
            <div className="bg-gray-900 rounded-xl p-4 overflow-auto">
                <pre className="text-xs text-emerald-400 font-mono">
                    {JSON.stringify(data.detail, null, 2)}
                </pre>
            </div>
        );
    };

    return createPortal(
        <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-5 border-b border-gray-100 flex items-start justify-between bg-white z-10 shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <LogBadge aksi={data.aksi} />
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{data.modul}</span>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Detail Aktivitas
                        </h2>
                        <div className="text-xs text-gray-500 mt-1">
                            {format(new Date(data.timestamp), 'dd MMMM yyyy, HH:mm:ss', { locale: localeId })}
                        </div>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {/* Section Info User & Network */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2"><User size={12} /> Pengguna</h4>
                            <div className="text-sm font-bold text-gray-900">{data.user_nama}</div>
                            <div className="text-xs text-gray-600 flex items-center justify-between">
                                <span className="capitalize px-2 py-0.5 bg-white border border-gray-200 rounded">{data.user_role.replace('_', ' ')}</span>
                                {data.status === 'sukses' ? 
                                    <span className="text-emerald-600 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Sukses</span> : 
                                    <span className="text-red-600 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Gagal</span>
                                }
                            </div>
                        </div>
                        <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2"><Activity size={12} /> Sesi</h4>
                            <div className="text-xs text-gray-600 flex items-center gap-2"><Globe size={14} className="text-gray-400" /> {data.ip_address}</div>
                            <div className="text-xs text-gray-600 flex items-center gap-2 capitalize"><Monitor size={14} className="text-gray-400" /> {data.device}</div>
                        </div>
                    </div>

                    {/* Section Target */}
                    <div className="p-4 border border-gray-200 rounded-xl">
                        <h4 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Target Resource</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Target</div>
                                <div className="text-sm text-gray-900 font-medium">{data.target_label || '-'}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><Hash size={10} /> ID Target</div>
                                <div className="text-sm text-gray-900 font-mono">{data.target_id || '-'}</div>
                            </div>
                            <div className="col-span-2">
                                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><MapPin size={10} /> Lokasi Outlet</div>
                                <div className="text-sm text-gray-900 capitalize">{data.outlet_nama || 'Semua Outlet / Sistem'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Section Error Info if Failed */}
                    {data.status === 'gagal' && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                            <h4 className="text-sm font-bold text-red-800 mb-1">Kegagalan Eksekusi</h4>
                            <p className="text-sm text-red-600">{data.error_msg || 'Aksi ditolak oleh sistem.'}</p>
                        </div>
                    )}

                    {/* Section Perubahan */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Data Perubahan</h4>
                        {renderDetail()}
                    </div>
                </div>
                
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
                </div>
            </div>
        </>
        , document.body
    );
}

