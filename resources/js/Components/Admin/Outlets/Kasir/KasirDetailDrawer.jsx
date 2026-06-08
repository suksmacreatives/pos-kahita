import React from 'react';
import { X, Calendar, MapPin, Mail, Phone, TrendingUp, AlertTriangle, CreditCard, UserCheck, BarChart3 } from 'lucide-react';
import KasirAvatar from '../Shared/KasirAvatar';
import OutletBadge from '../Shared/OutletBadge';
import { Link } from '@inertiajs/react';

export default function KasirDetailDrawer({ isOpen, onClose, kasir }) {
    if (!isOpen || !kasir) return null;

    const formatRupiah = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');
    
    // Shift badges mapping
    const shiftBadges = {
        pagi: 'bg-blue-100 text-blue-700 border-blue-200',
        siang: 'bg-amber-100 text-amber-700 border-amber-200',
        malam: 'bg-purple-100 text-purple-700 border-purple-200'
    };

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 w-full max-w-[400px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                
                {/* Header Profile Area (with background pattern) */}
                <div className="relative bg-slate-900 overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="px-6 pt-10 pb-6 relative z-10 flex flex-col items-center text-center">
                        <div className="mb-4">
                            <KasirAvatar nama={kasir.nama} size="xl" fotoColor={kasir.foto_color} />
                        </div>
                        <h2 className="text-xl font-extrabold text-white mb-1">{kasir.nama}</h2>
                        <div className="flex items-center gap-2 mb-4">
                            <span className={`w-2 h-2 rounded-full ${kasir.status === 'aktif' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                            <span className="text-xs text-slate-300 font-medium uppercase tracking-wider">{kasir.status}</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3">
                            <OutletBadge outlet={{ id: kasir.outlet_id, nama: kasir.outlet_nama }} showDot={true} />
                            <div className="w-px h-4 bg-white/20" />
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${shiftBadges[kasir.shift_default]}`}>
                                Shift {kasir.shift_default}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                    
                    {/* Kontak & Info */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700 font-medium">{kasir.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700 font-medium">{kasir.telp}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm pt-3 border-t border-gray-50">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-500 text-xs">Bergabung sejak {kasir.bergabung ? new Date(kasir.bergabung).toLocaleDateString('id-ID') : '-'}</span>
                        </div>
                    </div>

                    {/* Performa Bulan Ini */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 px-1">Performa Bulan Ini</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
                                <CreditCard className="w-4 h-4 text-blue-500 mb-1" />
                                <span className="text-lg font-bold text-gray-900">{kasir.stats?.total_transaksi_bulan || 0}</span>
                                <span className="text-[10px] text-gray-500 font-medium">Transaksi Selesai</span>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
                                <TrendingUp className="w-4 h-4 text-emerald-500 mb-1" />
                                <span className="text-sm font-bold text-gray-900 mt-1">{formatRupiah(kasir.stats?.total_omset_bulan || 0)}</span>
                                <span className="text-[10px] text-gray-500 font-medium">Total Omset</span>
                            </div>
                            <div className={`bg-white p-3 rounded-xl border shadow-sm flex flex-col gap-1 ${(kasir.stats?.void_rate || 0) > 5 ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
                                <AlertTriangle className={`w-4 h-4 mb-1 ${(kasir.stats?.void_rate || 0) > 5 ? 'text-red-500' : 'text-amber-500'}`} />
                                <span className={`text-lg font-bold ${(kasir.stats?.void_rate || 0) > 5 ? 'text-red-600' : 'text-gray-900'}`}>{kasir.stats?.void_rate || 0}%</span>
                                <span className="text-[10px] text-gray-500 font-medium">{kasir.stats?.void_count_bulan || 0} Void / {kasir.stats?.refund_count_bulan || 0} Refund</span>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
                                <UserCheck className="w-4 h-4 text-purple-500 mb-1" />
                                <span className="text-lg font-bold text-gray-900">{kasir.stats?.shift_hadir_bulan || 0}/{kasir.stats?.shift_total_bulan || 0}</span>
                                <span className="text-[10px] text-gray-500 font-medium">Kehadiran Shift</span>
                            </div>
                        </div>
                    </div>

                    {/* Mini Jadwal 7 Hari Kedepan */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <h3 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" /> Jadwal Shift Minggu Ini
                        </h3>
                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-gray-100 text-[10px] font-bold text-center">
                            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((hari, i) => {
                                // Dummy shift pattern logic
                                const isOff = i === 5; // Sab libur
                                const isMorning = i < 5;
                                const isNight = i === 6;
                                
                                let label = 'P';
                                let color = 'bg-blue-100 text-blue-700';
                                
                                if (isOff) { label = 'L'; color = 'bg-gray-200 text-gray-500'; }
                                else if (isNight) { label = 'M'; color = 'bg-purple-100 text-purple-700'; }

                                return (
                                    <div key={hari} className="flex flex-col gap-1 w-8">
                                        <span className="text-gray-400">{hari}</span>
                                        <span className={`w-8 h-8 flex items-center justify-center rounded-lg ${color}`}>
                                            {label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-[9px] text-gray-400 text-center mt-2">P=Pagi, S=Siang, M=Malam, L=Libur</p>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 bg-white grid grid-cols-2 gap-3 shrink-0">
                    <Link
                        href={route('admin.outlets.detail', kasir.outlet_id)}
                        className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center justify-center shadow-sm"
                    >
                        Lihat Outlet
                    </Link>
                    <button
                        className="py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-bold text-white transition-colors flex items-center justify-center shadow-sm"
                    >
                        Edit Kasir
                    </button>
                </div>
            </div>
        </>
    );
}
