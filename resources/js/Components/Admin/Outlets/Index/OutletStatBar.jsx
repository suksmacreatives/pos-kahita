import React from 'react';
import { Store, TrendingUp, CreditCard, AlertTriangle } from 'lucide-react';

export default function OutletStatBar({ totalAktif, totalOmset, transaksiHariIni, stokMenipis }) {
    const formatRupiah = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row justify-between divide-y md:divide-y-0 md:divide-x divide-gray-100">
            
            <div className="flex items-center gap-4 px-4 py-2 flex-1">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Store className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Outlet</p>
                    <p className="text-lg font-extrabold text-gray-900">{totalAktif} <span className="text-xs font-normal text-gray-500">aktif</span></p>
                </div>
            </div>

            <div className="flex items-center gap-4 px-4 py-2 flex-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Omset Bulan</p>
                    <p className="text-lg font-extrabold text-gray-900">{formatRupiah(totalOmset)}</p>
                </div>
            </div>

            <div className="flex items-center gap-4 px-4 py-2 flex-1">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Transaksi Hari Ini</p>
                    <p className="text-lg font-extrabold text-gray-900">{transaksiHariIni} <span className="text-xs font-normal text-gray-500">trx</span></p>
                </div>
            </div>

            <div className="flex items-center gap-4 px-4 py-2 flex-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stokMenipis > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}>
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Stok Menipis</p>
                    <p className={`text-lg font-extrabold ${stokMenipis > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {stokMenipis} <span className="text-xs font-normal text-gray-500">produk</span>
                    </p>
                </div>
            </div>

        </div>
    );
}
