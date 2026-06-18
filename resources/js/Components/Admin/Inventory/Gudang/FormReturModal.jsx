import React, { useState, useMemo } from "react";
import { createPortal } from 'react-dom';
import { X, Plus, Search, AlertTriangle } from "lucide-react";
import SelectDropdown from '@/Components/Admin/SelectDropdown';
import VariantTableGrid from "./VariantTableGrid";

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
    setItems(prev => {
      if (prev.some(i => i.produk_id === produk.id)) return prev;
      return [...prev, {
        produk_id: produk.id,
        nama: produk.nama_produk,
        kode: produk.kode_produk,
        variants: produk.varian.map(v => ({
          ukuran: v.ukuran,
          warna: v  .warna || '',
          warna_hex: v.warna_hex || '#6b7280',
          stok: v.stok,
          qty: 0,
        })),
      }];
    });
    setProductSearch("");
  };

  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const handleQtyChange = (itemIdx, variantIdx, val) => {
    setItems(prev => {
      const c = [...prev];
      c[itemIdx] = { ...c[itemIdx], variants: c[itemIdx].variants.map((v, i) => i === variantIdx ? { ...v, qty: val } : v) };
      return c;
    });
  };

  const flatItems = useMemo(() => items.flatMap(it => it.variants.filter(v => parseInt(v.qty) > 0).map(v => ({ ...v, produk_id: it.produk_id, nama: it.nama }))), [items]);
  const totalQty = useMemo(() => flatItems.reduce((a, v) => a + (parseInt(v.qty) || 0), 0), [flatItems]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplierId || !alasan || flatItems.length === 0) return;
    onSubmit({
      supplier_id: parseInt(supplierId),
      supplier_nama: suppliers.find(s => s.id === parseInt(supplierId))?.nama,
      alasan,
      tanggal,
      items: flatItems.map(v => ({
        produk_id: v.produk_id,
        nama: v.nama,
        ukuran: v.ukuran,
        warna: v.warna,
        qty: parseInt(v.qty),
      })),
      total_qty: totalQty,
      total_item: flatItems.length,
    });
    setItems([]);
    setSupplierId("");
    setAlasan("");
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
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
                <SelectDropdown
                  value={supplierId}
                  onChange={setSupplierId}
                  options={suppliers.map(s => ({ value: s.id, label: s.nama }))}
                  placeholder="-- Pilih Supplier --"
                  searchable
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Alasan Retur *</label>
                <SelectDropdown
                  value={alasan}
                  onChange={setAlasan}
                  options={alasanRetur.map(a => ({ value: a.value, label: a.label }))}
                  placeholder="-- Pilih Alasan --"
                />
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
              {items.map((it, idx) => (
                <div key={it.produk_id} className="mb-3">
                  <VariantTableGrid
                    nama={it.nama}
                    kode={it.kode}
                    variants={it.variants}
                    onRemove={() => removeItem(idx)}
                    onQtyChange={(vi, val) => handleQtyChange(idx, vi, val)}
                    maxKey="stok"
                  />
                </div>
              ))}
            </div>
          </div>

          {items.length > 0 && (
            <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs">
                <span className="text-gray-500">Produk: <strong className="text-gray-800">{items.length}</strong></span>
                <span className="text-gray-500">Item: <strong className="text-gray-800">{flatItems.length}</strong></span>
                <span className="text-gray-500">Total Qty: <strong className="text-gray-800">{totalQty}</strong></span>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setItems([])} className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 cursor-pointer">Reset</button>
                <button type="submit" disabled={!supplierId || !alasan || flatItems.length === 0} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50">Simpan Retur</button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
    , document.body
  );
}
