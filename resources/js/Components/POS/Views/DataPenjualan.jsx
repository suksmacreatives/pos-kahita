import React from 'react';

export default function DataPenjualan({ salesHistory = [], formatRupiah }) {
    return (
        <div className="flex-1 flex flex-col h-full bg-[#f4f6f9] overflow-hidden">
            <div className="bg-white px-4 py-3 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-sm font-black text-gray-800 uppercase tracking-wide">Data Penjualan</h2>
                <p className="text-[11px] text-gray-400 font-semibold">Daftar invoice dan riwayat transaksi selesai</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-400 font-bold text-[10px] uppercase border-b border-gray-200">
                            <tr>
                                <th className="p-3">No. Invoice</th>
                                <th className="p-3">Waktu</th>
                                <th className="p-3">Pelanggan</th>
                                <th className="p-3">Metode</th>
                                <th className="p-3 text-right">Total Belanja</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
                            {salesHistory.map((sale) => (
                                <tr key={sale.id} className="hover:bg-gray-50/40">
                                    <td className="p-3 font-bold text-gray-800">{sale.invoice}</td>
                                    <td className="p-3 text-gray-400">{sale.waktu}</td>
                                    <td className="p-3">{sale.pelanggan}</td>
                                    <td className="p-3">
                                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold">
                                            {sale.metode}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right font-black text-gray-900">{formatRupiah(sale.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}