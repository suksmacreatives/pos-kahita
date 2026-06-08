import React from 'react';
import { Settings } from 'lucide-react';
import KasirAvatar from '../Shared/KasirAvatar';

export default function ShiftTable({ mode = 'global', outletId = null, onEditShift, kasirs = [], shifts = [], outlets = [] }) {
    
    const displayOutlets = outletId 
        ? outlets.filter(o => String(o.id) === String(outletId))
        : outlets;

    const hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

    const getShiftBadge = (shiftValue) => {
        const badges = {
            pagi: <span className="w-full block py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded font-bold shadow-sm">Pagi</span>,
            siang: <span className="w-full block py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded font-bold shadow-sm">Siang</span>,
            malam: <span className="w-full block py-1 bg-purple-100 text-purple-700 border border-purple-200 rounded font-bold shadow-sm">Malam</span>,
            libur: <span className="w-full block py-1 bg-gray-100 text-gray-500 border border-gray-200 rounded font-semibold border-dashed">Libur</span>,
        };
        return badges[shiftValue] || <span className="w-full block py-1 bg-gray-50 text-gray-400 border border-gray-100 rounded border-dashed">-</span>;
    };

    if (displayOutlets.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 text-sm">
                Belum ada data shift.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-gray-900">Jadwal Shift Mingguan</h3>
                {onEditShift && (
                    <button 
                        onClick={onEditShift}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-emerald-300 hover:text-emerald-600 rounded-lg text-[11px] font-semibold transition-colors shadow-sm"
                    >
                        <Settings className="w-3.5 h-3.5" /> Atur Shift
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-center text-[11px]">
                    <thead className="bg-slate-50 text-gray-500 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-left w-48">Kasir</th>
                            {hariList.map(h => (
                                <th key={h} className="px-2 py-3 font-semibold min-w-[80px]">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {displayOutlets.map(outlet => {
                            const outletKasirs = kasirs.filter(k => String(k.outlet_id) === String(outlet.id));
                            if (outletKasirs.length === 0) return null;

                            return (
                                <React.Fragment key={outlet.id}>
                                    {mode === 'global' && (
                                        <tr>
                                            <td colSpan="8" className="px-4 py-2 text-left bg-slate-800 text-white font-bold">
                                                {outlet.nama || outlet.name}
                                            </td>
                                        </tr>
                                    )}

                                    {outletKasirs.map(kasir => {
                                        const myShifts = shifts.filter(s => s.kasir_id === kasir.id);
                                        
                                        const getShiftHariIni = (hari) => {
                                            const shift = myShifts.find(s => s.hari === hari);
                                            return shift ? shift.shift : kasir.shift_default;
                                        };

                                        return (
                                            <tr key={kasir.id} className="hover:bg-slate-50/30 transition-colors">
                                                <td className="px-4 py-2.5 text-left">
                                                    <div className="flex items-center gap-3">
                                                        <KasirAvatar nama={kasir.nama} size="sm" fotoColor={kasir.foto_color || '#10B981'} />
                                                        <div>
                                                            <p className="font-bold text-gray-900">{kasir.nama}</p>
                                                            <p className="text-[9px] text-gray-500">{kasir.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {hariList.map(hari => {
                                                    let val = getShiftHariIni(hari);
                                                    return (
                                                        <td key={hari} className="px-1.5 py-2.5">
                                                            {getShiftBadge(val)}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
