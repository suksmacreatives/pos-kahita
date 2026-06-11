import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2 } from 'lucide-react';

export default function FormReturGudangModal({ isOpen, onClose, selectedOutlet, onSubmit, outlets = [], outletStok = {} }) {
  if (!isOpen) return null;

  const originOutlet = outlets.find(o => o.id === selectedOutlet);

  // Form states
  const [alasan, setAlasan] = useState('kelebihan stok');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [catatan, setCatatan] = useState('');
  const [items, setItems] = useState([]); // [{ product_id, varian_sku, qty, max_qty, nama, ukuran, warna, catatan_item }]

  // Products in current outlet
  const availableProducts = outletStok[selectedOutlet] || [];

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      {
        product_id: '',
        varian_sku: '',
        qty: 1,
        max_qty: 0,
        nama: '',
        ukuran: '',
        warna: '',
        catatan_item: '',
        error: ''
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleProductChange = (index, prodId) => {
    const prod = availableProducts.find(p => p.id === parseInt(prodId));
    if (!prod) return;

    setItems(prev => {
      const copy = [...prev];
      const firstVarian = prod.varian[0] || { sku: '', ukuran: '', warna: '', stok: 0 };
      copy[index] = {
        ...copy[index],
        product_id: prodId,
        varian_sku: firstVarian.sku,
        max_qty: firstVarian.stok,
        qty: Math.min(1, firstVarian.stok),
        nama: prod.nama_produk,
        ukuran: firstVarian.ukuran,
        warna: firstVarian.warna,
        error: firstVarian.stok <= 0 ? 'Stok varian habis!' : ''
      };
      return copy;
    });
  };

  const handleVarianChange = (index, sku) => {
    const row = items[index];
    const prod = availableProducts.find(p => p.id === parseInt(row.product_id));
    if (!prod) return;

    const varian = prod.varian.find(v => v.sku === sku);
    if (!varian) return;

    setItems(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        varian_sku: sku,
        ukuran: varian.ukuran,
        warna: varian.warna,
        max_qty: varian.stok,
        qty: Math.min(copy[index].qty, varian.stok),
        error: varian.stok <= 0 ? 'Stok varian habis!' : ''
      };
      return copy;
    });
  };

  const handleQtyChange = (index, qtyVal) => {
    const q = parseInt(qtyVal) || 0;
    setItems(prev => {
      const copy = [...prev];
      const max = copy[index].max_qty;
      let error = '';

      if (q <= 0) {
        error = 'Jumlah harus > 0';
      } else if (q > max) {
        error = `Maksimal retur ${max} pcs`;
      }

      copy[index] = {
        ...copy[index],
        qty: q,
        error
      };
      return copy;
    });
  };

  const handleItemCatatanChange = (index, text) => {
    setItems(prev => {
      const copy = [...prev];
      copy[index].catatan_item = text;
      return copy;
    });
  };

  const isFormInvalid = 
    items.length === 0 || 
    items.some(it => !it.product_id || !it.varian_sku || !!it.error || it.qty <= 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormInvalid) return;

    onSubmit({
      id: Math.floor(100 + Math.random() * 900),
      nomor_retur: `RO-20260528-${Math.floor(100 + Math.random() * 900)}`,
      outlet_id: selectedOutlet,
      outlet_nama: originOutlet?.nama || '',
      tgl_retur: tanggal,
      alasan,
      items: items.map(({ product_id, varian_sku, qty, nama, ukuran, warna, catatan_item }) => ({
        produk_id: parseInt(product_id),
        nama,
        ukuran,
        warna,
        qty,
        catatan: catatan_item
      })),
      total_item: items.length,
      total_qty: items.reduce((acc, it) => acc + it.qty, 0),
      status: 'diajukan',
      catatan
    });
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-base font-bold text-gray-800">Buat Retur ke Gudang Pusat</h3>
            <p className="text-[10px] text-gray-400 font-medium">Ajukan pengembalian stok outlet ke gudang pusat</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-150 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-550 uppercase mb-2">Asal Outlet</label>
              <input
                type="text"
                disabled
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-500"
                value={originOutlet?.nama || ''}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-550 uppercase mb-2">Alasan Retur *</label>
              <select
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 font-semibold focus:border-emerald-500 outline-none cursor-pointer"
                value={alasan}
                onChange={e => setAlasan(e.target.value)}
              >
                <option value="kelebihan stok">Kelebihan Stok</option>
                <option value="cacat">Produk Cacat</option>
                <option value="tidak laku">Tidak Laku / Slow Moving</option>
                <option value="salah kirim">Kesalahan Kirim dari Gudang</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-550 uppercase mb-2">Tanggal Pengiriman</label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 font-semibold focus:border-emerald-500 outline-none"
                value={tanggal}
                onChange={e => setTanggal(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-550 uppercase mb-2">Catatan untuk Gudang</label>
            <textarea
              rows="2"
              placeholder="Tulis informasi detail pengembalian..."
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 outline-none focus:border-emerald-500 font-medium"
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
            />
          </div>

          {/* Section Item */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-150 pb-2">
              <span className="text-xs font-bold text-gray-800">Daftar Produk yang Diretur</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-750 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Produk
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-center py-6 text-xs text-gray-400 font-semibold italic">Belum ada item ditambahkan. Klik 'Tambah Produk'.</p>
            ) : (
              <div className="space-y-3">
                {items.map((row, idx) => {
                  const selectedProd = availableProducts.find(p => p.id === parseInt(row.product_id));
                  
                  return (
                    <div key={idx} className="p-3 border border-gray-200 rounded-xl bg-gray-50/30 space-y-2 relative">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="absolute right-3 top-3 p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pr-8">
                        {/* Select Product */}
                        <div className="sm:col-span-5">
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">Produk</label>
                          <select
                            required
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-emerald-500 font-medium cursor-pointer"
                            value={row.product_id}
                            onChange={e => handleProductChange(idx, e.target.value)}
                          >
                            <option value="">-- Pilih Produk --</option>
                            {availableProducts.map(p => (
                              <option key={p.id} value={p.id}>{p.nama_produk} ({p.kode_produk})</option>
                            ))}
                          </select>
                        </div>

                        {/* Select Varian */}
                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">Varian (Size - Warna)</label>
                          <select
                            required
                            disabled={!row.product_id}
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 disabled:bg-gray-100 rounded-lg text-xs outline-none focus:border-emerald-500 font-medium cursor-pointer"
                            value={row.varian_sku}
                            onChange={e => handleVarianChange(idx, e.target.value)}
                          >
                            {!row.product_id && <option value="">Pilih produk dulu</option>}
                            {selectedProd?.varian.map(v => (
                              <option key={v.sku} value={v.sku}>Size {v.ukuran} [Stok: {v.stok} pcs]</option>
                            ))}
                          </select>
                        </div>

                        {/* Input Qty */}
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">Qty Retur</label>
                          <input
                            type="number"
                            required
                            min="1"
                            disabled={!row.varian_sku}
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 disabled:bg-gray-100 rounded-lg text-xs outline-none focus:border-emerald-500 font-bold"
                            value={row.qty}
                            onChange={e => handleQtyChange(idx, e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="pr-8">
                        <label className="block text-[10px] font-bold text-gray-400 mb-1">Keterangan Item (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Sobek pada kantong kanan, noda kotor..."
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-emerald-500 font-medium"
                          value={row.catatan_item}
                          onChange={e => handleItemCatatanChange(idx, e.target.value)}
                        />
                      </div>

                      {/* Error text */}
                      {row.error && (
                        <p className="text-[10px] text-rose-600 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {row.error}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-3 text-rose-800">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-xs font-semibold">
              Stok fisik outlet akan langsung dikurangi setelah Anda mengirimkan barang retur. Gudang pusat akan mengonfirmasi penerimaan secara terpisah.
            </span>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-150 bg-gray-50/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isFormInvalid}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/10 transition-all cursor-pointer"
          >
            Ajukan Retur
          </button>
        </div>
      </div>
        </div>
      </div>
    </>
    , document.body
  );
}

