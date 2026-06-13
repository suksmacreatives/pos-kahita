import React, { useState, useMemo, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import SidebarPos from '@/Components/POS/SidebarPos';

// Import View Modular
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

export default function Index({
    auth,
    products_from_db = [],
    promos = [],
    is_shift_open_db = false,
    active_shift_details = null,
    attendances = [],
    outlet_name = '',
}) {

    // =========================================================
    // STATE
    // =========================================================
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState('kasir');
    const [selectedPromo, setSelectedPromo] = useState(null);
    const [cart, setCart] = useState(() => {
    try {
        const saved = localStorage.getItem("my_cart");
        if (saved) {
            console.log("LOG: Berhasil memuat dari storage");
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error("Gagal parse JSON dari storage");
    }
    return [];
    });
    const [savedBills, setSavedBills] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [isCheckoutView, setIsCheckoutView] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState('Tunai');
    const [inputUangDiterima, setInputUangDiterima] = useState('');

    const [salesHistory, setSalesHistory] = useState([]);
    const [kasHistory, setKasHistory] = useState([]);
    const [voidHistory, setVoidHistory] = useState([]);
    const [sessionHistory, setSessionHistory] = useState([]);

    const [loadingSidebar, setLoadingSidebar] = useState(false);
    const [showModalTutup, setShowModalTutup] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    // STATE BARU UNTUK MODAL
    const [appNotification, setAppNotification] = useState({ isOpen: false, type: 'success', title: '', message: '' });
    const [successModal, setSuccessModal] = useState({ isOpen: false, data: null });

    const isSessionOpen = is_shift_open_db;
    const kasirName = auth.user.name;

    const formBukaKasir = useForm({ starting_cash: '' });
    const formTutupKasir = useForm({ physical_cash: '' });

    const [displayProducts, setDisplayProducts] = useState(products_from_db);
    const [productsVersion, setProductsVersion] = useState(0); // Tambahkan baris ini
    const loadSidebarData = async () => {
        try {
            setLoadingSidebar(true);
            const sidebarResponse = await fetch(route('pos.sidebar-data'));
            const sidebarData = await sidebarResponse.json();

            setSalesHistory((sidebarData.semua_transaksi || []).map((trx) => ({
                ...trx,
                pelanggan: trx.customer_name || trx.nama_pelanggan || 'Umum',
                metode: trx.payment_method || trx.metode_pembayaran || 'Tunai',
                total: trx.grand_total || trx.total_harga || 0,
                waktu: trx.created_at,
                items: trx.items?.map((item) => ({
                    id: item.id,
                    name: item.product_name || item.name,
                    customName: item.product_name,
                    quantity: item.quantity || 1,
                    price: item.price || 0,
                    varianWarna: item.variant_color,
                    varianUkuran: item.variant_size,
                })) || [],
            })));

            setVoidHistory((sidebarData.semua_transaksi || []).filter(t => t.status?.toLowerCase() === 'void'));
            setKasHistory(sidebarData.cash_transactions || []);

            const shiftResponse = await fetch(route('pos.riwayat-shift'));
            const shiftData = await shiftResponse.json();
            setSessionHistory(shiftData.map((shift) => ({
                id: shift.id, waktu_buka: shift.opened_at, waktu_tutup: shift.closed_at, saldo_awal: shift.starting_cash, saldo_akhir: shift.physical_cash, selisih: shift.discrepancy, status: shift.status, nama_kasir: shift.user?.name || 'Kasir', created_at: shift.created_at, total_transaksi: shift.transactions?.length || 0, omset: Number(shift.system_cash || 0) + Number(shift.starting_cash || 0),
            })));
        } catch (err) { console.error('Gagal load sidebar:', err); } finally { setLoadingSidebar(false); }
    };

    useEffect(() => { loadSidebarData(); }, []);

    const filteredProducts = useMemo(() => displayProducts.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())), [searchQuery, displayProducts]);
    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
    const uangKembalian = useMemo(() => { const cash = parseFloat(inputUangDiterima) || 0; return cash > subtotal ? cash - subtotal : 0; }, [inputUangDiterima, subtotal]);
    const sisaTagihan = useMemo(() => { const cash = parseFloat(inputUangDiterima) || 0; return cash >= subtotal ? 0 : subtotal - cash; }, [inputUangDiterima, subtotal]);
    const formatRupiah = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

    const addToCart = (productWithVarian) => {
        setCart((prev) => {
            const exist = prev.find((item) => item.id === productWithVarian.id && item.varianWarna === productWithVarian.varianWarna && item.varianUkuran === productWithVarian.varianUkuran);
            if (exist) { return prev.map((i) => i.id === productWithVarian.id && i.varianWarna === productWithVarian.varianWarna && i.varianUkuran === productWithVarian.varianUkuran ? { ...i, quantity: i.quantity + 1 } : i); }
            return [...prev, { ...productWithVarian, quantity: 1 }];
        });
    };

const cetakStrukLangsung = (transaksiData) => {
    // 1. Ambil konfigurasi dari localStorage (sama seperti di PengaturanNotaView)
    const savedConfig = localStorage.getItem('master_nota_config');
    const notaConfig = savedConfig ? JSON.parse(savedConfig) : {
        namaToko: 'KAHITA BUSANA',
        alamatToko: 'JL. BYPASS DHARMA GIRI',
        telpToko: '082189833575',
        showNamaToko: true, showAlamat: true, showTelp: true,
        showNoStruk: true, showWaktu: true,
        showHeaderTerimakasih: true, showFooterNote: true,
        teksTerimakasih: 'Terima Kasih',
        teksFooterNote: 'Mohon diperiksa kembali pembelian anda...'
    };

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    const waktu = new Date().toLocaleString('id-ID');

    doc.write(`
        <html>
        <head>
            <style>
                body { font-family: 'Courier New', monospace; width: 70mm; font-size: 11px; line-height: 1.4; color: #000; }
                .text-center { text-align: center; }
                .font-bold { font-weight: bold; }
                .uppercase { text-transform: uppercase; }
                .border-b { border-bottom: 1px dashed #000; margin: 5px 0; }
                table { width: 100%; border-collapse: collapse; }
                .flex-between { display: flex; justify-content: space-between; }
            </style>
        </head>
        <body>
            <div class="text-center">
                ${notaConfig.showNamaToko ? `<h4 class="font-bold uppercase">${notaConfig.namaToko}</h4>` : ''}
                ${notaConfig.showAlamat ? `<p class="uppercase">${notaConfig.alamatToko}</p>` : ''}
                ${notaConfig.showTelp ? `<p>TELP: ${notaConfig.telpToko}</p>` : ''}
                ${notaConfig.showNoStruk ? `<p class="font-bold">NO.STRUK: ${transaksiData.noStruk || '100505'}</p>` : ''}
                ${notaConfig.showWaktu ? `<p>${waktu}</p>` : ''}
            </div>

            <div class="border-b"></div>

            <table>
                ${transaksiData.items.map(item => `
                    <tr>
                        <td colspan="2" class="font-bold uppercase">${item.name || item.customName}</td>
                    </tr>
                    <tr>
                        <td>${item.quantity} x ${formatRupiah(item.price || 0)}</td>
                        <td style="text-align:right">${formatRupiah((item.price * item.quantity) || 0)}</td>
                    </tr>
                `).join('')}
            </table>

            <div class="border-b"></div>

            <div class="font-bold">
                <div class="flex-between"><span>TOTAL RP. =</span><span>${formatRupiah(transaksiData.total || 0)}</span></div>
                <div class="flex-between">
                    <span>${transaksiData.metode || 'TUNAI'} =</span>
                    <span>${formatRupiah(transaksiData.tunai || 0)}</span>
                </div>
            </div>

            ${(transaksiData.metode === 'TUNAI' || !transaksiData.metode) ? `
                <div class="border-b"></div>
                <div class="font-bold flex-between">
                    <span>KEMBALI RP. =</span><span>${formatRupiah(transaksiData.kembali || 0)}</span>
                </div>
            ` : ''}

            <div class="border-b"></div>

            ${notaConfig.showHeaderTerimakasih ? `<div class="text-center font-bold" style="margin: 10px 0;">${notaConfig.teksTerimakasih}</div>` : ''}
            
            ${notaConfig.showFooterNote ? `<div class="text-center" style="font-size: 10px;">${notaConfig.teksFooterNote}</div>` : ''}
        </body>
        </html>
    `);
    doc.close();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
};

useEffect(() => {
    const saved = localStorage.getItem("my_cart");
    if (saved) {
        setCart(JSON.parse(saved));
    }
}, []); 

const handleProsesBayarFinal = async () => {
    if (isProcessing) return; 
    if (cart.length === 0) {
        setAppNotification({ isOpen: true, type: 'error', title: 'Keranjang Kosong', message: 'Belum ada produk dipilih' });
        return;
    }
    setIsProcessing(true);

    try {
        const response = await fetch('/pos/transaksi', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Accept': 'application/json', 
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') 
            },
            body: JSON.stringify({
                customer_name: customerName || 'Umum', 
                payment_method: selectedPayment, 
                promo_id: selectedPromo?.id || null,
                subtotal, 
                grand_total: subtotal,
                paid_amount: selectedPayment === 'Tunai' ? Number(inputUangDiterima) : subtotal,
                change_amount: selectedPayment === 'Tunai' ? uangKembalian : 0,
                items: cart.map((item) => ({ 
                    product_id: item.product_id || item.id, 
                    product_name: item.customName || item.name, 
                    variant_color: item.varianWarna || null, 
                    variant_size: item.varianUkuran || null, 
                    price: item.price, 
                    quantity: item.quantity, 
                    total_price: item.price * item.quantity 
                })),
            }),
        });
        
        const result = await response.json();

        // LOGIKA HARUS DI DALAM SINI
        if (result.success) {
            // 1. Update stok di layar secara instan
            setDisplayProducts(prevProducts => 
                prevProducts.map(p => {
                    const itemInCart = cart.find(c => (c.product_id || c.id) === (p.product_id || p.id));
                    if (itemInCart) {
                        return { ...p, stock: Math.max(0, p.stock - itemInCart.quantity) };
                    }
                    return p;
                })
            );
            setProductsVersion(prev => prev + 1);

            // 2. Jika server mengembalikan data produk terbaru, timpa dengan data dari server
            if (result.products) {
                setDisplayProducts(result.products);
            }

            // 3. Update data sidebar
            await loadSidebarData();
            
            // 4. Tampilkan modal sukses
            setSuccessModal({
                isOpen: true,
                data: {
                    total: subtotal,
                    metode: selectedPayment,
                    bayar: Number(inputUangDiterima || subtotal),
                    kembalian: uangKembalian,
                    items: cart
                }
            });

            // 5. Reset form
            setCart([]); 
            setCustomerName(''); 
            setInputUangDiterima(''); 
            setSelectedPayment('Tunai'); 
            setIsCheckoutView(false);
        } else {
            // Jika transaksi gagal dari sisi server
            setAppNotification({ isOpen: true, type: 'error', title: 'Transaksi Gagal', message: result.message || 'Gagal transaksi' });
        }
    } catch (error) {
        setAppNotification({ isOpen: true, type: 'error', title: 'Server Error', message: 'Terjadi kesalahan server' });
    } finally {
        setIsProcessing(false);
    }
};

    const handleTutupKasir = () => {
    formTutupKasir.post(route('pos.tutup-kasir'), {
        preserveScroll: true,
        onSuccess: () => {
            setShowModalTutup(false);
        },
        onError: (errors) => {
            console.error(errors);
        }
    });
};
console.log(
    salesHistory.map(trx => ({
        nama: trx.pelanggan,
        payment_method: trx.payment_method
    }))
);
console.log("DEBUG_INDEX: Isi cart di Index saat ini:", cart);
    return (
        <div className="bg-[#f4f6f9] h-screen w-screen flex flex-col font-sans overflow-hidden select-none text-gray-700">
            <Head title={`Kasa POS - ${outlet_name || 'Outlet'}`} />

            {/* MODAL NOTIFIKASI */}
            {appNotification.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-80 text-center">
                        <div className={`text-4xl mb-2 ${appNotification.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                            {appNotification.type === 'success' ? '✓' : '⚠'}
                        </div>
                        <h3 className="font-bold text-lg">{appNotification.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">{appNotification.message}</p>
                        <button onClick={() => setAppNotification({ ...appNotification, isOpen: false })} className="bg-emerald-600 text-white w-full py-2 rounded">OK</button>
                    </div>
                </div>
            )}

            {/* MODAL SUKSES BAYAR */}
            {successModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h3 className="font-bold text-xl text-center mb-4">Pembayaran Berhasil!</h3>
                        <div className="border-t border-b py-3 my-3">
                            <div className="flex justify-between py-1"><span>Total Belanja:</span><span className="font-bold">{formatRupiah(successModal.data.total)}</span></div>
                            <div className="flex justify-between py-1"><span>Metode:</span><span className="font-bold">{successModal.data.metode}</span></div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setSuccessModal({ isOpen: false, data: null })} className="flex-1 bg-gray-200 py-2 rounded">Kembali</button>
                            <button onClick={() => { cetakStrukLangsung(successModal.data); setSuccessModal({ isOpen: false, data: null }); }} className="flex-1 bg-emerald-600 text-white py-2 rounded">Print Struk</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL BUKA KASIR */}
{!isSessionOpen && (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">

            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                    Buka Sesi Kasir
                </h2>

                <p className="text-sm text-slate-500 mt-2">
                    Masukkan modal awal kasir sebelum memulai transaksi
                </p>
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    formBukaKasir.post(route('pos.buka-kasir'));
                }}
            >
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Modal Awal Kasir
                    </label>

                    <input
                        type="number"
                        min="0"
                        value={formBukaKasir.data.starting_cash}
                        onChange={(e) =>
                            formBukaKasir.setData(
                                'starting_cash',
                                e.target.value
                            )
                        }
                        className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        placeholder="Contoh: 500000"
                        required
                    />
                </div>

                {formBukaKasir.errors.starting_cash && (
                    <div className="text-red-500 text-sm mb-3">
                        {formBukaKasir.errors.starting_cash}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={formBukaKasir.processing}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition"
                >
                    {formBukaKasir.processing
                        ? 'Membuka Kasir...'
                        : 'Buka Kasir'}
                </button>
            </form>

        </div>
    </div>
)}

            {showModalTutup && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl shadow-xl w-[420px] p-6">
            
            <h2 className="text-xl font-bold text-gray-800 mb-2">
                Tutup Kasir
            </h2>

            <p className="text-sm text-gray-500 mb-4">
                Masukkan jumlah uang fisik yang ada di laci kasir.
            </p>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                    Uang Fisik
                </label>

                <input
                    type="number"
                    min="0"
                    value={formTutupKasir.data.physical_cash}
                    onChange={(e) =>
                        formTutupKasir.setData(
                            'physical_cash',
                            e.target.value
                        )
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Masukkan uang fisik"
                />

                {formTutupKasir.errors.physical_cash && (
                    <p className="text-red-500 text-xs mt-1">
                        {formTutupKasir.errors.physical_cash}
                    </p>
                )}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => setShowModalTutup(false)}
                    className="flex-1 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                    Batal
                </button>

                <button
                    onClick={handleTutupKasir}
                    disabled={formTutupKasir.processing}
                    className="flex-1 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                >
                    {formTutupKasir.processing
                        ? 'Memproses...'
                        : 'Tutup Kasir'}
                </button>
            </div>

        </div>
    </div>
)}

            <div className="flex-1 flex overflow-hidden relative w-full h-full">
                <SidebarPos isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}  onOpen={() => setIsSidebarOpen(true)} activeMenu={activeMenu} setActiveMenu={setActiveMenu} isSessionOpen={isSessionOpen} onTutupKasir={() => setShowModalTutup(true)} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="bg-[#009664] text-white h-[48px] px-4 flex items-center justify-between shadow-sm z-10 flex-shrink-0">
                        <div className="flex items-center space-x-3">
                            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded hover:bg-emerald-700 transition">☰</button>
                            <span className="font-black text-sm tracking-wide uppercase">{outlet_name || 'Outlet'}</span>
                        </div>
                        <div className="text-xs font-bold tracking-wider opacity-90">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </header>
                    <div className="flex-1 flex overflow-hidden w-full h-full">
                        {activeMenu === 'kasir' && (<KasirPosView  promos={promos} selectedPromo={selectedPromo} setSelectedPromo={setSelectedPromo} filteredProducts={filteredProducts} searchQuery={searchQuery} setSearchQuery={setSearchQuery} addToCart={addToCart} cart={cart} setCart={setCart} savedBills={savedBills} setSavedBills={setSavedBills} customerName={customerName} setCustomerName={setCustomerName} isCheckoutView={isCheckoutView} setIsCheckoutView={setIsCheckoutView} selectedPayment={selectedPayment} setSelectedPayment={setSelectedPayment} inputUangDiterima={inputUangDiterima} setInputUangDiterima={setInputUangDiterima} subtotal={subtotal} sisaTagihan={sisaTagihan} uangKembalian={uangKembalian} handleProsesBayarFinal={handleProsesBayarFinal} formatRupiah={formatRupiah} />)}
                        {/* ... (Menu lainnya tetap sama) */}
                        {activeMenu === 'penjualan' && (<DataPenjualan salesHistory={salesHistory} formatRupiah={formatRupiah} onPrint={cetakStrukLangsung} onVoid={(sale) => { console.log('VOID:', sale); }} />)}
                        {activeMenu === 'laporan-ringkasan' && (<RingkasanPenjualan salesHistory={salesHistory} formatRupiah={formatRupiah} />)}
                        {activeMenu === 'void' && (<VoidTransaksi voidHistory={voidHistory} formatRupiah={formatRupiah} />)}
                        {activeMenu === 'laporan-kasir-sesi' && (<KasirAktivitas sessionHistory={sessionHistory} formatRupiah={formatRupiah} />)}
                        {activeMenu === 'laporan-kas-kasir' && (
                            <KasKasir
                                formatRupiah={formatRupiah}
                                initialCash={active_shift_details?.starting_cash || 0}
                                kasHistory={[
                                    ...salesHistory.map(trx => ({
                                        id: trx.id,
                                        nama: `Penjualan ${trx.pelanggan}`,
                                        jenis: 'Uang Masuk',
                                        kategori: 'Penjualan',
                                        jumlah: Number(trx.total || 0),
                                        payment_method: trx.payment_method,
                                        deskripsi: `Via ${trx.payment_method}`
                                    })),

                                    ...kasHistory.map(item => ({
                                        id: item.id,
                                        nama: item.name,
                                        jenis:
                                            item.transaction_type === 'IN'
                                                ? 'Uang Masuk'
                                                : 'Uang Keluar',
                                        kategori: item.category,
                                        jumlah: item.amount,
                                        deskripsi: item.description
                                    }))
                                ]}
                            />
                        )}
                        {activeMenu === 'laporan-produk-terjual' && (<ProdukTerjual salesHistory={salesHistory} formatRupiah={formatRupiah} />)}
                        {activeMenu === 'laporan-jenis-bayar' && (<JenisBayar salesHistory={salesHistory} formatRupiah={formatRupiah} />)}
                        {activeMenu === 'absensi' && (<Absensi attendances={attendances} />)}
                        {activeMenu === 'pengaturan-nota' && (<PengaturanNotaView formatRupiah={formatRupiah} />)}
                        {activeMenu === 'pengaturan-printer' && (<PengaturanPrinterView />)}
                        {activeMenu === 'pengaturan-toko' && (<PengaturanTokoView />)}
                    </div>
                </div>
            </div>
        </div>
    );
}