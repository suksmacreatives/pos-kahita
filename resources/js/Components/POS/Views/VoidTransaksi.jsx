import React, { useState, useMemo, useRef, useEffect } from 'react';

export default function VoidTransaksi({ voidHistory = [], formatRupiah }) {
    // --- STATE FILTER & SEARCH ---
    const [periodeMakro, setPeriodeMakro] = useState('hari'); 
    const [selectedOutlet, setSelectedOutlet] = useState('all'); 
    const [searchTerm, setSearchTerm] = useState(''); 

    const toYMD = (dateObj) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const parseLocalYMD = (dateStr) => {
        const [year, month, day] = String(dateStr).split('-').map(Number);
        return new Date(year, (month || 1) - 1, day || 1);
    };

    // Diselaraskan: State Tanggal default otomatis mengambil tanggal hari ini secara dinamis
    const [rangeTanggal, setRangeTanggal] = useState(() => {
        const hariIni = toYMD(new Date());
        return { start: hariIni, end: hariIni };
    });

    const [modeTanggal, setModeTanggal] = useState(null); // 'start' | 'end'
    const startDateInputRef = useRef(null);
    const endDateInputRef = useRef(null);

    useEffect(() => {
        const today = new Date();

        if (periodeMakro === 'hari') {
            const hariIni = toYMD(today);
            setRangeTanggal({ start: hariIni, end: hariIni });
        } else if (periodeMakro === 'bulan') {
            const awalBulan = new Date(today.getFullYear(), today.getMonth(), 1);
            setRangeTanggal({ start: toYMD(awalBulan), end: toYMD(today) });
        } else if (periodeMakro === 'tahun') {
            const awalTahun = new Date(today.getFullYear(), 0, 1);
            setRangeTanggal({ start: toYMD(awalTahun), end: toYMD(today) });
        }

        setModeTanggal(null);
    }, [periodeMakro]);

    // --- HANDLER NAVIGASI TANGGAL (PANAH ◀ DAN ▶) ---
    const geserTanggal = (jumlahHari) => {
        const tanggalBaruStart = parseLocalYMD(rangeTanggal.start);
        tanggalBaruStart.setDate(tanggalBaruStart.getDate() + jumlahHari);

        const tanggalBaruEnd = parseLocalYMD(rangeTanggal.end);
        tanggalBaruEnd.setDate(tanggalBaruEnd.getDate() + jumlahHari);

        setRangeTanggal({
            start: toYMD(tanggalBaruStart),
            end: toYMD(tanggalBaruEnd)
        });
    };

    const bukaPickerTanggal = (mode) => {
        setModeTanggal(mode);
        const ref = mode === 'start' ? startDateInputRef : endDateInputRef;
        if (ref.current) {
            ref.current.showPicker();
        }
    };

    const handleTanggalMulai = (e) => {
        const tanggalTerpilih = e.target.value;
        if (!tanggalTerpilih) return;
        setRangeTanggal((prev) => {
            const endDate = prev.end < tanggalTerpilih ? tanggalTerpilih : prev.end;
            return { start: tanggalTerpilih, end: endDate };
        });
        setModeTanggal(null);
    };

    const handleTanggalAkhir = (e) => {
        const tanggalTerpilih = e.target.value;
        if (!tanggalTerpilih) return;
        setRangeTanggal((prev) => {
            const startDate = prev.start > tanggalTerpilih ? tanggalTerpilih : prev.start;
            return { start: startDate, end: tanggalTerpilih };
        });
        setModeTanggal(null);
    };

    const formatLabelTanggal = (dateStr) => {
        if (!dateStr) return '';
        const opsi = { day: 'numeric', month: 'short', year: 'numeric' };
        return parseLocalYMD(dateStr).toLocaleDateString('id-ID', opsi);
    };

    // --- LOGIKA FILTER DATA MURNI VOID ---
    const filteredData = useMemo(() => {
        return voidHistory.filter((item) => {
            const noNotaAsal = item.invoice_number || item.penjualan?.no_nota || item.penjualan?.invoice || '';
            const namaKasir = item.voidUser?.name || item.user?.name || item.kasir_peminta?.name || item.nama_kasir || '';
            const alasanVoid = item.void_reason || item.alasan_void || item.alasan || '';

            const matchesSearch =
                noNotaAsal.toLowerCase().includes(searchTerm.toLowerCase()) ||
                namaKasir.toLowerCase().includes(searchTerm.toLowerCase()) ||
                alasanVoid.toLowerCase().includes(searchTerm.toLowerCase());

            const tanggalVoid = String(item.voided_at || item.created_at || '').slice(0, 10);
            const matchesDate = tanggalVoid
                ? tanggalVoid >= rangeTanggal.start && tanggalVoid <= rangeTanggal.end
                : false;

            return matchesSearch && matchesDate;
        });
    }, [voidHistory, searchTerm, rangeTanggal]);

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'disetujui':
            case 'sukses':
                return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-50 text-rose-600 border border-rose-100">Disetujui</span>;
            case 'menunggu':
            case 'pending':
                return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-600 border border-amber-100">Menunggu</span>;
            case 'ditolak':
                return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">Ditolak</span>;
            default:
                return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-50 text-slate-500">{status || 'Disetujui'}</span>;
        }
    };

    return (
        <div className="flex-1 bg-[#f7f8fa] p-5 overflow-y-auto">
            
            {/* ====== AREA FILTER UTAMA (SAMA PERSIS GAYA POSISI & STYLE) ====== */}
            <div className="bg-white border rounded-xl p-4 mb-5 flex-shrink-0 w-full">
                <div className="flex flex-row items-center justify-between gap-4 w-full">
                    
                    {/* Filter Kiri: Pilihan Makro */}
                    <div className="flex-1 max-w-[220px]">
                        <select 
                            value={periodeMakro}
                            onChange={(e) => setPeriodeMakro(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#009664] cursor-pointer w-full"
                        >
                            <option value="hari">Hari ini</option>
                            <option value="bulan">Bulan ini</option>
                            <option value="tahun">Tahun ini</option>
                        </select>
                    </div>

                    {/* Filter Tengah: Date Range Picker Interaktif */}
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden h-[33px] min-w-[300px] flex-1 relative">
                        <button
                            type="button"
                            onClick={() => geserTanggal(-1)}
                            className="px-3 text-sm text-slate-500 hover:bg-slate-50 transition border-r border-slate-200 h-full"
                        >
                            &lt;
                        </button>

                        <button
                            type="button"
                            onClick={() => bukaPickerTanggal('start')}
                            className={`px-3 text-sm transition h-full flex-1 ${modeTanggal === 'start' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50/50'}`}
                            title="Pilih tanggal awal"
                        >
                            Dari: {formatLabelTanggal(rangeTanggal.start)}
                        </button>

                        <span className="px-1 text-slate-300 text-sm">-</span>

                        <button
                            type="button"
                            onClick={() => bukaPickerTanggal('end')}
                            className={`px-3 text-sm transition h-full flex-1 ${modeTanggal === 'end' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50/50'}`}
                            title="Pilih tanggal akhir"
                        >
                            Sampai: {formatLabelTanggal(rangeTanggal.end)}
                        </button>

                        <input
                            type="date"
                            ref={startDateInputRef}
                            value={rangeTanggal.start}
                            max={rangeTanggal.end}
                            onChange={handleTanggalMulai}
                            className="absolute opacity-0 pointer-events-none w-0 h-0"
                        />
                        <input
                            type="date"
                            ref={endDateInputRef}
                            value={rangeTanggal.end}
                            min={rangeTanggal.start}
                            onChange={handleTanggalAkhir}
                            className="absolute opacity-0 pointer-events-none w-0 h-0"
                        />

                        <button
                            type="button"
                            onClick={() => geserTanggal(1)}
                            className="px-3 text-sm text-slate-500 hover:bg-slate-50 transition border-l border-slate-200 h-full"
                        >
                            &gt;
                        </button>
                    </div>

                    {/* Filter Kanan: Dropdown Pilihan Status Void / Outlet */}
                    <div className="flex-1 max-w-[240px]">
                        <select 
                            value={selectedOutlet}
                            onChange={(e) => setSelectedOutlet(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#009664] cursor-pointer w-full"
                        >
                            <option value="all">Semua Status</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ====== AREA KONTEN DATA BAWAH ====== */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                
                {/* BARIS TERPISAH: PENCARIAN (SEARCH BAR) */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-72">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                            🔍
                        </span>
                        <input 
                            type="text"
                            placeholder="Cari No. Nota, kasir, alasan..."
                            className="w-full border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition shadow-2xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="text-sm text-slate-500  w-full md:w-auto text-right">
                        Ditemukan <span className="font-semibold text-slate-800">{filteredData.length}</span> log void
                    </div>
                </div>

                {/* DATA TABEL LOG VOID */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

    <div className="overflow-x-auto">

        <table className="min-w-full">

            <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[11px] uppercase tracking-wider text-slate-600">

                    <th className="px-5 py-4 text-left">
                        Waktu Void
                    </th>

                    <th className="px-4 py-4 text-left">
                        No. Invoice
                    </th>

                    <th className="px-4 py-4 text-left">
                        Kasir
                    </th>

                    <th className="px-4 py-4 text-center">
                        Aksi
                    </th>

                    <th className="px-4 py-4 text-right">
                        Nilai Transaksi
                    </th>

                    <th className="px-5 py-4 text-center">
                        Status
                    </th>

                </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">

                {filteredData.length > 0 ? (

                    filteredData.map((item) => {

                        const waktu =
                            item.voided_at
                                ? new Date(item.voided_at).toLocaleString(
                                      "id-ID",
                                      {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                      }
                                  )
                                : item.created_at
                                ? new Date(item.created_at).toLocaleString(
                                      "id-ID",
                                      {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                      }
                                  )
                                : "-";

                        const nota =
                            item.invoice_number || "-";

                        const kasir =
                            item.voidUser?.name ||
                            item.user?.name ||
                            "-";

                        const total =
                            Number(item.grand_total ?? 0);

                        return (

                            <tr
                                key={item.id}
                                className="hover:bg-slate-50 transition-all duration-150"
                            >

                                {/* Waktu */}

                                <td className="px-5 py-4 whitespace-nowrap">

                                    <div className="font-medium text-slate-700">
                                        {waktu}
                                    </div>

                                </td>

                                {/* Invoice */}

                                <td className="px-4 py-4">

                                    <div className="font-bold text-blue-700">
                                        {nota}
                                    </div>

                                </td>

                                {/* Kasir */}

                                <td className="px-4 py-4">

                                    <div className="font-semibold text-slate-700">
                                        {kasir}
                                    </div>

                                </td>

                                {/* Aksi */}

                                <td className="px-4 py-4 text-center">

                                    <span className="inline-flex items-center rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-xs font-semibold">
                                        Transaksi Dibatalkan
                                    </span>

                                </td>

                                {/* Nilai */}

                                <td className="px-4 py-4 text-right">

                                    <span className="font-bold text-red-600 text-base">
                                        {formatRupiah(total)}
                                    </span>

                                </td>

                                {/* Status */}

                                <td className="px-5 py-4 text-center">

                                    <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs font-bold tracking-wide">
                                        VOID
                                    </span>

                                </td>

                            </tr>

                        );

                    })

                ) : (

                    <tr>

                        <td
                            colSpan="6"
                            className="py-16 text-center"
                        >

                            <div className="flex flex-col items-center gap-3">

                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl">
                                    📄
                                </div>

                                <div className="font-semibold text-slate-700">
                                    Belum Ada Data Void
                                </div>

                                <div className="text-sm text-slate-400">
                                    Tidak ditemukan transaksi yang telah di-void.
                                </div>

                            </div>

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