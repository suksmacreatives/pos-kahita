import React, { useState, useEffect } from 'react';

export default function PengaturanTokoView() {
    const [toko, setToko] = useState({
        nama: 'TOKO 88',
        tagline: 'PREMIUM DIGITAL & TECH EXPERIENCE',
        alamat: 'JL. BYPASS DHARMA GIRI',
        telp: '082189833575',
        registrasi: 'REG-2026-088'
    });
    const [suksesSimpan, setSuksesSimpan] = useState(false);

    useEffect(() => {
        const localData = localStorage.getItem('outlet_config');
        if (localData) {
            setToko(JSON.parse(localData));
        }
    }, []);

    const handleSave = (e) => {
        e.preventDefault();
        localStorage.setItem('outlet_config', JSON.stringify(toko));
        setSuksesSimpan(true);
        setTimeout(() => setSuksesSimpan(false), 2000);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] text-slate-600 font-sans tracking-tight p-6 gap-6 overflow-hidden">

            {/* ======================================================== */}
            {/* TWO-COLUMN LAYOUT: FORM CONFIG & PROFILE CARD PREVIEW    */}
            {/* ======================================================== */}
            <div className="flex-1 flex flex-row gap-6 overflow-hidden items-start w-full">
                
                {/* KOLOM KIRI: FORM CONFIGURATION IDENTITAS */}
                <form onSubmit={handleSave} className="flex-1 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5 overflow-y-auto max-h-full">
                    <div className="space-y-4">
                        
                        {/* Nama Bisnis */}
                        <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nama Bisnis / Outlet</label>
                            <input 
                                type="text" 
                                value={toko.nama} 
                                onChange={(e) => setToko({...toko, nama: e.target.value.toUpperCase()})} 
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-all text-xs" 
                                required
                            />
                        </div>

                        {/* Slogan / Tagline Bisnis */}
                        <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Slogan / Tagline Bisnis</label>
                            <input 
                                type="text" 
                                value={toko.tagline} 
                                onChange={(e) => setToko({...toko, tagline: e.target.value.toUpperCase()})} 
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-all text-xs" 
                                placeholder="CONTOH: INTEGRITY & QUALITY SERVICE"
                            />
                        </div>

                        {/* Alamat Operasional */}
                        <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lokasi Alamat Fisik</label>
                            <input 
                                type="text" 
                                value={toko.alamat} 
                                onChange={(e) => setToko({...toko, alamat: e.target.value.toUpperCase()})} 
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-all text-xs" 
                                required
                            />
                        </div>

                        {/* Grid Multi-Kolom untuk Kredensial Kontak dan Legalitas */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* No Telepon */}
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nomor Kontak Outlet</label>
                                <input 
                                    type="text" 
                                    value={toko.telp} 
                                    onChange={(e) => setToko({...toko, telp: e.target.value})} 
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-all text-xs" 
                                    required
                                />
                            </div>

                            {/* Kode Registrasi / NIB */}
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kode Registrasi / NIB</label>
                                <input 
                                    type="text" 
                                    value={toko.registrasi} 
                                    onChange={(e) => setToko({...toko, registrasi: e.target.value.toUpperCase()})} 
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-all text-xs" 
                                    placeholder="CONTOH: NIB-123456"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Action Button & Feedback Status */}
                    <div className="space-y-3 pt-2">
                        <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-2xs cursor-pointer">
                            Perbarui Profil Outlet
                        </button>

                        {suksesSimpan && (
                            <div className="text-center text-slate-800 font-semibold text-[11px] bg-slate-100 border border-slate-200 py-1.5 rounded-lg transition-all">
                                Identitas outlet berhasil diperbarui secara lokal.
                            </div>
                        )}
                    </div>
                </form>

                {/* KOLOM KANAN: REAL-TIME PROFILE CARD PREVIEW */}
                <div className="w-80 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col gap-4 self-stretch">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Representasi Identitas</span>
                        <span className="text-[11px] text-slate-400">Pratinjau visual ringkas profil eksekutif perusahaan.</span>
                    </div>

                    {/* Kad Profil Minimalis */}
                    <div className="flex-1 border border-slate-200 bg-slate-50/40 rounded-xl p-5 flex flex-col justify-between overflow-hidden">
                        
                        {/* Sisi Atas: Nama Bisnis & Tagline */}
                        <div className="space-y-1">
                            <div className="h-6 w-6 bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold rounded-md mb-3 tracking-normal">
                                {toko.nama ? toko.nama.substring(0, 2) : 'OK'}
                            </div>
                            <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase break-words leading-none">
                                {toko.nama || 'NAMA OUTLET'}
                            </h3>
                            <p className="text-[9px] text-slate-400 font-bold tracking-wider uppercase break-words">
                                {toko.tagline || 'SLOGAN OUTLET PERUSAHAAN'}
                            </p>
                        </div>

                        {/* Sisi Bawah: Metadata Kontak, Lokasi, & Legalitas */}
                        <div className="space-y-3 border-t border-slate-200/80 pt-4 mt-4 text-[10px] text-slate-500 font-medium">
                            <div className="flex flex-col">
                                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Alamat Resmi</span>
                                <span className="text-slate-700 font-semibold mt-0.5 break-words uppercase">{toko.alamat || 'LOKASI ALAMAT BELUM DIATUR'}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Hotline</span>
                                    <span className="font-mono text-slate-700 mt-0.5">{toko.telp || '-'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">ID Registrasi</span>
                                    <span className="font-mono text-slate-700 mt-0.5 truncate">{toko.registrasi || '-'}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

        </div>
    );
}