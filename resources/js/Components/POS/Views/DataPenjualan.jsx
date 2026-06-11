import React, { useState } from 'react';

export default function DataPenjualan({
    salesHistory = [],
    formatRupiah,
    onPrint,
    onVoid
}) {

    const [selectedSale, setSelectedSale] = useState(null);

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f4f6f9] overflow-hidden">

            {/* HEADER */}
            <div className="bg-white px-4 py-3 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-sm font-black text-gray-800 uppercase tracking-wide">
                    Data Penjualan
                </h2>

                <p className="text-[11px] text-gray-400 font-semibold">
                    Daftar invoice dan riwayat transaksi selesai
                </p>
            </div>

            {/* TABLE */}
            <div className="flex-1 overflow-y-auto p-4">

                <div className="bg-white border border-gray-200 rounded-l shadow-sm overflow-hidden text-xs">

                    <table className="w-full text-left border-collapse">

                        {/* TABLE HEAD */}
                        <thead className="bg-gray-50 text-gray-400 font-bold text-[10px] uppercase border-b border-gray-200">
                            <tr>
                                <th className="p-3">No. Invoice</th>
                                <th className="p-3">Waktu</th>
                                <th className="p-3">Pelanggan</th>
                                <th className="p-3">Metode</th>
                                <th className="p-3 text-center">Status</th>
                                <th className="p-3 text-right">Total Belanja</th>
                            </tr>
                        </thead>

                        {/* TABLE BODY */}
                        <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">

                            {salesHistory.map((sale) => (

                                <tr
                                    key={sale.id}
                                    onClick={() => setSelectedSale(sale)}
                                    className="hover:bg-emerald-50/40 cursor-pointer transition"
                                >

                                    {/* INVOICE */}
                                    <td className="p-3 font-bold text-gray-800">
                                        {sale.invoice_number || `INV-${sale.id}`}
                                    </td>

                                    {/* WAKTU */}
                                    <td className="p-3 text-gray-400">
                                        {
                                            sale.created_at
                                                ? new Date(sale.created_at).toLocaleTimeString(
                                                    'id-ID',
                                                    {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }
                                                )
                                                : '-'
                                        }
                                    </td>

                                    {/* PELANGGAN */}
                                    <td className="p-3">
                                        {sale.customer_name || 'Umum'}
                                    </td>

                                    {/* METODE */}
                                    <td className="p-3">
                                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold">
                                            {sale.payment_method || 'Tunai'}
                                        </span>
                                    </td>

                                    {/* STATUS */}
                                    <td className="p-3 text-center">
                                        <span
                                            className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                                sale.status === 'void'
                                                    ? 'bg-red-100 text-red-600'
                                                    : 'bg-emerald-100 text-emerald-600'
                                            }`}
                                        >
                                            {sale.status?.toUpperCase() || 'COMPLETED'}
                                        </span>
                                    </td>

                                    {/* TOTAL */}
                                    <td className="p-3 text-right font-black text-gray-900">
                                        {formatRupiah(
                                            sale.grand_total || 0
                                        )}
                                    </td>

                                </tr>

                            ))}

                            {/* EMPTY */}
                            {salesHistory.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="p-8 text-center text-gray-400 italic"
                                    >
                                        Belum ada riwayat penjualan hari ini.
                                    </td>
                                </tr>
                            )}

                        </tbody>
                    </table>
                </div>
            </div>

            {/* =========================================================================
                MODAL DETAIL TRANSAKSI
               ========================================================================= */}

            {selectedSale && (

                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">

                    <div className="bg-white w-full max-w-xl rounded-l shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">

                        {/* HEADER */}
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">

                            <div>
                                <h3 className="text-sm font-black text-gray-800 uppercase">
                                    Detail Transaksi
                                </h3>

                                <p className="text-[11px] text-gray-400 font-semibold mt-1">
                                    {selectedSale.invoice_number || `INV-${selectedSale.id}`}
                                </p>
                            </div>

                            <button
                                onClick={() => setSelectedSale(null)}
                                className="text-gray-400 hover:text-gray-700 text-lg"
                            >
                                ✕
                            </button>

                        </div>

                        {/* BODY */}
                        <div className="p-4 max-h-[65vh] overflow-y-auto">

                            {/* INFO */}
                            <div className="grid grid-cols-2 gap-3 text-xs mb-4">

                                <div className="bg-gray-50 border border-gray-100 rounded-l p-3">
                                    <span className="text-gray-400 font-semibold block mb-1">
                                        Pelanggan
                                    </span>

                                    <p className="font-black text-gray-800">
                                        {selectedSale.customer_name || 'Umum'}
                                    </p>
                                </div>

                                <div className="bg-gray-50 border border-gray-100 rounded-l p-3">
                                    <span className="text-gray-400 font-semibold block mb-1">
                                        Metode Pembayaran
                                    </span>

                                    <p className="font-black text-[#009664]">
                                        {selectedSale.payment_method || 'Tunai'}
                                    </p>
                                </div>

                            </div>

                            {/* ITEM LIST */}
                            <div className="border border-gray-200 rounded-l overflow-hidden">

                                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-400 tracking-wide">
                                    Detail Item
                                </div>

                                {(selectedSale.transaction_items || []).length === 0 ? (

                                    <div className="p-6 text-center text-gray-400 text-xs italic">
                                        Tidak ada detail item transaksi.
                                    </div>

                                ) : (

                                    (selectedSale.transaction_items || []).map((item, index) => (

                                        <div
                                            key={index}
                                            className="flex justify-between items-center p-4 border-b border-gray-100 last:border-b-0 text-xs"
                                        >

                                            <div className="flex-1 pr-3">

                                                <h4 className="font-black text-gray-800 uppercase">
                                                    {item.product_name_snapshot}
                                                </h4>

                                                <div className="flex flex-wrap gap-1 mt-1">

                                                    {item.variant_color && (
                                                        <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                                            {item.variant_color}
                                                        </span>
                                                    )}

                                                    {item.variant_size && (
                                                        <span className="bg-emerald-50 text-[#009664] px-1.5 py-0.5 rounded text-[9px] font-bold">
                                                            Size: {item.variant_size}
                                                        </span>
                                                    )}

                                                </div>

                                                <span className="text-gray-400 text-[10px] font-semibold block mt-1">
                                                    {item.quantity} x {formatRupiah(item.price_at_sale)}
                                                </span>

                                            </div>

                                            <div className="text-right">
                                                <span className="font-black text-[#009664]">
                                                    {
                                                        formatRupiah(
                                                            item.price_at_sale * item.quantity
                                                        )
                                                    }
                                                </span>
                                            </div>

                                        </div>

                                    ))

                                )}

                            </div>

                            {/* TOTAL */}
                            <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl p-4">

                                <div className="flex justify-between items-center text-xs">

                                    <span className="font-bold text-gray-400 uppercase">
                                        Total Belanja
                                    </span>

                                    <span className="text-lg font-black text-[#009664]">
                                        {
                                            formatRupiah(
                                                selectedSale.grand_total || 0
                                            )
                                        }
                                    </span>

                                </div>

                            </div>

                        </div>

                        {/* FOOTER */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-2">

                            {/* PRINT */}
                            <button
                                onClick={() => onPrint(selectedSale)}
                                className="flex-1 bg-[#009664] hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm"
                            >
                                🖨 Cetak Struk
                            </button>

                            {/* VOID */}
                            {
                                selectedSale.status !== 'void' && (
                                    <button
                                        onClick={() => onVoid(selectedSale)}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm"
                                    >
                                        VOID
                                    </button>
                                )
                            }

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}