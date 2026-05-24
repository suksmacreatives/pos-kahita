import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import React, { useState } from 'react'; // Sudah diperbaiki dari 'use' menjadi 'import'
import { Head } from '@inertiajs/react';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';

export default function PosIndex({ auth, products }) {
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Fungsi Tambah ke Keranjang
    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    // Fungsi Kurangi/Tambah Jumlah Kuantitas di Keranjang
    const updateQuantity = (id, amount) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + amount;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    // Fungsi Hapus Item dari Keranjang
    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    // Hitung Total Belanjaan
    const totalPayments = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Filter Produk berdasarkan Pencarian
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-neutral-800 leading-tight">POS Kasir - Kahita Boutique</h2>}
        >
            <Head title="POS Kasir" />

            <div className="py-6 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* KOLOM KIRI: Daftar Produk Kebaya & Kamen (Ambil 2 Kolom Luas) */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Bar Pencarian */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100">
                            <input
                                type="text"
                                placeholder="Cari kebaya, kamen, atau aksesoris..."
                                className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Grid Card Produk */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredProducts.map((product) => (
                                <div 
                                    key={product.id} 
                                    className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => addToCart(product)}
                                >
                                    <div>
                                        <span className="text-xs font-semibold px-2 py-1 bg-amber-50 text-amber-800 rounded-full">
                                            {product.category}
                                        </span>
                                        <h3 className="font-medium text-neutral-800 mt-2 line-clamp-2">{product.name}</h3>
                                        <p className="text-xs text-neutral-400 mt-1">Ukuran: {product.size} | Stok: {product.stock}</p>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="font-bold text-amber-700">
                                            Rp {product.price.toLocaleString('id-ID')}
                                        </span>
                                        <button className="p-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* KOLOM KANAN: Ringkasan Keranjang Belanja Kasir (1 Kolom) */}
                    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 flex flex-col h-[calc(100vh-180px)] justify-between sticky top-6">
                        <div>
                            <div className="flex items-center gap-2 pb-4 border-b border-neutral-100">
                                <ShoppingCart className="text-amber-700" size={20} />
                                <h3 className="font-semibold text-neutral-800 text-lg">Keranjang Belanja</h3>
                            </div>

                            {/* Daftar Item di Keranjang */}
                            <div className="overflow-y-auto max-h-[350px] divide-y divide-neutral-100 pr-1 mt-2">
                                {cart.length === 0 ? (
                                    <div className="text-center py-12 text-neutral-400 text-sm">
                                        Belum ada item terpilih. <br />Klik produk di sebelah kiri.
                                    </div>
                                ) : (
                                    cart.map((item) => (
                                        <div key={item.id} className="py-3 flex justify-between items-center gap-2">
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-neutral-800 line-clamp-1">{item.name}</h4>
                                                <span className="text-xs text-amber-700 font-semibold">
                                                    Rp {item.price.toLocaleString('id-ID')}
                                                </span> {/* Sudah diperbaiki dari typo }} sebelumnya */}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="p-1 border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-50">
                                                    <Minus size={12} />
                                                </button>
                                                <span className="text-sm font-medium px-1 w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} className="p-1 border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-50">
                                                    <Plus size={12} />
                                                </button>
                                                <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-500 hover:bg-red-50 rounded pl-2">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Bagian Total Harga & Tombol Bayar */}
                        <div className="border-t border-neutral-100 pt-4 mt-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-neutral-500 font-medium">Total Pembayaran</span>
                                <span className="text-xl font-bold text-neutral-900">
                                    Rp {totalPayments.toLocaleString('id-ID')}
                                </span>
                            </div>
                            <button 
                                disabled={cart.length === 0}
                                className={`w-full py-3 rounded-xl font-semibold text-center transition-all ${
                                    cart.length === 0 
                                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' 
                                    : 'bg-amber-700 hover:bg-amber-800 text-white shadow-md hover:shadow-lg'
                                }`}
                            >
                                Proses Transaksi (Bayar)
                            </button>
                        </div>

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}