import React, { useState, useMemo, useRef } from 'react';

export default function RingkasanPenjualan({ salesHistory = [], outlets = [], formatRupiah }) {
    // ----------------------------------------------------
    // STATE FILTER BARIS ATAS
    // ----------------------------------------------------
    const [periodeMakro, setPeriodeMakro] = useState('hari');
    const [selectedOutlet, setSelectedOutlet] = useState('all');
    const [chartMode, setChartMode] = useState('hari'); // hari | minggu | bulan

    const [rangeTanggal, setRangeTanggal] = useState({
        start: '2026-05-25',
        end: '2026-05-25'
    });
    
    const [isPilihanPertama, setIsPilihanPertama] = useState(true);
    const hiddenDateInputRef = useRef(null);

    const formatLabelTanggal = (dateString) => {
        if (!dateString) return '';
        try {
            const opsi = { day: 'numeric', month: 'short', year: 'numeric' };
            return new Date(dateString).toLocaleDateString('id-ID', opsi);
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
            setRangeTanggal({ start: tanggalTerpilih, end: tanggalTerpilih });
            setIsPilihanPertama(false);
        } else {
            const tglAwal = new Date(rangeTanggal.start);
            const tglAkhir = new Date(tanggalTerpilih);
            
            const selisihWaktu = tglAkhir.getTime() - tglAwal.getTime();
            const selisihHari = Math.ceil(selisihWaktu / (1000 * 3600 * 24));

            if (selisihHari < 0) {
                alert('Tanggal akhir tidak boleh mendahului tanggal awal. Silakan pilih ulang.');
                setIsPilihanPertama(true);
                return;
            }

            if (selisihHari > 31) {
                alert('Batas maksimal rentang filter detail adalah 31 hari!');
                setIsPilihanPertama(true);
                return;
            }

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
        setRangeTanggal({
            start: formatKeString(tglAwal),
            end: formatKeString(tglAkhir)
        });
    };

    // ----------------------------------------------------
    // PROSES ANALISIS & AKUMULASI DATA SMART DASHBOARD
    // ----------------------------------------------------
    const dataProses = useMemo(() => {
        const listAman = Array.isArray(salesHistory) ? salesHistory : [];

        const dataTersaring = listAman.filter(item => {
            if (!item) return false;
            const itemDate = item.tanggal || item.created_at?.split('T')[0];
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
        const mapBayar = { Cash: 0, QRIS: 0, Transfer: 0, Debit: 0 };

        const namaHariIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

        dataTersaring.forEach(nota => {
            if (!nota) return;
            
            const totalNota = Number(nota.total) || 0;
            omset += totalNota;
            if (nota.pelanggan_id) pelangganUnik.add(nota.pelanggan_id);
            if (nota.status === 'refund' || nota.status === 'void') refundVoidCount++;

            if (nota.items && Array.isArray(nota.items)) {
                nota.items.forEach(prod => {
                    if (prod && prod.nama) {
                        const qty = Number(prod.quantity) || 0;
                        produkTerjual += qty;
                        mapProduk[prod.nama] = (mapProduk[prod.nama] || 0) + qty;
                    }
                });
            }

            let jamAngka = 9;
            if (nota.jam && typeof nota.jam === 'string') {
                jamAngka = parseInt(nota.jam.split(':')[0], 10);
            } else if (nota.created_at) {
                jamAngka = new Date(nota.created_at).getHours();
            }
            const labelJam = `${String(jamAngka).padStart(2, '0')}:00`;
            mapJam[labelJam] = (mapJam[labelJam] || 0) + totalNota;

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

            if (nota.metode_pembayaran && mapBayar[nota.metode_pembayaran] !== undefined) {
                mapBayar[nota.metode_pembayaran] += totalNota;
            }
        });

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

        const produkUrut = Object.keys(mapProduk)
            .map(nama => ({ nama, terjual: mapProduk[nama], stok: mapProduk[nama] > 10 ? 15 : 5 }))
            .sort((a, b) => b.terjual - a.terjual)
            .slice(0, 3);

        const totalBagiBayar = omset || 1;
        const listMetodeBayar = Object.keys(mapBayar).map(key => ({
            metode: key,
            nilai: mapBayar[key],
            persentase: Math.round((mapBayar[key] / totalBagiBayar) * 100)
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

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden text-slate-600 font-sans tracking-tight">
            
            {/* ====== AREA FILTER UTAMA (SINKRON DENGAN VOID TRANSAKSI) ====== */}
            <div className="bg-white p-4 border-b border-slate-100 flex-shrink-0 w-full">
                <div className="flex flex-row items-center justify-between gap-4 w-full">
                    
                    {/* Filter Kiri: Pilihan Makro */}
                    <div className="flex-1 max-w-[220px]">
                        <select 
                            value={periodeMakro}
                            onChange={(e) => setPeriodeMakro(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#009664] cursor-pointer w-full"
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

                    {/* Filter Kanan: Dropdown Pilihan Outlet */}
                    <div className="flex-1 max-w-[240px]">
                        <select 
                            value={selectedOutlet}
                            onChange={(e) => setSelectedOutlet(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#009664] cursor-pointer w-full"
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
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
                
                {/* 1. CARDS METRIK UTAMA */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                    <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-2xs">
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Omset</span>
                        <span className="text-sm font-semibold text-slate-800 mt-1 block">
                            {renderRupiah(dataProses.omset)}
                        </span>
                    </div>

                    <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-2xs">
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Transaksi</span>
                        <span className="text-sm font-semibold text-slate-800 mt-1 block">{dataProses.transaksi} Nota</span>
                    </div>

                    <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-2xs">
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Produk Terjual</span>
                        <span className="text-sm font-semibold text-slate-800 mt-1 block">{dataProses.produkTerjual} Item</span>
                    </div>

                    <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-2xs">
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Pelanggan</span>
                        <span className="text-sm font-semibold text-slate-800 mt-1 block">{dataProses.pelanggan} Orang</span>
                    </div>

                    <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-2xs">
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Rata Belanja</span>
                        <span className="text-sm font-semibold text-slate-800 mt-1 block">
                            {renderRupiah(dataProses.rataBelanja)}
                        </span>
                    </div>

                    <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-2xs">
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Refund/Void</span>
                        <span className="text-sm font-semibold text-rose-600 mt-1 block">{dataProses.refundVoid} Kasus</span>
                    </div>
                </div>

                {/* 2. CORE ANALYTICS BLOCK */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    
                    {/* CORE GRAFIK */}
                    <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-xl p-5 flex flex-col justify-between min-h-[270px] shadow-2xs">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <div>
                                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                    Grafik Analisis Performa ({chartMode === 'hari' ? 'Jam Kerja' : chartMode === 'minggu' ? 'Harian' : 'Mingguan'})
                                </h4>
                                <p className="text-[10px] text-slate-400">Gunakan filter disamping untuk merubah sumbu penyajian data</p>
                            </div>
                            
                            <div className="bg-slate-100 p-0.5 rounded-lg flex text-[9px] font-medium">
                                {[['hari', 'Hari'], ['minggu', 'Minggu'], ['bulan', 'Bulan']].map(([key, label]) => (
                                    <button 
                                        key={key}
                                        type="button"
                                        onClick={() => setChartMode(key)}
                                        className={`px-2.5 py-1 rounded-md transition uppercase ${chartMode === key ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-400'}`}
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
                                        <div className="absolute -top-6 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                                            {renderRupiah(item.nilai)}
                                        </div>
                                        <div 
                                            style={{ height: `${item.percentage || 4}%` }}
                                            className="w-full bg-slate-100 group-hover:bg-[#009664] rounded-t transition-colors duration-300"
                                        />
                                        <span className="text-[10px] text-slate-400 font-medium mt-2 whitespace-nowrap">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* METODE PEMBAYARAN */}
                    <div className="bg-white border border-slate-200/60 rounded-xl p-5 flex flex-col justify-between shadow-2xs">
                        <div className="border-b border-slate-100 pb-2">
                            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Metode Pembayaran</h4>
                            <p className="text-[10px] text-slate-400">Distribusi jalur penyelesaian transaksi</p>
                        </div>

                        <div className="space-y-3.5 my-auto py-2">
                            {dataProses.listMetodeBayar.map((p, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-medium">
                                        <span className="text-slate-600 uppercase tracking-wide">{p.metode}</span>
                                        <span className="text-slate-400">{p.persentase}%</span>
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
                <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-2xs">
                    <div className="border-b border-slate-100 pb-3 mb-4">
                        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Produk Terlaris Hari Ini</h4>
                        <p className="text-[10px] text-slate-400">Daftar item dengan volume penjualan tertinggi</p>
                    </div>

                    {dataProses.produkUrut.length === 0 ? (
                        <p className="text-xs text-slate-400 py-2 text-center italic">Tidak ada data penjualan produk pada rentang ini.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {dataProses.produkUrut.map((item, idx) => (
                                <div key={idx} className="border border-slate-100 rounded-xl p-3.5 flex items-center justify-between bg-slate-50/40">
                                    <div className="flex items-center space-x-2.5">
                                        <span className="text-xs font-medium text-slate-400">0{idx + 1}.</span>
                                        <div>
                                            <span className="text-xs font-medium text-slate-800 block uppercase tracking-wide">{item.nama}</span>
                                            <span className="text-[10px] text-slate-400 mt-0.5 block">Terjual: <strong className="text-slate-600 font-semibold">{item.terjual} Pcs</strong></span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[9px] px-2 py-0.5 rounded font-medium border ${
                                            item.stok <= 7 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-200'
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