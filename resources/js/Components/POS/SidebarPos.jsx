import React, { useState } from 'react';
import {
    Computer,
    BaggageClaim,
    ChartColumnIncreasing,
    CalendarCheck2,
    Settings,
    Lock
} from 'lucide-react';


export default function SidebarPos({ 
    isOpen,          
    onClose,
    onOpen,        
    activeMenu, 
    setActiveMenu, 
    isSessionOpen, 
    onTutupKasir 
}) {
    // State internal untuk mengatur buka-tutup dropdown menu Laporan dan Pengaturan
    const [isLaporanOpen, setIsLaporanOpen] = useState(false);
    const [isPengaturanOpen, setIsPengaturanOpen] = useState(false);

    // Daftar menu utama bagian atas
    const menuItemsTop = [
    { id: 'kasir', label: 'Kasir (POS)', icon: <Computer size={20} /> },
    { id: 'penjualan', label: 'Penjualan', icon: <BaggageClaim size={20} /> },
];

    // List anak menu (sub-menu) untuk Laporan
    const subMenuLaporan = [
        { id: 'laporan-ringkasan', label: 'Ringkasan Penjualan' },
        { id: 'void', label: 'Void' },
        { id: 'laporan-kasir-sesi', label: 'Kasir (Aktivitas Sesi)' },
        { id: 'laporan-kas-kasir', label: 'Kas Kasir' },
        { id: 'laporan-produk-terjual', label: 'Produk Terjual' },
        { id: 'laporan-jenis-bayar', label: 'Jenis Bayar' },
    ];

    // List anak menu (sub-menu) untuk Pengaturan yang baru
    const subMenuPengaturan = [
        { id: 'pengaturan-nota', label: 'Nota Kasir' },
        { id: 'pengaturan-printer', label: 'Printer' },
        { id: 'pengaturan-toko', label: 'Tentang Toko/Outlet' },
    ];

    // Fungsi handle klik menu Laporan
    const handleLaporanToggle = () => {
    if (!isOpen) {
        if (onOpen) onOpen();
        setIsLaporanOpen(true);
        return;
    }
    setIsLaporanOpen(prev => !prev);
    };

    // Fungsi handle klik menu Pengaturan
    const handlePengaturanToggle = () => {
    if (!isOpen) {
        if (onOpen) onOpen();
        setIsPengaturanOpen(true);
        return;
    }
    setIsPengaturanOpen(prev => !prev);
    };

    // Handler klik item menu untuk sekaligus merapatkan sidebar (opsional/fleksibel)
    const handleMenuClick = (menuId) => {
        setActiveMenu(menuId);
        // Jika Anda ingin sidebar otomatis merapat setelah pilih menu, aktifkan baris di bawah ini:
        // if (isOpen && onClose) onClose();
    };

    return (
        <div 
            className={`bg-white text-slate-700 h-full flex flex-col justify-between border-r border-slate-100 shadow-sm transition-all duration-300 ease-in-out flex-shrink-0 z-20 ${
                isOpen ? 'w-64' : 'w-[75px]'
            }`}
        >
            {/* ====== BAGIAN ATAS / HEADER USER PROFILE ====== */}
            <div className="flex flex-col overflow-hidden w-full">
                <div className={`p-4 border-b border-slate-100 flex flex-col ${
                    isOpen ? 'items-start' : 'items-center'
                }`}>
                    <div className="flex items-center space-x-3 w-full relative">
                        {/* Avatar Bulat Oranye KB */}
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            KB
                        </div>
                        
                        {/* Detail teks profil muncul jika isOpen = true */}
                        {isOpen && (
                            <div className="flex flex-col min-w-0 flex-1 animate-in fade-in duration-200">
                                <span className="text-xs text-slate-500 truncate">Agus Arismawan</span>
                                <span className="text-[10px] text-slate-400 truncate">ID Pelanggan: #0266213</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ====== BAGIAN TENGAH: NAVIGATION MENU (SCROLLABLE) ====== */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    
                    {/* 1. Menu Utama (Kasir & Penjualan) */}
                    {menuItemsTop.map((menu) => {
                        const isActive = activeMenu === menu.id;
                        return (
                            <button
                                key={menu.id}
                                type="button"
                                onClick={() => handleMenuClick(menu.id)}
                                className={`w-full flex items-center rounded-xl transition-all duration-150 font-semibold text-sm ${
                                    isOpen ? 'px-4 py-3 space-x-4 justify-start' : 'p-3 justify-center'
                                } ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                title={!isOpen ? menu.label : ''}
                            >
                                <span className="text-lg flex-shrink-0">{menu.icon}</span>
                                {isOpen && <span className="truncate text-left flex-1">{menu.label}</span>}
                            </button>
                        );
                    })}

                    {/* 2. MENU DROPDOWN LAPORAN */}
                    <div className="w-full">
                        <button
                            type="button"
                            onClick={handleLaporanToggle}
                            className={`w-full flex items-center rounded-xl transition-all duration-150 font-semibold text-sm ${
                                isOpen ? 'px-4 py-3 space-x-4 justify-start' : 'p-3 justify-center'
                            } ${activeMenu.startsWith('laporan') ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
                            title={!isOpen ? 'Laporan' : ''}
                        >
                            <ChartColumnIncreasing size={20} className="flex-shrink-0" />
                            {isOpen && <span className="truncate text-left flex-1">Laporan</span>}
                        </button>

                        {/* Sub-menu Laporan */}
                        {isOpen && isLaporanOpen && (
                            <div className="mt-1 ml-6 pl-4 border-l border-slate-100 bg-slate-50/50 rounded-r-xl py-1 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                                {subMenuLaporan.map((sub) => (
                                    <button
                                        key={sub.id}
                                        type="button"
                                        onClick={() => handleMenuClick(sub.id)}
                                        className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium block truncate transition ${
                                            activeMenu === sub.id 
                                                ? 'text-emerald-600 font-bold bg-white shadow-sm' 
                                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                        }`}
                                    >
                                        {sub.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 3. Menu Absensi */}
                    <button
                        type="button"
                        onClick={() => handleMenuClick('absensi')}
                        className={`w-full flex items-center rounded-xl transition-all duration-150 font-semibold text-sm ${
                            isOpen ? 'px-4 py-3 space-x-4 justify-start' : 'p-3 justify-center'
                        } ${activeMenu === 'absensi' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
                        title={!isOpen ? 'Absensi' : ''}
                    >
                        <CalendarCheck2 size={20} className="flex-shrink-0" />
                        {isOpen && <span className="truncate text-left flex-1">Absensi</span>}
                    </button>

                    {/* 4. MENU DROPDOWN PENGATURAN */}
                    <div className="w-full">
                        <button
                            type="button"
                            onClick={handlePengaturanToggle}
                            className={`w-full flex items-center rounded-xl transition-all duration-150 font-semibold text-sm ${
                                isOpen ? 'px-4 py-3 space-x-4 justify-start' : 'p-3 justify-center'
                            } ${activeMenu.startsWith('pengaturan') ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
                            title={!isOpen ? 'Pengaturan' : ''}
                        >
                            <Settings size={20} className="flex-shrink-0" />
                            {isOpen && <span className="truncate text-left flex-1">Pengaturan</span>}
                        </button>

                        {/* Sub-menu Pengaturan */}
                        {isOpen && isPengaturanOpen && (
                            <div className="mt-1 ml-6 pl-4 border-l border-slate-100 bg-slate-50/50 rounded-r-xl py-1 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                                {subMenuPengaturan.map((sub) => (
                                    <button
                                        key={sub.id}
                                        type="button"
                                        onClick={() => handleMenuClick(sub.id)}
                                        className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium block truncate transition ${
                                            activeMenu === sub.id 
                                                ? 'text-emerald-600 font-bold bg-white shadow-sm' 
                                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                        }`}
                                    >
                                        {sub.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 5. TAMPILAN ASLI TUTUP KASIR */}
                    {isSessionOpen && (
                        <div className="pt-1">
                            <button
                                type="button"
                                onClick={onTutupKasir}
                                className={`w-full flex items-center rounded-xl transition-all duration-150 font-semibold text-sm ${
                                    isOpen ? 'px-4 py-3 space-x-4 justify-start' : 'p-3 justify-center'
                                } text-slate-600 hover:bg-slate-50`}
                                title={!isOpen ? 'Tutup Kasir' : ''}
                            >
                                <Lock size={20} className="flex-shrink-0 text-orange-500" />
                                {isOpen && (
                                    <span className="truncate text-left flex-1 font-semibold text-slate-700">
                                        Tutup Kasir
                                    </span>
                                )}
                            </button>
                        </div>
                    )}

                </div>
            </div>

            {/* ====== BAGIAN BAWAH: TOMBOL KELUAR / LOCK SIDEBAR ====== */}
            <div className={`p-2 border-t border-slate-50 flex flex-col flex-shrink-0 ${
                isOpen ? 'items-end' : 'items-center'
            }`}>
            </div>

        </div>
    );
}