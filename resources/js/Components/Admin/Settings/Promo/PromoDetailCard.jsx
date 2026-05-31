import React, { useState } from 'react';
import { Edit, ShieldOff, Calendar, Store, Clock } from 'lucide-react';
import PromoBadge from './PromoBadge';
import { format, differenceInDays } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function PromoDetailCard({ data, onEdit, onToggleStatus }) {
    const [showConfirm, setShowConfirm] = useState(false);
    
    const formatRupiah = (val) => `Rp ${val.toLocaleString('id-ID')}`;

    const daysLeft = differenceInDays(new Date(data.berlaku_sampai), new Date());
    const isAlmostExpired = data.status === 'aktif' && daysLeft > 0 && daysLeft <= 3;
    const isExpired = data.status === 'kadaluarsa' || daysLeft < 0;

    let nilaiText = '';
    if (data.tipe === 'persentase') {
        nilaiText = `${data.nilai_diskon}%`;
        if (data.max_diskon) nilaiText += ` (maks ${formatRupiah(data.max_diskon)})`;
    } else if (data.tipe === 'nominal') {
        nilaiText = formatRupiah(data.nilai_diskon);
    } else if (data.tipe === 'beli_x_gratis_y') {
        nilaiText = data.deskripsi || 'Promo Beli X Gratis Y';
    } else {
        nilaiText = `Harga Bundle: ${formatRupiah(data.nilai_diskon)}`;
    }

    const persentaseKuota = data.kuota ? Math.min(100, Math.round((data.terpakai / data.kuota) * 100)) : 0;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <PromoBadge status={data.status} />
                    <PromoBadge tipe={data.tipe} />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-1">{data.nama_promo}</h3>
                <div className="mb-4">
                    <span className="font-mono text-sm bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                        {data.kode_promo}
                    </span>
                </div>

                <div className="space-y-1.5 mb-4 border-b border-dashed border-gray-200 pb-4">
                    <div className="text-sm font-medium text-gray-900">Nilai: <span className="text-emerald-600 font-bold">{nilaiText}</span></div>
                    <div className="text-xs text-gray-500">Min. belanja: {data.min_transaksi > 0 ? formatRupiah(data.min_transaksi) : 'Tidak ada'}</div>
                </div>

                <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} className={isExpired ? 'text-red-400' : 'text-gray-400'} />
                        <span className={isExpired ? 'line-through text-gray-400' : ''}>
                            {format(new Date(data.berlaku_dari), 'dd MMM', { locale: localeId })} — {format(new Date(data.berlaku_sampai), 'dd MMM yyyy', { locale: localeId })}
                        </span>
                        {isAlmostExpired && <span className="ml-auto text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded flex items-center gap-1"><Clock size={10} /> {daysLeft} hari lagi</span>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Store size={16} className="text-gray-400" />
                        <span className="capitalize">{Array.isArray(data.berlaku_di) ? data.berlaku_di.join(', ') : 'Semua Outlet'}</span>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between text-xs text-gray-600 mb-1 font-medium">
                        <span>Kuota Terpakai</span>
                        {data.kuota ? <span>{data.terpakai} / {data.kuota}</span> : <span>{data.terpakai} (∞ Unlimited)</span>}
                    </div>
                    {data.kuota && (
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div 
                                className={`h-2 rounded-full ${persentaseKuota >= 90 ? 'bg-red-500' : persentaseKuota >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                style={{ width: `${persentaseKuota}%` }}
                            ></div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-2 relative">
                <button 
                    onClick={() => onEdit(data)} 
                    className="flex-1 flex justify-center items-center gap-1.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <Edit size={14} /> Edit
                </button>
                <button 
                    onClick={() => setShowConfirm(true)}
                    disabled={data.status === 'kadaluarsa'}
                    className="flex-1 flex justify-center items-center gap-1.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    <ShieldOff size={14} className={data.status === 'aktif' ? 'text-amber-500' : 'text-emerald-500'} />
                    {data.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                </button>

                {showConfirm && (
                    <div className="absolute bottom-full mb-2 right-0 left-0 bg-white shadow-xl border border-gray-200 rounded-xl p-3 z-10 animate-in slide-in-from-bottom-2">
                        <p className="text-xs text-center font-bold text-gray-900 mb-2">
                            Yakin {data.status === 'aktif' ? 'nonaktifkan' : 'aktifkan'} promo ini?
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 text-xs py-1.5 border border-gray-300 rounded font-medium hover:bg-gray-50">Batal</button>
                            <button onClick={() => { setShowConfirm(false); onToggleStatus(data); }} className={`flex-1 text-xs py-1.5 rounded font-medium text-white ${data.status === 'aktif' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>Ya</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
