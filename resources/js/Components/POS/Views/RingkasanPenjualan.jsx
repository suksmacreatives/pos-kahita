import React, { useState, useMemo, useRef, useEffect } from 'react';

export default function RingkasanPenjualan({ salesHistory = [], outlets = [], formatRupiah, analisis_produk = {} }) {
    // ----------------------------------------------------
    // STATE FILTER BARIS ATAS
    // ----------------------------------------------------
    const [periodeMakro, setPeriodeMakro] = useState('hari');
    const [selectedOutlet, setSelectedOutlet] = useState('all');
    const [chartMode, setChartMode] = useState('hari'); // hari | minggu | bulan

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

    const [rangeTanggal, setRangeTanggal] = useState(() => {
        const hariIni = toYMD(new Date());
        return { start: hariIni, end: hariIni };
    });

    useEffect(() => {
        const today = new Date();

        if (periodeMakro === 'hari') {
            const hariIni = toYMD(today);
            setRangeTanggal({ start: hariIni, end: hariIni });
        } else if (periodeMakro === 'bulan') {
            const awal = new Date(today.getFullYear(), today.getMonth(), 1);
            setRangeTanggal({ start: toYMD(awal), end: toYMD(today) });
        } else if (periodeMakro === 'tahun') {
            const awal = new Date(today.getFullYear(), 0, 1);
            setRangeTanggal({ start: toYMD(awal), end: toYMD(today) });
        }

        setModeTanggal(null);
    }, [periodeMakro]);

    const [modeTanggal, setModeTanggal] = useState(null); // 'start' | 'end'
    const startDateInputRef = useRef(null);
    const endDateInputRef = useRef(null);

    const formatLabelTanggal = (dateString) => {
        if (!dateString) return '';
        const opsi = { day: 'numeric', month: 'short', year: 'numeric' };
        return parseLocalYMD(dateString).toLocaleDateString('id-ID', opsi);
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
            const end = prev.end < tanggalTerpilih ? tanggalTerpilih : prev.end;
            return { start: tanggalTerpilih, end };
        });
        setModeTanggal(null);
    };

    const handleTanggalAkhir = (e) => {
        const tanggalTerpilih = e.target.value;
        if (!tanggalTerpilih) return;
        setRangeTanggal((prev) => {
            const start = prev.start > tanggalTerpilih ? tanggalTerpilih : prev.start;
            return { start, end: tanggalTerpilih };
        });
        setModeTanggal(null);
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
    };

    // ----------------------------------------------------
    // PROSES ANALISIS & AKUMULASI DATA SMART DASHBOARD
    // ----------------------------------------------------
    const dataProses = useMemo(() => {
         console.log('salesHistory:', salesHistory);
        const listAman = Array.isArray(salesHistory) ? salesHistory : [];
console.log("Range Tanggal:", rangeTanggal);
console.log("Data Pertama:", salesHistory[0]);
        const dataTersaring = listAman.filter(item => {
            if (!item) return false;
            const itemDate = item.tanggal || item.created_at?.split('T')[0];
            console.log("Item Date:", itemDate);
    console.log("Start:", rangeTanggal.start);
    console.log("End:", rangeTanggal.end);
            if (!itemDate) return false;
            
            const cocokTanggal = itemDate >= rangeTanggal.start && itemDate <= rangeTanggal.end;
            
            const idOutletSesuai = String(item.outlet_id) === String(selectedOutlet);
            const namaOutletSesuai = item.outlet_name === selectedOutlet;
            const cocokOutlet = selectedOutlet === 'all' || idOutletSesuai || namaOutletSesuai;
            
            return cocokTanggal && cocokOutlet;
        });

        let omset = 0;
        let produkTerjual = 0;
        let pelangganUnik = new Set();
        let refundVoidCount = 0;

        const mapJam = {};
        const mapHari = { 'Senin': 0, 'Selasa': 0, 'Rabu': 0, 'Kamis': 0, 'Jumat': 0, 'Sabtu': 0, 'Minggu': 0 };
        const mapMinggu = { 'Minggu 1': 0, 'Minggu 2': 0, 'Minggu 3': 0, 'Minggu 4': 0 };
        
        const mapProduk = {};
        
        // SELARAS DATABASE: Disesuaikan dengan pilihan metode mutasi kas JenisBayar
        const jenisBayar = { 'Tunai': 0, 'QRIS': 0, 'Debit': 0, 'Transfer': 0 };

        const namaHariIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

        dataTersaring.forEach(nota => {
            if (!nota) return;
            
            // SINKRONISASI TOTAL OMSET (Mendukung properti 'jumlah' atau 'total')
            const totalNota =
    Number(
        nota.grand_total ??
        nota.total ??
        nota.jumlah
    ) || 0;
            omset += totalNota;
            
            if (nota.customer_name)
{
    pelangganUnik.add(nota.customer_name);
}
            if (nota.status === 'refund' || nota.status === 'void') refundVoidCount++;

            // MENGAKOMODASI STRUKTUR ARRAY PRODUK POS
            const items =
    nota.transaction_items ||
    nota.items ||
    nota.produkTerjual ||
    [];
            if (Array.isArray(items)) {
                items.forEach(prod => {
                    if (prod) {
                        const nameKey =
    prod.product_name_snapshot ||
    prod.nama ||
    prod.name;
                        const qty = Number(prod.qty || prod.quantity) || 0;
                        
                        if (nameKey) {
                            produkTerjual += qty;
                            mapProduk[nameKey] = (mapProduk[nameKey] || 0) + qty;
                        }
                    }
                });
            }

            // AMBIL JAM TRANSAKSI
            let jamAngka = 9;
            if (nota.jam && typeof nota.jam === 'string') {
                jamAngka = parseInt(nota.jam.split(':')[0], 10);
            } else if (nota.created_at) {
                jamAngka = new Date(nota.created_at).getHours();
            }
            const labelJam = `${String(jamAngka).padStart(2, '0')}:00`;
            mapJam[labelJam] = (mapJam[labelJam] || 0) + totalNota;

            // AMBIL HARI DAN MINGGUAN
            const tanggalObj = new Date(nota.tanggal || nota.created_at);
            if (!isNaN(tanggalObj)) {
                const hariNama = namaHariIndo[tanggalObj.getDay()];
                if (mapHari[hariNama] !== undefined) mapHari[hariNama] += totalNota;

                const hariKe = tanggalObj.getDate();
                if (hariKe <= 7) mapMinggu['Minggu 1'] += totalNota;
                else if (hariKe <= 14) mapMinggu['Minggu 2'] += totalNota;
                else if (hariKe <= 21) mapMinggu['Minggu 3'] += totalNota;
                else mapMinggu['Minggu 4'] += totalNota;
            }

            // SINKRONISASI METODE PEMBAYARAN KASIR (Mendukung metodeBayar / metode_pembayaran)
            const metodeAmandemen =
    nota.payment_method ||
    nota.metodeBayar ||
    nota.metode_pembayaran ||
    nota.metode;
            if (metodeAmandemen && jenisBayar[metodeAmandemen] !== undefined) {
                jenisBayar[metodeAmandemen] += totalNota;
            }
        });

        // KONTEN DATA UNTUK SUMBU GRAFIK BAR
        let SusunanChart = [];
        if (chartMode === 'hari') {
            const jamList = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
            const maxVal = Math.max(...jamList.map(j => mapJam[j] || 0), 1);
            SusunanChart = jamList.map(j => ({ label: j, nilai: mapJam[j] || 0, percentage: ((mapJam[j] || 0) / maxVal) * 100 }));
        } else if (chartMode === 'minggu') {
            const hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
            const maxVal = Math.max(...hariList.map(h => mapHari[h] || 0), 1);
            SusunanChart = hariList.map(h => ({ label: h, nilai: mapHari[h] || 0, percentage: ((mapHari[h] || 0) / maxVal) * 100 }));
        } else if (chartMode === 'bulan') {
            const mingguList = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'];
            const maxVal = Math.max(...mingguList.map(m => mapMinggu[m] || 0), 1);
            SusunanChart = mingguList.map(m => ({ label: m, nilai: mapMinggu[m] || 0, percentage: ((mapMinggu[m] || 0) / maxVal) * 100 }));
        }

        // AMBIL TOP 3 PRODUK TERLARIS
        const produkUrut = Object.keys(mapProduk)
            .map(nama => ({ nama, terjual: mapProduk[nama], stok: mapProduk[nama] > 10 ? 15 : 5 }))
            .sort((a, b) => b.terjual - a.terjual)
            .slice(0, 3);

        const totalBagiBayar = omset || 1;
        const listMetodeBayar = Object.keys(jenisBayar).map(key => ({
            metode: key,
            nilai: jenisBayar[key],
            persentase: Math.round((jenisBayar[key] / totalBagiBayar) * 100)
        }));

        return {
            omset,
            transaksi: dataTersaring.length,
            produkTerjual,
            pelanggan: pelangganUnik.size || dataTersaring.length,
            rataBelanja: dataTersaring.length > 0 ? Math.round(omset / dataTersaring.length) : 0,
            refundVoid: refundVoidCount,
            SusunanChart,
            produkUrut,
            listMetodeBayar
        };
    }, [salesHistory, rangeTanggal, selectedOutlet, chartMode]);

    const renderRupiah = (nilai) => {
        if (formatRupiah) return formatRupiah(nilai);
        return `Rp ${(nilai || 0).toLocaleString('id-ID')}`;
    };
    const listProduk = analisis_produk?.list_tabel || [];

    return (
        <div className="flex-1 bg-[#f7f8fa] p-5 overflow-y-auto">
            
            {/* ====== AREA FILTER UTAMA ====== */}
            <div className="bg-white p-4 border-b border-slate-100 flex-shrink-0 w-full">
                <div className="flex flex-row items-center justify-between gap-4 w-full">
                    
                    {/* Filter Kiri: Pilihan Makro */}
                    <div className="flex-1 max-w-[220px]">
                        <select 
                            value={periodeMakro}
                            onChange={(e) => setPeriodeMakro(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer w-full"
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

                    {/* Filter Kanan: Dropdown Pilihan Outlet */}
                    <div className="flex-1 max-w-[240px]">
                        <select 
                            value={selectedOutlet}
                            onChange={(e) => setSelectedOutlet(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer w-full"
                        >
                            <option value="all">Semua Outlet</option>
                            {Array.isArray(outlets) && outlets.map((out, idx) => (
                                <option key={idx} value={out.id || out.nama || out.outlet_name}>
                                    {out.nama || out.outlet_name || `Outlet ${idx + 1}`}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* ====== AREA KONTEN UTAMA DENGAN GRAFIK DINAMIS ========= */}
            <div className="flex-1  p-5 space-y-5">

                
                {/* 1. CARDS METRIK UTAMA */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                    <div className="bg-white border border-slate-200/60 rounded-lg p-4 shadow-sm">
                        <span className="text-xs text-slate-500">Omset</span>
                        <h2 className="text-xl font-black mt-1 text-gray-800">
                            {renderRupiah(dataProses.omset)}
                        </h2>
                    </div>

                    <div className="bg-white border border-slate-200/60 rounded-lg p-4 shadow-sm">
                        <span className="text-xs text-slate-500">Transaksi</span>
                        <h2 className="text-xl font-black mt-1 text-gray-800">
                            {dataProses.transaksi}
                        </h2>
                    </div>

                    <div className="bg-white border border-slate-200/60 rounded-lg p-4 shadow-sm">
                        <span className="text-xs text-slate-500">Produk Terjual</span>
                        <h2 className="text-xl font-black mt-1 text-gray-800">
                            {dataProses.produkTerjual}
                        </h2>
                    </div>

                    <div className="bg-white border border-slate-200/60 rounded-lg p-4 shadow-sm">
                        <span className="text-xs text-slate-500">Pelanggan</span>
                        <h2 className="text-xl font-black mt-1 text-gray-800">
                            {dataProses.pelanggan}
                        </h2>
                    </div>

                    <div className="bg-white border border-slate-200/60 rounded-lg p-4 shadow-sm">
                        <span className="text-xs text-slate-500">Rata Belanja</span>
                        <h2 className="text-xl font-black mt-1 text-gray-800">
                            {renderRupiah(dataProses.rataBelanja || 0 )}
                        </h2>
                    </div>

                    <div className="bg-white border border-slate-200/60 rounded-lg p-4 shadow-sm">
                        <span className="text-xs text-slate-500">Refund/Void</span>
                        <h2 className="text-xl font-black mt-1 text-rose-600">
                            {dataProses.refundVoid} Kasus
                        </h2>
                    </div>
                </div>

                {/* 2. CORE ANALYTICS BLOCK */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    
                    {/* CORE GRAFIK */}
                    <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-xl p-5 flex flex-col justify-between min-h-[270px] shadow-sm">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <div>
                                <h2 className="text-lg font-black text-slate-800">
                                    Grafik Performa ({chartMode === 'hari' ? 'Jam Kerja' : chartMode === 'minggu' ? 'Harian' : 'Mingguan'})
                                </h2>
                                <p className="text-sm text-slate-500">Gunakan filter disamping untuk merubah sumbu penyajian data</p>
                            </div>
                            
                            <div className="bg-slate-100 p-0.5 rounded-l flex text-xs font-bold">
                                {[["hari", "Hari"], ["minggu", "Minggu"], ["bulan", "Bulan"]].map(([key, label]) => (
                                    <button 
                                        key={key}
                                        type="button"
                                        onClick={() => setChartMode(key)}
                                        className={`px-2.5 py-1 rounded-md transition uppercase ${chartMode === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-x-auto pt-6 pb-1 scrollbar-thin">
                            <div className="flex items-end justify-between px-2 h-36 space-x-6 min-w-[580px]">
                                {dataProses.SusunanChart.map((item, idx) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                        <div className="absolute -top-6 bg-slate-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                                            {renderRupiah(item.nilai)}
                                        </div>
                                        <div 
                                            style={{ height: `${item.percentage || 4}%` }}
                                            className="w-full bg-slate-100 group-hover:bg-[#009664] rounded-t transition-colors duration-300"
                                        />
                                        <span className="text-xs text-slate-500 font-bold mt-2 whitespace-nowrap">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* METODE PEMBAYARAN */}
                    <div className="bg-white border border-slate-200/60 rounded-xl p-5 flex flex-col justify-between shadow-sm">
                        <div className="border-b border-slate-100 pb-2">
                            <h2 className="text-lg font-black text-slate-800">Metode Pembayaran</h2>
                            <p className="text-sm text-slate-500">Distribusi jalur penyelesaian transaksi</p>
                        </div>

                        <div className="space-y-3.5 my-auto py-2">
                            {dataProses.listMetodeBayar.map((p, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-slate-600 uppercase tracking-wide">{p.metode}</span>
                                        <span className="text-slate-500 ">{p.persentase}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            style={{ width: `${p.persentase}%` }} 
                                            className="bg-slate-700 h-full rounded-full transition-all duration-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. PRODUCT INSIGHTS */}
                <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm">
                    <div className="border-b border-slate-100 pb-3 mb-4">
                        <h2 className="text-lg font-black text-slate-800">Produk Terlaris</h2>
                        <p className="text-sm text-slate-500">Daftar item dengan volume penjualan tertinggi</p>
                    </div>

                    {listProduk.length === 0 ?  (
                        <p className="text-xs text-slate-500 py-2 text-center italic">Tidak ada data penjualan produk pada rentang ini.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(analisis_produk?.list_tabel || []).map((item, idx) => (
                                <div key={idx} className="border border-slate-100 rounded-xl p-3.5 flex items-center justify-between bg-slate-50/40">
                                    <div className="flex items-center space-x-2.5">
                                        <span className="text-xs font-bold text-slate-500">0{idx + 1}.</span>
                                        <div>
                                            <span className="font-bold text-slate-800 text-slate-800 block uppercase tracking-wide">{item.nama_produk}</span>
                                            <span className="text-xs text-slate-500 mt-0.5 block">Terjual: <strong className="text-slate-600 font-bold">{item.produkTerjual} Pcs</strong></span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs px-2 py-0.5 rounded-xl font-bold border ${
                                            (item.stok || 0) <= 7 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                                        }`}>
                                            Sisa Stok: {item.stok}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}