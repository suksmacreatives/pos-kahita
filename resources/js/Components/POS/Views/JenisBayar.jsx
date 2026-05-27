import React, { useMemo } from 'react';

export default function JenisBayar({ salesHistory = [], formatRupiah }) {
    // ----------------------------------------------------
    // UTILITY: FORMAT RUPIAH AMAN
    // ----------------------------------------------------
    const renderRupiah = (nilai) => {
        if (formatRupiah) return formatRupiah(nilai);
        return `Rp ${(nilai || 0).toLocaleString('id-ID')}`;
    };

    // ----------------------------------------------------
    // ENGINE ANALISIS METODE PEMBAYARAN (KUAT & MINIMALIS)
    // ----------------------------------------------------
    const analisisPembayaran = useMemo(() => {
        const paymentMethods = ['Tunai', 'QRIS', 'Debit', 'Kredit'];
        let grandTotalSemuaMetode = 0;
        let totalSeluruhTransaksi = salesHistory.length;

        // Inisialisasi struktur data rekap
        const rekap = paymentMethods.map(method => ({
            nama: method,
            nominal: 0,
            jumlahTransaksi: 0,
            kontribusiPersen: 0
        }));

        // Kalkulasi data riil dari salesHistory
        salesHistory.forEach(sale => {
            const index = paymentMethods.indexOf(sale.metode);
            if (index !== -1) {
                rekap[index].nominal += (sale.total || 0);
                rekap[index].jumlahTransaksi += 1;
                grandTotalSemuaMetode += (sale.total || 0);
            }
        });

        // Hitung persentase kontribusi finansial per metode pembayaran
        const rekapMatang = rekap.map(item => ({
            ...item,
            kontribusiPersen: grandTotalSemuaMetode > 0 ? (item.nominal / grandTotalSemuaMetode) * 100 : 0
        })).sort((a, b) => b.nominal - a.nominal); // Urutkan dari perputaran uang tertinggi

        return {
            dataMetode: rekapMatang,
            grandTotal: grandTotalSemuaMetode,
            totalTransaksi: totalSeluruhTransaksi
        };
    }, [salesHistory]);

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] text-slate-600 font-sans tracking-tight p-6 gap-6 overflow-hidden">

            {/* ======================================================== */}
            {/* METRIK MINI RINGKASAN                                    */}
            {/* ======================================================== */}
            <div className="grid grid-cols-2 gap-4 w-full flex-shrink-0">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Kas Masuk (Sales)</p>
                    <p className="text-base font-bold text-slate-800 mt-1 font-mono">{renderRupiah(analisisPembayaran.grandTotal)}</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Frekuensi Transaksi</p>
                    <p className="text-base font-bold text-slate-800 mt-1">{analisisPembayaran.totalTransaksi} Kali Log</p>
                </div>
            </div>

            {/* ======================================================== */}
            {/* TABEL METODE PEMBAYARAN: BERSIH & KONSISTEN              */}
            {/* ======================================================== */}
            <div className="flex-1 overflow-hidden flex flex-col w-full">
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex flex-col h-full w-full">
                    
                    <div className="overflow-y-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70 border-b border-slate-200/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10">
                                    <th className="py-3 px-5 w-[60px] text-center">No</th>
                                    <th className="py-3 px-5">Metode Pembayaran</th>
                                    <th className="py-3 px-5 text-center">Jumlah Transaksi</th>
                                    <th className="py-3 px-5 text-right">Share Kontribusi</th>
                                    <th className="py-3 px-5 text-right">Total Dana Masuk</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs divide-y divide-slate-100 font-medium text-slate-600">
                                {analisisPembayaran.dataMetode.map((item, i) => (
                                    <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                        {/* Nomor */}
                                        <td className="py-4 px-5 text-center font-mono text-slate-400">
                                            {i + 1}
                                        </td>
                                        
                                        {/* Nama Metode Pembayaran */}
                                        <td className="py-4 px-5 font-semibold text-slate-800 uppercase tracking-wide">
                                            {item.nama}
                                        </td>

                                        {/* Jumlah Penggunaan */}
                                        <td className="py-4 px-5 text-center font-medium text-slate-600">
                                            {item.jumlahTransaksi} Transaksi
                                        </td>

                                        {/* Kontribusi Persentase Finansial */}
                                        <td className="py-4 px-5 text-right font-mono text-slate-400">
                                            {item.kontribusiPersen.toFixed(1)}%
                                        </td>

                                        {/* Total Nominal Uang Masuk */}
                                        <td className="py-4 px-5 text-right font-bold text-slate-900 text-sm font-mono">
                                            {renderRupiah(item.nominal)}
                                        </td>
                                    </tr>
                                ))}

                                {analisisPembayaran.dataMetode.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="py-16 text-center italic text-slate-400">
                                            Belum ada pencatatan riwayat metode pembayaran masuk.
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