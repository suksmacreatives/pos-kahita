import React, { useState, useMemo, useRef } from 'react';

export default function VoidTransaksi({ voidHistory = [], formatRupiah }) {
    // --- STATE FILTER & SEARCH ---
    const [periodeMakro, setPeriodeMakro] = useState('hari'); 
    const [selectedOutlet, setSelectedOutlet] = useState('all'); 
    const [searchTerm, setSearchTerm] = useState(''); 

    // Diselaraskan: State Tanggal default otomatis mengambil tanggal hari ini secara dinamis
    const [rangeTanggal, setRangeTanggal] = useState(() => {
        const hariIni = new Date().toISOString().split('T')[0];
        return { start: hariIni, end: hariIni };
    });

    const hiddenDateInputRef = useRef(null);

    // --- HANDLER NAVIGASI TANGGAL (PANAH ◀ DAN ▶) ---
    const geserTanggal = (jumlahHari) => {
        const tanggalBaruStart = new Date(rangeTanggal.start);
        tanggalBaruStart.setDate(tanggalBaruStart.getDate() + jumlahHari);
        
        const tanggalBaruEnd = new Date(rangeTanggal.end);
        tanggalBaruEnd.setDate(tanggalBaruEnd.getDate() + jumlahHari);

        const formatYMD = (dateObj) => dateObj.toISOString().split('T')[0];

        setRangeTanggal({
            start: formatYMD(tanggalBaruStart),
            end: formatYMD(tanggalBaruEnd)
        });
    };

    const pemicuKalenderKlik = () => {
        if (hiddenDateInputRef.current) {
            hiddenDateInputRef.current.showPicker();
        }
    };

    const handleKalenderInput = (e) => {
        if (e.target.value) {
            setRangeTanggal({
                start: e.target.value,
                end: e.target.value
            });
        }
    };

    const formatLabelTanggal = (dateStr) => {
        if (!dateStr) return '';
        const opsi = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateStr).toLocaleDateString('id-ID', opsi);
    };

    // --- LOGIKA FILTER DATA MURNI VOID ---
    const filteredData = useMemo(() => {
        return voidHistory.filter((item) => {
            const noNotaAsal = item.penjualan?.no_nota || item.penjualan?.invoice || '';
            const namaKasir = item.kasir_peminta?.name || item.nama_kasir || '';
            const alasanVoid = item.alasan_void || item.alasan || '';

            const matchesSearch = 
                noNotaAsal.toLowerCase().includes(searchTerm.toLowerCase()) ||
                namaKasir.toLowerCase().includes(searchTerm.toLowerCase()) ||
                alasanVoid.toLowerCase().includes(searchTerm.toLowerCase());

            const tanggalVoid = item.created_at ? item.created_at.split('T')[0] : '';
            let matchesDate = true;

            if (periodeMakro === 'hari') {
                matchesDate = (tanggalVoid >= rangeTanggal.start && tanggalVoid <= rangeTanggal.end);
            } else if (periodeMakro === 'bulan') {
                const bulanVoid = tanggalVoid.substring(0, 7);
                const bulanSekarang = new Date().toISOString().substring(0, 7);
                matchesDate = bulanVoid === bulanSekarang;
            } else if (periodeMakro === 'tahun') {
                const tahunVoid = tanggalVoid.substring(0, 4);
                const tahunSekarang = new Date().getFullYear().toString();
                matchesDate = tahunVoid === tahunSekarang;
            }

            return matchesSearch && matchesDate;
        });
    }, [voidHistory, searchTerm, periodeMakro, rangeTanggal]);

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'disetujui':
            case 'sukses':
                return <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-rose-50 text-rose-600 border border-rose-100">Disetujui</span>;
            case 'menunggu':
            case 'pending':
                return <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-amber-50 text-amber-600 border border-amber-100">Menunggu</span>;
            case 'ditolak':
                return <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">Ditolak</span>;
            default:
                return <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-slate-50 text-slate-500">{status || 'Disetujui'}</span>;
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden text-slate-600 font-sans tracking-tight">
            
            {/* ====== AREA FILTER UTAMA (SAMA PERSIS GAYA POSISI & STYLE) ====== */}
            <div className="bg-white p-4 border-b border-slate-100 flex-shrink-0 w-full">
                <div className="flex flex-row items-center justify-between gap-4 w-full">
                    
                    {/* Filter Kiri: Pilihan Makro */}
                    <div className="flex-1 max-w-[220px]">
                        <select 
                            value={periodeMakro}
                            onChange={(e) => setPeriodeMakro(e.target.value)}
                            className="bg-white border border-slate-200 rounded-l px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#009664] cursor-pointer w-full"
                        >
                            <option value="hari">Hari ini</option>
                            <option value="bulan">Bulan ini</option>
                            <option value="tahun">Tahun ini</option>
                        </select>
                    </div>

                    {/* Filter Tengah: Date Range Picker Interaktif */}
                    <div className="flex items-center bg-white border border-slate-200 rounded-l overflow-hidden h-[33px] min-w-[300px] flex-1 relative">
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

                    {/* Filter Kanan: Dropdown Pilihan Status Void / Outlet */}
                    <div className="flex-1 max-w-[240px]">
                        <select 
                            value={selectedOutlet}
                            onChange={(e) => setSelectedOutlet(e.target.value)}
                            className="bg-white border border-slate-200 rounded-l px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#009664] cursor-pointer w-full"
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
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 text-xs">
                            🔍
                        </span>
                        <input 
                            type="text"
                            placeholder="Cari No. Nota, kasir, alasan..."
                            className="w-full bg-white border border-slate-200 rounded-l pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-emerald-500 transition shadow-2xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="text-xs text-slate-400 font-medium w-full md:w-auto text-right">
                        Ditemukan <span className="font-bold text-slate-600">{filteredData.length}</span> log void
                    </div>
                </div>

                {/* DATA TABEL LOG VOID */}
                <div className="bg-white rounded-l border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <th className="p-3.5 px-5">Waktu Keluar Log</th>
                                    <th className="p-3.5 px-4">No. Nota Asal</th>
                                    <th className="p-3.5 px-4">Kasir Peminta</th>
                                    <th className="p-3.5 px-4">Alasan Void</th>
                                    <th className="p-3.5 px-4 text-right">Nilai Transaksi</th>
                                    <th className="p-3.5 px-5 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                                {filteredData.length > 0 ? (
                                    filteredData.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/40 transition">
                                            <td className="p-3.5 px-5 whitespace-nowrap text-slate-400">
                                                {item.created_at ? new Date(item.created_at).toLocaleString('id-ID', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                }) : '-'}
                                            </td>
                                            <td className="p-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                                                {item.penjualan?.no_nota || item.penjualan?.invoice || 'N/A'}
                                            </td>
                                            <td className="p-3.5 px-4">
                                                <span className="font-semibold text-slate-700">
                                                    {item.kasir_peminta?.name || item.nama_kasir || 'Kasir'}
                                                </span>
                                            </td>
                                            <td className="p-3.5 px-4 max-w-xs truncate text-slate-400" title={item.alasan_void || item.alasan}>
                                                {item.alasan_void || item.alasan || '-'}
                                            </td>
                                            <td className="p-3.5 px-4 text-right font-bold text-slate-700 whitespace-nowrap">
                                                {formatRupiah ? formatRupiah(item.penjualan?.total_harga || item.penjualan?.total || 0) : `Rp ${(item.penjualan?.total_harga || item.penjualan?.total || 0).toLocaleString('id-ID')}`}
                                            </td>
                                            <td className="p-3.5 px-5 text-center whitespace-nowrap">
                                                {getStatusBadge(item.status)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-slate-400 italic">
                                            Tidak ada log data void yang cocok dengan filter.
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