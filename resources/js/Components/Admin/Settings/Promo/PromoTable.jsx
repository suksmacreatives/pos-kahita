import React, { useState } from 'react';
import { Edit, MoreVertical, Copy, ShieldOff, Trash2 } from 'lucide-react';
import PromoBadge from './PromoBadge';
import { format, differenceInDays } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function PromoTable({ data, onEdit, onDuplicate, onToggleStatus, onDelete }) {
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);

    const formatRupiah = (val) => `Rp ${val.toLocaleString('id-ID')}`;

    const toggleDropdown = (id) => {
        if (activeDropdown === id) setActiveDropdown(null);
        else setActiveDropdown(id);
        setConfirmAction(null);
    };

    const handleConfirm = (actionType, id) => {
        if (actionType === 'delete') onDelete(id);
        if (actionType === 'toggle') {
            const promo = data.find(p => p.id === id);
            if (promo) onToggleStatus(promo);
        }
        setConfirmAction(null);
        setActiveDropdown(null);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible relative z-10">
            <div className="overflow-x-auto min-h-[300px]">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Promo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nilai</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Berlaku</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kuota</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {data.length > 0 ? data.map((row, idx) => {
                            const daysLeft = differenceInDays(new Date(row.berlaku_sampai), new Date());
                            const isAlmostExpired = row.status === 'aktif' && daysLeft > 0 && daysLeft <= 3;
                            const isExpired = row.status === 'kadaluarsa' || daysLeft < 0;
                            const persentaseKuota = row.kuota ? Math.min(100, Math.round((row.terpakai / row.kuota) * 100)) : 0;

                            let nilaiText = '';
                            if (row.tipe === 'persentase') {
                                nilaiText = `${row.nilai_diskon}%`;
                                if (row.max_diskon) nilaiText += ` (maks ${formatRupiah(row.max_diskon)})`;
                            } else if (row.tipe === 'nominal') {
                                nilaiText = formatRupiah(row.nilai_diskon);
                            } else {
                                nilaiText = 'Paket Spesial';
                            }

                            return (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{idx + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-bold text-gray-900">{row.nama_promo}</div>
                                        <div className="text-[10px] text-gray-500 max-w-[200px] truncate" title={row.deskripsi}>{row.deskripsi}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
                                            {row.kode_promo}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <PromoBadge tipe={row.tipe} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {nilaiText}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`text-xs ${isExpired ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                            {format(new Date(row.berlaku_dari), 'dd MMM', { locale: localeId })} — {format(new Date(row.berlaku_sampai), 'dd MMM yyyy', { locale: localeId })}
                                        </div>
                                        {isAlmostExpired && <div className="text-[10px] font-bold text-amber-600 mt-1">⚠ {daysLeft} hari lagi</div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-xs text-gray-600 mb-1 font-medium">
                                            {row.kuota ? `${row.terpakai} / ${row.kuota} dipakai` : '∞ Unlimited'}
                                        </div>
                                        {row.kuota && (
                                            <div className="w-24 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                <div 
                                                    className={`h-1.5 rounded-full ${persentaseKuota >= 90 ? 'bg-red-500' : persentaseKuota >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                                    style={{ width: `${persentaseKuota}%` }}
                                                ></div>
                                            </div>
                                        )}
                                        {row.status === 'habis' && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 rounded font-bold mt-1 inline-block">Habis</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <PromoBadge status={row.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2 relative">
                                            <button onClick={() => onEdit(row)} className="text-gray-400 hover:text-amber-600 p-1 rounded transition-colors" title="Edit">
                                                <Edit size={18} />
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
                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 text-left">
                                                        {!confirmAction ? (
                                                            <>
                                                                <button onClick={() => { setActiveDropdown(null); onDuplicate(row); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                                    <Copy size={16} className="text-blue-500" /> Duplikat Promo
                                                                </button>
                                                                {row.status !== 'kadaluarsa' && row.status !== 'habis' && (
                                                                    <button onClick={() => setConfirmAction({ type: 'toggle', id: row.id })} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                                        <ShieldOff size={16} className={row.status === 'aktif' ? 'text-amber-500' : 'text-emerald-500'} /> {row.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                                                                    </button>
                                                                )}
                                                                <button onClick={() => setConfirmAction({ type: 'delete', id: row.id })} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50 mt-1 pt-2">
                                                                    <Trash2 size={16} className="text-red-500" /> Hapus
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <div className="p-3">
                                                                <div className="text-xs text-gray-900 font-bold mb-2 text-wrap">
                                                                    {confirmAction.type === 'delete' ? `Yakin hapus promo ${row.kode_promo}?` : `Yakin ${row.status === 'aktif' ? 'nonaktifkan' : 'aktifkan'} promo ini?`}
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => setConfirmAction(null)} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50">Batal</button>
                                                                    <button onClick={() => handleConfirm(confirmAction.type, row.id)} className={`flex-1 px-2 py-1.5 rounded text-xs font-medium text-white ${confirmAction.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>Ya</button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                                    Tidak ada data promo yang sesuai
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
