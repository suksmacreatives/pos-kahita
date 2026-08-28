import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, AlertCircle, Info, ChevronDown, Search, Package, ArrowRight } from 'lucide-react';

function SearchableSelect({ options, value, onChange, placeholder, disabled, renderOption, renderSelected }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  const filtered = options.filter(o => {
    const label = (o.label || '').toLowerCase();
    const searchLower = search.toLowerCase();
    return label.includes(searchLower) || String(o.value).toLowerCase().includes(searchLower);
  });

  const selected = options.find(o => o.value === value);

  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 disabled:bg-gray-100 rounded-lg text-xs outline-none focus:border-emerald-500 font-medium flex items-center justify-between gap-1 cursor-pointer"
      >
        <span className="truncate">
          {selected ? (renderSelected ? renderSelected(selected) : selected.label) : placeholder || 'Pilih...'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-[60] mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg shadow-black/5 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
              <Search className="w-3 h-3 text-gray-400 shrink-0" />
              <input
                type="text"
                className="w-full bg-transparent text-xs outline-none placeholder:text-gray-400"
                placeholder="Cari..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="text-center py-4 text-xs text-gray-400">Tidak ditemukan</p>
            ) : (
              filtered.map(o => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center gap-2 ${
                    o.value === value ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {renderOption ? renderOption(o) : o.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const ALASAN_OPTIONS = [
  { value: 'permintaan', label: 'Permintaan Outlet Tujuan' },
  { value: 'kelebihan stok', label: 'Kelebihan Stok' },
  { value: 'darurat', label: 'Darurat / Stok Habis' },
];

export default function FormTransferModal({ isOpen, onClose, selectedOutlet, onSubmit, outlets = [], outletStok = {}, processing = false }) {
  if (!isOpen) return null;

  const originOutlet = outlets.find(o => o.id === selectedOutlet);

  const [destinationId, setDestinationId] = useState('');
  const [alasan, setAlasan] = useState('permintaan');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [catatan, setCatatan] = useState('');
  const [items, setItems] = useState([]);

  const availableProducts = outletStok[selectedOutlet] || [];

  const outletOptions = outlets
    .filter(o => o.id !== selectedOutlet)
    .map(o => ({ value: o.id, label: o.nama, kota: o.kota, warna: o.warna, hexColor: o.hexColor }));

  const productOptions = availableProducts.map(p => ({
    value: p.id,
    label: `${p.nama_produk} (${p.kode_produk})`,
    nama: p.nama_produk,
    kode: p.kode_produk,
    varian: p.varian,
    total_stok: p.total_stok,
    status: p.status,
    varianCount: p.varian?.length || 0,
    kategori: p.kategori,
  }));

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      {
        product_id: '',
        product_variant_id: '',
        qty: 1,
        max_qty: 0,
        nama: '',
        ukuran: '',
        warna: '',
        kode: '',
        varian_sku: '',
        error: ''
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleProductChange = (index, prodId) => {
    const prod = availableProducts.find(p => p.id === prodId);
    if (!prod) return;

    setItems(prev => {
      const copy = [...prev];
      const firstVarian = prod.varian[0] || { id: '', sku: '', ukuran: '', warna: '', stok: 0 };
      copy[index] = {
        ...copy[index],
        product_id: prodId,
        product_variant_id: firstVarian.id,
        max_qty: firstVarian.stok,
        qty: Math.min(1, firstVarian.stok),
        nama: prod.nama_produk,
        kode: prod.kode_produk,
        ukuran: firstVarian.ukuran,
        warna: firstVarian.warna,
        varian_sku: firstVarian.sku,
        error: firstVarian.stok <= 0 ? 'Stok varian habis!' : ''
      };
      return copy;
    });
  };

  const handleVarianChange = (index, variantId) => {
    const row = items[index];
    const prod = availableProducts.find(p => p.id === row.product_id);
    if (!prod) return;

    const varian = prod.varian.find(v => v.id === variantId);
    if (!varian) return;

    setItems(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        product_variant_id: varian.id,
        ukuran: varian.ukuran,
        warna: varian.warna,
        max_qty: varian.stok,
        varian_sku: varian.sku,
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
      if (q <= 0) error = 'Jumlah harus > 0';
      else if (q > max) error = `Maksimal transfer ${max} pcs`;
      copy[index] = { ...copy[index], qty: q, error };
      return copy;
    });
  };

  const isFormInvalid =
    !destinationId ||
    items.length === 0 ||
    items.some(it => !it.product_id || !it.product_variant_id || !!it.error || it.qty <= 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormInvalid) return;

    const destOutlet = outlets.find(o => o.id === destinationId);

    onSubmit({
      id: Math.floor(100 + Math.random() * 900),
      nomor_transfer: `TF-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(100 + Math.random() * 900)}`,
      outlet_asal_id: selectedOutlet,
      outlet_asal_nama: originOutlet?.nama || '',
      outlet_tujuan_id: destinationId,
      outlet_tujuan_nama: destOutlet?.nama || '',
      tgl_transfer: tanggal,
      tgl_diterima: null,
      items: items.map(({ product_id, product_variant_id, qty, nama, ukuran, warna }) => ({
        product_id,
        product_variant_id,
        nama,
        ukuran,
        warna,
        qty
      })),
      total_item: items.length,
      total_qty: items.reduce((acc, it) => acc + it.qty, 0),
      alasan,
      status: 'menunggu_konfirmasi',
      dibuat_oleh: 'Admin HQ'
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between bg-gray-50/50 shrink-0">
              <div>
                <h3 className="text-base font-bold text-gray-800">Buat Transfer Antar Outlet</h3>
                <p className="text-[10px] text-gray-400 font-medium">Kirimkan stok barang dari outlet Anda ke outlet lain</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-150 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Outlet Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-550 uppercase mb-2">Asal Outlet</label>
                  <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: originOutlet?.hexColor || '#6B7280' }} />
                    <span className="text-xs font-bold text-gray-500">{originOutlet?.nama || ''}</span>
                    {originOutlet?.kota && (
                      <span className="text-[10px] text-gray-400 font-medium">• {originOutlet.kota}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-550 uppercase mb-2">Tujuan Outlet *</label>
                  <SearchableSelect
                    options={outletOptions}
                    value={destinationId}
                    onChange={setDestinationId}
                    placeholder="-- Pilih Outlet Tujuan --"
                    renderOption={(o) => (
                      <>
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: o.hexColor || '#10B981' }} />
                        <span className="font-medium">{o.label}</span>
                        {o.kota && <span className="text-gray-400 ml-auto text-[10px]">{o.kota}</span>}
                      </>
                    )}
                    renderSelected={(o) => (
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: o.hexColor || '#10B981' }} />
                        <span className="font-semibold text-gray-700">{o.label}</span>
                      </span>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-550 uppercase mb-2">Alasan Transfer *</label>
                  <SearchableSelect
                    options={ALASAN_OPTIONS}
                    value={alasan}
                    onChange={setAlasan}
                    placeholder="Pilih alasan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-550 uppercase mb-2">Tanggal Kirim *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:border-emerald-500 outline-none"
                    value={tanggal}
                    onChange={e => setTanggal(e.target.value)}
                  />
                </div>
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-xs font-bold text-gray-550 uppercase mb-2">Catatan Tambahan</label>
                <textarea
                  rows="2"
                  placeholder="Tulis alasan detail atau instruksi pengiriman..."
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 outline-none focus:border-emerald-500 font-medium resize-none"
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                />
              </div>

              {/* Product Items Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-150 pb-2">
                  <span className="text-xs font-bold text-gray-800">Daftar Produk yang Ditransfer</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Produk
                  </button>
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-xs text-gray-400 font-semibold">Belum ada item ditambahkan</p>
                    <p className="text-[10px] text-gray-300 mt-1">Klik 'Tambah Produk' untuk memulai</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((row, idx) => {
                      const selectedProd = availableProducts.find(p => p.id === row.product_id);
                      const varianOptions = (selectedProd?.varian || []).map(v => ({
                        value: v.id,
                        label: `${v.sku || '-'} - Size ${v.ukuran || '-'} [${v.stok} pcs]`,
                        ukuran: v.ukuran,
                        warna: v.warna,
                        stok: v.stok,
                        sku: v.sku,
                      }));

                      return (
                        <div key={idx} className="p-4 border border-gray-200 rounded-xl bg-gray-50/30 space-y-3 relative">
                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="absolute right-3 top-3 p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {/* Item header info */}
                          {row.nama && (
                            <div className="flex items-start gap-3 pr-10">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-gray-800">{row.nama}</span>
                                  {row.kode && <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded">#{row.kode}</span>}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  {row.varian_sku && <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1 py-0.5 rounded border border-gray-100">{row.varian_sku}</span>}
                                  <span className="text-[10px] text-gray-500 font-medium">Ukuran: <strong>{row.ukuran || '-'}</strong></span>
                                  <span className="text-gray-300">|</span>
                                  <span className="text-[10px] text-gray-500 font-medium">Warna: <strong>{row.warna || '-'}</strong></span>
                                  <span className="text-gray-300">|</span>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    row.max_qty <= 0 ? 'bg-red-50 text-red-600' :
                                    row.max_qty < 10 ? 'bg-amber-50 text-amber-600' :
                                    'bg-emerald-50 text-emerald-700'
                                  }`}>
                                    Stok: {row.max_qty} pcs
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                            {/* Product */}
                            <div className="sm:col-span-5">
                              <label className="block text-[10px] font-bold text-gray-400 mb-1">Produk</label>
                              <SearchableSelect
                                options={productOptions}
                                value={row.product_id}
                                onChange={(val) => handleProductChange(idx, val)}
                                placeholder="-- Pilih Produk --"
                                renderOption={(o) => (
                                  <div className="flex flex-col w-full">
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-gray-700 text-xs">{o.nama}</span>
                                      <span className="text-gray-400 text-[10px] font-mono">#{o.kode}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {o.kategori && <span className="text-[10px] text-gray-400">{o.kategori}</span>}
                                      <span className={`text-[10px] font-bold ${
                                        o.total_stok <= 0 ? 'text-red-500' :
                                        o.total_stok < 10 ? 'text-amber-500' :
                                        'text-emerald-600'
                                      }`}>
                                        {o.total_stok} stok
                                      </span>
                                      <span className="text-[10px] text-gray-400">{o.varianCount} varian</span>
                                    </div>
                                  </div>
                                )}
                                renderSelected={(o) => (
                                  <div className="flex items-center gap-2 w-full">
                                    <span className="font-semibold text-gray-700 text-xs truncate">{o.nama}</span>
                                    <span className="text-gray-400 text-[10px] shrink-0">#{o.kode}</span>
                                  </div>
                                )}
                              />
                            </div>

                            {/* Variant */}
                            <div className="sm:col-span-4">
                              <label className="block text-[10px] font-bold text-gray-400 mb-1">Varian</label>
                              <SearchableSelect
                                options={varianOptions}
                                value={row.product_variant_id}
                                onChange={(val) => handleVarianChange(idx, val)}
                                placeholder={!row.product_id ? 'Pilih produk dulu' : '-- Pilih Varian --'}
                                disabled={!row.product_id}
                                renderOption={(o) => (
                                  <div className="flex items-center gap-2.5 w-full">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-semibold text-gray-700">{o.sku || '-'}</span>
                                        <span className="text-gray-300">|</span>
                                        <span className="text-[10px] text-gray-500">Ukuran: <strong>{o.ukuran || '-'}</strong></span>
                                        <span className="text-gray-300">|</span>
                                        <span className="text-[10px] text-gray-500">Warna: <strong>{o.warna || '-'}</strong></span>
                                      </div>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className={`h-1.5 flex-1 max-w-[60px] rounded-full ${
                                          o.stok <= 0 ? 'bg-red-200' :
                                          o.stok < 10 ? 'bg-amber-200' :
                                          'bg-emerald-200'
                                        }`}>
                                          <div className={`h-1.5 rounded-full ${
                                            o.stok <= 0 ? 'bg-red-500 w-0' :
                                            o.stok < 10 ? 'bg-amber-500' :
                                            'bg-emerald-500'
                                          }`} style={{ width: `${Math.min(100, (o.stok / 50) * 100)}%` }} />
                                        </div>
                                        <span className={`text-[10px] font-bold ${
                                          o.stok <= 0 ? 'text-red-600' :
                                          o.stok < 10 ? 'text-amber-600' :
                                          'text-emerald-700'
                                        }`}>
                                          {o.stok} pcs
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                renderSelected={(o) => (
                                  <div className="flex items-center gap-2 w-full">
                                    <span className="font-medium text-gray-700 text-xs">{o.sku || '-'}</span>
                                    <span className="text-[10px] text-gray-500">Ukuran: <strong>{o.ukuran || '-'}</strong></span>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-[10px] text-gray-500">Warna: <strong>{o.warna || '-'}</strong></span>
                                    <span className={`ml-auto text-[10px] font-bold ${
                                      o.stok <= 0 ? 'text-red-500' :
                                      o.stok < 10 ? 'text-amber-500' :
                                      'text-emerald-600'
                                    }`}>
                                      {o.stok} pcs
                                    </span>
                                  </div>
                                )}
                              />
                            </div>

                            {/* Qty */}
                            <div className="sm:col-span-3">
                              <label className="block text-[10px] font-bold text-gray-400 mb-1">Qty Transfer</label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  required
                                  min="1"
                                  disabled={!row.product_variant_id}
                                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 disabled:bg-gray-100 rounded-lg text-xs outline-none focus:border-emerald-500 font-bold text-center"
                                  value={row.qty}
                                  onChange={e => handleQtyChange(idx, e.target.value)}
                                />
                              </div>
                            </div>
                          </div>

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

              {/* Ringkasan */}
              {items.length > 0 && (
                <div className="bg-gray-50 border border-gray-150 rounded-xl px-4 py-3 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-semibold">Total Item: <strong className="text-gray-800">{items.length} produk</strong></span>
                  <span className="text-gray-500 font-semibold">Total Qty: <strong className="text-gray-800">{items.reduce((acc, it) => acc + (it.qty || 0), 0)} pcs</strong></span>
                </div>
              )}

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 text-amber-800">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold leading-relaxed">
                  Stok fisik di <strong>{originOutlet?.nama || 'Outlet Asal'}</strong> akan langsung dikurangi setelah transfer diproses. Mohon pastikan data barang dan jumlah yang dimasukkan sudah benar.
                </span>
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-150 bg-gray-50/50 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={isFormInvalid || processing}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/10 transition-all inline-flex items-center gap-2"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                {processing ? 'Menyimpan...' : 'Kirim Transfer'}
              </button>
            </div>

          </div>
    </div>,
    document.body
  );
}
