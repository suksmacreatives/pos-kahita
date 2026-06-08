import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';

export default function Absensi({ kasirName, attendances }) {
    const namaKasirAktif = kasirName || 'Agus Arismawan';
    const { auth } = usePage().props;
    console.log(auth);
    const [dataAbsensi, setDataAbsensi] = useState(attendances || []);
    const [selectedKasir, setSelectedKasir] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    // STATE UNTUK CUSTOM MODAL & NOTIFIKASI
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: 'confirm', // 'confirm' atau 'alert'
        title: '',
        message: '',
        onConfirm: null
    });

    useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
}, []);

    useEffect(() => {
    setDataAbsensi(attendances || []);
}, [attendances]);

const dataTabel = dataAbsensi.map(item => ({
    id: item.id,
    nama: item.user?.name || '-',
    role: item.user?.role || '-',
    jamMasuk: item.clock_in,
    jamPulang: item.clock_out,
    status: item.status
}));

    const formatTimeReal = (date) => {
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(/\./g, ':');
    };

    // Fungsi pembantu untuk memicu Custom Alert
    const showAlert = (title, message) => {
        setModalConfig({
            isOpen: true,
            type: 'alert',
            title,
            message,
            onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
        });
    };

    // Handler Konfirmasi Hadir
    const handleAbsenMasuk = (e) => {
    e.preventDefault();

    // Pastikan data ini ada dan tidak kosong
    const dataAbsensi = {
        user_id: auth.user.id, // Ambil dari props auth yang tersedia di response
        outlet_id: auth.user.outlet_id,
        date: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
        clock_in: new Date().toLocaleTimeString('en-GB'), // Format HH:MM:SS
        status: 'Aktif Bekerja'
    };

    router.post('/absensi', dataAbsensi, {
        onSuccess: () => {
            showAlert('Berhasil', 'Absen masuk berhasil dicatat!');
        },
        onError: (errors) => {
            console.error("Error dari server:", errors);
            // Ini akan menampilkan pesan spesifik apa yang kurang
            showAlert('Gagal', errors.user_id || errors.date || 'Terjadi kesalahan');
        }
    });
};

    // Handler Tombol Pulang menggunakan Custom Modal
    const handleAbsenPulang = (id, nama) => {
    setModalConfig({
        isOpen: true,
        type: 'confirm',
        title: 'Konfirmasi Pulang',
        message: `Apakah Anda yakin kasir "${nama}" ingin absen pulang?`,
        onConfirm: () => {

            router.post(`/absensi/pulang/${id}`, {}, {
                onSuccess: () => {

                    setDataAbsensi(prev =>
                        prev.map(item =>
                            item.id === id
                                ? {
                                    ...item,
                                    clock_out: formatTimeReal(new Date()),
                                    status: 'Sudah Pulang'
                                }
                                : item
                        )
                    );

                    setModalConfig(prev => ({
                        ...prev,
                        isOpen: false
                    }));

                    showAlert(
                        'Selesai Shift',
                        `Kasir ${nama} telah berhasil absen pulang.`
                    );
                }
            });

        }
    });
};

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden relative">
            
            {/* ====== HEADER BANNER ====== */}
            <div className="bg-white px-6 py-4 border-b border-slate-100 flex-shrink-0 flex justify-between items-center">
                <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">Sistem Absensi Kasir</h2>
                    <p className="text-[11px] text-slate-400 font-semibold">Data terintegrasi langsung dengan master User Akun POS</p>
                </div>
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-1.5 text-right flex items-center space-x-3">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono">JAM SYSTEM</span>
                    <span className="text-sm font-black text-slate-700 font-mono tracking-tight">{formatTimeReal(currentTime)}</span>
                </div>
            </div>

            {/* ====== MAIN GRID CONTENT ====== */}
            <div className="flex-1 overflow-hidden p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
                
                {/* PANEL KIRI: FORM PILIH USER */}
                <div className="lg:col-span-1 flex flex-col space-y-4">
                    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm relative overflow-hidden flex-shrink-0">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-[#009664]" />
                        
                        <div className="flex items-center space-x-2 mb-4">
                            <span className="text-base">👤</span>
                            <h3 className="font-black text-xs text-slate-700 uppercase tracking-wider">Pilih Personel Kasir</h3>
                        </div>

                        <form onSubmit={handleAbsenMasuk} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Nama Kasir Aktif</label>
                                <div className="relative">
                                    <select 
                                        value={selectedKasir}
                                        onChange={(e) => setSelectedKasir(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#009664] transition appearance-none"
                                    >
                                        <option value="">-- Pilih Akun Kasir --</option>
                                        <option value={namaKasirAktif}>{namaKasirAktif} (Aktif)</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                        <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                className="w-full bg-[#009664] text-white py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-sm shadow-emerald-600/10 hover:bg-emerald-700 active:scale-[0.99] transition flex items-center justify-center space-x-2"
                            >
                                <span>🛫</span>
                                <span>Klik Absen Datang</span>
                            </button>
                        </form>
                    </div>

                    {/* COUNTER STATUS WIDGET */}
                    <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm grid grid-cols-2 gap-3 text-center flex-1 min-h-[110px] items-center">
                        <div className="border-r border-slate-100">
                            <span className="text-xl block mb-1">🟢</span>
                            <span className="text-2xl font-black text-slate-800 font-mono">
                                {dataAbsensi.filter(i => i.status === 'Aktif Bekerja').length}
                            </span>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Staf Standby</p>
                        </div>
                        <div>
                            <span className="text-xl block mb-1">🏁</span>
                            <span className="text-2xl font-black text-slate-800 font-mono">
                                {dataAbsensi.filter(i => i.status === 'Sudah Pulang').length}
                            </span>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Selesai Shift</p>
                        </div>
                    </div>
                </div>

                {/* PANEL KANAN: MONITOR PERGERAKAN TABEL */}
                <div className="lg:col-span-2 flex flex-col bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-black text-xs text-slate-700 uppercase tracking-wider flex items-center">
                            <span className="mr-2">📈</span> Pergerakan Aktivitas Kerja Hari Ini
                        </h3>
                        <span className="text-[10px] bg-[#009664]/10 text-[#009664] px-2.5 py-0.5 rounded-md font-bold">
                            Logs: {dataAbsensi.length}
                        </span>
                    </div>

                    <div className="flex-1 overflow-auto">
                        {dataAbsensi.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                                <span className="text-3xl mb-2">📥</span>
                                <p className="text-xs font-bold uppercase tracking-wide">Belum Ada Kasir Yang Datang</p>
                                <p className="text-[11px] opacity-75 mt-0.5">Log pergerakan waktu masuk akan muncul di sini setelah klik tombol hadir.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-100 sticky top-0 z-10">
                                        <th className="py-2.5 px-4">Nama Kasir</th>
                                        <th className="py-2.5 px-3">Jam Masuk</th>
                                        <th className="py-2.5 px-3">Jam Pulang</th>
                                        <th className="py-2.5 px-3">Status</th>
                                        <th className="py-2.5 px-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                    {dataTabel.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50/60 transition">
                                            <td className="py-3 px-4">
                                                <div className="font-bold text-slate-800 uppercase tracking-wide">{row.nama}</div>
                                                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{row.role}</div>
                                            </td>
                                            <td className="py-3 px-3 font-mono font-bold text-slate-600">
                                                <span className="text-emerald-500 mr-1">⚡</span> {row.jamMasuk}
                                            </td>
                                            <td className="py-3 px-3 font-mono font-bold">
                                                {row.jamPulang ? (
                                                    <span className="text-slate-600"><span className="text-orange-500 mr-1">⌛</span> {row.jamPulang}</span>
                                                ) : (
                                                    <span className="text-slate-300">-- : -- : --</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                                    row.status === 'Aktif Bekerja' 
                                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                }`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {row.status === 'Aktif Bekerja' ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAbsenPulang(row.id, row.nama)}
                                                        className="bg-white border border-orange-200 text-orange-600 px-3 py-1 rounded-xl font-bold text-[10px] hover:bg-orange-50 active:scale-95 shadow-sm transition"
                                                    >
                                                        🛬 Pulang
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 font-semibold italic">Shift Berakhir</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* ======================================================== */}
            {/* ====== COMPONENT CUSTOM MODAL (DI ATAS BACKDROP LAYER) ====== */}
            {/* ======================================================== */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in">
                    {/* Backdrop Blur Gelap */}
                    <div 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => modalConfig.type === 'alert' && setModalConfig(prev => ({ ...prev, isOpen: false }))}
                    />
                    
                    {/* Kotak Konten Modal */}
                    <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 relative z-10 text-center transform scale-100 transition-transform">
                        {/* Ikon Header Modal */}
                        <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-lg font-bold ${
                            modalConfig.title === 'Gagal Absen' || modalConfig.title === 'Perhatian'
                                ? 'bg-amber-50 text-amber-600'
                                : modalConfig.title === 'Konfirmasi Pulang'
                                ? 'bg-orange-50 text-orange-600'
                                : 'bg-emerald-50 text-emerald-600'
                        }`}>
                            {modalConfig.title === 'Konfirmasi Pulang' ? '❓' : modalConfig.title === 'Berhasil' ? '✅' : '⚠️'}
                        </div>

                        {/* Judul & Isi Pesan */}
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">{modalConfig.title}</h4>
                        <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed px-2">{modalConfig.message}</p>

                        {/* Group Tombol Aksi */}
                        <div className="flex items-center justify-center space-x-2 mt-5">
                            {modalConfig.type === 'confirm' ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                                        className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-xs py-2 px-4 rounded-xl transition uppercase tracking-wider"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={modalConfig.onConfirm}
                                        className="flex-1 bg-[#009664] text-white hover:bg-emerald-700 font-bold text-xs py-2 px-4 rounded-xl transition uppercase tracking-wider shadow-sm shadow-emerald-600/10"
                                    >
                                        Ya, Pulang
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={modalConfig.onConfirm}
                                    className="w-full bg-slate-800 text-white hover:bg-slate-900 font-bold text-xs py-2.5 rounded-xl transition uppercase tracking-wider"
                                >
                                    Mengerti
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}