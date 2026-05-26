import { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import SidebarPos from '@/Components/POS/SidebarPos';

export default function Index({ auth, products = [] }) {
    // --- STATE UTAMA NAVIGASI SIDEBAR ---
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState('kasir'); // kasir, penjualan, void, kasir (aktivitas), kas kasir, produk terjual, jenis bayar

    // --- STATE SESI KASIR ---
    const [isSessionOpen, setIsSessionOpen] = useState(false);
    const [modalAwal, setModalAwal] = useState('');
    const [bukaKasirModal, setBukaKasirModal] = useState(true);

    // State Alur Tutup Kasir
    const [tutupKasirModal, setTutupKasirModal] = useState(false);
    const [inputCashFisik, setInputCashFisik] = useState('');

    // --- STATE UTAMA TRANSAKSI (SISI KANAN) ---
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [savedOrders, setSavedOrders] = useState([]); 
    const [openDaftarOrderModal, setOpenDaftarOrderModal] = useState(false);
    
    // --- STATE PROMO ---
    const [selectedPromo, setSelectedPromo] = useState(null);
    const [openPromoModal, setOpenPromoModal] = useState(false);

    const availablePromos = [
        { id: 1, name: 'Diskon Grand Opening 10%', type: 'percentage', value: 10 },
        { id: 2, name: 'Potongan Berkah Rp 25.000', type: 'fixed', value: 25000 },
    ];

    // --- STATE VIEW PEMBAYARAN KANAN ---
    const [isCheckoutView, setIsCheckoutView] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState('Tunai');
    const [inputUangDiterima, setInputUangDiterima] = useState('');
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [lastInvoice, setLastInvoice] = useState(null);

    // --- STATE LOG HISTORY LAPORAN (KEMBALI BERFUNGSI) ---
    const [salesHistory, setSalesHistory] = useState([]);
    const [voidHistory, setVoidHistory] = useState([]);
    const [sessionHistory, setSessionHistory] = useState([]);
    const [kasHistory, setKasHistory] = useState([]);

    // --- DATA PRODUK UTAMA ---
    const displayProducts = products.length > 0 ? products : [
        { id: 1, name: 'ALAS BIRU', price: 175000, code: 'E3' },
        { id: 2, name: 'Aruna biru', price: 175000, code: 'E3' },
        { id: 3, name: 'CAKRA dasar pink', price: 175000, code: 'E3R' },
        { id: 4, name: 'CENDANA BIRU', price: 175000, code: 'CDN-B' },
        { id: 5, name: 'ENDEK 3D', price: 950000, code: 'E3' },
        { id: 6, name: 'ENDEK 3D REBONG SONGKET', price: 1500000, code: 'E3R' },
        { id: 7, name: 'Endek rebong', price: 950000, code: 'ER' },
        { id: 8, name: 'JCT', price: 175000, code: 'JCT' },
        { id: 9, name: 'JEMPIRING', price: 175000, code: 'JMP' },
        { id: 10, name: 'Jempiring coklat tua', price: 175000, code: 'JCT' },
        { id: 11, name: 'JSM', price: 2200000, code: 'JSM' },
        { id: 12, name: 'JUMPUTAN SUTRA MASTULI', price: 2200000, code: 'JSM' },
        { id: 13, name: 'KML', price: 220000, code: 'KML' },
        { id: 14, name: 'KMM', price: 220000, code: 'KMM' },
        { id: 15, name: 'Kebaya mahika L', price: 220000, code: 'KML' },
        { id: 16, name: 'Kebaya mahika M', price: 220000, code: 'KMM' },
    ];

    const filteredProducts = useMemo(() => {
        return displayProducts.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, displayProducts]);

    // --- KALKULASI PROMO & TOTAL ---
    const subtotal = useMemo(() => cart.reduce((s, item) => s + (item.price * item.quantity), 0), [cart]);
    const totalQty = useMemo(() => cart.reduce((s, item) => s + item.quantity, 0), [cart]);

    const nilaiPotonganPromo = useMemo(() => {
        if (!selectedPromo) return 0;
        if (selectedPromo.type === 'percentage') {
            return (subtotal * selectedPromo.value) / 100;
        }
        return selectedPromo.value;
    }, [selectedPromo, subtotal]);

    const totalBayar = useMemo(() => {
        const hasil = subtotal - nilaiPotonganPromo;
        return hasil < 0 ? 0 : hasil;
    }, [subtotal, nilaiPotonganPromo]);

    const uangKembalian = useMemo(() => {
        const cash = parseFloat(inputUangDiterima) || 0;
        return cash > totalBayar ? cash - totalBayar : 0;
    }, [inputUangDiterima, totalBayar]);

    const sisaTagihan = useMemo(() => {
        const cash = parseFloat(inputUangDiterima) || 0;
        return cash >= totalBayar ? 0 : totalBayar - cash;
    }, [inputUangDiterima, totalBayar]);

    // --- KALKULASI PRODUK TERJUAL & JENIS BAYAR ---
    const produkTerjualSummary = useMemo(() => {
        const map = {};
        salesHistory.forEach(sale => {
            sale.items.forEach(item => {
                if (!map[item.id]) {
                    map[item.id] = { name: item.name, code: item.code, qty: 0, total: 0 };
                }
                map[item.id].qty += item.quantity;
                map[item.id].total += item.price * item.quantity;
            });
        });
        return Object.values(map);
    }, [salesHistory]);

    const jenisBayarSummary = useMemo(() => {
        const summary = { 'Tunai': 0, 'QRIS majoo': 0, 'Transfer': 0, 'Nontunai': 0 };
        salesHistory.forEach(sale => {
            if (summary[sale.metode] !== undefined) {
                summary[sale.metode] += sale.total;
            }
        });
        return summary;
    }, [salesHistory]);


    // --- FUNGSI-FUNGSI AKSI UTAMA ---
    const handleBukaKasir = (e) => {
        e.preventDefault();
        if (!modalAwal || modalAwal <= 0) return alert("Masukkan modal awal!");
        
        const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        // Catat ke Kas & Aktivitas Sesi
        setKasHistory([{ id: Date.now(), nama: 'Modal Awal Sesi', tipe: 'Uang Masuk', kategori: 'Tunai', jumlah: parseFloat(modalAwal), waktu: timestamp }]);
        setSessionHistory([{ id: Date.now(), aktivitas: 'Buka Sesi Kasir', user: 'Agus Arismawan', waktu: timestamp, detail: `Modal awal ${formatRupiah(modalAwal)}` }]);
        
        setIsSessionOpen(true);
        setBukaKasirModal(false);
    };

    const handleTutupKasirFinal = () => {
        const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        setSessionHistory(prev => [...prev, { id: Date.now(), aktivitas: 'Tutup Sesi Kasir', user: 'Agus Arismawan', waktu: timestamp, detail: `Uang fisik dilaporkan: ${formatRupiah(inputCashFisik || 0)}` }]);
        
        alert("Sesi kasir berhasil ditutup!");
        setIsSessionOpen(false);
        setTutupKasirModal(false);
        setBukaKasirModal(true);
        setCart([]);
        setSalesHistory([]);
        setVoidHistory([]);
    };

    const addToCart = (product) => {
        if (!isSessionOpen) return setBukaKasirModal(true);
        setCart(prev => {
            const exist = prev.find(item => item.id === product.id);
            if (exist) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQty = (id, change) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const q = item.quantity + change;
                return q > 0 ? { ...item, quantity: q } : null;
            }
            return item;
        }).filter(Boolean));
    };

    const clearCart = () => {
        if (confirm("Hapus semua barang di keranjang belanja?")) {
            setCart([]);
            setSelectedPromo(null);
        }
    };

    const saveOrderGantung = () => {
        if (cart.length === 0) return alert("Keranjang kosong, tidak ada yang bisa disimpan.");
        const newOrder = {
            id: Date.now(),
            customer: customerName || 'Tanpa Nama',
            items: cart,
            selectedPromo: selectedPromo,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };
        setSavedOrders([...savedOrders, newOrder]);
        setCart([]);
        setCustomerName('');
        setSelectedPromo(null);
        alert("Pesanan berhasil disimpan ke Daftar Order!");
    };

    const loadSavedOrder = (order) => {
        setCart(order.items);
        setCustomerName(order.customer);
        setSelectedPromo(order.selectedPromo);
        setSavedOrders(savedOrders.filter(o => o.id !== order.id));
        setOpenDaftarOrderModal(false);
    };

    const handleProsesBayarFinal = () => {
        const nominalMasuk = parseFloat(inputUangDiterima) || 0;
        if (selectedPayment === 'Tunai' && nominalMasuk < totalBayar) {
            return alert("Uang pembayaran kurang dari total tagihan!");
        }

        const invoiceNo = `INV/${new Date().getFullYear()}/${Math.floor(100000 + Math.random() * 900000)}`;
        const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        const invoiceData = {
            id: Date.now(),
            invoice: invoiceNo,
            pelanggan: customerName || 'Umum',
            total: totalBayar,
            subtotal: subtotal,
            potongan: nilaiPotonganPromo,
            metode: selectedPayment,
            diterima: selectedPayment === 'Tunai' ? nominalMasuk : totalBayar,
            kembalian: selectedPayment === 'Tunai' ? uangKembalian : 0,
            items: cart,
            waktu: timestamp
        };

        setLastInvoice(invoiceData);
        setSalesHistory([invoiceData, ...salesHistory]);
        
        // Log aktivitas kas masuk
        setKasHistory(prev => [...prev, { id: Date.now(), nama: `Penjualan ${invoiceNo}`, tipe: 'Uang Masuk', kategori: selectedPayment, jumlah: totalBayar, waktu: timestamp }]);
        
        setIsCheckoutView(false);
        setSuccessModalOpen(true); 
    };

    const handleProsesVoid = (sale) => {
        if(confirm(`Apakah Anda yakin ingin membatalkan (VOID) transaksi ${sale.invoice}?`)) {
            const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            
            setVoidHistory([{ ...sale, waktuVoid: timestamp }, ...voidHistory]);
            setSalesHistory(salesHistory.filter(s => s.id !== sale.id));
            
            // Catat pengeluaran kas krn void balik uang
            setKasHistory(prev => [...prev, { id: Date.now(), nama: `Void Transaksi ${sale.invoice}`, tipe: 'Uang Keluar', kategori: sale.metode, jumlah: sale.total, waktu: timestamp }]);
            alert(`Transaksi ${sale.invoice} berhasil ditiadakan.`);
        }
    };

    const formatRupiah = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

    return (
        <div className="bg-gray-100 h-screen w-screen flex flex-col font-sans select-none overflow-hidden relative text-gray-800">
            <Head title="POS Kasir Kahita Busana" />

            {/* TOPBAR HEADER HEADER */}
            <header className="bg-emerald-600 text-white h-14 px-4 flex items-center justify-between flex-shrink-0 shadow-sm z-20">
                <div className="flex items-center space-x-3">
                    <button 
                        type="button" 
                        onClick={() => setIsSidebarOpen(true)} 
                        className="p-1.5 rounded-lg hover:bg-emerald-700 transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    </button>
                    <span className="font-extrabold text-base tracking-wide uppercase">majoo</span>
                </div>
                <div className="text-xs font-bold bg-emerald-700 px-3 py-1 rounded-md">
                    Agus Arismawan - Kahita Busana
                </div>
            </header>

            {/* APP CONTAINER */}
            <div className="flex-1 flex overflow-hidden relative w-full h-full">
                
                {/* INTERAKTIF SIDEBAR NAVIGATION DRAWER */}
                <div className={`absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <SidebarPos 
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                        activeMenu={activeMenu}
                        setActiveMenu={(menu) => { setActiveMenu(menu); setIsSidebarOpen(false); }}
                        isSessionOpen={isSessionOpen}
                        onTutupKasir={() => setTutupKasirModal(true)}
                    />
                </div>

                {isSidebarOpen && (
                    <div onClick={() => setIsSidebarOpen(false)} className="absolute inset-0 bg-black/40 z-30 transition-opacity duration-300"/>
                )}

                {/* AREA PANEL DISPLAY DINAMIS (KASIR + LAPORAN LENGKAF) */}
                <main className="flex-1 flex overflow-hidden w-full h-full">
                    
                    {/* 1. VIEW MENU KASIR UTAMA */}
                    {activeMenu === 'kasir' && (
                        <div className="flex-1 flex overflow-hidden w-full">
                            {/* KATALOG KIRI */}
                            <div className="flex-1 flex flex-col p-3 overflow-hidden">
                                <div className="mb-3 bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm flex items-center">
                                    <span className="mr-2 text-gray-400">🔍</span>
                                    <input 
                                        type="text" 
                                        placeholder="Cari nama barang atau barcode..." 
                                        value={searchQuery} 
                                        onChange={e => setSearchQuery(e.target.value)} 
                                        className="w-full bg-transparent text-xs focus:outline-none"
                                    />
                                </div>
                                
                                <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 content-start">
                                    {filteredProducts.map(product => (
                                        <button 
                                            key={product.id} 
                                            onClick={() => addToCart(product)} 
                                            className="bg-white border border-gray-200 rounded-2xl p-3 flex flex-col justify-between h-36 shadow-sm hover:border-emerald-500 transition text-left relative overflow-hidden"
                                        >
                                            <div className="w-full h-14 bg-gray-50 rounded-xl flex items-center justify-center font-black text-gray-500 text-xs uppercase p-1 text-center truncate">
                                                {product.code}
                                            </div>
                                            <div className="text-xs font-bold text-gray-700 mt-1 line-clamp-2 leading-tight h-8">
                                                {product.name}
                                            </div>
                                            <div className="text-xs font-black text-emerald-600">
                                                {formatRupiah(product.price)}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* PANEL KANAN MAJOO CHECKOUT STYLE (YANG DI-SUKAI) */}
                            <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-md flex-shrink-0 overflow-hidden">
                                {!isCheckoutView ? (
                                    <>
                                        <div className="grid grid-cols-3 bg-gray-50 border-b text-center text-xs font-bold text-gray-600 h-11 border-t flex-shrink-0">
                                            <button onClick={() => setOpenDaftarOrderModal(true)} className="flex items-center justify-center space-x-1 border-r hover:bg-gray-100 transition">
                                                <span>📋</span> <span>Daftar Order</span>
                                                {savedOrders.length > 0 && <span className="bg-orange-500 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center ml-1">{savedOrders.length}</span>}
                                            </button>
                                            <div className="flex items-center justify-center space-x-1 border-r bg-white text-emerald-600">
                                                <span>Jenis Order</span> <span className="text-[10px]">▼</span>
                                            </div>
                                            <button onClick={() => { const name = prompt("Masukkan Nama Pelanggan:"); if(name !== null) setCustomerName(name); }} className="flex items-center justify-center space-x-1 hover:bg-gray-100 text-gray-500">
                                                <span>➕ Pelanggan</span>
                                            </button>
                                        </div>

                                        <div className="px-3 py-1.5 bg-emerald-50 text-[11px] font-bold text-emerald-800 border-b flex justify-between items-center flex-shrink-0">
                                            <span>👤 Pelanggan: <span className="underline">{customerName || 'Umum'}</span></span>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
                                            {cart.length === 0 ? (
                                                <div className="text-center text-gray-400 py-32 space-y-2">
                                                    <div className="text-3xl">🛒</div>
                                                    <p className="font-medium">Silakan masukkan pesanan dari pelanggan</p>
                                                </div>
                                            ) : (
                                                cart.map(item => (
                                                    <div key={item.id} className="flex justify-between items-start border-b border-gray-100 pb-2.5">
                                                        <div className="max-w-[180px]">
                                                            <p className="font-bold text-gray-800 truncate">{item.name}</p>
                                                            <p className="text-gray-400 font-semibold">{formatRupiah(item.price)}</p>
                                                        </div>
                                                        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
                                                            <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 bg-white font-black rounded-md shadow-sm text-center">-</button>
                                                            <span className="font-extrabold px-1 min-w-[14px] text-center">{item.quantity}</span>
                                                            <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 bg-white font-black rounded-md shadow-sm text-center">+</button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs space-y-1.5 font-bold text-gray-600 flex-shrink-0">
                                            <div className="flex justify-between"><span>Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
                                            <div className="flex justify-between font-black text-sm text-gray-800 pt-1 border-t">
                                                <span>Total Tagihan</span>
                                                <span className="text-emerald-600 text-base">{formatRupiah(totalBayar)}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 h-14 border-t border-gray-200 flex-shrink-0">
                                            <button onClick={clearCart} disabled={cart.length === 0} className="flex items-center justify-center bg-gray-50 border-r hover:bg-red-50 text-gray-500 disabled:opacity-40 transition">
                                                <span className="text-lg">🗑️</span>
                                            </button>
                                            <button onClick={() => setOpenPromoModal(true)} disabled={cart.length === 0} className="flex items-center justify-center border-r bg-gray-50 text-xs font-bold space-x-1">
                                                <span className="text-base">🎟️</span> <span>Promo</span>
                                            </button>
                                            <button onClick={saveOrderGantung} disabled={cart.length === 0} className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 border-r text-[11px] font-bold">
                                                <span className="text-sm">📥</span> <span>Simpan</span>
                                            </button>
                                            <button onClick={() => { if(cart.length > 0) { setIsCheckoutView(true); setInputUangDiterima(''); } }} disabled={cart.length === 0} className={`flex flex-col items-center justify-center font-black transition relative ${cart.length > 0 ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                                                <span className="text-[13px] uppercase">Bayar</span>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    /* TAMPILAN VIEW PEMBAYARAN VERTIKAL (PROPORSI PRESISI) */
                                    <div className="flex flex-col h-full bg-[#f4f6f9] text-gray-800 overflow-hidden">
                                        <div className="bg-emerald-600 text-white p-3 flex items-center justify-between flex-shrink-0">
                                            <div className="flex items-center space-x-3">
                                                <button onClick={() => setIsCheckoutView(false)} className="text-lg font-bold hover:text-gray-200">←</button>
                                                <span className="text-xs font-bold tracking-wide">Pembayaran</span>
                                            </div>
                                            <span className="text-[10px] bg-emerald-700 px-2 py-0.5 rounded-full font-bold">● Status: Online</span>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                            {/* NOMINAL TAGIHAN BOX */}
                                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                                                <span className="text-[11px] text-gray-400 font-bold uppercase block tracking-wider">Total Tagihan</span>
                                                <span className="text-2xl font-black text-gray-900 block mt-1">{formatRupiah(totalBayar)}</span>
                                                <div className="grid grid-cols-2 gap-2 border-t border-gray-100 mt-3 pt-3 text-left">
                                                    <div>
                                                        <span className="text-[10px] text-gray-400 font-bold block uppercase">Sisa Tagihan</span>
                                                        <span className="text-xs font-black text-red-500">{formatRupiah(sisaTagihan)}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] text-gray-400 font-bold block uppercase">Kembalian</span>
                                                        <span className="text-xs font-black text-emerald-600">{formatRupiah(uangKembalian)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* METODE SELEKSI OPSI */}
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">Metode Pembayaran</label>
                                                <div className="grid grid-cols-2 gap-1.5 bg-white p-1 rounded-xl border border-gray-200 shadow-sm text-center font-bold text-xs">
                                                    {['Tunai', 'QRIS majoo', 'Transfer', 'Nontunai'].map(method => (
                                                        <button key={method} type="button" onClick={() => { setSelectedPayment(method); setInputUangDiterima(method === 'Tunai' ? '' : totalBayar); }} className={`py-2 rounded-lg transition ${selectedPayment === method ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-gray-500 hover:bg-gray-50'}`}>
                                                            {method}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* INPUT TUNAI + QUICK NOMINAL */}
                                            {selectedPayment === 'Tunai' && (
                                                <div className="space-y-3">
                                                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Uang Tunai Diterima</label>
                                                        <div className="relative flex items-center">
                                                            <span className="absolute left-3 text-xs font-bold text-gray-400">Rp</span>
                                                            <input type="number" placeholder="0" value={inputUangDiterima} onChange={e => setInputUangDiterima(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 pl-8 text-sm font-black text-gray-800 focus:outline-none focus:border-emerald-500" />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                                                        <button type="button" onClick={() => setInputUangDiterima(totalBayar)} className="bg-white border border-emerald-500 text-emerald-700 rounded-xl py-2.5 shadow-sm text-center hover:bg-emerald-50">Uang Pas</button>
                                                        <button type="button" onClick={() => setInputUangDiterima(200000)} className="bg-white border border-gray-200 text-gray-700 rounded-xl py-2.5 shadow-sm text-center hover:bg-gray-50">Rp 200.000</button>
                                                        <button type="button" onClick={() => setInputUangDiterima(300000)} className="bg-white border border-gray-200 text-gray-700 rounded-xl py-2.5 shadow-sm text-center hover:bg-gray-50">Rp 300.000</button>
                                                        <button type="button" onClick={() => { const nominal = prompt("Masukkan Nominal Lainnya:"); if(nominal) setInputUangDiterima(nominal); }} className="bg-white border border-gray-200 text-gray-500 rounded-xl py-2.5 shadow-sm text-center hover:bg-gray-50">Lainnya</button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* RINGKASAN PRODUK BELANJA */}
                                            <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                                                <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase mb-2">
                                                    <span>Ringkasan ({totalQty} Produk)</span>
                                                    <span>Pelanggan: {customerName || 'Umum'}</span>
                                                </div>
                                                <div className="divide-y divide-gray-50 max-h-32 overflow-y-auto text-xs font-medium">
                                                    {cart.map(item => (
                                                        <div key={item.id} className="py-2 flex justify-between items-center">
                                                            <span className="text-gray-700 truncate max-w-[160px]">{item.quantity}x {item.name}</span>
                                                            <span className="text-gray-500 font-bold">{formatRupiah(item.price * item.quantity)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-white border-t border-gray-200 flex-shrink-0">
                                            <button 
                                                type="button"
                                                onClick={handleProsesBayarFinal} 
                                                disabled={selectedPayment === 'Tunai' && (!inputUangDiterima || parseFloat(inputUangDiterima) < totalBayar)}
                                                className={`w-full font-black text-white rounded-xl py-3 text-xs uppercase tracking-wider text-center shadow-md transition ${
                                                    selectedPayment !== 'Tunai' || (inputUangDiterima && parseFloat(inputUangDiterima) >= totalBayar) ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-300 cursor-not-allowed text-gray-400'
                                                }`}
                                            >
                                                Proses Bayar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 2. VIEW LAPORAN: RINGKASAN PENJUALAN */}
                    {activeMenu === 'penjualan' && (
                        <div className="flex-1 p-5 overflow-y-auto bg-gray-50">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-sm font-black text-gray-700 uppercase tracking-wider">📋 Ringkasan Penjualan Sesi Ini</h2>
                                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-lg">Total Invoice: {salesHistory.length}</span>
                            </div>
                            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden text-xs">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-100 text-gray-500 font-bold border-b text-[11px] uppercase">
                                        <tr>
                                            <th className="p-3.5">Waktu</th>
                                            <th className="p-3.5">No. Invoice</th>
                                            <th className="p-3.5">Pelanggan</th>
                                            <th className="p-3.5">Metode Bayar</th>
                                            <th className="p-3.5 text-right">Total Transaksi</th>
                                            <th className="p-3.5 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y font-medium text-gray-600">
                                        {salesHistory.length === 0 ? (
                                            <tr><td colSpan="6" className="p-6 text-center text-gray-400 font-bold">Belum ada transaksi penjualan terekam pada sesi ini.</td></tr>
                                        ) : (
                                            salesHistory.map((s) => (
                                                <tr key={s.id} className="hover:bg-gray-50">
                                                    <td className="p-3.5 font-mono text-gray-400">{s.waktu}</td>
                                                    <td className="p-3.5 font-bold text-emerald-600">{s.invoice}</td>
                                                    <td className="p-3.5">{s.pelanggan}</td>
                                                    <td className="p-3.5"><span className="bg-gray-100 border text-gray-700 px-2 py-0.5 rounded-md font-bold text-[10px]">{s.metode}</span></td>
                                                    <td className="p-3.5 text-right font-black text-gray-800">{formatRupiah(s.total)}</td>
                                                    <td className="p-3.5 text-center">
                                                        <button onClick={() => handleProsesVoid(s)} className="bg-red-50 border border-red-200 text-red-600 font-bold px-2.5 py-1 rounded-lg hover:bg-red-100 transition text-[11px]">VOID</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 3. VIEW LAPORAN: VOID HISTORY */}
                    {activeMenu === 'void' && (
                        <div className="flex-1 p-5 overflow-y-auto bg-gray-50">
                            <h2 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">🚫 Daftar Transaksi Dibatalkan (VOID)</h2>
                            <div className="bg-white border border-red-100 rounded-2xl shadow-sm overflow-hidden text-xs">
                                <table className="w-full text-left">
                                    <thead className="bg-red-50 text-red-700 font-bold border-b text-[11px] uppercase">
                                        <tr>
                                            <th className="p-3.5">Waktu Void</th>
                                            <th className="p-3.5">No. Invoice</th>
                                            <th className="p-3.5">Pelanggan</th>
                                            <th className="p-3.5">Metode Sebelumnya</th>
                                            <th className="p-3.5 text-right">Total Dikembalikan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y font-medium text-gray-600">
                                        {voidHistory.length === 0 ? (
                                            <tr><td colSpan="5" className="p-6 text-center text-gray-400 font-bold">Tidak ada history pembatalan transaksi (void).</td></tr>
                                        ) : (
                                            voidHistory.map((v) => (
                                                <tr key={v.id} className="bg-red-50/20">
                                                    <td className="p-3.5 font-mono text-red-500 font-bold">{v.waktuVoid}</td>
                                                    <td className="p-3.5 font-bold line-through text-gray-400">{v.invoice}</td>
                                                    <td className="p-3.5 text-gray-500">{v.pelanggan}</td>
                                                    <td className="p-3.5 text-gray-400">{v.metode}</td>
                                                    <td className="p-3.5 text-right font-black text-red-600">{formatRupiah(v.total)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 4. VIEW LAPORAN: AKTIVITAS SESI KASIR */}
                    {activeMenu === 'kasir (aktivitas)' && (
                        <div className="flex-1 p-5 overflow-y-auto bg-gray-50">
                            <h2 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">⏱️ Log Aktivitas Sesi Kasir</h2>
                            <div className="space-y-3 max-w-xl">
                                {sessionHistory.length === 0 ? (
                                    <div className="bg-white p-6 rounded-2xl border text-center text-gray-400 font-bold">Log sesi masih kosong. Selesaikan pembukaan kasir terlebih dahulu.</div>
                                ) : (
                                    sessionHistory.map(log => (
                                        <div key={log.id} className="bg-white border rounded-xl p-3.5 shadow-sm flex justify-between items-start">
                                            <div className="space-y-1">
                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${log.aktivitas.includes('Buka') ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}`}>{log.aktivitas}</span>
                                                <p className="text-xs font-bold text-gray-700 pt-1">{log.detail}</p>
                                                <p className="text-[11px] text-gray-400 font-medium">Oleh: {log.user}</p>
                                            </div>
                                            <span className="text-xs font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{log.waktu}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* 5. VIEW LAPORAN: ARUS KAS KASIR */}
                    {activeMenu === 'kas kasir' && (
                        <div className="flex-1 p-5 overflow-y-auto bg-gray-50">
                            <h2 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">💵 Laporan Keluar Masuk Arus Kas Laci</h2>
                            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden text-xs">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-100 text-gray-500 font-bold border-b text-[11px] uppercase">
                                        <tr>
                                            <th className="p-3.5">Waktu</th>
                                            <th className="p-3.5">Deskripsi Mutasi</th>
                                            <th className="p-3.5">Tipe Kas</th>
                                            <th className="p-3.5">Kategori</th>
                                            <th className="p-3.5 text-right">Jumlah Uang</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y font-medium text-gray-600">
                                        {kasHistory.length === 0 ? (
                                            <tr><td colSpan="5" className="p-6 text-center text-gray-400 font-bold">Arus kas belum mencatat mutasi apapun.</td></tr>
                                        ) : (
                                            kasHistory.map((k) => (
                                                <tr key={k.id} className="hover:bg-gray-50">
                                                    <td className="p-3.5 font-mono text-gray-400">{k.waktu}</td>
                                                    <td className="p-3.5 font-bold text-gray-700">{k.nama}</td>
                                                    <td className="p-3.5">
                                                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${k.tipe === 'Uang Masuk' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{k.tipe}</span>
                                                    </td>
                                                    <td className="p-3.5 text-gray-400 font-bold uppercase text-[10px]">{k.kategori}</td>
                                                    <td className={`p-3.5 text-right font-black ${k.tipe === 'Uang Masuk' ? 'text-emerald-600' : 'text-red-600'}`}>{k.tipe === 'Uang Masuk' ? '+' : '-'}{formatRupiah(k.jumlah)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 6. VIEW LAPORAN: PRODUK TERJUAL */}
                    {activeMenu === 'produk terjual' && (
                        <div className="flex-1 p-5 overflow-y-auto bg-gray-50">
                            <h2 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">📦 Kuantitas Ringkasan Produk Terjual</h2>
                            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden text-xs">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-100 text-gray-500 font-bold border-b text-[11px] uppercase">
                                        <tr>
                                            <th className="p-3.5">Kode</th>
                                            <th className="p-3.5">Nama Item Produk</th>
                                            <th className="p-3.5 text-center">Qty Terjual</th>
                                            <th className="p-3.5 text-right">Total Akumulasi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y font-medium text-gray-600">
                                        {produkTerjualSummary.length === 0 ? (
                                            <tr><td colSpan="4" className="p-6 text-center text-gray-400 font-bold">Belum ada item produk terjual yang berhasil dibukukan.</td></tr>
                                        ) : (
                                            produkTerjualSummary.map((p, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="p-3.5 font-bold text-gray-400 uppercase font-mono">{p.code}</td>
                                                    <td className="p-3.5 font-bold text-gray-700">{p.name}</td>
                                                    <td className="p-3.5 text-center font-black bg-gray-50 text-gray-800">{p.qty} pcs</td>
                                                    <td className="p-3.5 text-right font-black text-emerald-600">{formatRupiah(p.total)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 7. VIEW LAPORAN: JENIS BAYAR METODE */}
                    {activeMenu === 'jenis bayar' && (
                        <div className="flex-1 p-5 overflow-y-auto bg-gray-50">
                            <h2 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">💳 Ringkasan Omset Berdasarkan Jenis Bayar</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(jenisBayarSummary).map(([metode, total]) => (
                                    <div key={metode} className="bg-white border rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                                        <div>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide block">Metode Pembayaran</span>
                                            <span className="text-xs font-black text-gray-700 block mt-0.5">{metode}</span>
                                        </div>
                                        <div className="mt-4 pt-2 border-t text-right">
                                            <span className="text-sm font-black text-emerald-600">{formatRupiah(total)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* POPUP MODAL 1: BUKA KASIR */}
            {bukaKasirModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-5 text-center shadow-xl">
                        <h3 className="font-black text-sm uppercase">Mulai Sesi Buka Kasir</h3>
                        <p className="text-[11px] text-gray-400 mt-1">Masukkan nominal uang modal awal laci hari ini.</p>
                        <form onSubmit={handleBukaKasir} className="mt-4 text-left space-y-3">
                            <input type="number" required placeholder="Contoh: 500000" value={modalAwal} onChange={e => setModalAwal(e.target.value)} className="w-full bg-gray-50 border p-2.5 rounded-xl text-xs font-bold focus:outline-none"/>
                            <button type="submit" className="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold uppercase">Buka Kasir & Mulai</button>
                        </form>
                    </div>
                </div>
            )}

            {/* POPUP MODAL 2: TUTUP KASIR DIALOG */}
            {tutupKasirModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl text-center space-y-3">
                        <h3 className="font-black text-sm uppercase text-red-600">🛑 Tutup Sesi Kasir</h3>
                        <p className="text-[11px] text-gray-400">Laporkan total uang fisik yang ada di dalam laci kasir saat ini.</p>
                        <div className="text-left pt-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Total Uang Fisik Laci</label>
                            <input type="number" placeholder="0" value={inputCashFisik} onChange={e => setInputCashFisik(e.target.value)} className="w-full bg-gray-50 border p-2 rounded-xl text-xs font-black focus:outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-3">
                            <button type="button" onClick={() => setTutupKasirModal(false)} className="bg-gray-100 border text-gray-600 rounded-xl py-2 text-xs font-bold">Batal</button>
                            <button type="button" onClick={handleTutupKasirFinal} className="bg-red-600 text-white rounded-xl py-2 text-xs font-black uppercase">Tutup Sesi</button>
                        </div>
                    </div>
                </div>
            )}

            {/* POPUP MODAL 3: DAFTAR ORDER GANTUNG */}
            {openDaftarOrderModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-xl text-xs">
                        <div className="flex justify-between items-center border-b pb-2 mb-3">
                            <h3 className="font-black text-sm uppercase">📋 Daftar Transaksi Gantung</h3>
                            <button onClick={() => setOpenDaftarOrderModal(false)} className="text-gray-400 font-bold text-sm">✕</button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {savedOrders.length === 0 ? (
                                <p className="text-center text-gray-400 py-8">Tidak ada pesanan yang disimpan.</p>
                            ) : (
                                savedOrders.map(order => (
                                    <div key={order.id} className="p-3 bg-gray-50 border rounded-xl flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-gray-800">Pelanggan: {order.customer}</p>
                                            <p className="text-[10px] text-gray-400">{order.time} | {order.items.length} Macam Barang</p>
                                        </div>
                                        <button onClick={() => loadSavedOrder(order)} className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg text-[11px]">Buka Kembali</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* POPUP MODAL 4: SELEKSI PROMO */}
            {openPromoModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl text-xs">
                        <div className="flex justify-between items-center border-b pb-2 mb-3">
                            <h3 className="font-black text-sm uppercase">🎟️ Pilih Promo Toko</h3>
                            <button onClick={() => setOpenPromoModal(false)} className="text-gray-400 font-bold text-sm">✕</button>
                        </div>
                        <div className="space-y-2">
                            {availablePromos.map(promo => (
                                <button key={promo.id} onClick={() => { setSelectedPromo(promo); setOpenPromoModal(false); }} className="w-full text-left p-3 bg-gray-50 border rounded-xl hover:border-orange-500 transition block font-semibold text-gray-700">{promo.name}</button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* POPUP MODAL 5: SUKSES PEMBAYARAN */}
            {successModalOpen && lastInvoice && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl text-xs text-center space-y-4">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl mx-auto">✓</div>
                        <div>
                            <h3 className="font-black text-sm uppercase text-gray-800">Pembayaran Berhasil!</h3>
                            <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{lastInvoice.invoice}</p>
                        </div>
                        <div className="flex space-x-2 pt-2">
                            <button onClick={() => { setSuccessModalOpen(false); setCart([]); setLastInvoice(null); }} className="w-1/2 bg-gray-100 font-bold py-2.5 rounded-xl border text-gray-700 hover:bg-gray-200 transition">Kembali</button>
                            <button onClick={() => alert("Mengirim data cetak thermal...")} className="w-1/2 bg-emerald-600 text-white font-black py-2.5 rounded-xl uppercase tracking-wider shadow-md hover:bg-emerald-700 transition">🖨️ Cetak Struk</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}