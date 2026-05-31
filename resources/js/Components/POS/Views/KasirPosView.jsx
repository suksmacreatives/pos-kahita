import React, { useState } from 'react';

export default function KasirPosView({
    filteredProducts,
    searchQuery,
    setSearchQuery,
    cart,
    setCart,
    savedBills,
    setSavedBills,
    customerName,
    setCustomerName,
    isCheckoutView,
    setIsCheckoutView,
    selectedPayment,
    setSelectedPayment,
    inputUangDiterima,
    setInputUangDiterima,
    subtotal,
    uangKembalian,
    handleProsesBayarFinal,
    formatRupiah
}) {
    // --- STATE MANAGEMENT VIEW KIRI ---
    // 'grid' = menampilkan produk, 'saved_list' = menampilkan tabel daftar belanja full-screen
    const [leftContentView, setLeftContentView] = useState('grid');

    // --- STATE POP-UP MULTI-VARIASI ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    // Menyimpan kombinasi pesanan dalam pop-up. Struktur: { "Warna-Ukuran": quantity }
    const [variantSelection, setVariantSelection] = useState({});

    // --- STATE CUSTOM DIALOG SYSTEM ---
    const [customAlert, setCustomAlert] = useState({ isOpen: false, message: '' });
    const [customConfirm, setCustomConfirm] = useState({ isOpen: false, message: '', onConfirm: null });

    // Master Data Variasi & Mock Foto
    const listWarna = [
        { name: 'Putih', image: null },
        { name: 'Hitam', image: null },
        { name: 'Mutiara', image: null },
        { name: 'Kuning', image: null },
        { name: 'Merah Manggis', image: null },
        { name: 'Biru Cendana', image: null }
    ];
    const listUkuran = ['S', 'M', 'L', 'XL', 'XXL'];

    // Helper pemicu alert custom
    const showAlert = (msg) => {
        setCustomAlert({ isOpen: true, message: msg });
    };

    // Klik Produk -> Reset & Buka Modal Multi-Variasi
    const handleCardClick = (product) => {
        setSelectedProduct(product);
        setVariantSelection({}); // Kosongkan pilihan variasi sebelumnya
        setIsModalOpen(true);
    };

    // Handler Tambah/Kurang Kuantitas Variasi di dalam Pop-up (- Angka +)
    const handleUpdateQuantityInModal = (warna, ukuran, delta) => {
        const key = `${warna}-${ukuran}`;
        const currentQty = variantSelection[key] || 0;
        const newQty = currentQty + delta;

        setVariantSelection(prev => {
            const updated = { ...prev };
            if (newQty <= 0) {
                delete updated[key];
            } else {
                updated[key] = newQty;
            }
            return updated;
        });
    };

    // Konfirmasi Multi-Variasi ke Keranjang Aktif (LOGIKANYA SUDAH DISELARASKAN)
    const handleKonfirmasiMultiVarian = () => {

    const keys = Object.keys(variantSelection);

    if (keys.length === 0) {
        showAlert('Silakan tentukan jumlah pada variasi warna & ukuran terlebih dahulu!');
        return;
    }

    const newItems = [];

    keys.forEach(key => {

        const [warna, ukuran] = key.split('-');

        const qty = variantSelection[key];

        newItems.push({
    cart_id:
        `${selectedProduct.id}-${warna}-${ukuran}-${Date.now()}-${Math.random()}`,

    product_id: selectedProduct.id,

    variant_color: warna,
    variant_size: ukuran,

    id: selectedProduct.id,

    name: selectedProduct.name,

    customName: selectedProduct.name,

    price: selectedProduct.price,

    varianWarna: warna,

    varianUkuran: ukuran,

    quantity: qty
});
    });

    setCart(prev => [...prev, ...newItems]);

    setIsModalOpen(false);
};

    // FUNGSI SIMPAN BILL (Dipicu dari tombol Simpan Bill kanan)
    const handleSimpanBillAction = () => {
        if (cart.length === 0) return;

        const nameForBill = customerName.trim() || `Pelanggan ${savedBills.length + 1}`;
        const newBill = {
            id: Date.now(),
            customerName: nameForBill,
            items: [...cart],
            total: subtotal
        };

        setSavedBills([...savedBills, newBill]);
        setCart([]);
        setCustomerName('');
        showAlert(`Belanjaan "${nameForBill}" dialihkan ke Daftar Belanja.`);
    };

    // FUNGSI RECALL BILL (Mengembalikan baris tabel terklik ke Box Pembayaran)
    const handleRecallBill = (bill) => {
        if (cart.length > 0) {
            setCustomConfirm({
                isOpen: true,
                message: 'Keranjang aktif tidak kosong. Simpan keranjang aktif saat ini ke daftar antrean?',
                onConfirm: (userConfirmed) => {
                    if (userConfirmed) {
                        const temporaryBill = {
                            id: Date.now() + 99,
                            customerName: customerName.trim() || 'Pelanggan Umum',
                            items: [...cart],
                            total: subtotal
                        };
                        setSavedBills(prev => [temporaryBill, ...prev.filter(b => b.id !== bill.id)]);
                    } else {
                        setSavedBills(savedBills.filter(b => b.id !== bill.id));
                    }
                    setCart(bill.items);
                    setCustomerName(bill.customerName);
                    setLeftContentView('grid');
                    setCustomConfirm({ isOpen: false, message: '', onConfirm: null });
                }
            });
        } else {
            setSavedBills(savedBills.filter(b => b.id !== bill.id));
            setCart(bill.items);
            setCustomerName(bill.customerName);
            setLeftContentView('grid');
        }
    };

    return (
        <div className="flex-1 flex h-full overflow-hidden w-full bg-[#f4f6f9]">
            
            {/* =========================================================================
                AREA KIRI: KONDISIONAL SCREEN (GRID PRODUK / TABEL DAFTAR BELANJA FULL)
               ========================================================================= */}
            <div className="flex-1 flex flex-col h-full p-4 overflow-hidden">
                
                {/* TAMPILAN SCREEN 1: GRID PRODUK UTAMA */}
                {leftContentView === 'grid' && (
                    <>
                        <div className="mb-4 flex-shrink-0">
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
                                <input 
                                    type="text"
                                    placeholder="Cari nama barang..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border border-gray-200 pl-9 pr-4 py-2.5 rounded-xl text-xs font-medium focus:outline-none focus:border-[#009664] transition shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pb-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                                {filteredProducts.map((product) => (
                                    <div 
                                        key={product.id}
                                        onClick={() => handleCardClick(product)}
                                        className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col justify-between cursor-pointer hover:border-[#009664] hover:shadow-md transition group h-44"
                                    >
                                        <div className="w-full h-24 bg-[#f4f6f9] rounded-xl flex items-center justify-center mb-3 text-gray-300 font-bold text-xs group-hover:bg-emerald-50 group-hover:text-[#009664] transition uppercase">
                                            FOTO KATEGORI
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-700 tracking-wide line-clamp-1">{product.name}</h3>
                                            <span className="text-xs font-bold text-[#009664] block mt-0.5">{formatRupiah(product.price)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* TAMPILAN SCREEN 2: TABEL DAFTAR BELANJA FULL SCREEN */}
                {leftContentView === 'saved_list' && (
                    <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-150">
                        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                            <div className="flex items-center space-x-2">
                                <span className="text-base">📋</span>
                                <h2 className="text-xs font-black text-gray-800 uppercase tracking-wider">Manajemen Tabel Daftar Belanja Tersimpan</h2>
                            </div>
                            <button 
                                onClick={() => setLeftContentView('grid')}
                                className="bg-[#009664] text-white font-bold px-3 py-1.5 rounded-xl text-[11px] hover:bg-emerald-700 transition flex items-center space-x-1"
                            >
                                <span>⬅</span> <span>Kembali ke Katalog Produk</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-gray-100/70 border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                                        <th className="p-4">Nama Pelanggan</th>
                                        <th className="p-4">Rincian Item & Variasi Kategori</th>
                                        <th className="p-4 text-right">Total Tagihan</th>
                                        <th className="p-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                                    {savedBills.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-gray-400 font-semibold italic">
                                                Tidak ada antrean daftar belanja yang disimpan saat ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        savedBills.map((bill) => (
                                            <tr 
                                                key={bill.id}
                                                onClick={() => handleRecallBill(bill)}
                                                className="hover:bg-emerald-50/40 cursor-pointer transition"
                                            >
                                                <td className="p-4 font-black text-gray-800 uppercase">{bill.customerName}</td>
                                                <td className="p-4 text-gray-500 max-w-xs truncate">
                                                    {bill.items.map(item => `${item.customName} (${item.varianWarna}/${item.varianUkuran}) x${item.quantity || 1}`).join(', ')}
                                                </td>
                                                <td className="p-4 text-right font-black text-[#009664]">{formatRupiah(bill.total)}</td>
                                                <td className="p-4 text-center">
                                                    <span className="bg-amber-100 text-amber-700 font-bold px-2.5 py-1 rounded-full text-[10px]">Buka & Bayar ➜</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* =========================================================================
                AREA KANAN: BOX PEMBAYARAN UTAMA
               ========================================================================= */}
            <div className="w-96 bg-white border-l border-gray-200 h-full flex flex-col flex-shrink-0 shadow-xl z-10">
                {!isCheckoutView ? (
                    <>
                        {/* BOX TOMBOL TOGGLE DAFTAR BELANJA */}
                        <div className="p-3 border-b border-gray-200 bg-gray-50 flex flex-col flex-shrink-0">
                            <button
                                type="button"
                                onClick={() => setLeftContentView(leftContentView === 'grid' ? 'saved_list' : 'grid')}
                                className={`w-full border p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition shadow-sm ${
                                    leftContentView === 'saved_list' 
                                        ? 'border-[#009664] bg-emerald-50 text-[#009664]' 
                                        : 'bg-white border-gray-200 hover:border-[#009664] text-gray-700'
                                }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <span>{leftContentView === 'saved_list' ? '🏷️ Lihat Produk' : '📋 Lihat Daftar Belanja'}</span>
                                    <span className="text-[11px] font-black">{leftContentView === 'saved_list' ? 'Tampilkan Katalog' : 'Buka List Tabel'}</span>
                                </div>
                                <span className="bg-amber-500 text-white font-black px-2.5 py-0.5 rounded-full text-[10px]">
                                    {savedBills.length}
                                </span>
                            </button>
                        </div>

                        {/* Input Nama Pelanggan */}
                        <div className="p-4 border-b border-gray-100 flex-shrink-0 bg-gray-50/30">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Nama Pelanggan</label>
                            <input 
                                type="text"
                                placeholder="Umum / Tulis nama pelanggan..."
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs font-bold focus:outline-none focus:border-[#009664]"
                            />
                        </div>

                        {/* Keranjang Belanja Aktif */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 font-medium text-xs">
                                    <span className="text-2xl mb-1">🛒</span>
                                    <p className="font-semibold text-gray-400">Keranjang masih kosong</p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.cart_id || item.id} className="flex justify-between items-center text-xs border-b border-gray-100 pb-3 group">
                                        <div className="flex-1 pr-2">
                                            <h4 className="font-bold text-gray-800 uppercase tracking-wide">{item.customName || item.name}</h4>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {item.varianWarna && <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[9px] font-bold">{item.varianWarna}</span>}
                                                {item.varianUkuran && <span className="bg-emerald-50 text-[#009664] px-1.5 py-0.5 rounded text-[9px] font-bold">Size: {item.varianUkuran}</span>}
                                            </div>
                                        <span className="text-gray-400 text-[10px] font-semibold block mt-1">{item.quantity} x {formatRupiah(item.price)}</span>                                        </div>
                                        <div className="text-right flex items-center gap-2">
                                        <span className="font-black text-gray-700">
                                            {formatRupiah(item.price * item.quantity)}
                                        </span>

                                        <button
                                            onClick={() =>
                                                setCart(cart.filter(i => i.cart_id !== item.cart_id))
                                            }
                                            className="text-red-400 hover:text-red-600 font-bold p-1 opacity-0 group-hover:opacity-100 transition"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* PANEL ACTIONS */}
                        <div className="border-t border-gray-100 p-4 bg-white flex-shrink-0 space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-gray-400 uppercase">Total Tagihan</span>
                                <span className="text-base font-black text-gray-800">{formatRupiah(subtotal)}</span>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <button type="button" onClick={() => setCart([])} disabled={cart.length === 0} className="flex flex-col items-center justify-center p-2 rounded-xl border border-red-100 bg-red-50/30 text-red-500 hover:bg-red-50 transition disabled:opacity-40">
                                    <span className="text-sm">🗑️</span>
                                    <span className="text-[9px] font-bold mt-0.5">Clear</span>
                                </button>
                                <button type="button" onClick={() => showAlert('Konfigurasi modul promo dapat diakses melalui Backoffice.')} className="flex flex-col items-center justify-center p-2 rounded-xl border border-amber-100 bg-amber-50/30 text-amber-600 hover:bg-amber-50 transition">
                                    <span className="text-sm">🎟️</span>
                                    <span className="text-[9px] font-bold mt-0.5">Promo</span>
                                </button>
                                <button type="button" onClick={handleSimpanBillAction} disabled={cart.length === 0} className="flex flex-col items-center justify-center p-2 rounded-xl border border-blue-100 bg-blue-50/30 text-blue-600 hover:bg-blue-50 transition disabled:opacity-40">
                                    <span className="text-sm">💾</span>
                                    <span className="text-[9px] font-bold mt-0.5">Simpan Bill</span>
                                </button>
                            </div>

                            <button disabled={cart.length === 0} onClick={() => setIsCheckoutView(true)} className="w-full bg-[#009664] disabled:bg-gray-300 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-md uppercase tracking-wide">
                                Lanjutkan Pembayaran
                            </button>
                        </div>
                    </>
                ) : (
                    /* VIEW PROSES CHECKOUT TRANSAKSI */
                    <>
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                            <span className="text-xs font-black text-gray-800 uppercase">Metode Pembayaran</span>
                            <button onClick={() => setIsCheckoutView(false)} className="text-[11px] font-bold text-gray-400 hover:text-gray-600">Kembali</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                {['Tunai', 'QRIS', 'Debit', 'Kredit'].map((method) => (
                                    <button
                                        key={method}
                                        type="button"
                                        onClick={() => setSelectedPayment(method)}
                                        className={`p-2.5 text-xs font-bold rounded-xl border text-center transition ${selectedPayment === method ? 'border-[#009664] bg-emerald-50 text-[#009664]' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                                    >
                                        {method === 'Tunai' ? '💵 ' : method === 'QRIS' ? '📱 ' : '💳 '}{method}
                                    </button>
                                ))}
                            </div>
                            {selectedPayment === 'Tunai' && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Uang yang Diterima</label>
                                    <input type="number" placeholder="Jumlah uang..." value={inputUangDiterima} onChange={(e) => setInputUangDiterima(e.target.value)} className="w-full bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-lg text-xs font-black focus:outline-none focus:bg-white focus:border-[#009664]"/>
                                </div>
                            )}
                            <div className="bg-gray-50 p-3 rounded-xl space-y-2 border border-gray-100 text-[11px] font-bold">
                                <div className="flex justify-between text-gray-500"><span>Total Belanja:</span><span>{formatRupiah(subtotal)}</span></div>
                                <div className="flex justify-between text-emerald-600"><span>Kembalian:</span><span>{formatRupiah(uangKembalian)}</span></div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50/60 flex-shrink-0">
                            <button onClick={handleProsesBayarFinal} className="w-full bg-[#009664] hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md">Selesaikan Transaksi</button>
                        </div>
                    </>
                )}
            </div>

            {/* =========================================================================
                POP-UP MODAL MULTI-VARIASI (+ ANGKA -)
               ========================================================================= */}
            {isModalOpen && selectedProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden text-xs font-medium animate-in fade-in zoom-in-95 duration-150 flex flex-col h-[85vh]">
                        
                        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                            <div>
                                <span className="text-[10px] uppercase font-black tracking-wider text-gray-400">Pilih Banyak Variasi & Jumlah Sekaligus</span>
                                <h3 className="text-base font-black text-gray-800 uppercase tracking-wide mt-0.5">{selectedProduct.name} - <span className="text-[#009664]">{formatRupiah(selectedProduct.price)}</span></h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 font-bold text-lg px-2">✕</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {listWarna.map((warna) => (
                                    <div key={warna.name} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col space-y-3">
                                        <div className="flex items-center space-x-3 border-b border-gray-100 pb-2">
                                            <div className="w-12 h-12 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center font-bold text-[9px] text-gray-400 uppercase text-center flex-shrink-0">
                                                FOTO VARIAN
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-800 text-xs uppercase tracking-wide">{warna.name}</h4>
                                                <p className="text-[10px] text-gray-400 font-semibold">Tentukan jumlah per-ukuran:</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-1">
                                            {listUkuran.map((ukuran) => {
                                                const key = `${warna.name}-${ukuran}`;
                                                const currentQty = variantSelection[key] || 0;

                                                return (
                                                    <div key={ukuran} className="flex items-center justify-between bg-gray-50 border border-gray-100 p-2 rounded-lg">
                                                        <span className="font-black text-gray-700 text-[11px]">Size {ukuran}</span>
                                                        
                                                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleUpdateQuantityInModal(warna.name, ukuran, -1)}
                                                                className="w-7 h-7 flex items-center justify-center font-bold text-gray-500 hover:bg-red-50 hover:text-red-500 border-r border-gray-200 transition"
                                                            >
                                                                -
                                                            </button>
                                                            <div className={`w-8 h-7 flex items-center justify-center font-black text-xs ${currentQty > 0 ? 'text-[#009664] bg-emerald-50/50' : 'text-gray-400'}`}>
                                                                {currentQty}
                                                            </div>
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleUpdateQuantityInModal(warna.name, ukuran, 1)}
                                                                className="w-7 h-7 flex items-center justify-center font-bold text-gray-500 hover:bg-emerald-50 hover:text-[#009664] border-l border-gray-200 transition"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
                            <div className="text-xs text-gray-400 font-bold">
                                Total Varian Terpilih: <span className="text-gray-800 font-black">{Object.values(variantSelection).reduce((a, b) => a + b, 0)} Pcs</span>
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition">Batal</button>
                                <button type="button" onClick={handleKonfirmasiMultiVarian} className="px-6 py-2 bg-[#009664] hover:bg-emerald-700 text-white rounded-xl font-black shadow-md transition uppercase tracking-wide">Masukkan Ke Keranjang</button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* =========================================================================
                CUSTOM SYSTEM COMPONENT: CHROMELESS MINIMALIST DIALOGS (ALERT & CONFIRM)
               ========================================================================= */}
            {customAlert.isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-100">
                    <div className="bg-white border border-slate-200 max-w-sm w-full rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-xs font-sans tracking-tight animate-in zoom-in-95 duration-100">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notifikasi Sistem</span>
                            <p className="text-slate-700 font-semibold text-xs leading-relaxed">{customAlert.message}</p>
                        </div>
                        <button 
                            type="button" 
                            onClick={() => setCustomAlert({ isOpen: false, message: '' })} 
                            className="w-full bg-[#009664] hover:bg-emerald-700 text-white font-bold py-2 rounded-xl transition text-center uppercase tracking-wider"
                        >
                            Mengerti
                        </button>
                    </div>
                </div>
            )}

            {customConfirm.isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-100">
                    <div className="bg-white border border-slate-200 max-w-sm w-full rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-xs font-sans tracking-tight animate-in zoom-in-95 duration-100">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Konfirmasi Antrean</span>
                            <p className="text-slate-700 font-semibold text-xs leading-relaxed">{customConfirm.message}</p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                type="button" 
                                onClick={() => customConfirm.onConfirm(false)} 
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2 rounded-xl transition text-center uppercase tracking-wider"
                            >
                                Abaikan
                            </button>
                            <button 
                                type="button" 
                                onClick={() => customConfirm.onConfirm(true)} 
                                className="flex-1 bg-[#009664] hover:bg-emerald-700 text-white font-bold py-2 rounded-xl transition text-center uppercase tracking-wider"
                            >
                                Simpan Dulu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}