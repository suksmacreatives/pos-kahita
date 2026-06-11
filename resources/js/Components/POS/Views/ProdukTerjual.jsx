import React, { useState, useMemo } from 'react';

export default function ProdukTerjual({ salesHistory = [], formatRupiah }) {
    // State untuk fitur pencarian / filter produk
    const [searchQuery, setSearchQuery] = useState('');

    // ----------------------------------------------------
    // UTILITY: FORMAT RUPIAH
    // ----------------------------------------------------
    const renderRupiah = (nilai) => {
        if (formatRupiah) return formatRupiah(nilai);
        return `Rp ${(nilai || 0).toLocaleString('id-ID')}`;
    };
    
    const analisis = useMemo(() => {
    const map = {};
    let grandQty = 0;
    let grandOmset = 0;

    salesHistory.forEach(sale => {
        // Gunakan 'transaction_items' sesuai struktur database Anda
        const items = sale.transaction_items || []; 
        
        items.forEach(product => {
            // Mapping field database ke variabel lokal:
            const nameKey = product.product_name || product.nama || product.product_name_snapshot || 'Produk Tanpa Nama';
            const currentQty = parseInt(product.quantity || 0);
            const currentPrice = parseFloat(product.price_at_sale || 0);

            if (!map[nameKey]) {
                map[nameKey] = { qty: 0, price: currentPrice };
            }
            
            map[nameKey].qty += currentQty;
            map[nameKey].price = currentPrice; 
            
            grandQty += currentQty;
            grandOmset += (currentQty * currentPrice);
        });
    });

        // 2. Mengubah ke Array & Menyaring Berdasarkan Pencarian
        const filteredProducts = Object.keys(map)
            .map(name => ({
                name: name,
                qty: map[name].qty,
                price: map[name].price,
                subtotal: map[name].qty * map[name].price,
                // Fitur Kontribusi Persentase Finansial terhadap Omset Toko
                kontribusiOmset: grandOmset > 0 ? ((map[name].qty * map[name].price) / grandOmset) * 100 : 0
            }))
            .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
            // Urutkan otomatis dari omset tertinggi (Sistem Peringkat Terlaris)
            .sort((a, b) => b.subtotal - a.subtotal);

        return {
            products: filteredProducts,
            totalKuantitas: grandQty,
            totalOmset: grandOmset,
            totalProdukUnik: Object.keys(map).length,
            rataRataOmsetPerItem: Object.keys(map).length > 0 ? grandOmset / Object.keys(map).length : 0
        };
    }, [salesHistory, searchQuery]);

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] text-slate-600 font-sans tracking-tight p-6 gap-6 overflow-hidden">
            
            {/* ======================================================== */}
            {/* HEADER & FITUR PENCARIAN (MINIMALIS)                      */}
            {/* ======================================================== */}
            <div className="flex flex-row justify-between items-center flex-shrink-0">
                {/* Real-time Search Input */}
                <div className="w-64">
                    <input 
                        type="text"
                        placeholder="Cari nama produk..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-l px-3 py-1.5 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
                    />
                </div>
            </div>

            {/* ======================================================== */}
            {/* METRIK FINANSIAL & OPERASIONAL (SEDERHANA & FLAT)        */}
            {/* ======================================================== */}
            <div className="grid grid-cols-4 gap-4 w-full flex-shrink-0">
                <div className="bg-white p-4 rounded-l border border-slate-200 shadow-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Omset Penjualan</p>
                    <p className="text-base font-bold text-slate-800 mt-1 font-mono">{renderRupiah(analisis.totalOmset)}</p>
                </div>

                <div className="bg-white p-4 rounded-l border border-slate-200 shadow-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Volume Produk Terjual</p>
                    <p className="text-base font-bold text-slate-800 mt-1">{analisis.totalKuantitas} Pcs</p>
                </div>

                <div className="bg-white p-4 rounded-l border border-slate-200 shadow-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Model Terjual</p>
                    <p className="text-base font-bold text-slate-800 mt-1">{analisis.totalProdukUnik} SKU</p>
                </div>

                <div className="bg-white p-4 rounded-l border border-slate-200 shadow-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rata-rata Omset / Model</p>
                    <p className="text-base font-bold text-slate-800 mt-1 font-mono">{renderRupiah(analisis.rataRataOmsetPerItem)}</p>
                </div>
            </div>

            {/* ======================================================== */}
            {/* TABEL DATA UTAMA: BERSIH & FOKUS PADA AKURASI            */}
            {/* ======================================================== */}
            <div className="flex-1 overflow-hidden flex flex-col w-full">
                <div className="bg-white border border-slate-200 rounded-l overflow-hidden shadow-2xs flex flex-col h-full w-full">
                    
                    <div className="overflow-y-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70 border-b border-slate-200/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10">
                                    <th className="py-3 px-5 w-[60px] text-center">No</th>
                                    <th className="py-3 px-5">Nama Barang</th>
                                    <th className="py-3 px-5 text-right">Harga Terakhir</th>
                                    <th className="py-3 px-5 text-center">Volume Terjual</th>
                                    <th className="py-3 px-5 text-right">Kontribusi</th>
                                    <th className="py-3 px-5 text-right">Subtotal Pendapatan</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs divide-y divide-slate-100 font-medium text-slate-600">
                                {analisis.products.map((item, i) => (
                                    <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                        {/* Nomor */}
                                        <td className="py-3.5 px-5 text-center font-mono text-slate-400">
                                            {i + 1}
                                        </td>
                                        
                                        {/* Nama Produk */}
                                        <td className="py-3.5 px-5 font-semibold text-slate-800 uppercase tracking-wide">
                                            {item.name}
                                        </td>

                                        {/* Harga Satuan */}
                                        <td className="py-3.5 px-5 text-right font-mono text-slate-500">
                                            {renderRupiah(item.price)}
                                        </td>

                                        {/* Qty Terjual */}
                                        <td className="py-3.5 px-5 text-center font-semibold text-slate-700">
                                            {item.qty} Pcs
                                        </td>

                                        {/* Persentase Kontribusi Omset */}
                                        <td className="py-3.5 px-5 text-right font-mono text-slate-400">
                                            {item.kontribusiOmset.toFixed(1)}%
                                        </td>

                                        {/* Total Per Item */}
                                        <td className="py-3.5 px-5 text-right font-bold text-slate-900 text-sm font-mono">
                                            {renderRupiah(item.subtotal)}
                                        </td>
                                    </tr>
                                ))}

                                {analisis.products.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="py-16 text-center italic text-slate-400">
                                            Tidak ada kecocokan data produk yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                </div>
            </div>

        </div>
    );
}