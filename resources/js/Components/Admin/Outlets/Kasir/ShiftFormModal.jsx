import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { router } from '@inertiajs/react';
import KasirAvatar from '../Shared/KasirAvatar';

export default function ShiftFormModal({ isOpen, onClose, outletId = null, kasirs = [] }) {
    if (!isOpen) return null;

    const [isSaving, setIsSaving] = useState(false);
    
    const availableKasirs = outletId 
        ? kasirs.filter(k => String(k.outlet_id) === String(outletId))
        : kasirs;

    const [selectedKasir, setSelectedKasir] = useState(availableKasirs.length > 0 ? availableKasirs[0].id : '');
    
    const hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    
    // State default shift (semua pagi kecuali sabtu-minggu)
    const [shifts, setShifts] = useState({
        Senin: 'pagi',
        Selasa: 'pagi',
        Rabu: 'pagi',
        Kamis: 'pagi',
        Jumat: 'pagi',
        Sabtu: 'siang',
        Minggu: 'libur',
    });

    const handleShiftChange = (hari, value) => {
        setShifts(prev => ({ ...prev, [hari]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        const payload = {
            shifts: Object.entries(shifts).map(([hari, shift]) => ({ hari, shift })),
        };
        router.post(route('admin.outlets.shifts.update', selectedKasir), payload, {
            onFinish: () => { setIsSaving(false); onClose(); },
            onError: () => setIsSaving(false),
        });
    };

    const activeKasir = availableKasirs.find(k => k.id === selectedKasir);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-extrabold text-gray-900">
                        Atur Jadwal Shift
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    
                    <div className="mb-6">
                        <label className="block text-[11px] font-bold text-gray-700 mb-2">Pilih Kasir</label>
                        <div className="relative">
                            <select
                                value={selectedKasir}
                                onChange={(e) => setSelectedKasir(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:ring-emerald-500/20 focus:border-emerald-500 outline-none appearance-none"
                            >
                                {availableKasirs.map(k => (
                                    <option key={k.id} value={k.id}>{k.nama} — {k.outlet_nama || '-'}</option>
                                ))}
                            </select>
                            {activeKasir && (
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <KasirAvatar nama={activeKasir.nama} size="sm" fotoColor={activeKasir.foto_color} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-2">Jadwal Shift 1 Minggu</label>
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-gray-500">
                                    <tr>
                                        <th className="px-4 py-2.5 font-semibold border-b border-gray-100">Hari</th>
                                        <th className="px-4 py-2.5 font-semibold border-b border-gray-100">Shift</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {hariList.map(hari => (
                                        <tr key={hari} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-2.5 font-medium text-gray-700 w-1/3">{hari}</td>
                                            <td className="px-4 py-2.5 w-2/3">
                                                <div className="flex gap-2">
                                                    {['pagi', 'siang', 'malam', 'libur'].map(opt => (
                                                        <label 
                                                            key={opt}
                                                            className={`flex-1 flex items-center justify-center py-1.5 px-2 rounded-lg cursor-pointer transition-colors border ${
                                                                shifts[hari] === opt 
                                                                    ? (
                                                                        opt === 'pagi' ? 'bg-blue-100 border-blue-300 text-blue-700 font-bold shadow-sm' :
                                                                        opt === 'siang' ? 'bg-amber-100 border-amber-300 text-amber-700 font-bold shadow-sm' :
                                                                        opt === 'malam' ? 'bg-purple-100 border-purple-300 text-purple-700 font-bold shadow-sm' :
                                                                        'bg-gray-200 border-gray-300 text-gray-700 font-bold shadow-sm'
                                                                    )
                                                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`shift_${hari}`}
                                                                value={opt}
                                                                checked={shifts[hari] === opt}
                                                                onChange={() => handleShiftChange(hari, opt)}
                                                                className="sr-only"
                                                            />
                                                            <span className="text-[10px] capitalize">{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                        >
                            {isSaving ? (
                                <>
                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" /> Simpan Jadwal
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
