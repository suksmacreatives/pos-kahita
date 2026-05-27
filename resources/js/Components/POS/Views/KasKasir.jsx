import React, { useState, useMemo } from 'react';

export default function KasKasir({ formatRupiah }) {
    // ----------------------------------------------------
    // STATE UTAMA & DATA MUTASI KAS REAL-TIME
    // ----------------------------------------------------
    const [listKas, setListKas] = useState([
        {
            id: 1,
            nama: 'Modal Awal',
            jenis: 'Uang Masuk',
            kategori: 'Pemasukan',
            jumlah: 500000,
            deskripsi: 'Saldo awal pembukaan kasir toko'
        }
    ]);

    // State Kontrol Tampilan Pop-up Modal
    const [isOpenModal, setIsOpenModal] = useState(false);
    
    // State Penyimpanan Input Form Transaksi Baru
    const [formData, setFormData] = useState({
        jenis: 'Uang Keluar', // Default langsung ke Pengeluaran sesuai permintaan
        nama: '',
        jumlah: '',
        deskripsi: ''
    });

    // ----------------------------------------------------
    // OTOMATISASI KALKULASI RINGKASAN KEUANGAN
    // ----------------------------------------------------
    const ringkasan = useMemo(() => {
        let totalPemasukan = 0;
        let totalPengeluaran = 0;
        let totalRefund = 0;  
        let totalPenjualan = 0; 

        listKas.forEach(item => {
            if (item.jenis === 'Uang Masuk') {
                totalPemasukan += item.jumlah;
            } else if (item.jenis === 'Uang Keluar') {
                totalPengeluaran += item.jumlah;
            }
        });

        // Rumus otomatis memperbarui sisa Kas di dalam Kasir
        const totalKasKasir = totalPemasukan - totalPengeluaran;

        return { 
            pemasukan: totalPemasukan, 
            pengeluaran: totalPengeluaran, 
            totalRefund, 
            totalKasKasir, 
            totalPenjualan 
        };
    }, [listKas]);

    // ----------------------------------------------------
    // ACTION HANDLER
    // ----------------------------------------------------
    const renderRupiah = (nilai) => {
        if (formatRupiah) return formatRupiah(nilai);
        return `Rp ${(nilai || 0).toLocaleString('id-ID')}`;
    };

    const handleSimpanTransaksi = (e) => {
        e.preventDefault();
        
        if (!formData.nama.trim() || !formData.jumlah) {
            alert('Mohon lengkapi Nama Transaksi dan Jumlah Uang!');
            return;
        }

        const nominalAngka = parseFloat(formData.jumlah);
        if (isNaN(nominalAngka) || nominalAngka <= 0) {
            alert('Masukkan nominal uang yang valid!');
            return;
        }

        // Membuat objek data transaksi riil baru
        const transaksiBaru = {
            id: Date.now(),
            nama: formData.nama,
            jenis: formData.jenis,
            kategori: formData.jenis === 'Uang Masuk' ? 'Pemasukan' : 'Pengeluaran',
            jumlah: nominalAngka,
            deskripsi: formData.deskripsi
        };

        // Memasukkan data ke tumpukan paling atas tabel
        setListKas(prev => [transaksiBaru, ...prev]);
        
        // Reset isi formulir kembali bersih
        setFormData({ jenis: 'Uang Keluar', nama: '', jumlah: '', deskripsi: '' });
        
        // Menutup Pop-up
        setIsOpenModal(false);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden text-slate-600 font-sans tracking-tight p-5 gap-4 relative">
            
            {/* ======================================================== */}
            {/* BARIS 1: POJOK KIRI ATAS HANYA BUTTON + TRANSAKSI        */}
            {/* ======================================================== */}
            <div className="flex flex-row justify-start items-center w-full flex-shrink-0">
                <button
                    onClick={() => setIsOpenModal(true)}
                    className="bg-[#009664] hover:bg-[#007a51] text-white py-2 px-5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition duration-150 cursor-pointer shadow-sm"
                >
                    <span className="text-sm font-black leading-none">+</span> Transaksi
                </button>
            </div>

            {/* ======================================================== */}
            {/* BARIS 2: KARTU RINGKASAN BERJEJER HORIZONTAL (KE SAMPING)*/}
            {/* ======================================================== */}
            <div className="grid grid-cols-5 gap-4 w-full flex-shrink-0">
                
                {/* Pemasukan */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs border-b-[3px] border-b-emerald-500">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pemasukan</p>
                    <p className="text-base font-bold text-slate-800 mt-1">{renderRupiah(ringkasan.pemasukan)}</p>
                </div>

                {/* Pengeluaran */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs border-b-[3px] border-b-indigo-600">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pengeluaran</p>
                    <p className="text-base font-bold text-slate-800 mt-1">{renderRupiah(ringkasan.pengeluaran)}</p>
                </div>

                {/* Total Refund */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs border-b-[3px] border-b-rose-500">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Refund</p>
                    <p className="text-base font-bold text-slate-800 mt-1">{renderRupiah(ringkasan.totalRefund)}</p>
                </div>

                {/* Total Kas Kasir */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs border-b-[3px] border-b-sky-500">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Kas Kasir</p>
                    <p className="text-base font-bold text-slate-800 mt-1">{renderRupiah(ringkasan.totalKasKasir)}</p>
                </div>

                {/* Total Penjualan */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs border-b-[3px] border-b-amber-500">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Penjualan</p>
                    <p className="text-base font-bold text-slate-800 mt-1">{renderRupiah(ringkasan.totalPenjualan)}</p>
                </div>

            </div>

            {/* ======================================================== */}
            {/* BARIS 3: TABEL DATA UTAMA LIST MUTASI KAS                */}
            {/* ======================================================== */}
            <div className="flex-1 overflow-hidden flex flex-col w-full mt-1">
                <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs flex flex-col h-full w-full">
                    <div className="overflow-y-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10">
                                    <th className="py-3 px-5">Nama</th>
                                    <th className="py-3 px-5">Jenis Transaksi</th>
                                    <th className="py-3 px-5">Kategori</th>
                                    <th className="py-3 px-5 text-right">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs divide-y divide-slate-100 font-medium text-slate-700">
                                {listKas.map((kas) => (
                                    <tr key={kas.id} className="hover:bg-slate-50/40 transition-colors">
                                        <td className="py-3.5 px-5 font-semibold text-slate-800">
                                            <div>{kas.nama}</div>
                                            {kas.deskripsi && (
                                                <div className="text-[10px] font-normal text-slate-400 mt-0.5 font-sans italic">
                                                    Ket: {kas.deskripsi}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-5 text-slate-500">{kas.jenis}</td>
                                        <td className="py-3.5 px-5">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                                                kas.kategori === 'Pemasukan' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
                                            }`}>
                                                {kas.kategori}
                                            </span>
                                        </td>
                                        <td className={`py-3.5 px-5 text-right font-bold text-sm ${
                                            kas.jenis === 'Uang Masuk' ? 'text-emerald-600' : 'text-slate-800'
                                        }`}>
                                            {kas.jenis === 'Uang Keluar' ? '- ' : ''}{renderRupiah(kas.jumlah)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ======================================================== */}
            {/* POP-UP MODAL: FORM TRANSAKSI MASUK & KELUAR              */}
            {/* ======================================================== */}
            {isOpenModal && (
                <div className="fixed inset-0 w-full h-full flex items-center justify-center z-[999]">
                    {/* Backdrop Transparan Gelap */}
                    <div 
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" 
                        onClick={() => setIsOpenModal(false)} 
                    />
                    
                    {/* Kotak Konten Form */}
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 mx-4">
                        <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Input Transaksi Kasir</h3>
                            <button 
                                type="button"
                                onClick={() => setIsOpenModal(false)} 
                                className="text-slate-400 hover:text-slate-600 font-bold text-sm p-1 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSimpanTransaksi} className="p-5 space-y-4">
                            {/* Pilihan Jenis */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tipe Transaksi</label>
                                <select 
                                    value={formData.jenis}
                                    onChange={(e) => setFormData(prev => ({ ...prev, jenis: e.target.value }))}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#009664]"
                                >
                                    <option value="Uang Keluar">Pengeluaran (Uang Keluar)</option>
                                    <option value="Uang Masuk">Pemasukan (Uang Masuk)</option>
                                </select>
                            </div>

                            {/* Nama Transaksi */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nama Transaksi / Keperluan</label>
                                <input 
                                    type="text"
                                    placeholder="Contoh: Bayar Listrik / Biaya Sampah"
                                    value={formData.nama}
                                    onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#009664]"
                                    required
                                />
                            </div>

                            {/* Nominal Uang */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Jumlah Uang (Nominal)</label>
                                <input 
                                    type="number"
                                    placeholder="Masukkan nilai uang"
                                    value={formData.jumlah}
                                    onChange={(e) => setFormData(prev => ({ ...prev, jumlah: e.target.value }))}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#009664] font-mono"
                                    required
                                />
                            </div>

                            {/* Deskripsi / Alasan */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Deskripsi / Alasan Singkat</label>
                                <textarea 
                                    rows="2"
                                    placeholder="Alasan detail..."
                                    value={formData.deskripsi}
                                    onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#009664] resize-none"
                                />
                            </div>

                            {/* Tombol Aksi */}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setIsOpenModal(false)}
                                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg text-xs font-semibold cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-[#009664] hover:bg-[#007a51] text-white rounded-lg text-xs font-semibold shadow-2xs cursor-pointer"
                                >
                                    Simpan Transaksi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}