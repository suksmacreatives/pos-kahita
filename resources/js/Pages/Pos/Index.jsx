import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import SidebarPos from '@/Components/POS/SidebarPos';

// Import View Modular Terpisah - UTUH SESUAI FILE ASLI ANDA
import KasirPosView from '@/Components/POS/Views/KasirPosView';
import DataPenjualan from '@/Components/POS/Views/DataPenjualan';
import RingkasanPenjualan from '@/Components/POS/Views/RingkasanPenjualan';
import VoidTransaksi from '@/Components/POS/Views/VoidTransaksi';
import KasirAktivitas from '@/Components/POS/Views/KasirAktivitas';
import KasKasir from '@/Components/POS/Views/KasKasir';
import ProdukTerjual from '@/Components/POS/Views/ProdukTerjual';
import JenisBayar from '@/Components/POS/Views/JenisBayar';
import Absensi from '@/Components/POS/Views/Absensi';
import PengaturanNotaView from '@/Components/POS/Views/PengaturanNotaView';
import PengaturanPrinterView from '@/Components/POS/Views/PengaturanPrinterView';
import PengaturanTokoView from '@/Components/POS/Views/PengaturanTokoView';

export default function Index({ auth, products = [] }) {
    // --- STATE UTAMA NAVIGASI ---
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState('kasir'); 

    // --- STATE MANAGEMENT SESI KASIR ---
    const [isSessionOpen, setIsSessionOpen] = useState(true);
    const [modalAwal] = useState(500000); 
    const [kasirName] = useState('Agus Arismawan');

    // --- STATE TRANSAKSI UTAMA (POS) ---
    const [cart, setCart] = useState([]); 
    const [savedBills, setSavedBills] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [isCheckoutView, setIsCheckoutView] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState('Tunai');
    const [inputUangDiterima, setInputUangDiterima] = useState('');

    // --- DATA STATE RIWAYAT (MOCK DATA KAS KASIR & PENJUALAN) ---
    const [salesHistory, setSalesHistory] = useState([
        { 
            id: 1, 
            invoice: 'INV/2026/05001', 
            waktu: '09:40', 
            pelanggan: 'Umum', 
            metode: 'Tunai', 
            total: 175000, 
            items: [{ name: 'WAJIK COKLAT MUDA', quantity: 1, price: 175000 }] 
        }
    ]);
    const [kasHistory, setKasHistory] = useState([
        { id: 1, nama: 'Modal Awal', tipe: 'Uang Masuk', kategori: 'Tunai', jumlah: 500000, waktu: '09:29, 25 Mei 2026' }
    ]);

    // ------------------------------------------------------------------
    // PERBAIKAN 1: Menambahkan State voidHistory Agar Tidak Error/Blank
    // ------------------------------------------------------------------
    const [voidHistory, setVoidHistory] = useState([
        { id: 1, tanggal: '2026-05-27', jam: '14:25', invoice: 'INV0021', kasir: 'Wayan', pelanggan: 'Umum', jumlah_item: 3, nominal: 120000, alasan_void: 'Salah input produk', catatan_void: '' },
        { id: 2, tanggal: '2026-05-27', jam: '14:40', invoice: 'INV0022', kasir: 'Komang', pelanggan: 'Gede (Member)', jumlah_item: 2, nominal: 80000, alasan_void: 'Double scan', catatan_void: '' },
        { id: 3, tanggal: '2026-05-27', jam: '15:10', invoice: 'INV0023', kasir: 'Wayan', pelanggan: 'Umum', jumlah_item: 1, nominal: 50000, alasan_void: 'Pelanggan batal', catatan_void: 'Mendadak buru-buru' }
    ]);

    // --- DEFAULT BACKUP DATA PRODUK ---
    const displayProducts = products.length > 0 ? products : [
        { id: 1, name: 'ALAS BIRU', price: 175000, code: 'E3' },
        { id: 2, name: 'Aruna biru', price: 175000, code: 'E3' },
        { id: 3, name: 'CAKRA dasar pink', price: 175000, code: 'E3R' },
        { id: 4, name: 'CENDANA BIRU', price: 175000, code: 'CDN-B' },
        { id: 5, name: 'ENDEK 3D', price: 950000, code: 'E3' },
        { id: 6, name: 'ENDEK 3D REBONG SONGKET', price: 1500000, code: 'E3R' },
    ];

    // --- LOGIKA UTAMA PERHITUNGAN TRANSAKSI (MEMOIZED) ---
    const filteredProducts = useMemo(() => {
        return displayProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery, displayProducts]);

    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
    
    const uangKembalian = useMemo(() => {
        const cash = parseFloat(inputUangDiterima) || 0;
        return cash > subtotal ? cash - subtotal : 0;
    }, [inputUangDiterima, subtotal]);

    const sisaTagihan = useMemo(() => {
        const cash = parseFloat(inputUangDiterima) || 0;
        return cash >= subtotal ? 0 : subtotal - cash;
    }, [inputUangDiterima, subtotal]);

    // --- FUNGSI SILENT PRINT (CETAK LANGSUNG LEWAT IFRAME) ---
    const cetakStrukLangsung = (transaksiData) => {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;

        const htmlStruk = `
            <html>
            <head>
                <style>
                    @page { size: auto; margin: 0mm; }
                    body { 
                        width: 210px; 
                        font-family: 'Courier New', Courier, monospace; 
                        font-size: 11px; 
                        color: #000; 
                        margin: 0; 
                        padding: 10px;
                        line-height: 1.2;
                    }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .bold { font-weight: bold; }
                    .line { border-bottom: 1px dashed #000; margin: 5px 0; }
                    .item-table { width: 100%; border-collapse: collapse; }
                    .item-table td { vertical-align: top; }
                </style>
            </head>
            <body>
                <div class="text-center bold" style="font-size: 14px;">KAHITA BUSANA</div>
                <div class="text-center">Jl. Kawasan Sentra Busana No. 1</div>
                <div class="text-center">Telp: 08123456789</div>
                <div class="line"></div>
                
                <table style="width: 100%; font-size: 11px;">
                    <tr><td>Nota:</td><td class="text-right">${transaksiData.invoice}</td></tr>
                    <tr><td>Kasir:</td><td class="text-right">${kasirName}</td></tr>
                    <tr><td>Pelanggan:</td><td class="text-right">${transaksiData.pelanggan}</td></tr>
                    <tr><td>Waktu:</td><td class="text-right">${transaksiData.waktu}</td></tr>
                </table>
                
                <div class="line"></div>
                
                <table class="item-table">
                    ${transaksiData.items.map(item => `
                        <tr>
                            <td colspan="2">${item.name}</td>
                        </tr>
                        <tr>
                            <td>&nbsp;&nbsp;${item.quantity} x ${formatRupiah(item.price)}</td>
                            <td class="text-right">${formatRupiah(item.price * item.quantity)}</td>
                        </tr>
                    `).join('')}
                </table>
                
                <div class="line"></div>
                
                <table style="width: 100%; font-size: 11px;" class="bold">
                    <tr><td>TOTAL:</td><td class="text-right">${formatRupiah(transaksiData.total)}</td></tr>
                    <tr><td>BAYAR (${transaksiData.metode}):</td><td class="text-right">${formatRupiah(parseFloat(inputUangDiterima) || transaksiData.total)}</td></tr>
                    <tr><td>KEMBALIAN:</td><td class="text-right">${formatRupiah(uangKembalian)}</td></tr>
                </table>
                
                <div class="line"></div>
                <div class="text-center bold" style="margin-top: 10px;">TERIMA KASIH</div>
                <div class="text-center">Selamat Berbelanja Kembali</div>
                <br/>
            </body>
            </html>
        `;

        doc.open();
        doc.write(htmlStruk);
        doc.close();

        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
    };

    // --- MANAJEMEN HANDLER TRANSAKSI ---
    const addToCart = (productWithVarian) => {
        setCart(prev => {
            const exist = prev.find(item => item.id === productWithVarian.id);
            if (exist) {
                return prev.map(i => i.id === productWithVarian.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...productWithVarian, quantity: 1 }];
        });
    };

    const handleProsesBayarFinal = () => {
        if (selectedPayment === 'Tunai' && (parseFloat(inputUangDiterima) || 0) < subtotal) {
            return alert("Uang pembayaran kurang!");
        }
        const invoiceNo = `INV/2026/${Math.floor(10000 + Math.random() * 90000)}`;
        const newSale = { 
            id: Date.now(), 
            invoice: invoiceNo, 
            waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), 
            pelanggan: customerName || 'Umum', 
            metode: selectedPayment, 
            total: subtotal, 
            items: cart 
        };
        
        cetakStrukLangsung(newSale);
        
        setSalesHistory([newSale, ...salesHistory]);
        setKasHistory(prev => [
            ...prev, 
            { id: Date.now(), nama: `Penjualan ${invoiceNo}`, tipe: 'Uang Masuk', kategori: selectedPayment, jumlah: subtotal, waktu: '25 Mei 2026' }
        ]);
        
        alert("Transaksi Sukses & Nota Dicetak!");
        setCart([]);
        setIsCheckoutView(false);
        setInputUangDiterima('');
        setCustomerName('');
    };

    const handleTutupKasirAction = () => {
        const konfirmasi = confirm("Apakah anda yakin ingin menutup sesi kasir saat ini?");
        if (konfirmasi) {
            setIsSessionOpen(false);
            alert("Sesi Kasir Berhasil Ditutup.");
        }
    };

    const formatRupiah = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

    return (
        <div className="bg-[#f4f6f9] h-screen w-screen flex flex-col font-sans overflow-hidden select-none text-gray-700">
            <Head title="Kasa POS - Kahita Busana" />

            <div className="flex-1 flex overflow-hidden relative w-full h-full">
                
                {/* COMPONENT SIDEBAR UTAMA */}
                <SidebarPos 
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                    isSessionOpen={isSessionOpen}
                    onTutupKasir={handleTutupKasirAction}
                />

                {/* AREA UTAMA (TOPBAR + VIEW AREA) */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    
                    {/* TOPBAR HEAD BANNER KASIR */}
                    <header className="bg-[#009664] text-white h-[48px] px-4 flex items-center justify-between shadow-sm z-10 flex-shrink-0">
                        <div className="flex items-center space-x-3">
                            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded hover:bg-emerald-700 transition">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"/>
                                </svg>
                            </button>
                            <span className="font-black text-sm tracking-wide uppercase">MAJOO</span>
                            <div className="text-[11px] bg-emerald-800/40 px-2 py-0.5 rounded flex items-center space-x-2 font-medium">
                                <span>{kasirName}</span>
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                            </div>
                        </div>
                        <div className="text-xs font-bold tracking-wider opacity-90">Rabu, 27 Mei 2026</div>
                    </header>

                    {/* INTERFACE SWITCHING VIEW AREA */}
                    <div className="flex-1 flex overflow-hidden w-full h-full">

                        {/* 1. VIEW KASIR POS */}
                        {activeMenu === 'kasir' && (
                            <KasirPosView 
                                filteredProducts={filteredProducts}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                addToCart={addToCart}
                                cart={cart}
                                setCart={setCart} 
                                savedBills={savedBills}       
                                setSavedBills={setSavedBills}
                                customerName={customerName}
                                setCustomerName={setCustomerName}
                                isCheckoutView={isCheckoutView}
                                setIsCheckoutView={setIsCheckoutView}
                                selectedPayment={selectedPayment}
                                setSelectedPayment={setSelectedPayment}
                                inputUangDiterima={inputUangDiterima}
                                setInputUangDiterima={setInputUangDiterima}
                                subtotal={subtotal}
                                sisaTagihan={sisaTagihan}
                                uangKembalian={uangKembalian}
                                handleProsesBayarFinal={handleProsesBayarFinal}
                                formatRupiah={formatRupiah}
                            />
                        )}

                        {/* 2. VIEW DATA PENJUALAN */}
                        {activeMenu === 'penjualan' && (
                            <DataPenjualan salesHistory={salesHistory} formatRupiah={formatRupiah} />
                        )}

                        {/* 3. VIEW LAPORAN: RINGKASAN PENJUALAN */}
                        {activeMenu === 'laporan-ringkasan' && (
                            <RingkasanPenjualan salesHistory={salesHistory} formatRupiah={formatRupiah} />
                        )}

                        {/* ------------------------------------------------------------------ */}
                        {/* PERBAIKAN 2: Mengubah activeTab Menjadi activeMenu === 'void'     */}
                        {/* ------------------------------------------------------------------ */}
                        {activeMenu === 'void' && (
                            <VoidTransaksi voidHistory={voidHistory} formatRupiah={formatRupiah} />
                        )}

                        {/* 4. VIEW LAPORAN: KASIR AKTIVITAS SESI */}
                        {activeMenu === 'laporan-kasir-sesi' && (
                            <KasirAktivitas modalAwal={modalAwal} salesHistory={salesHistory} kasirName={kasirName} formatRupiah={formatRupiah} />
                        )}

                        {/* 5. VIEW LAPORAN: KAS KASIR (MUTASI JURNAL) */}
                        {activeMenu === 'laporan-kas-kasir' && (
                            <KasKasir kasHistory={kasHistory} salesHistory={salesHistory} formatRupiah={formatRupiah} />
                        )}

                        {/* 6. VIEW LAPORAN: LIST PRODUK TERJUAL */}
                        {activeMenu === 'laporan-produk-terjual' && (
                            <ProdukTerjual salesHistory={salesHistory} formatRupiah={formatRupiah} />
                        )}

                        {/* 7. VIEW LAPORAN: JENIS METODE BAYAR */}
                        {activeMenu === 'laporan-jenis-bayar' && (
                            <JenisBayar salesHistory={salesHistory} formatRupiah={formatRupiah} />
                        )}

                        {/* 8. VIEW FITUR ABSENSI */}
                        {activeMenu === 'absensi' && (
                            <Absensi kasirName={kasirName} />
                        )}

                        {/* 9. VIEW FITUR PENGATURAN NOTA */}
                        {activeMenu === 'pengaturan-nota' && (
                            <PengaturanNotaView formatRupiah={formatRupiah} />
                        )}

                        {/* 10. VIEW FITUR PENGATURAN PRINTER */}
                        {activeMenu === 'pengaturan-printer' && (
                            <PengaturanPrinterView />
                        )}

                        {/* 11. VIEW FITUR PENGATURAN TOKO */}
                        {activeMenu === 'pengaturan-toko' && (
                            <PengaturanTokoView />
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}