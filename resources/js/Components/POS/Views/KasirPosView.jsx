import React, { useState } from 'react';

export default function KasirPosView({
    filteredProducts,
    searchQuery,
    setSearchQuery,
    cart,
    setCart,
    outlet_name,
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
    formatRupiah,
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
    const [modalType, setModalType] = useState('default');

    // Helper untuk mengelompokkan varian berdasarkan warna
    const getColorName = (color) => {
        if (!color) return 'Default';
        if (typeof color === 'string') return color;
        return color.nama || 'Default';
    };

    // Helper pemicu alert custom
    const showAlert = (msg) => {
        setCustomAlert({ isOpen: true, message: msg });
    };

    // Klik Produk -> Reset & Buka Modal Multi-Variasi
    const handleCardClick = (product) => {
    const kategori =
        product.category?.name?.toLowerCase();
    setSelectedProduct(product);
    if (kategori === 'kebaya') {
        setModalType('kebaya');
    }
    else if (kategori === 'kamen') {
        setModalType('kamen');
    }
    else {
        setModalType('default');
    }
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
            <div className="flex-1 overflow-y-auto pb-4 px-6 pt-6">
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
            // Menjumlahkan semua stock dari seluruh varian produk ini
            const totalStock = product.variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) || 0;

            return (
                <div
                    key={product.id}
                    onClick={() => handleCardClick(product)}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
                >
                    {/* FOTO */}
                    <div className="relative h-48 bg-slate-50">
                        {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-bold uppercase">No Image</div>
                        )}
                        <div className="absolute top-3 left-3">
                            <span className="bg-white/90 backdrop-blur px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                {product.category?.name || 'Produk'}
                            </span>
                        </div>
                    </div>

                    {/* INFO */}
                    <div className="p-3">
                        <h3 className="font-bold text-slate-800 text-xs uppercase line-clamp-2 min-h-[32px]">
                            {product.name}
                        </h3>
                        <div className="mt-3 flex items-end justify-between">
                            <div>
                                <div className="text-sm font-black text-[#009664]">{formatRupiah(product.price)}</div>
                                <div className={`text-[10px] font-bold ${totalStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    Stock: {totalStock}
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-[#009664] text-white flex items-center justify-center font-bold">
                                +
                            </div>
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl w-full max-w-2xl flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
            
            {/* HEADER */}
            <div className="p-6 border-b flex items-center gap-5 bg-white">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 overflow-hidden flex-shrink-0">
                    {selectedProduct.image ? (
                        <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-[9px] font-bold text-slate-400">FOTO</span>
                    )}
                </div>
                <div className="flex-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kategori: {selectedProduct.category?.name}</p>
                    <h2 className="text-lg font-black uppercase text-slate-800 leading-tight mt-1">{selectedProduct.name}</h2>
                    <p className="text-[#009664] font-black">{formatRupiah(selectedProduct.price)}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-xl font-black text-slate-400 hover:text-slate-800">✕</button>
            </div>

            {/* CONTENT */}
            <div className="p-6 overflow-y-auto flex-1 bg-[#f9f9f9]">
                {(() => {
                    const isKebaya = selectedProduct.category?.name?.toLowerCase().includes('kebaya');
                    
                    return isKebaya ? (
                        <div className="space-y-6">
                            {selectedProduct.variants?.map((v, i) => {
                                const colorObj = typeof v.color === 'string' ? JSON.parse(v.color) : v.color;
                                return (
                                    <div key={i} className="bg-white p-4 rounded-2xl border flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-slate-100 rounded-lg" />
                                            <div>
                                                <div className="font-black text-sm">{colorObj?.nama || 'Varian'}</div>
                                                <div className="text-[10px] text-slate-400">Stok: {v.stock ?? 0}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {['S','M','L','XL','XXL'].map(size => (
                                                <button key={size} className={`w-8 h-8 rounded-lg border text-[10px] font-bold ${v.size === size ? 'bg-[#009664] text-white' : 'bg-white'}`}>{size}</button>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="w-8 h-8 bg-slate-100 rounded-lg font-black">-</button>
                                            <span className="w-6 text-center font-black">1</span>
                                            <button className="w-8 h-8 bg-[#009664] text-white rounded-lg font-black">+</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {selectedProduct.variants?.map((v, i) => {
                                const colorObj = typeof v.color === 'string' ? JSON.parse(v.color) : v.color;
                                return (
                                    <div key={i} className="bg-white border rounded-2xl p-4 flex flex-col items-center">
                                        <div className="w-full h-24 bg-slate-100 rounded-xl mb-3" />
                                        <div className="font-black text-sm mb-1">{colorObj?.nama || 'Varian'}</div>
                                        <div className="text-[10px] text-slate-400 mb-2">Stok: {v.stock ?? 0}</div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <button className="w-8 h-8 bg-slate-100 rounded-lg font-black">-</button>
                                            <span className="w-6 text-center font-black">0</span>
                                            <button className="w-8 h-8 bg-[#009664] text-white rounded-lg font-black">+</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })()}
            </div>

            {/* FOOTER */}
            <div className="p-6 border-t bg-white grid grid-cols-2 gap-4">
                <button onClick={() => setIsModalOpen(false)} className="py-3 rounded-xl border font-bold text-slate-600">Cancel</button>
                <button onClick={() => setIsModalOpen(false)} className="py-3 rounded-xl bg-[#009664] font-black text-white">Tambah</button>
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