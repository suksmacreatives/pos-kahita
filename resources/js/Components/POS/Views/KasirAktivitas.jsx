
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

    const [rangeTanggal, setRangeTanggal] = useState({
        start: hariIniStr,
        end: hariIniStr
    });

    const [isPilihanPertama, setIsPilihanPertama] = useState(true);
    const hiddenDateInputRef = useRef(null);

    // State UI
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [selectedSesi, setSelectedSesi] = useState(null);

    useEffect(() => {

        const kini = new Date();

        const formatString = (d) => {
            return d.toISOString().split('T')[0];
        };

        if (periodeMakro === 'hari') {

            setRangeTanggal({
                start: hariIniStr,
                end: hariIniStr
            });

        } else if (periodeMakro === 'bulan') {

            const awalBulan = new Date(
                kini.getFullYear(),
                kini.getMonth(),
                1
            );

            const akhirBulan = new Date(
                kini.getFullYear(),
                kini.getMonth() + 1,
                0
            );

            setRangeTanggal({
                start: formatString(awalBulan),
                end: formatString(akhirBulan)
            });

        } else if (periodeMakro === 'tahun') {

            const awalTahun = new Date(
                kini.getFullYear(),
                0,
                1
            );

            const akhirTahun = new Date(
                kini.getFullYear(),
                11,
                31
            );

            setRangeTanggal({
                start: formatString(awalTahun),
                end: formatString(akhirTahun)
            });
        }

        setIsPilihanPertama(true);

    }, [periodeMakro, hariIniStr]);

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

        try {

            const opsi = {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            };

            return new Date(dateString)
                .toLocaleDateString('id-ID', opsi);

        } catch (e) {

            return dateString;
        }
    };

    const pemicuKalenderKlik = () => {

        if (hiddenDateInputRef.current) {
            hiddenDateInputRef.current.showPicker();
        }
    };

    const handleKalenderInput = (e) => {

        const tanggalTerpilih = e.target.value;

        if (!tanggalTerpilih) return;

        if (isPilihanPertama) {

            setRangeTanggal({
                start: tanggalTerpilih,
                end: tanggalTerpilih
            });

            setIsPilihanPertama(false);

            setPeriodeMakro('custom');

        } else {

            setRangeTanggal((prev) => {

                const startStr =
                    tanggalTerpilih < prev.start
                        ? tanggalTerpilih
                        : prev.start;

                const endStr =
                    tanggalTerpilih > prev.start
                        ? tanggalTerpilih
                        : prev.start;

                return {
                    start: startStr,
                    end: endStr
                };
            });

            setIsPilihanPertama(true);
        }
    };

    const geserTanggal = (jumlahHari) => {

        const tglAwal = new Date(rangeTanggal.start);
        const tglAkhir = new Date(rangeTanggal.end);

        tglAwal.setDate(
            tglAwal.getDate() + jumlahHari
        );

        tglAkhir.setDate(
            tglAkhir.getDate() + jumlahHari
        );

        const formatKeString = (d) => {
            return d.toISOString().split('T')[0];
        };

        setRangeTanggal({
            start: formatKeString(tglAwal),
            end: formatKeString(tglAkhir)
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
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden text-slate-600 font-sans tracking-tight relative">

            {/* FILTER */}
            <div className="bg-white p-4 border-b border-slate-100 flex-shrink-0 w-full">
                <div className="flex flex-row items-center justify-between gap-4 w-full">

                    <div className="flex-1 max-w-[220px]">
                        <select
                            value={periodeMakro}
                            onChange={(e) =>
                                setPeriodeMakro(e.target.value)
                            }
                            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#009664] cursor-pointer w-full shadow-2xs"
                        >
                            <option value="hari">Hari ini</option>
                            <option value="bulan">Bulan ini</option>
                            <option value="tahun">Tahun ini</option>
                            <option value="custom" disabled>
                                Rentang Kustom
                            </option>
                        </select>
                    </div>

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
                            className={`px-4 text-xs font-medium transition h-full flex-1 ${
                                !isPilihanPertama
                                    ? 'bg-amber-50 text-amber-700 font-semibold animate-pulse'
                                    : 'text-slate-700 hover:bg-slate-50/50'
                            }`}
                        >

                            {rangeTanggal.start === rangeTanggal.end
                                ? formatLabelTanggal(rangeTanggal.start)
                                : `${formatLabelTanggal(rangeTanggal.start)} - ${formatLabelTanggal(rangeTanggal.end)}`}

                            {!isPilihanPertama &&
                                ' (Pilih tanggal akhir...)'}
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

                    <div className="flex-1 max-w-[240px]">
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#009664] cursor-pointer w-full shadow-2xs"
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

                                <tr
                                    key={`${sesi.id || index}-${index}`}
                                    className="hover:bg-slate-50/40 transition-colors"
                                >

                                    <td className="py-3.5 px-4 text-slate-500">
                                        {sesi.waktuBuka || sesi.waktu_buka}
                                    </td>

                                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                                        {renderRupiah(
                                            sesi.saldoAwal || sesi.saldo_awal
                                        )}
                                    </td>

                                    <td className="py-3.5 px-4 font-semibold text-[#009664]">
                                        {sesi.kasir ||
                                            sesi.user?.name ||
                                            sesi.nama_kasir}
                                    </td>

                                    <td className="py-3.5 px-4 text-slate-500">
                                        {sesi.waktuTutup ||
                                            sesi.waktu_tutup ||
                                            '-'}
                                    </td>

                                    <td className="py-3.5 px-4 font-semibold text-slate-800">

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
                                            className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition hover:bg-slate-100"
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
