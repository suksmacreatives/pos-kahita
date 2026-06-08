import React, { useState, useMemo, useEffect } from 'react';

export default function KasKasir({ formatRupiah, initialCash = 0, kasHistory = [], onSaveTransaction }) {
    const [listKas, setListKas] = useState([]);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [formData, setFormData] = useState({
        jenis: 'Uang Keluar',
        kategoriDetail: 'Pengeluaran Umum',
        nama: '',
        jumlah: '',
        deskripsi: ''
    });

    useEffect(() => {
        const dataBackend = Array.isArray(kasHistory) ? kasHistory : [];
        let normalized = dataBackend.map((item, index) => ({
            id: item.id || `data-${index}`,
            nama: item.nama || 'Transaksi Kas',
            jenis: item.jenis || 'Uang Keluar',
            kategori: item.kategoriDetail || item.kategori || 'Pengeluaran Umum',
            jumlah: Number(item.jumlah || 0),
            payment_method: item.payment_method,
            deskripsi: item.deskripsi || ''
            
        }));

        const hasModalAwal = normalized.some(item => item.nama === 'Modal Awal');
        if (!hasModalAwal && initialCash > 0) {
            normalized.unshift({
                id: 'modal-awal-active',
                nama: 'Modal Awal',
                jenis: 'Uang Masuk',
                kategori: 'Pemasukan',
                jumlah: Number(initialCash),
                deskripsi: 'Saldo awal sesi kasir aktif'
            });
        }
        setListKas(normalized);
    }, [kasHistory, initialCash]);

    const ringkasan = useMemo(() => {

    let pemasukan = Number(initialCash || 0);

    let pengeluaran = 0;
    let totalRefund = 0;
    let totalPenjualan = 0;

    let totalKasKasir = Number(initialCash || 0);

    listKas.forEach(item => {

        const jumlah = Number(item.jumlah || 0);

        // Abaikan modal awal dummy
        if (item.nama === 'Modal Awal') {
            return;
        }

        // Penjualan
        if (item.kategori === 'Penjualan') {

            totalPenjualan += jumlah;

            if (
                item.payment_method &&
                item.payment_method.toLowerCase() === 'tunai'
            ) {
                totalKasKasir += jumlah;
            }

            return;
        }

        // Uang Masuk
        if (item.jenis === 'Uang Masuk') {
            totalKasKasir += jumlah;
        }

        // Uang Keluar
        if (item.jenis === 'Uang Keluar') {
            pengeluaran += jumlah;
            totalKasKasir -= jumlah;
        }

        // Refund
        if (item.kategori === 'Refund') {
            totalRefund += jumlah;
        }
    });

    return {
        pemasukan,
        pengeluaran,
        totalRefund,
        totalPenjualan,
        totalKasKasir
    };

}, [listKas, initialCash]);

    const renderRupiah = (nilai) => {
        if (formatRupiah) return formatRupiah(nilai);
        return `Rp ${(nilai || 0).toLocaleString('id-ID')}`;
    };

   const handleSimpanTransaksi = async (e) => {
    e.preventDefault();

    try {
        const response = await fetch(route('cash-transactions.store'), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content
            },
            body: JSON.stringify({
                jenis: formData.jenis,
                kategoriDetail: formData.kategoriDetail,
                nama: formData.nama,
                jumlah: parseFloat(formData.jumlah),
                deskripsi: formData.deskripsi
            })
        });

        const data = await response.json();

        if (response.ok) {
            window.location.reload();
            // Gunakan data dari respon backend jika perlu (misal: mengambil ID baru)
            const newItem = {
                id: data.id || Date.now(), // Ambil ID dari database
                nama: formData.nama,
                jenis: formData.jenis,
                kategori: formData.kategoriDetail,
                jumlah: Number(formData.jumlah),
                deskripsi: formData.deskripsi
            };

            // Update UI
            setListKas(prev => [newItem, ...prev]);
            setIsOpenModal(false);
            setFormData({
                jenis: 'Uang Keluar',
                kategoriDetail: 'Pengeluaran Umum',
                nama: '',
                jumlah: '',
                deskripsi: ''
            });
        } else {
            alert(data.message || 'Gagal menyimpan transaksi.');
        }
    } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan koneksi ke server.');
    }
};

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] p-5 gap-4">
            <div className="flex flex-row justify-start items-center w-full flex-shrink-0">
                <button onClick={() => setIsOpenModal(true)} className="bg-[#009664] hover:bg-[#007a51] text-white py-2 px-5 rounded-lg font-bold text-xs">+ Transaksi</button>
            </div>

            {/* Ringkasan */}
            <div className="grid grid-cols-5 gap-4 w-full flex-shrink-0">
                {[{title: 'Pemasukan', val: ringkasan.pemasukan, color: 'emerald'}, {title: 'Pengeluaran', val: ringkasan.pengeluaran, color: 'indigo'}, {title: 'Total Refund', val: ringkasan.totalRefund, color: 'rose'}, {title: 'Total Kas Kasir', val: ringkasan.totalKasKasir, color: 'sky'}, {title: 'Total Penjualan', val: ringkasan.totalPenjualan, color: 'amber'}].map((item, i) => (
                    <div key={i} className={`bg-white p-3.5 rounded-xl border border-slate-200 border-b-[3px] border-b-${item.color}-500`}>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase">{item.title}</p>
                        <p className="text-base font-bold text-slate-800 mt-1">{renderRupiah(item.val)}</p>
                    </div>
                ))}
            </div>

            {/* Tabel */}
            <div className="flex-1 overflow-hidden bg-white border border-slate-200/80 rounded-xl shadow-2xs">
                <div className="overflow-y-auto h-full">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 sticky top-0">
                            <tr className="text-[11px] font-semibold text-slate-400 uppercase">
                                <th className="py-3 px-5">Nama</th>
                                <th className="py-3 px-5">Jenis</th>
                                <th className="py-3 px-5">Kategori</th>
                                <th className="py-3 px-5 text-right">Jumlah</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs divide-y divide-slate-100 text-slate-700">
                            {listKas
                                .filter(kas => kas.kategori !== 'Penjualan') // Sembunyikan Penjualan dari tabel
                                .map((kas) => (
                                    <tr key={kas.id} className="hover:bg-slate-50/40">
                                        <td className="py-3.5 px-5 font-semibold text-slate-800">
                                            {kas.nama}
                                            {kas.deskripsi && <div className="text-[10px] font-normal text-slate-400 italic">Ket: {kas.deskripsi}</div>}
                                        </td>
                                        <td className="py-3.5 px-5 text-slate-500">{kas.jenis}</td>
                                        <td className="py-3.5 px-5">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${kas.kategori === 'Pemasukan' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                                {kas.kategori}
                                            </span>
                                        </td>
                                        <td className={`py-3.5 px-5 text-right font-bold ${kas.jenis === 'Uang Masuk' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                            {kas.jenis === 'Uang Keluar' ? `- ${renderRupiah(kas.jumlah)}` : `+ ${renderRupiah(kas.jumlah)}`}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

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
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tipe Transaksi</label>
                                    <select 
                                        value={formData.jenis}
                                        onChange={(e) => {
                                            const jenisBaru = e.target.value;
                                            setFormData(prev => ({ 
                                                ...prev, 
                                                jenis: jenisBaru,
                                                kategoriDetail: jenisBaru === 'Uang Masuk' ? 'Pemasukan Umum' : 'Pengeluaran Umum'
                                            }));
                                        }}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#009664]"
                                    >
                                        <option value="Uang Keluar">Pengeluaran (Uang Keluar)</option>
                                        <option value="Uang Masuk">Pemasukan (Uang Masuk)</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kategori Spesifik</label>
                                    <select 
                                        value={formData.kategoriDetail}
                                        onChange={(e) => setFormData(prev => ({ ...prev, kategoriDetail: e.target.value }))}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#009664]"
                                    >
                                        {formData.jenis === 'Uang Keluar' ? (
                                            <>
                                                <option value="Pengeluaran Umum">Pengeluaran Umum</option>
                                                <option value="Refund">Refund Saja</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="Pemasukan Umum">Pemasukan Umum</option>
                                                <option value="Penjualan">Hasil Penjualan</option>
                                            </>
                                        )}
                                    </select>
                                </div>
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