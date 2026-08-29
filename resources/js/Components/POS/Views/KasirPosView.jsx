import React, { useState } from 'react';

export default function KasirPosView({
    promos = [],
    selectedPromo,
    setSelectedPromo,
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
    nilaiDiskon,
    totalSetelahDiskon,
    uangKembalian,
    handleProsesBayarFinal,
    formatRupiah,
    isSidebarOpen,
}) {
    
    // --- STATE MANAGEMENT VIEW KIRI ---
    // 'grid' = menampilkan produk, 'saved_list' = menampilkan tabel daftar belanja full-screen
    const [leftContentView, setLeftContentView] = useState('grid');

    const [showPromoModal, setShowPromoModal] = useState(false);
    

    // --- STATE POP-UP MULTI-VARIASI ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    
    // Menyimpan kombinasi pesanan dalam pop-up. Struktur: { "Warna-Ukuran": quantity }
    const [variantSelection, setVariantSelection] = useState({});
    
    // --- STATE CUSTOM DIALOG SYSTEM ---
    const [customAlert, setCustomAlert] = useState({ isOpen: false, message: '' });
    const [customConfirm, setCustomConfirm] = useState({ isOpen: false, message: '', onConfirm: null });
    const [modalType, setModalType] = useState('default');
    React.useEffect(() => {
        if (isModalOpen && selectedProduct?.variants?.length > 0) {
            const firstV = selectedProduct.variants[0];
            const colorName = typeof firstV.color === 'string' ? firstV.color : firstV.color?.nama;
            setSelectedColor(colorName);
            setSelectedSize(firstV.size);
        }
    }, [isModalOpen, selectedProduct]);

    const currentVariant = selectedProduct?.variants?.find(v => {
    const colorName = typeof v.color === 'string' ? v.color : v.color?.nama;
    return colorName === selectedColor && v.size === selectedSize;
    });

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
        if (!product) return; 
        setSelectedProduct(product);
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

    // 1. Buat array item baru
    const newItems = keys.map(key => {
        const [warna, ukuran] = key.split('-');
        const qty = variantSelection[key];
        
        
        return {
            cart_id: `${selectedProduct.id}-${warna}-${ukuran}-${Date.now()}-${Math.random()}`,
            product_id: selectedProduct.id,
            variant_color: warna,
            variant_size: ukuran,
            id: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            varianWarna: warna,
            varianUkuran: ukuran,
            quantity: qty
        };
    });

    // 2. Update state dengan fungsi updater (prev)
    // Ini memastikan kita selalu menggunakan data terbaru dari Index.jsx
    setCart(prevCart => {
        const updatedCart = [...prevCart, ...newItems];
        console.log("DEBUG: Berhasil menambahkan ke cart, total item sekarang:", updatedCart.length);
        return updatedCart;
    });

    // 3. PENTING: Reset state modal agar tidak "nyangkut" untuk produk berikutnya
    setVariantSelection({});
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
    // 1. Jika keranjang kosong, langsung proses tanpa konfirmasi
    if (cart.length === 0) {
        processRecall(bill);
        return;
    }

    // 2. Jika keranjang ada isinya, munculkan konfirmasi
    setCustomConfirm({
        isOpen: true,
        message: 'Keranjang aktif tidak kosong. Simpan keranjang aktif saat ini ke daftar antrean?',
        onConfirm: (userConfirmed) => {
            if (userConfirmed) {
                // Simpan cart yang sekarang ke savedBills
                const temporaryBill = {
                    id: Date.now(),
                    customerName: customerName.trim() || 'Pelanggan Umum',
                    items: [...cart],
                    total: subtotal
                };
                setSavedBills(prev => [temporaryBill, ...prev]);
            }
            
            // Proses pengambilan bill yang dipilih
            processRecall(bill);
            
            // Tutup konfirmasi
            setCustomConfirm({ isOpen: false, message: '', onConfirm: null });
        }
    });
};

