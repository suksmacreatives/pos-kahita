import React, { useState, useMemo } from "react";
import { createPortal } from 'react-dom';
import { X, Search, AlertTriangle } from "lucide-react";
import SelectDropdown from '@/Components/Admin/SelectDropdown';
import VariantTableGrid from "./VariantTableGrid";

export default function FormDistribusiModal({ open, onClose, onSubmit, outlets = [], onlineShops = [], warehouseProducts = [], processing = false }) {
  const [tipeTujuan, setTipeTujuan] = useState("outlet");
  const [outletId, setOutletId] = useState("");
  const [onlineShopId, setOnlineShopId] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [productSearch, setProductSearch] = useState("");
  const [items, setItems] = useState([]);

  const selectedOutlet = outlets.find(o => o.id === parseInt(outletId));
  const selectedOnlineShop = onlineShops.find(s => s.id === parseInt(onlineShopId));
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
          warna: v.warna || '',
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
  const hasOverStock = useMemo(() => flatItems.some(v => parseInt(v.qty) > v.stok), [flatItems]);

  if (!open) return null;

  const handleSubmit = (e, mode) => {
    e.preventDefault();
    const effectiveTipe = tipeTujuan === 'online' ? 'online' : 'outlet';
    const isOnline = effectiveTipe === 'online';
    if ((isOnline ? !onlineShopId : !outletId) || flatItems.length === 0) return;
    onSubmit({
      tipe_tujuan: effectiveTipe,
      outlet_id: isOnline ? null : parseInt(outletId),
      online_shop_id: isOnline ? parseInt(onlineShopId) : null,
      outlet_tujuan: isOnline ? selectedOnlineShop?.nama : selectedOutlet?.nama,
      outlet_warna: selectedOutlet?.warna,
      outlet_hexColor: selectedOutlet?.hexColor,
      tanggal_kirim: mode === 'dikirim' ? tanggal : null,
      items: flatItems.map(v => ({
        produk_id: v.produk_id,
        nama: v.nama,
        ukuran: v.ukuran,
        warna: v.warna,
        qty: parseInt(v.qty),
      })),
      total_qty: totalQty,
      status: mode === 'draft' ? 'draft' : 'dikirim',
    });
    setItems([]);
    setOutletId("");
    setOnlineShopId("");
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div><h3 className="text-sm font-bold text-gray-800">Tambah Distribusi</h3><p className="text-[10px] text-gray-400">Catat pengiriman barang ke outlet / online shop</p></div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => handleSubmit(e, 'dikirim')} className="flex-1 flex flex-col min-h-0">
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Tujuan *</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setTipeTujuan('outlet'); setOnlineShopId(""); }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${tipeTujuan === 'outlet' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >
                    Outlet
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTipeTujuan('online'); setOutletId(""); }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${tipeTujuan === 'online' ? 'bg-sky-50 border-sky-300 text-sky-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >
                    Online Shop
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Tanggal Kirim</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:border-emerald-500 outline-none" value={tanggal} onChange={e => setTanggal(e.target.value)} />
              </div>
            </div>

            {tipeTujuan === 'outlet' ? (
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Outlet *</label>
                <SelectDropdown
                  value={outletId}
                  onChange={setOutletId}
                  options={outlets.map(o => ({ value: o.id, label: o.nama }))}
                  placeholder="-- Pilih Outlet --"
                  searchable
                />
                {selectedOutlet && (
                  <div className="flex items-center gap-1.5 mt-1.5 px-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedOutlet.hexColor }} />
                    <span className="text-[10px] text-gray-500">{selectedOutlet.nama}</span>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Tujuan Online Shop *</label>
                <SelectDropdown
                  value={onlineShopId}
                  onChange={setOnlineShopId}
                  options={onlineShops.map(s => ({ value: s.id, label: s.nama }))}
                  placeholder="-- Pilih Online Shop --"
                  searchable
                />
                {selectedOnlineShop && (
                  <div className="flex items-center gap-1.5 mt-1.5 px-1">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <span className="text-[10px] text-gray-500">{selectedOnlineShop.nama}</span>
                  </div>
                )}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-700">Item Produk</span>
              </div>
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Cari produk untuk ditambahkan..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500" value={productSearch} onChange={e => setProductSearch(e.target.value)} />
              </div>
              {productSearch && filteredProducts.length > 0 && (
                <div className="absolute z-10 w-[calc(100%-3rem)] max-w-[600px] bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                  {filteredProducts.map(p => (
                    <button key={p.id} type="button" onClick={() => addItem(p)} className="w-full px-3 py-2 text-left text-xs hover:bg-emerald-50 flex items-center justify-between cursor-pointer">
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
                {hasOverStock && (
                  <span className="flex items-center gap-1 text-rose-600 font-semibold"><AlertTriangle className="w-3.5 h-3.5" />Melebihi stok</span>
                )}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setItems([])} className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 cursor-pointer">Reset</button>
                <button type="button" onClick={(e) => handleSubmit(e, 'draft')} className="px-4 py-2 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold hover:bg-emerald-50 cursor-pointer">Simpan Draft</button>
                <button type="submit" disabled={(tipeTujuan === 'online' ? !onlineShopId : !outletId) || flatItems.length === 0 || processing} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50">{processing ? 'Menyimpan...' : 'Proses Distribusi'}</button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
    , document.body
  );
}
