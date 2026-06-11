import React, { useState, useMemo } from "react";
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Search, AlertTriangle } from "lucide-react";
const alasanRetur = [
  { value: 'Produk cacat', label: 'Produk Cacat / Rusak' },
  { value: 'Stok berlebih', label: 'Stok Berlebih / Overstock' },
  { value: 'Tidak laku', label: 'Tidak Laku / Slow Moving' },
  { value: 'Salah kirim', label: 'Salah Kirim / Wrong Item' },
];

export default function FormReturModal({ open, onClose, onSubmit, suppliers = [], warehouseProducts = [] }) {
  const [supplierId, setSupplierId] = useState("");
  const [alasan, setAlasan] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [productSearch, setProductSearch] = useState("");
  const [items, setItems] = useState([]);

  const filteredProducts = useMemo(() => {
    if (!productSearch) return warehouseProducts;
    const q = productSearch.toLowerCase();
    return warehouseProducts.filter(p => p.nama_produk.toLowerCase().includes(q) || p.kode_produk.toLowerCase().includes(q));
  }, [productSearch]);

  const addItem = (produk) => {
    const varian = produk.varian[0] || { ukuran: "M" };
    setItems(prev => [...prev, {
      produk_id: produk.id,
      nama: produk.nama_produk,
      kode: produk.kode_produk,
      ukuran: varian.ukuran,
      varianOptions: produk.varian,
      stokTersedia: produk.total_stok,
      qty: 1,
    }]);
    setProductSearch("");
  };

  const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) => {
    setItems(prev => { const c = [...prev]; c[i] = { ...c[i], [field]: val }; return c; });
  };

  const totalQty = useMemo(() => items.reduce((a, it) => a + (parseInt(it.qty) || 0), 0), [items]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplierId || !alasan || items.length === 0) return;
    onSubmit({
      supplier_id: parseInt(supplierId),
      supplier_nama: suppliers.find(s => s.id === parseInt(supplierId))?.nama,
      alasan,
      tanggal,
      items: items.map(it => ({
        produk_id: it.produk_id,
        nama: it.nama,
        ukuran: it.ukuran,
        qty: parseInt(it.qty),
      })),
      total_qty: totalQty,
      total_item: items.length,
      status: 'diajukan',
    });
    setItems([]);
    setSupplierId("");
    setAlasan("");
    onClose();
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div><h3 className="text-sm font-bold text-gray-800">Tambah Retur ke Supplier</h3><p className="text-[10px] text-gray-400">Catat barang yang dikembalikan ke supplier</p></div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Supplier *</label>
                <select required className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:border-emerald-500 outline-none" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                  <option value="">-- Pilih Supplier --</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Alasan Retur *</label>
                <select required className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:border-emerald-500 outline-none" value={alasan} onChange={e => setAlasan(e.target.value)}>
                  <option value="">-- Pilih Alasan --</option>
                  {alasanRetur.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Tanggal Retur</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:border-emerald-500 outline-none" value={tanggal} onChange={e => setTanggal(e.target.value)} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-700">Item Produk</span>
              </div>
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Cari produk untuk diretur..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500" value={productSearch} onChange={e => setProductSearch(e.target.value)} />
              </div>
              {productSearch && filteredProducts.length > 0 && (
                <div className="absolute z-10 w-[calc(100%-3rem)] max-w-[600px] bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                  {filteredProducts.map(p => (
                    <button key={p.id} type="button" onClick={() => addItem(p)} className="w-full px-3 py-2 text-left text-xs hover:bg-rose-50 flex items-center justify-between cursor-pointer">
                      <span><span className="font-mono text-gray-400 mr-2">{p.kode_produk}</span>{p.nama_produk}</span>
                      <span className="text-gray-400">Stok: {p.total_stok}</span>
                    </button>
                  ))}
                </div>
              )}
              {items.length === 0 && <p className="text-center py-6 text-xs text-gray-400 italic">Belum ada item. Cari produk di atas.</p>}
              {items.map((it, idx) => {
                const qty = parseInt(it.qty) || 0;
                const overStock = qty > it.stokTersedia;
                return (
                  <div key={idx} className={`flex items-center gap-2 mb-2 p-3 bg-gray-50 rounded-xl border ${overStock ? 'border-rose-300 bg-rose-50' : 'border-gray-200'}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{it.nama}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{it.kode} • Stok: <strong className="text-gray-700">{it.stokTersedia}</strong></p>
                    </div>
                    <select className="w-14 px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-emerald-500" value={it.ukuran} onChange={e => updateItem(idx, "ukuran", e.target.value)}>
                      {it.varianOptions.map(v => <option key={v.ukuran} value={v.ukuran}>{v.ukuran}</option>)}
                    </select>
                    <input type="number" min="1" max={it.stokTersedia} className={`w-16 px-2 py-1.5 border rounded-lg text-xs text-right font-bold outline-none focus:border-emerald-500 ${overStock ? 'border-rose-400 bg-rose-100' : 'border-gray-200'}`} value={it.qty} onChange={e => updateItem(idx, "qty", parseInt(e.target.value) || 0)} />
                    {overStock && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" title="Melebihi stok tersedia" />}
                    <button type="button" onClick={() => removeItem(idx)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </div>
                );
              })}
            </div>
          </div>

          {items.length > 0 && (
            <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-500">Total Item: <strong className="text-gray-800">{items.length}</strong> • Total Qty: <strong className="text-gray-800">{totalQty}</strong></span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setItems([])} className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 cursor-pointer">Reset</button>
                <button type="submit" disabled={!supplierId || !alasan || items.length === 0} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50">Simpan Retur</button>
              </div>
            </div>
          )}
        </form>
      </div>
        </div>
      </div>
    </>
    , document.body
  );
}