// Helper function untuk menghindari duplikasi kode
const processRecall = (bill) => {
    setCart([...bill.items]); 
    setCustomerName(bill.customerName);
    setSavedBills(prev => prev.filter(b => b.id !== bill.id));
    setLeftContentView('grid');
    setIsCheckoutView(false); 
};
const handleRemoveCartItem = (cartId) => {
    setCart(prev =>
        prev.filter(item => item.cart_id !== cartId)
    );
};


    return (
        <div className="flex-1 flex h-full overflow-hidden w-full bg-[#f4f6f9]">
            
            {/* =========================================================================
                AREA KIRI: KONDISIONAL SCREEN (GRID PRODUK / TABEL DAFTAR BELANJA FULL)
               ========================================================================= */}
<div className="flex-1 overflow-y-auto pb-4 px-6 pt-6">

    {leftContentView === 'grid' ? (
        <>
        {/* =========================
            SEARCH PRODUK
        ========================== */}
        <div className="mb-5">
            <div className="relative max-w-xl">

                {/* Icon Search */}
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                        className="w-5 h-5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z"
                        />
                    </svg>
                </div>

                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) =>
                        setSearchQuery(e.target.value)
                    }
                    placeholder="Cari nama produk..."
                    className="
                        w-full
                        pl-11
                        pr-10
                        py-3
                        bg-white
                        border
                        border-slate-200
                        rounded-xl
                        text-sm
                        text-slate-700
                        outline-none
                        focus:border-[#009664]
                        focus:ring-2
                        focus:ring-[#009664]/10
                        transition
                    "
                />

                {/* Tombol Clear */}
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="
                            absolute
                            inset-y-0
                            right-0
                            pr-4
                            flex
                            items-center
                            text-slate-400
                            hover:text-slate-700
                        "
                    >
                        ✕
                    </button>
                )}

            </div>

            {/* Info hasil pencarian */}
            <div className="mt-2 text-xs text-slate-400">
                {searchQuery ? (
                    <>
                        Menampilkan{" "}
                        <span className="font-bold text-slate-600">
                            {filteredProducts.length}
                        </span>{" "}
                        produk untuk "{searchQuery}"
                    </>
                ) : (
                    <>
                        <span className="font-bold text-slate-600">
                            {filteredProducts.length}
                        </span>{" "}
                        produk tersedia
                    </>
                )}
            </div>
        </div>

        <div
    className={`grid gap-4 ${
        isSidebarOpen
            ? 'grid-cols-2'
            : 'grid-cols-3'
    }`}
>
            {filteredProducts.map((product) => {

                const totalStock =
                    product.variants?.reduce(
                        (sum, v) => sum + (Number(v.stock) || 0),
                        0
                    ) || 0;

                return (
                    <div
                        key={product.id}
                        onClick={() => handleCardClick(product)}
                        className=" bg-white rounded-sm overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
                    >
                        <div className="relative aspect-square bg-slate-50 border-b border-slate-200">
                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-bold uppercase">
                                    No Image
                                </div>
                            )}
                        </div>

                        <div className="p-3">
                            <h3
                                className="
                                    font-bold
                                    text-slate-800
                                    text-xs
                                    uppercase
                                    leading-5
                                    line-clamp-2
                                    min-h-[40px]
                                "
                            >
                                {product.name}
                            </h3>

                            <div className="mt-3 flex items-end justify-between">
                                <div>
                                    <div className="text-sm font-black text-[#009664]">
                                        {formatRupiah(product.price)}
                                    </div>

                                    <div
                                        className={`text-[10px] font-bold ${
                                            totalStock > 0
                                                ? 'text-green-600'
                                                : 'text-red-500'
                                        }`}
                                    >
                                        Stock: {totalStock}
                                    </div>
                                </div>

                                <div className="w-9 h-9 border border-[#009664] text-[#009664] flex items-center justify-center font-bold rounded-sm hover:bg-[#009664] hover:text-white transition-all">
                                    +
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
</>
    ) : (

        <div className="bg-white rounded-l border border-slate-200 shadow-sm overflow-hidden">

    {/* HEADER */}
    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">

        <div>
            <h2 className="text-lg font-black text-slate-800">
                Daftar Belanja Tersimpan
            </h2>

            <p className="text-xs text-slate-500 mt-1">
                Klik salah satu bill untuk memanggil kembali transaksi.
            </p>
        </div>

        <div className="text-right">
            <div className="text-2xl font-black text-[#009664]">
                {savedBills.length}
            </div>

            <div className="text-[11px] text-slate-400">
                Antrean
            </div>
        </div>

    </div>

    {savedBills.length === 0 ? (

        <div className="py-24 text-center">

            <div className="text-5xl mb-4">
                🧾
            </div>

            <h3 className="font-bold text-slate-700">
                Belum Ada Bill Tersimpan
            </h3>

            <p className="text-sm text-slate-400 mt-2">
                Bill yang disimpan akan muncul di sini.
            </p>

            <div className="mt-8">
                <button
                    type="button"
                    onClick={() => setLeftContentView('grid')}
                    className="px-5 py-2.5 rounded-l bg-[#009664] text-white text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
                >
                    ← Kembali ke Produk
                </button>
            </div>

        </div>

    ) : (

        <div className="flex flex-col">

            <div className="overflow-x-auto">

                <table className="w-full">

                    <thead className="bg-slate-50 border-b border-slate-200">

                        <tr className="text-[11px] uppercase tracking-wider text-slate-500">

                            <th className="text-left px-5 py-4">
                                No
                            </th>

                            <th className="text-left px-5 py-4">
                                Pelanggan
                            </th>

                            <th className="text-left px-5 py-4">
                                Ringkasan Produk
                            </th>

                            <th className="text-center px-5 py-4">
                                Qty Item
                            </th>

                            <th className="text-right px-5 py-4">
                                Total
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {savedBills.map((bill, index) => (

                            <tr
                                key={bill.id}
                                onClick={() => handleRecallBill(bill)}
                                className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition"
                            >

                                <td className="px-5 py-4 font-bold text-slate-500">
                                    {index + 1}
                                </td>

                                <td className="px-5 py-4">
                                    <div className="font-bold text-slate-800">
                                        {bill.customerName}
                                    </div>
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-600">

                                    {bill.items
                                        .slice(0, 2)
                                        .map(item => item.name || item.customName)
                                        .join(', ')}

                                    {bill.items.length > 2 &&
                                        ` +${bill.items.length - 2} lainnya`}

                                </td>

                                <td className="px-5 py-4 text-center font-semibold text-slate-700">
                                    {bill.items.length}
                                </td>

                                <td className="px-5 py-4 text-right font-black text-[#009664]">
                                    {formatRupiah(bill.total)}
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            {/* FOOTER */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">

                <button
                    type="button"
                    onClick={() => setLeftContentView('grid')}
                    className="px-5 py-2.5 rounded-l bg-[#009664] text-white text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
                >
                    ← Kembali ke Produk
                </button>

            </div>

        </div>

    )}

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
                                onClick={() =>
                                    setLeftContentView(
                                        leftContentView === 'grid'
                                            ? 'saved_list'
                                            : 'grid'
                                    )
                                }
                                className={`w-full border p-2.5 rounded-l flex items-center justify-between text-xs font-bold transition shadow-sm ${
                                    leftContentView === 'saved_list' 
                                        ? 'border-[#009664] bg-emerald-50 text-[#009664]' 
                                        : 'bg-white border-gray-200 hover:border-[#009664] text-gray-700'
                                }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <span>📋 Daftar Belanja</span>
                                    <span className="text-[11px] font-black">
                                        Lihat Antrean
                                    </span>
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
                                className="w-full bg-white border border-gray-200 px-3 py-2 rounded-l text-xs font-bold focus:outline-none focus:border-[#009664]"
                            />
                        </div>

                        {/* Keranjang Belanja Aktif */}
<div className="flex-1 overflow-y-auto p-4 space-y-3">    
    {cart && cart.length > 0 ? (
        cart.map((item, index) => (
            
            <div
    key={item.cart_id || index}
    className="flex justify-between items-center text-xs border-b border-gray-100 pb-3"
>
    <div className="flex-1">
        <p className="font-bold">{item.name || item.customName}</p>

        <div className="flex gap-1 mt-1">
            {item.varianWarna && (
                <span className="bg-gray-100 px-1 rounded">
                    {item.varianWarna}
                </span>
            )}

            {item.varianUkuran &&
            item.varianUkuran !== 'null' &&
            item.varianUkuran !== 'NULL' &&
            item.varianUkuran !== '-' && (
                <span className="bg-emerald-50 px-1 rounded">
                    Size: {item.varianUkuran}
                </span>
            )}
        </div>
    </div>

    <div className="text-right mr-3">
        <p className="font-bold">
            {formatRupiah(item.price * item.quantity)}
        </p>

        <p className="text-[10px] text-gray-400">
            Qty: {item.quantity}
        </p>
    </div>

    <button
    type="button"
    onClick={() => handleRemoveCartItem(item.cart_id)}
    className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-500 font-bold flex items-center justify-center transition"
>
    ✕
</button>
</div>
        ))
    ) : (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs">
            <span>🛒 Keranjang kosong</span>
        </div>
    )}
</div>

                        {/* PANEL ACTIONS */}
                        <div className="border-t border-gray-100 p-4 bg-white flex-shrink-0 space-y-3">
                            {selectedPromo && (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs">

        <div className="flex justify-between items-start">

            <div>
                <div className="font-bold text-emerald-700">
                    Promo Aktif
                </div>

                <div className="mt-1">
                    {selectedPromo.nama_promo}
                </div>
            </div>

            <button
                type="button"
                onClick={() => setSelectedPromo(null)}
                className="w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center font-bold"
                title="Batalkan Promo"
            >
                ✕
            </button>

        </div>

        <div className="flex justify-between items-center text-xs text-red-500 font-bold mt-2">
            <span>Potongan Promo</span>
            <span>- {formatRupiah(nilaiDiskon)}</span>
        </div>

    </div>
)}
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-gray-400 uppercase">Total Tagihan</span>
                                <span className="text-base font-black text-gray-800">{formatRupiah(totalSetelahDiskon)}</span>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <button type="button" onClick={() => setCart([])} disabled={cart.length === 0} className="flex flex-col items-center justify-center p-2 rounded-l border border-red-100 bg-red-50/30 text-red-500 hover:bg-red-50 transition disabled:opacity-40">
                                    <span className="text-sm">🗑️</span>
                                    <span className="text-[9px] font-bold mt-0.5">Clear</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPromoModal(true)}
                                    className="flex flex-col items-center justify-center p-2 rounded-l border border-amber-100 bg-amber-50/30 text-amber-600 hover:bg-amber-50 transition"
                                >
                                    <span className="text-sm">🎟️</span>
                                    <span className="text-[9px] font-bold mt-0.5">
                                        Promo
                                    </span>
                                </button>
                                <button type="button" onClick={handleSimpanBillAction} disabled={cart.length === 0} className="flex flex-col items-center justify-center p-2 rounded-l border border-blue-100 bg-blue-50/30 text-blue-600 hover:bg-blue-50 transition disabled:opacity-40">
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
                                        className={`p-2.5 text-xs font-bold rounded-l border text-center transition ${selectedPayment === method ? 'border-[#009664] bg-emerald-50 text-[#009664]' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                                    >
                                        {method === 'Tunai' ? '💵 ' : method === 'QRIS' ? '📱 ' : '💳 '}{method}
                                    </button>
                                ))}
                            </div>
                            {selectedPayment === 'Tunai' && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Uang yang Diterima</label>
                                    <input 
                                        type="text" 
                                        placeholder="Jumlah uang..." 
                                        value={
                                            inputUangDiterima 
                                                ? String(inputUangDiterima).replace(/\B(?=(\d{3})+(?!\d))/g, ".") 
                                                : ""
                                        } 
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/\D/g, "");
                                            setInputUangDiterima(rawValue);
                                        }} 
                                        className="w-full bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-lg text-xs font-black focus:outline-none focus:bg-white focus:border-[#009664]"
                                    />
                                </div>
                            )}
                            <div className="bg-gray-50 p-3 rounded-xl space-y-2 border border-gray-100 text-[11px] font-bold">
                                <div className="flex justify-between text-gray-500">
    <span>Subtotal:</span>
    <span>{formatRupiah(subtotal)}</span>
</div>

{selectedPromo && (
    <div className="flex justify-between text-red-500">
        <span>Diskon:</span>
        <span>- {formatRupiah(nilaiDiskon)}</span>
    </div>
)}

<div className="flex justify-between font-black text-[#009664]">
    <span>Total Bayar:</span>
    <span>{formatRupiah(totalSetelahDiskon)}</span>
</div>
                                <div className="flex justify-between text-emerald-600"><span>Kembalian:</span><span>{formatRupiah(uangKembalian)}</span></div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50/60 flex-shrink-0">
                            <button onClick={handleProsesBayarFinal} className="w-full bg-[#009664] hover:bg-emerald-700 text-white font-bold py-2.5 rounded-l text-xs transition shadow-md">Selesaikan Transaksi</button>
                        </div>
                    </>
                )}
            </div>

            {/* =========================================================================
                POP-UP MODAL MULTI-VARIASI (+ ANGKA -)rounded-l
               ========================================================================= */}
{isModalOpen && selectedProduct && (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
        {customAlert.isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-100">
                    <div className="bg-white border border-slate-200 max-w-sm w-full rounded-l p-5 shadow-2xl flex flex-col gap-4 text-xs font-sans tracking-tight animate-in zoom-in-95 duration-100">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notifikasi Sistem</span>
                            <p className="text-slate-700 font-semibold text-xs leading-relaxed">{customAlert.message}</p>
                        </div>
                        <button 
                            type="button" 
                            onClick={() => setCustomAlert({ isOpen: false, message: '' })} 
                            className="w-full bg-[#009664] hover:bg-emerald-700 text-white font-bold py-2 rounded-l transition text-center uppercase tracking-wider"
                        >
                            Mengerti
                        </button>
                    </div>
                </div>
            )}
        <div className="bg-white rounded-t-l sm:rounded-l w-full max-w-lg flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-black text-slate-800">Pilih Varian</h2>
                <button onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-6">
                {/* 1. WARNA */}
                <div>
                    <p className="font-bold text-sm mb-2">Warna</p>
                    <div className="flex flex-wrap gap-2">
                        {Array.from(new Set(selectedProduct.variants?.map(v => typeof v.color === 'string' ? v.color : v.color?.nama))).map(c => (
                            <button 
                                key={c} 
                                onClick={() => { 
                                    setSelectedColor(c);
                                    // Reset ke size pertama yang tersedia untuk warna tersebut
                                    const firstSizeForColor = selectedProduct.variants.find(v => (typeof v.color === 'string' ? v.color : v.color?.nama) === c)?.size;
                                    setSelectedSize(firstSizeForColor);
                                }}
                                className={`px-4 py-2 rounded-l text-xs font-bold border-2 ${selectedColor === c ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}
                            >{c}</button>
                        ))}
                    </div>
                </div>

                {/* 2. UKURAN */}
                <div>
                    <p className="font-bold text-sm mb-2">Ukuran</p>
                    <div className="flex flex-wrap gap-2">
                        {selectedProduct.variants
                            .filter(v => (typeof v.color === 'string' ? v.color : v.color?.nama) === selectedColor)
                            .map(v => (
                                <button 
                                    key={v.id}
                                    onClick={() => setSelectedSize(v.size)}
                                    className={`px-4 py-2 rounded-l text-sm font-bold border-2 ${selectedSize === v.size ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}
                                >{v.size || 'All Size'}</button>
                            ))}
                    </div>
                </div>

                {/* 3. STOK & QTY */}
                {currentVariant && (
                    <div className="pt-4 border-t space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-600">
                                Stok: {currentVariant.stock}
                            </span>
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => handleUpdateQuantityInModal(selectedColor, selectedSize, -1)}
                                    className="w-10 h-10 rounded-full border bg-slate-50 font-black"
                                >-</button>
                                <span className="font-black w-8 text-center">
                                    {variantSelection[`${selectedColor}-${selectedSize}`] || 0}
                                </span>
                                <button 
                                    onClick={() => {
                                        const currentKey = `${selectedColor}-${selectedSize}`;
                                        const currentQty = variantSelection[currentKey] || 0;
                                        if (currentQty < currentVariant.stock) {
                                            handleUpdateQuantityInModal(selectedColor, selectedSize, 1);
                                        } else {
                                            showAlert("Stok tidak mencukupi!");
                                        }
                                    }}
                                    className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black"
                                >+</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t">
                <button 
                    onClick={handleKonfirmasiMultiVarian} 
                    disabled={!currentVariant || (variantSelection[`${selectedColor}-${selectedSize}`] || 0) === 0}
                    className="w-full py-4 bg-emerald-600 disabled:bg-gray-300 text-white font-black rounded-l"
                >
                    Tambah ke Keranjang
                </button>
            </div>
        </div>
    </div>
)}

            {/* =========================================================================
                CUSTOM SYSTEM COMPONENT: CHROMELESS MINIMALIST DIALOGS (ALERT & CONFIRM)
               ========================================================================= */}

            {customConfirm.isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-100">
                    <div className="bg-white border border-slate-200 max-w-sm w-full rounded-l p-5 shadow-2xl flex flex-col gap-4 text-xs font-sans tracking-tight animate-in zoom-in-95 duration-100">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Konfirmasi Antrean</span>
                            <p className="text-slate-700 font-semibold text-xs leading-relaxed">{customConfirm.message}</p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                type="button" 
                                onClick={() => customConfirm.onConfirm(false)} 
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2 rounded-l transition text-center uppercase tracking-wider"
                            >
                                Abaikan
                            </button>
                            <button 
                                type="button" 
                                onClick={() => customConfirm.onConfirm(true)} 
                                className="flex-1 bg-[#009664] hover:bg-emerald-700 text-white font-bold py-2 rounded-l transition text-center uppercase tracking-wider"
                            >
                                Simpan Dulu
                            </button>
                        </div>
                    </div>
                </div>
            )}
                {showPromoModal && (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
        <div className="bg-white rounded-l w-[500px] max-h-[80vh] overflow-hidden shadow-xl">

            <div className="px-5 py-4 border-b flex justify-between items-center">
                <h2 className="font-bold text-lg">
                    Daftar Promo Aktif
                </h2>

                <button
                    onClick={() => setShowPromoModal(false)}
                    className="text-red-500 font-bold"
                >
                    ✕
                </button>
            </div>

            <div className="p-4 max-h-[500px] overflow-y-auto">

                {promos.length === 0 ? (
                    <p className="text-center text-gray-400">
                        Tidak ada promo aktif
                    </p>
                ) : (
                    promos.map((promo) => (
                        <div
                            key={promo.id}
                            className="border rounded-l p-4 mb-3 hover:border-[#009664]"
                        >
                            <div className="font-bold">
                                {promo.nama_promo}
                            </div>

                            <div className="text-xs text-gray-500">
                                Kode: {promo.kode_promo}
                            </div>

                            <div className="text-sm mt-2">
                                {promo.tipe === 'persentase'
                                    ? `${promo.nilai_diskon}%`
                                    : formatRupiah(
                                          promo.nilai_diskon
                                      )}
                            </div>

                            <button
                                className="mt-3 px-3 py-1 rounded-l bg-[#009664] text-white text-xs"
                                onClick={() => {
                                    setSelectedPromo(promo);
                                    setShowPromoModal(false);
                                }}
                            >
                                Gunakan Promo
                            </button>
                        </div>
                    ))
                )}

            </div>

        </div>
    </div>
)}
        </div>
    );

}