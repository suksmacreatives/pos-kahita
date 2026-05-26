import { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function SidebarPos({ 
    isOpen, 
    onClose, 
    activeMenu, 
    setActiveMenu, 
    isSessionOpen, 
    onTutupKasir 
}) {
    const [openLaporanDropdown, setOpenLaporanDropdown] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 bg-black/40 z-40" onClick={onClose}>
            <aside className="w-72 bg-white h-full shadow-2xl flex flex-col text-gray-700" onClick={e => e.stopPropagation()}>
                
                {/* Header Profile Sidebar (Sesuai Foto 2) */}
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center space-x-3 h-[73px]">
                    <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        KB
                    </div>
                    <div>
                        <h4 className="font-black text-sm text-gray-800 uppercase leading-tight">Kahita Busana</h4>
                        <p className="text-[11px] text-gray-500 font-medium">Agus Arismawan</p>
                        <p className="text-[9px] text-gray-400">ID Pelanggan: #0266213</p>
                    </div>
                </div>

                {/* Navigasi Menu */}
                <nav className="flex-1 p-3 space-y-1 text-sm font-bold text-gray-600 overflow-y-auto">
                    
                    {/* 1. Kasir POS */}
                    <button 
                        onClick={() => { setActiveMenu('kasir'); onClose(); }} 
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition ${activeMenu === 'kasir' ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-gray-50'}`}
                    >
                        <span>🖥️</span> <span>Kasir (POS)</span>
                    </button>

                    {/* 2. Penjualan */}
                    <button 
                        onClick={() => { setActiveMenu('penjualan'); onClose(); }} 
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition ${activeMenu === 'penjualan' ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-gray-50'}`}
                    >
                        <span>🛒</span> <span>Penjualan</span>
                    </button>

                    {/* 3. Dropdown Laporan */}
                    <div>
                        <button 
                            onClick={() => setOpenLaporanDropdown(!openLaporanDropdown)} 
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition"
                        >
                            <div className="flex items-center space-x-3">
                                <span>📊</span> <span>Laporan</span>
                            </div>
                            <span className="text-xs text-gray-400">{openLaporanDropdown ? '▲' : '▼'}</span>
                        </button>
                        
                        {openLaporanDropdown && (
                            <div className="pl-9 pr-2 py-1 space-y-0.5 bg-gray-50 rounded-lg text-xs font-semibold text-gray-500">
                                <button onClick={() => { setActiveMenu('laporan-ringkasan'); onClose(); }} className="w-full text-left py-2 hover:text-emerald-600 block">Ringkasan Penjualan</button>
                                <button onClick={() => alert('Fitur Void')} className="w-full text-left py-2 hover:text-emerald-600 block">Void</button>
                                <button onClick={() => { setActiveMenu('laporan-aktivitas'); onClose(); }} className="w-full text-left py-2 hover:text-emerald-600 block">Kasir (Aktivitas Sesi)</button>
                                <button onClick={() => { setActiveMenu('laporan-kas-kasir'); onClose(); }} className="w-full text-left py-2 hover:text-emerald-600 block">Kas Kasir</button>
                                <button onClick={() => alert('Fitur Produk Terjual')} className="w-full text-left py-2 hover:text-emerald-600 block">Produk Terjual</button>
                                <button onClick={() => alert('Fitur Jenis Bayar')} className="w-full text-left py-2 hover:text-emerald-600 block">Jenis Bayar</button>
                            </div>
                        )}
                    </div>

                    {/* 4. Pengaturan Nota */}
                    <button 
                        onClick={() => { setActiveMenu('pengaturan'); onClose(); }} 
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition ${activeMenu === 'pengaturan' ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-gray-50'}`}
                    >
                        <span>⚙️</span> <span>Pengaturan Nota</span>
                    </button>
                </nav>

                {/* Footer Sidebar: Tombol Tutup Kasir & Keluar */}
                <div className="p-3 border-t border-gray-100 bg-gray-50 space-y-1.5">
                    {isSessionOpen && (
                        <button 
                            onClick={() => { onTutupKasir(); onClose(); }} 
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-sm"
                        >
                            <span>🔒</span> <span>Tutup Kasir</span>
                        </button>
                    )}
                    <Link href="/admin/dashboard" className="w-full flex items-center space-x-3 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition">
                        <span>🚪</span> <span>Keluar Kasir</span>
                    </Link>
                </div>
            </aside>
        </div>
    );
}