import React, { useState, useEffect } from 'react';

export default function PengaturanNotaView({ formatRupiah }) {
    // 1. STATE MASTER UNTUK TEMPLATE NOTA
    const [notaConfig, setNotaConfig] = useState({
    namaToko: 'KAHITA BUSANA',
    alamatToko: 'JL. BYPASS DHARMA GIRI',
    telpToko: '082189833575',

    logo: '',
    showLogo: true,

    showNamaToko: true,
    showAlamat: true,
    showTelp: true,
    showNoStruk: true,
    showWaktu: true,
    showHeaderTerimakasih: true,
    showFooterNote: true,

    teksTerimakasih: 'Terima Kasih',
    teksFooterNote: 'Mohon diperiksa kembali pembelian anda.',
});

    // Load data jika sebelumnya sudah pernah disimpan di localStorage
    useEffect(() => {
        const savedConfig = localStorage.getItem('master_nota_config');
        if (savedConfig) {
            setNotaConfig(JSON.parse(savedConfig));
        }
    }, []);

    // 2. STATE WAKTU REAL-TIME SAAT PRINT
    const [waktuCetak, setWaktuCetak] = useState('');

    const dapatkanWaktuSekarang = () => {
        const sekarang = new Date();
        const tgl = String(sekarang.getDate()).padStart(2, '0');
        const bln = String(sekarang.getMonth() + 1).padStart(2, '0');
        const thn = sekarang.getFullYear();
        const jam = String(sekarang.getHours()).padStart(2, '0');
        const menit = String(sekarang.getMinutes()).padStart(2, '0');
        return `${tgl}-${bln}-${thn} ${jam}:${menit}`;
    };

    // Set waktu awal live preview
    useEffect(() => {
        setWaktuCetak(dapatkanWaktuSekarang());
    }, []);

    // 3. MOCK DATA UNTUK LIVE PREVIEW
    const mockItems = [
        { name: 'SKY BAKI SEGI DALAM 05', qty: 1, price: 6000, total: 6000 },
        { name: 'BSH KURSI BAKSO 3R3 ANYAM', qty: 4, price: 20000, total: 80000 }
    ];

    // 4. HANDLER SIMPAN & PRINT (DIPERBAIKI)
    const handleSimpanDanCetak = () => {
    localStorage.setItem(
        'master_nota_config',
        JSON.stringify(notaConfig)
    );

    alert('Template nota berhasil disimpan');
};
const handleUploadLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const size = Math.min(img.width, img.height);
            const sx = (img.width - size) / 2;
            const sy = (img.height - size) / 2;
            const canvas = document.createElement("canvas");
            canvas.width = 300;
            canvas.height = 300;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(
                img,
                sx,
                sy,
                size,
                size,
                0,
                0,
                300,
                300
            );
            const cropped = canvas.toDataURL("image/png");
            setNotaConfig(prev => ({
                ...prev,
                logo: cropped
            }));
        };
        img.src = event.target.result;
    };
  reader.readAsDataURL(file);
};

    return (
        // Ditambahkan class 'print:p-0 print:bg-white' agar kertas thermal bersih dari padding luar saat dicetak
        <div className="flex-1 flex h-full bg-[#f4f6f9] p-5 overflow-hidden text-xs font-semibold text-gray-600 print:p-0 print:bg-white">
            
            {/* Gaya CSS Khusus untuk print layout (Menghilangkan Header/Footer bawaan browser browser) */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { 
                        size: auto; 
                        margin: 0mm; 
                    }
                    body { 
                        background-color: #ffffff; 
                    }
                }
            `}} />

            {/* PANEL KIRI: FORM EDIT (Disembunyikan total saat cetak menggunakan 'print:hidden') */}
            <div className="flex-1 bg-white border border-gray-200 rounded-l flex overflow-hidden shadow-sm print:hidden">
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                    {/* SEKSI 1: EDIT DATA IDENTITAS TOKO */}
                    <div className="space-y-3 bg-gray-50/40 p-4 rounded-l border border-gray-100">
                        <h4 className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Identitas Atas Nota</h4>
                        <div className="space-y-3 bg-gray-50/60 p-4 rounded-xl border border-gray-200">
                            <label className="block text-[11px] font-semibold text-gray-700">
                                Logo Toko
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
                                    {notaConfig.logo ? (
                                        <img
                                            src={notaConfig.logo}
                                            alt="Logo"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <div className="text-2xl">🖼️</div>
                                            <div className="text-[10px] mt-1">
                                                Belum ada logo
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer transition text-xs font-semibold">
                                        📁 Pilih Logo
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg,image/webp"
                                            onChange={handleUploadLogo}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500">Nama Toko</label>
                            <input type="text" value={notaConfig.namaToko} onChange={(e) => setNotaConfig({...notaConfig, namaToko: e.target.value})} className="w-full border border-gray-200 rounded-l px-3 py-2 font-bold text-gray-800 focus:outline-none focus:border-emerald-500"/>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500">Alamat Toko</label>
                            <input type="text" value={notaConfig.alamatToko} onChange={(e) => setNotaConfig({...notaConfig, alamatToko: e.target.value})} className="w-full border border-gray-200 rounded-l px-3 py-2 font-bold text-gray-800 focus:outline-none focus:border-emerald-500"/>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500">No. Telepon</label>
                            <input type="text" value={notaConfig.telpToko} onChange={(e) => setNotaConfig({...notaConfig, telpToko: e.target.value})} className="w-full border border-gray-200 rounded-l px-3 py-2 font-bold text-gray-800 focus:outline-none focus:border-emerald-500"/>
                        </div>
                    </div>

                    {/* SEKSI 2: PENGATURAN CENTANG */}
                    <div className="space-y-2.5 bg-gray-50/60 p-4 rounded-l border border-gray-100">
                        <h4 className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Komponen Yang Ditampilkan</h4>
                        
                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={notaConfig.showLogo}
                                onChange={(e)=>
                                    setNotaConfig({
                                        ...notaConfig,
                                        showLogo:e.target.checked
                                    })
                                }
                            />

                            <span>Tampilkan Logo</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer select-none">
                            <input type="checkbox" checked={notaConfig.showNamaToko} onChange={(e) => setNotaConfig({...notaConfig, showNamaToko: e.target.checked})} className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"/>
                            <span className="text-gray-700">Tampilkan Nama Toko</span>
                        </label>
                        
                        <label className="flex items-center space-x-3 cursor-pointer select-none">
                            <input type="checkbox" checked={notaConfig.showAlamat} onChange={(e) => setNotaConfig({...notaConfig, showAlamat: e.target.checked})} className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"/>
                            <span className="text-gray-700">Tampilkan Alamat Toko</span>
                        </label>
                        
                        <label className="flex items-center space-x-3 cursor-pointer select-none">
                            <input type="checkbox" checked={notaConfig.showTelp} onChange={(e) => setNotaConfig({...notaConfig, showTelp: e.target.checked})} className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"/>
                            <span className="text-gray-700">Tampilkan Nomor Telepon</span>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer select-none">
                            <input type="checkbox" checked={notaConfig.showNoStruk} onChange={(e) => setNotaConfig({...notaConfig, showNoStruk: e.target.checked})} className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"/>
                            <span className="text-gray-700">Tampilkan No. Struk (Di Bawah Alamat)</span>
                        </label>
                        
                        <label className="flex items-center space-x-3 cursor-pointer select-none">
                            <input type="checkbox" checked={notaConfig.showWaktu} onChange={(e) => setNotaConfig({...notaConfig, showWaktu: e.target.checked})} className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"/>
                            <span className="text-gray-700">Waktu Otomatis Saat Ngeprint</span>
                        </label>
                        
                        <label className="flex items-center space-x-3 cursor-pointer select-none">
                            <input type="checkbox" checked={notaConfig.showHeaderTerimakasih} onChange={(e) => setNotaConfig({...notaConfig, showHeaderTerimakasih: e.target.checked})} className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"/>
                            <span className="text-gray-700">Tampilkan Teks Salam Penutup</span>
                        </label>
                        
                        <label className="flex items-center space-x-3 cursor-pointer select-none">
                            <input type="checkbox" checked={notaConfig.showFooterNote} onChange={(e) => setNotaConfig({...notaConfig, showFooterNote: e.target.checked})} className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"/>
                            <span className="text-gray-700">Tampilkan Catatan Syarat Kaki</span>
                        </label>
                    </div>

                    {/* SEKSI 3: INPUT TEKS KAKI */}
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 font-bold uppercase">Teks Salam Penutup</label>
                            <input type="text" value={notaConfig.teksTerimakasih} onChange={(e) => setNotaConfig({...notaConfig, teksTerimakasih: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-emerald-500 text-gray-800"/>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 font-bold uppercase">Teks Catatan Ketentuan Toko (Rata Tengah)</label>
                            <textarea rows="3" value={notaConfig.teksFooterNote} onChange={(e) => setNotaConfig({...notaConfig, teksFooterNote: e.target.value})} className="w-full border border-gray-200 rounded-l p-3 font-bold focus:outline-none focus:border-emerald-500 text-gray-800 text-center resize-none leading-normal"/>
                        </div>
                    </div>

                    <button onClick={handleSimpanDanCetak} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-l uppercase tracking-wide transition shadow-sm">
                        💾 Simpan & Test Cetak Nota
                    </button>
                </div>
            </div>

            {/* PANEL KANAN: LIVE PREVIEW & AREA CETAK UTAMA */}
            {/* Pada mode cetak, hilangkan style pembungkus luar dan lebarkan penuh (w-full p-0 bg-white) */}
            <div className="w-80 bg-gray-100 p-4 flex flex-col items-center overflow-y-auto flex-shrink-0 print:w-full print:p-0 print:bg-white print:overflow-visible">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 print:hidden">Live Preview Kertas Nota</span>
                
                {/* Kontainer Utama Kertas Thermal (Akan dicetak presisi tanpa shadow/border) */}
                <div
                        id="print-area-nota"
                        className="
                            bg-white
                            w-[72mm]
                            text-[11px]
                            font-mono
                            text-black
                            p-2
                            leading-[1.2]
                            shadow-md
                            border
                            border-gray-200
                        "
                    >
                    
                    {/* 1. SEKSI KOP NOTA ATAS */}
                    <div className="text-center mb-2">
                        {notaConfig.showLogo && notaConfig.logo && (
                            <div className="flex justify-center mb-2">
                                <img src={notaConfig.logo}className="w-[60px] h-[60px] mx-auto rounded object-cover mb-1"/>
                            </div>
                        )}
                        {notaConfig.showNamaToko && <h4 className="font-bold uppercase text-[12px] leading-none">{notaConfig.namaToko}</h4>}
                        {notaConfig.showAlamat && <p className="uppercase leading-none mt-1">{notaConfig.alamatToko}</p>}
                        {notaConfig.showTelp && <p className="leading-none mt-1">TELP: {notaConfig.telpToko}</p>}
                        {notaConfig.showNoStruk && <p className="font-bold leading-none mt-1">NO.STRUK: 100505</p>}
                        {notaConfig.showWaktu && <p className="leading-none mt-1">{waktuCetak}</p>}
                    </div>

                    {/* 2. DAFTAR ITEM BARANG */}
                    <div className="border-dashed border-black my-2">
                        {mockItems.map((item, idx) => (
                            <div key={idx} className="mb-1">
                                <div className="font-bold uppercase">{item.name}</div>
                                <div className="flex justify-between">
                        <span>
                            {item.qty} x {item.price.toLocaleString('id-ID')}
                        </span>
                        <span>
                            {item.total.toLocaleString('id-ID')}
                        </span>
                    </div>
                            </div>
                        ))}
                    </div>

                    {/* 3. AKUMULASI TOTAL */}
                    <div className="mt-2 border-b border-dashed border-black w-full">
                        <div className="w-full flex justify-between">
                            <span>TOTAL RP. =</span>
                            <span className="font-bold">{formatRupiah ? formatRupiah(86000) : '86.000'}</span>
                        </div>
                        <div className="w-full flex justify-between">
                            <span className="font-bold uppercase">TUNAI =</span>
                            <span>{formatRupiah ? formatRupiah(100000) : '100.000'}</span>
                        </div>
                    </div>

                    <div className="py-1.5 w-full border-b border-dashed border-black mb-3">
                        <div className="w-full flex justify-between">
                            <span className="font-bold">KEMBALI RP. =</span>
                            <span className="font-bold">{formatRupiah ? formatRupiah(14000) : '14.000'}</span>
                        </div>
                    </div>

                    {/* 4. SALAM PENUTUP */}
                    {notaConfig.showHeaderTerimakasih && (
                        <div className="text-center mt-2 font-bold text-[11px] block w-full">
                            {notaConfig.teksTerimakasih}
                        </div>
                    )}

                    {/* 5. FOOTER SYARAT TOKO */}
                    {notaConfig.showFooterNote && (
                        <div className="text-center text-[10px] leading-4 px-2 whitespace-pre-wrap">
                            {notaConfig.teksFooterNote}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}