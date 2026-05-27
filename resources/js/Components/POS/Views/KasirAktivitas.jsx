import React, { useState, useRef, useMemo } from 'react';

export default function AktivitasSesiKasir({ sessionHistory = [], formatRupiah }) {
    // ----------------------------------------------------
    // STATE FILTER BARIS ATAS (KONSISTEN 3 ELEMEN UTAMA)
    // ----------------------------------------------------
    const [periodeMakro, setPeriodeMakro] = useState('hari');
    const [statusFilter, setStatusFilter] = useState('all');
    const [rangeTanggal, setRangeTanggal] = useState({
        start: '2026-05-25',
        end: '2026-05-25'
    });

    const [isPilihanPertama, setIsPilihanPertama] = useState(true);
    const hiddenDateInputRef = useRef(null);

    // State Kontrol Interaksi UI
    const [activeDropdown, setActiveDropdown] = useState(null); 
    const [selectedSesi, setSelectedSesi] = useState(null); 

    // ----------------------------------------------------
    // LOGIC FILTERING DATA REAL DARI DATABASE
    // ----------------------------------------------------
    const dataTersaring = useMemo(() => {
        // Memastikan sessionHistory selalu berupa Array aman dari database
        const listAman = Array.isArray(sessionHistory) ? sessionHistory : [];

        return listAman.filter(item => {
            if (!item) return false;

            // Integrasi Filter Berdasarkan Tanggal Buka Sesi (Format: YYYY-MM-DD)
            const tanggalSesi = item.tanggal || item.created_at?.split('T')[0] || item.waktu_buka_raw?.split(' ')[0];
            const cocokTanggal = tanggalSesi ? (tanggalSesi >= rangeTanggal.start && tanggalSesi <= rangeTanggal.end) : true;

            // Integrasi Filter Berdasarkan Status Sesi
            const statusSesiSekarang = item.status || (item.waktu_tutup ? 'Selesai' : 'Aktif Buka');
            const cocokStatus = statusFilter === 'all' || statusSesiSekarang.toLowerCase() === statusFilter.toLowerCase();
            
            return cocokTanggal && cocokStatus;
        });
    }, [sessionHistory, rangeTanggal, statusFilter]);

    // ----------------------------------------------------
    // UTILITIES HANDLER
    // ----------------------------------------------------
    const formatLabelTanggal = (dateString) => {
        if (!dateString) return '';
        try {
            const opsi = { day: 'numeric', month: 'short', year: 'numeric' };
            return new Date(dateString).toLocaleDateString('id-ID', opsi);
        } catch (e) { return dateString; }
    };

    const pemicuKalenderKlik = () => { if (hiddenDateInputRef.current) hiddenDateInputRef.current.showPicker(); };

    const handleKalenderInput = (e) => {
        const tanggalTerpilih = e.target.value;
        if (!tanggalTerpilih) return;

        if (isPilihanPertama) {
            setRangeTanggal({ start: tanggalTerpilih, end: tanggalTerpilih });
            setIsPilihanPertama(false);
        } else {
            setRangeTanggal(prev => ({ ...prev, end: tanggalTerpilih }));
            setIsPilihanPertama(true);
        }
    };

    const geserTanggal = (jumlahHari) => {
        const tglAwal = new Date(rangeTanggal.start);
        const tglAkhir = new Date(rangeTanggal.end);
        tglAwal.setDate(tglAwal.getDate() + jumlahHari);
        tglAkhir.setDate(tglAkhir.getDate() + jumlahHari);
        const formatKeString = (d) => d.toISOString().split('T')[0];
        setRangeTanggal({ start: formatKeString(tglAwal), end: formatKeString(tglAkhir) });
    };

    const renderRupiah = (nilai) => {
        if (formatRupiah) return formatRupiah(nilai);
        return `Rp ${(nilai || 0).toLocaleString('id-ID')}`;
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden text-slate-600 font-sans tracking-tight relative">
            
            {/* ======================================================== */}
            {/* ====== AREA FILTER UTAMA (3 FILTER UTAMA SAJA) ========= */}
            {/* ======================================================== */}
            <div className="bg-white p-4 border-b border-slate-100 flex-shrink-0 w-full">
                <div className="flex flex-row items-center justify-between gap-4 w-full">
                    
                    {/* Filter 1: Pilihan Makro Periode */}
                    <div className="flex-1 max-w-[220px]">
                        <select 
                            value={periodeMakro}
                            onChange={(e) => setPeriodeMakro(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#009664] cursor-pointer w-full shadow-2xs"
                        >
                            <option value="hari">Hari ini</option>
                            <option value="bulan">Bulan ini</option>
                            <option value="tahun">Tahun ini</option>
                        </select>
                    </div>

                    {/* Filter 2: Date Range Picker Interaktif */}
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden h-[33px] min-w-[300px] flex-1 relative shadow-2xs">
                        <button 
                            type="button"
                            onClick={() => geserTanggal(-1)}
                            className="px-3 text-xs font-medium text-slate-500 hover:bg-slate-50 transition border-r border-slate-200 h-full"
                        >
                            &lt;
                        </button>
                        
                        <button
                            type="button"
                            onClick={pemicuKalenderKlik}
                            className="px-4 text-xs font-medium text-slate-700 hover:bg-slate-50/50 transition h-full flex-1"
                        >
                            {formatLabelTanggal(rangeTanggal.start)} - {formatLabelTanggal(rangeTanggal.end)}
                        </button>
                        
                        <input 
                            type="date"
                            ref={hiddenDateInputRef}
                            onChange={handleKalenderInput}
                            className="absolute opacity-0 pointer-events-none w-0 h-0"
                        />

                        <button 
                            type="button"
                            onClick={() => geserTanggal(1)}
                            className="px-3 text-xs font-medium text-slate-500 hover:bg-slate-50 transition border-l border-slate-200 h-full"
                        >
                            &gt;
                        </button>
                    </div>

                    {/* Filter 3: Dropdown Pilihan Status Sesi Kasir */}
                    <div className="flex-1 max-w-[240px]">
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#009664] cursor-pointer w-full shadow-2xs"
                        >
                            <option value="all">Semua Status</option>
                            <option value="selesai">Selesai</option>
                            <option value="aktif">Aktif Buka</option>
                        </select>
                    </div>

                </div>
            </div>

            {/* ======================================================== */}
            {/* ====== AREA DATA UTAMA TABLE LAYOUT DARI DATABASE ====== */}
            {/* ======================================================== */}
            <div className="flex-1 overflow-y-auto p-5">
                <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                <th className="py-3 px-4">Waktu Buka</th>
                                <th className="py-3 px-4">Saldo Awal</th>
                                <th className="py-3 px-4">Kasir</th>
                                <th className="py-3 px-4">Waktu Tutup</th>
                                <th className="py-3 px-4">Saldo Akhir</th>
                                <th className="py-3 px-4 text-center w-16">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs divide-y divide-slate-100 font-medium text-slate-700">
                            {dataTersaring.map((sesi, index) => (
                                <tr key={sesi.id || index} className="hover:bg-slate-50/40 transition-colors">
                                    <td className="py-3.5 px-4 text-slate-500">{sesi.waktuBuka || sesi.waktu_buka}</td>
                                    <td className="py-3.5 px-4 font-semibold text-slate-800">{renderRupiah(sesi.saldoAwal || sesi.saldo_awal)}</td>
                                    <td className="py-3.5 px-4 font-semibold text-[#009664]">{sesi.kasir || sesi.user?.name || sesi.nama_kasir}</td>
                                    <td className="py-3.5 px-4 text-slate-500">{sesi.waktuTutup || sesi.waktu_tutup || '-'}</td>
                                    <td className="py-3.5 px-4 font-semibold text-slate-800">{renderRupiah(sesi.saldoAkhir || sesi.saldo_akhir)}</td>
                                    <td className="py-3.5 px-4 text-center relative">
                                        <button 
                                            onClick={() => setActiveDropdown(activeDropdown === index ? null : index)}
                                            className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition hover:bg-slate-100"
                                        >
                                            &#8942;
                                        </button>

                                        {activeDropdown === index && (
                                            <>
                                                <div className="fixed inset-0 z-20" onClick={() => setActiveDropdown(null)} />
                                                <div className="absolute right-4 mt-1 w-44 bg-white border border-slate-200/80 rounded-lg shadow-lg py-1 z-30 text-left overflow-hidden">
                                                    <button 
                                                        onClick={() => { setActiveDropdown(null); alert('Membuka Fitur Detail Sesi...'); }}
                                                        className="w-full px-3 py-2 text-[11px] text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                                    >
                                                        👁 Lihat Detail
                                                    </button>
                                                    <button 
                                                        onClick={() => { setActiveDropdown(null); setSelectedSesi(sesi); }}
                                                        className="w-full px-3 py-2 text-[11px] hover:bg-slate-50 flex items-center gap-2 font-semibold text-slate-800"
                                                    >
                                                        🧾 Lihat Aktivitas Sesi
                                                    </button>
                                                    <button 
                                                        onClick={() => { setActiveDropdown(null); alert('Mencetak struk sesi...'); }}
                                                        className="w-full px-3 py-2 text-[11px] text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                                    >
                                                        🖨 Cetak Ulang Sesi
                                                    </button>
                                                    <button 
                                                        onClick={() => { setActiveDropdown(null); alert('Mengunduh PDF Laporan...'); }}
                                                        className="w-full px-3 py-2 text-[11px] text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100"
                                                    >
                                                        ⬇ Download PDF
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {dataTersaring.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center italic text-slate-400">
                                        Tidak ada data aktivitas sesi kasir dalam database pada rentang filter ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ======================================================== */}
            {/* ====== MODAL SLIDE OUT PANEL LAPORAN STRUK DINAMIS ===== */}
            {/* ======================================================== */}
            {selectedSesi && (
                <>
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40" onClick={() => setSelectedSesi(null)} />
                    
                    <div className="fixed top-0 right-0 h-full w-[360px] bg-slate-100 shadow-2xl z-50 flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-300">
                        
                        <div className="bg-white px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">Aktivitas Sesi Terperinci</span>
                            <button onClick={() => setSelectedSesi(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm p-1">✕</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 flex justify-center">
                            <div className="bg-white w-full border border-slate-200 shadow-xs p-5 font-mono text-[11px] text-slate-800 space-y-4 leading-relaxed rounded-sm">
                                <div className="text-center space-y-0.5">
                                    <h3 className="font-bold text-xs uppercase tracking-wide">TOKO KAHITA BUSANA</h3>
                                    <p className="text-slate-400">Laporan Sesi Kasir</p>
                                </div>

                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Kasir:</span>
                                        <span className="font-bold text-slate-700">{selectedSesi.kasir || selectedSesi.user?.name || selectedSesi.nama_kasir}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Waktu Buka:</span>
                                        <span>{selectedSesi.waktuBuka || selectedSesi.waktu_buka}</span>
                                    </div>
                                </div>

                                <div className="border-b border-dashed border-slate-300" />

                                <div className="space-y-1">
                                    <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">SALDO</p>
                                    <div className="flex justify-between"><span>Saldo awal:</span><span>{renderRupiah(selectedSesi.saldoAwal || selectedSesi.saldo_awal)}</span></div>
                                    <div className="flex justify-between"><span>Saldo akhir input:</span><span>{renderRupiah(selectedSesi.saldoAkhir || selectedSesi.saldo_akhir)}</span></div>
                                    <div className="flex justify-between"><span>Kas sistem:</span><span>{renderRupiah(selectedSesi.kasSistem || selectedSesi.kas_sistem || selectedSesi.saldo_akhir)}</span></div>
                                    <div className="flex justify-between font-bold border-t border-slate-100 pt-1 text-slate-900">
                                        <span>Selisih:</span>
                                        <span className={(selectedSesi.selisih || 0) === 0 ? "text-emerald-600" : "text-rose-600"}>
                                            {renderRupiah(selectedSesi.selisih || 0)}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-b border-dashed border-slate-300" />

                                <div className="space-y-1">
                                    <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">RINGKASAN PENJUALAN</p>
                                    <div className="flex justify-between"><span>Total transaksi:</span><span>{selectedSesi.ringkasan?.totalTransaksi || selectedSesi.total_transaksi || 0}</span></div>
                                    <div className="flex justify-between"><span>Produk terjual:</span><span>{selectedSesi.ringkasan?.produkTerjual || selectedSesi.produk_terjual || 0} item</span></div>
                                    <div className="flex justify-between font-bold text-slate-900"><span>Omset:</span><span>{renderRupiah(selectedSesi.ringkasan?.omset || selectedSesi.omset || 0)}</span></div>
                                    <div className="flex justify-between"><span>Diskon:</span><span>{renderRupiah(selectedSesi.ringkasan?.diskon || selectedSesi.diskon || 0)}</span></div>
                                    <div className="flex justify-between text-amber-600"><span>Void:</span><span>{selectedSesi.ringkasan?.voidCount || selectedSesi.void_count || 0} transaksi</span></div>
                                    <div className="flex justify-between text-rose-600"><span>Refund:</span><span>{selectedSesi.ringkasan?.refundCount || selectedSesi.refund_count || 0} transaksi</span></div>
                                    <div className="flex justify-between"><span>Pajak:</span><span>{renderRupiah(selectedSesi.ringkasan?.pajak || selectedSesi.pajak || 0)}</span></div>
                                </div>

                                <div className="border-b border-dashed border-slate-300" />

                                <div className="space-y-1">
                                    <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">METODE PEMBAYARAN</p>
                                    <div className="flex justify-between"><span>Cash:</span><span>{renderRupiah(selectedSesi.metodeBayar?.cash || selectedSesi.pembayaran_cash || 0)}</span></div>
                                    <div className="flex justify-between"><span>QRIS:</span><span>{renderRupiah(selectedSesi.metodeBayar?.qris || selectedSesi.pembayaran_qris || 0)}</span></div>
                                    <div className="flex justify-between"><span>Transfer:</span><span>{renderRupiah(selectedSesi.metodeBayar?.transfer || selectedSesi.pembayaran_transfer || 0)}</span></div>
                                </div>

                                <div className="border-b border-dashed border-slate-300" />

                                <div className="space-y-1">
                                    <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">PRODUK TERJUAL</p>
                                    {(selectedSesi.produkDetail || selectedSesi.produk_detail || []).map((prod, idx) => (
                                        <div key={idx} className="flex justify-between text-slate-700">
                                            <span>{prod.nama || prod.nama_produk}</span>
                                            <span className="font-bold">x{prod.qty || prod.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-b border-dashed border-slate-300" />

                                <div className="space-y-1">
                                    <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">AKTIVITAS SESI</p>
                                    {(selectedSesi.logAktivitas || selectedSesi.log_aktivitas || []).map((log, idx) => (
                                        <div key={idx} className="flex gap-3 text-slate-600">
                                            <span className="text-slate-400 font-semibold">{log.jam || log.waktu}</span>
                                            <span>{log.teks || log.aktivitas}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-b border-dashed border-slate-300" />
                                <p className="text-center text-[10px] text-slate-400 pt-2 font-sans tracking-wide">KA-HITA POS SYSTEM SECURED</p>
                            </div>
                        </div>

                        <div className="bg-white p-3 border-t border-slate-200">
                            <button 
                                onClick={() => alert('Mengirim perintah cetak ulang ke mesin thermal printer...')}
                                className="w-full bg-[#009664] hover:bg-[#007a51] text-white py-2 text-xs font-semibold rounded-lg shadow-sm transition duration-150 uppercase tracking-wide"
                            >
                                🖨 Cetak Ulang Sesi
                            </button>
                        </div>
                    </div>
                </>
            )}

        </div>
    );
}