import React from 'react';
import { MapPin, Clock, Phone, Mail, FileText, CheckCircle2, Store } from 'lucide-react';
import KasirAvatar from '../Shared/KasirAvatar';
import OutletBadge from '../Shared/OutletBadge';

export default function TabProfil({ outlet }) {
    if (!outlet) return null;

    const formatTanggal = (iso) => {
        if (!iso) return '-';
        const d = new Date(iso);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const jamOp = outlet.jam_operasional || {};

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Store className="w-4 h-4 text-gray-400" /> Informasi Outlet
                        </h3>
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-6 text-sm">
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Alamat Lengkap</p>
                                <p className="font-medium text-gray-900">{outlet.alamat || '-'}</p>
                                <p className="text-gray-500 mt-0.5">{outlet.kota || '-'}, {outlet.provinsi || '-'} {outlet.kode_pos || ''}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kontak</p>
                                <p className="font-medium text-gray-900 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {outlet.telp || '-'}</p>
                                <p className="font-medium text-gray-900 flex items-center gap-1.5 mt-1"><Mail className="w-3.5 h-3.5 text-gray-400" /> {outlet.email || '-'}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tipe Outlet</p>
                                <OutletBadge outlet={outlet} showDot={false} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal Dibuka</p>
                                <p className="font-medium text-gray-900">{formatTanggal(outlet.dibuka_sejak)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Luas Bangunan</p>
                                <p className="font-medium text-gray-900">{outlet.luas_m2 || 0} m²</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" /> Jam Operasional
                        </h3>
                    </div>
                    <div className="p-0">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/50 text-xs text-gray-500">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Hari</th>
                                    <th className="px-6 py-3 font-semibold">Jam Buka</th>
                                    <th className="px-6 py-3 font-semibold">Jam Tutup</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-gray-700">
                                {[
                                    { label: 'Senin - Jumat', key: 'senin_jumat' },
                                    { label: 'Sabtu', key: 'sabtu' },
                                    { label: 'Minggu', key: 'minggu' },
                                ].map(({ label, key }) => {
                                    const jadwal = jamOp[key] || {};
                                    return (
                                        <tr key={key} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-6 py-3.5 font-medium">{label}</td>
                                            <td className="px-6 py-3.5">{jadwal.buka || '-'}</td>
                                            <td className="px-6 py-3.5">{jadwal.tutup || '-'}</td>
                                            <td className="px-6 py-3.5">
                                                {jadwal.buka ? (
                                                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] rounded font-bold">Buka</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] rounded font-bold">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-16 bg-slate-50" />
                    <div className="relative z-10 mb-3">
                        <KasirAvatar nama={outlet.manajer_nama || '-'} size="xl" fotoColor={outlet.warna_hex || '#10B981'} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">{outlet.manajer_nama || '-'}</h3>
                    <p className="text-xs text-gray-500 mb-4">Manajer Outlet</p>
                    
                    <div className="w-full space-y-2 text-sm">
                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-gray-100">
                            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="font-medium text-gray-700">{outlet.manajer_telp || '-'}</span>
                        </div>
                    </div>
                    <button className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors">
                        Kirim Pesan
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <FileText className="w-4 h-4 text-gray-400" /> Konfigurasi POS
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Metode Pembayaran</p>
                            <div className="flex flex-wrap gap-2">
                                {(outlet.konfigurasi?.metode_bayar || []).map(m => (
                                    <span key={m} className="px-2.5 py-1 bg-slate-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {m}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pajak Lokal</p>
                                <p className="font-bold text-gray-900">{outlet.konfigurasi?.pajak_lokal || 0}%</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Printer Struk</p>
                                <p className="font-bold text-gray-900">{outlet.konfigurasi?.printer_struk ? 'Aktif' : 'Nonaktif'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5">
                    <div className="h-[160px] bg-slate-100 rounded-xl relative overflow-hidden flex items-center justify-center">
                        <MapPin className="w-12 h-12 text-slate-300 absolute" />
                        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="w-4 h-4 rounded-full border-2 border-white mb-2 shadow-md" style={{ backgroundColor: outlet.warna_hex || '#10B981' }} />
                            <a 
                                href={`https://maps.google.com/?q=${outlet.latitude || -8.6705},${outlet.longitude || 115.2126}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-white/90 backdrop-blur border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                            >
                                Buka di Google Maps →
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
