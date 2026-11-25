
import React, { useState, useRef, useMemo, useEffect } from 'react';

export default function AktivitasSesiKasir({
    sessionHistory = [],
    formatRupiah
}) {


    const [periodeMakro, setPeriodeMakro] = useState('hari');
    const [statusFilter, setStatusFilter] = useState('all');

    const hariIniStr = useMemo(() => {
        return new Date().toISOString().split('T')[0];
    }, []);

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

    const [rangeTanggal, setRangeTanggal] = useState({
        start: hariIniStr,
        end: hariIniStr
    });

    const [modeTanggal, setModeTanggal] = useState(null); // 'start' | 'end'
    const startDateInputRef = useRef(null);
    const endDateInputRef = useRef(null);

    // State UI
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [selectedSesi, setSelectedSesi] = useState(null);

    useEffect(() => {
        const kini = new Date();

        if (periodeMakro === 'hari') {
            const hariIni = toYMD(kini);
            setRangeTanggal({ start: hariIni, end: hariIni });
        } else if (periodeMakro === 'bulan') {
            const awalBulan = new Date(kini.getFullYear(), kini.getMonth(), 1);
            setRangeTanggal({ start: toYMD(awalBulan), end: toYMD(kini) });
        } else if (periodeMakro === 'tahun') {
            const awalTahun = new Date(kini.getFullYear(), 0, 1);
            setRangeTanggal({ start: toYMD(awalTahun), end: toYMD(kini) });
        }

        setModeTanggal(null);
    }, [periodeMakro]);

    // ----------------------------------------------------
    // FILTER DATA
    // ----------------------------------------------------
    const dataTersaring = useMemo(() => {

        const listAman = Array.isArray(sessionHistory)
            ? sessionHistory
            : [];

        return listAman.filter((item) => {

            if (!item) return false;

            const tanggalRaw =
                item.tanggal ||
                item.created_at ||
                item.waktu_buka ||
                item.waktu_buka_raw;

            if (!tanggalRaw) return true;

            const tanggalSesi = String(tanggalRaw)
                .split(' ')[0]
                .split('T')[0];

            const cocokTanggal =
                tanggalSesi >= rangeTanggal.start &&
                tanggalSesi <= rangeTanggal.end;

            const statusSesiSekarang =
                item.status || 'open';

            const cocokStatus =
                statusFilter === 'all' ||
                statusSesiSekarang
                    .toLowerCase()
                    === statusFilter.toLowerCase();

            return cocokTanggal && cocokStatus;
        });

    }, [sessionHistory, rangeTanggal, statusFilter]);

    // ----------------------------------------------------
    // UTILITIES
    // ----------------------------------------------------
    const formatLabelTanggal = (dateString) => {
        if (!dateString) return '';
        const opsi = { day: 'numeric', month: 'short', year: 'numeric' };
        return parseLocalYMD(dateString).toLocaleDateString('id-ID', opsi);
    };

    const bukaPickerTanggal = (mode) => {
        setModeTanggal(mode);
        setPeriodeMakro('custom');
        const ref = mode === 'start' ? startDateInputRef : endDateInputRef;
        if (ref.current) {
            ref.current.showPicker();
        }
    };

    const handleTanggalMulai = (e) => {
        const tanggalTerpilih = e.target.value;
        if (!tanggalTerpilih) return;
        setRangeTanggal((prev) => {
            const end = prev.end < tanggalTerpilih ? tanggalTerpilih : prev.end;
            return { start: tanggalTerpilih, end };
        });
        setModeTanggal(null);
        setPeriodeMakro('custom');
    };

    const handleTanggalAkhir = (e) => {
        const tanggalTerpilih = e.target.value;
        if (!tanggalTerpilih) return;
        setRangeTanggal((prev) => {
            const start = prev.start > tanggalTerpilih ? tanggalTerpilih : prev.start;
            return { start, end: tanggalTerpilih };
        });
        setModeTanggal(null);
        setPeriodeMakro('custom');
    };

    const geserTanggal = (jumlahHari) => {
        const tglAwal = parseLocalYMD(rangeTanggal.start);
        const tglAkhir = parseLocalYMD(rangeTanggal.end);

        tglAwal.setDate(tglAwal.getDate() + jumlahHari);
        tglAkhir.setDate(tglAkhir.getDate() + jumlahHari);

        setRangeTanggal({
            start: toYMD(tglAwal),
            end: toYMD(tglAkhir)
        });

        setPeriodeMakro('custom');
    };

    const renderRupiah = (nilai) => {

        if (formatRupiah) {
            return formatRupiah(nilai);
        }

        return `Rp ${(Number(nilai) || 0)
            .toLocaleString('id-ID')}`;
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f4f6f9] overflow-hidden">

            {/* FILTER */}
            <div className="bg-white p-4 border-b border-slate-100 flex-shrink-0 w-full">
                <div className="flex flex-row items-center justify-between gap-4 w-full">

                    <div className="flex-1 max-w-[220px]">
                        <select
                            value={periodeMakro}
                            onChange={(e) =>
                                setPeriodeMakro(e.target.value)
                            }
                            className="bg-white border border-gray-200 rounded-l px-3 py-1.5 text-xs font-medium text-gray-700 focus:outline-none focus:border-[#009664] cursor-pointer w-full"
                        >
                            <option value="hari">Hari ini</option>
                            <option value="bulan">Bulan ini</option>
                            <option value="tahun">Tahun ini</option>
                            <option value="custom" disabled>
                                Rentang Kustom
                            </option>
                        </select>
                    </div>

                    <div className="flex items-center bg-white border border-gray-200 rounded-l overflow-hidden h-[33px] min-w-[300px] flex-1 relative">
                        <button
                            type="button"
                            onClick={() => geserTanggal(-1)}
                            className="px-3 text-xs font-medium text-gray-500 hover:bg-slate-50 transition border-r border-gray-200 h-full"
                        >
                            &lt;
                        </button>

                        <button
                            type="button"
                            onClick={() => bukaPickerTanggal('start')}
                            className={`px-3 text-xs font-medium transition h-full flex-1 ${modeTanggal === 'start' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50/50'}`}
                            title="Pilih tanggal awal"
                        >
                            Dari: {formatLabelTanggal(rangeTanggal.start)}
                        </button>

                        <span className="px-1 text-slate-300 text-sm">-</span>

                        <button
                            type="button"
                            onClick={() => bukaPickerTanggal('end')}
                            className={`px-3 text-xs font-medium transition h-full flex-1 ${modeTanggal === 'end' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50/50'}`}
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
                            className="px-3 text-xs font-medium text-gray-500 hover:bg-slate-50 transition border-l border-gray-200 h-full"
                        >
                            &gt;
                        </button>
                    </div>

                    <div className="flex-1 max-w-[240px]">
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                            className="bg-white border border-gray-200 rounded-l px-3 py-1.5 text-xs font-medium text-gray-700 focus:outline-none focus:border-[#009664] cursor-pointer w-full"
                        >
                            <option value="all">
                                Semua Status
                            </option>

                            <option value="closed">
                                Selesai
                            </option>

                            <option value="open">
                                Aktif Buka
                            </option>
                        </select>
                    </div>

                </div>
            </div>

            {/* TABLE */}
            <div className="flex-1 overflow-y-auto p-5">

                <div className="bg-white border border-gray-200 rounded-l overflow-hidden">

                    <table className="w-full text-left border-collapse">

                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase text-gray-400 font-bold">

                                <th className="py-3 px-4">Waktu Buka</th>
                                <th className="py-3 px-4">Saldo Awal</th>
                                <th className="py-3 px-4">Kasir</th>
                                <th className="py-3 px-4">Waktu Tutup</th>
                                <th className="py-3 px-4">Saldo Akhir</th>
                                <th className="py-3 px-4 text-center w-16">Aksi</th>

                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 text-xs text-gray-600 font-medium">

                            {dataTersaring.map((sesi, index) => (

                                <tr
                                    key={`${sesi.id || index}-${index}`}
                                    className="hover:bg-slate-50/40 transition-colors"
                                >

                                    <td className="py-3.5 px-4 text-gray-500">
                                        {sesi.waktuBuka || sesi.waktu_buka}
                                    </td>

                                    <td className="py-3.5 px-4 font-bold text-gray-800">
                                        {renderRupiah(
                                            sesi.saldoAwal || sesi.saldo_awal
                                        )}
                                    </td>

                                    <td className="py-3.5 px-4 font-bold text-[#009664]">
                                        {sesi.kasir ||
                                            sesi.user?.name ||
                                            sesi.nama_kasir}
                                    </td>

                                    <td className="py-3.5 px-4 text-gray-500">
                                        {sesi.waktuTutup ||
                                            sesi.waktu_tutup ||
                                            '-'}
                                    </td>

                                    <td className="py-3.5 px-4 font-bold text-gray-800">

                                        {(sesi.waktuTutup || sesi.waktu_tutup)
                                            ? renderRupiah(
                                                sesi.saldoAkhir || sesi.saldo_akhir
                                            )
                                            : (
                                                <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                                    Masih Buka
                                                </span>
                                            )}

                                    </td>

                                    <td className="py-3.5 px-4 text-center relative">

                                        <button
                                            onClick={() =>
                                                setActiveDropdown(
                                                    activeDropdown === index
                                                        ? null
                                                        : index
                                                )
                                            }
                                            className="text-slate-400 hover:text-gray-700 p-1 rounded transition hover:bg-slate-100"
                                        >
                                            &#8942;
                                        </button>

                                    </td>
                                </tr>
                            ))}

                            {dataTersaring.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="py-12 text-center italic text-slate-400"
                                    >
                                        Tidak ada data aktivitas sesi kasir dalam database pada rentang filter ini.
                                    </td>
                                </tr>
                            )}

                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
