import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, AlertTriangle, Check, ShieldCheck, Search } from 'lucide-react';

export default function FormOpnameOutletModal({ isOpen, onClose, selectedOutlet, onSubmit, outlets = [], outletStok = {} }) {
  if (!isOpen) return null;

  const activeOutlet = outlets.find(o => o.id === selectedOutlet);

  // Wizard state: 'setup' | 'counting'
  const [step, setStep] = useState('setup');
  
  // Setup fields
  const [staffName, setStaffName] = useState('');
  const [scope, setScope] = useState('all'); // 'all' | 'Atasan' | 'Bawahan' | 'Hijab' | 'Terusan' | 'Aksesoris'

  // Counting state: flat array of varians of the selected scope
  const [items, setItems] = useState([]); // [{ id, name, varian_sku, ukuran, warna, stok_sistem, stok_fisik, keterangan }]
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Prepare items when starting opname
  const handleStartOpname = (e) => {
    e.preventDefault();
    if (!staffName.trim()) return;

    const rawProducts = outletStok[selectedOutlet] || [];
    
    // Filter products by scope
    const filteredProducts = scope === 'all' 
      ? rawProducts 
      : rawProducts.filter(p => p.kategori === scope);

    // Flatten into varians
    const flatItems = filteredProducts.flatMap(p => 
      p.varian.map(v => ({
        produk_id: p.id,
        nama: p.nama_produk,
        kategori: p.kategori,
        varian_sku: v.sku,
        ukuran: v.ukuran,
        warna: v.warna,
        stok_sistem: v.stok,
        stok_fisik: v.stok, // default physical = system
        keterangan: ''
      }))
    );

    setItems(flatItems);
    setStep('counting');
  };

  // Update physical stock inline
  const handleFisikChange = (sku, val) => {
    const qty = Math.max(0, parseInt(val) || 0);
    setItems(prev => prev.map(item => 
      item.varian_sku === sku ? { ...item, stok_fisik: qty } : item
    ));
  };

  // Update notes inline
  const handleKeteranganChange = (sku, text) => {
    setItems(prev => prev.map(item => 
      item.varian_sku === sku ? { ...item, keterangan: text } : item
    ));
  };

  // Search filter inside counting sheet
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(it => 
      it.nama.toLowerCase().includes(q) || 
      it.varian_sku.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  // Calculations for summary
  const summary = useMemo(() => {
    let plus = 0;
    let minus = 0;
    items.forEach(it => {
      const diff = it.stok_fisik - it.stok_sistem;
      if (diff > 0) plus += diff;
      if (diff < 0) minus += Math.abs(diff);
    });
    return { plus, minus };
  }, [items]);

  const handleSubmit = () => {
    onSubmit({
      id: Math.floor(100 + Math.random() * 900),
      nomor_opname: `OPO-20260528-${Math.floor(100 + Math.random() * 900)}`,
      outlet_id: selectedOutlet,
      tgl_mulai: new Date().toISOString().split('T')[0],
      tgl_selesai: new Date().toISOString().split('T')[0],
      status: 'selesai',
      items: items.map(it => ({
        produk_id: it.produk_id,
        nama: it.nama,
        ukuran: it.ukuran,
        warna: it.warna,
        stok_sistem: it.stok_sistem,
        stok_fisik: it.stok_fisik,
        selisih: it.stok_fisik - it.stok_sistem,
        keterangan: it.keterangan
      })),
      total_item: items.length,
      total_selisih_plus: summary.plus,
      total_selisih_minus: summary.minus,
      dilakukan_oleh: staffName
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-250" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-base font-bold text-gray-800">
              {step === 'setup' ? 'Mulai Stock Opname Outlet' : 'Form Pengisian Fisik Opname'}
            </h3>
            <p className="text-[10px] text-gray-400 font-medium">Outlet: <span className="font-semibold text-gray-600">{activeOutlet?.nama}</span></p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-150 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setup Step */}
        {step === 'setup' && (
          <form onSubmit={handleStartOpname} className="p-6 space-y-6">
            <div className="bg-amber-55 bg-amber-50 border border-amber-100 text-amber-850 p-4 rounded-xl flex gap-3 text-xs font-semibold">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
              <span>Stock Opname akan membandingkan stok fisik saat ini dengan stok sistem. Pastikan operasional transaksi kasir sedang tenang/tutup sebelum memulai opname.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-550 uppercase mb-2">Petugas Pemeriksa *</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap staff..."
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 font-semibold focus:border-emerald-500 outline-none"
                  value={staffName}
                  onChange={e => setStaffName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-550 uppercase mb-2">Scope / Cakupan Opname</label>
                <select
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 font-semibold focus:border-emerald-500 outline-none cursor-pointer"
                  value={scope}
                  onChange={e => setScope(e.target.value)}
                >
                  <option value="all">Semua Kategori Produk</option>
                  <option value="Atasan">Kategori Atasan</option>
                  <option value="Bawahan">Kategori Bawahan</option>
                  <option value="Terusan">Kategori Terusan</option>
                  <option value="Hijab">Kategori Hijab</option>
                  <option value="Aksesoris">Kategori Aksesoris</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!staffName.trim()}
                className="px-4 py-2 bg-emerald-600 disabled:opacity-50 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/10 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4" />
                Mulai Sesi Opname
              </button>
            </div>
          </form>
        )}

        {/* Counting / Sheet Step */}
        {step === 'counting' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Sheet Search bar */}
            <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between gap-4">
              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari item di checklist..."
                  className="pl-9 pr-4 py-1.5 w-full bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 transition-colors"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="text-[10px] text-gray-400 font-bold uppercase">
                Petugas: <span className="text-gray-600 font-extrabold">{staffName}</span> • Scope: <span className="text-gray-600 font-extrabold">{scope}</span>
              </div>
            </div>

            {/* Flat items table */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="border border-gray-150 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-2.5">Produk</th>
                      <th className="px-4 py-2.5">Varian</th>
                      <th className="px-4 py-2.5 text-right">Stok Sistem</th>
                      <th className="px-4 py-2.5 text-right">Stok Fisik (Input)*</th>
                      <th className="px-4 py-2.5 text-right">Selisih</th>
                      <th className="px-4 py-2.5">Keterangan / Alasan Selisih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                    {filteredItems.map((item) => {
                      const diff = item.stok_fisik - item.stok_sistem;
                      let diffClass = 'text-gray-400';
                      if (diff > 0) diffClass = 'text-emerald-600 font-bold';
                      if (diff < 0) diffClass = 'text-rose-600 font-bold';

                      return (
                        <tr key={item.varian_sku} className="hover:bg-gray-50/50">
                          <td className="px-4 py-2">
                            <div>
                              <span className="font-bold text-gray-800">{item.nama}</span>
                              <span className="block text-[8px] font-mono text-gray-400">{item.varian_sku}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] font-bold">{item.ukuran}</span>
                              <span className="w-3.5 h-3.5 rounded-full border border-gray-200 shrink-0" style={{ backgroundColor: item.warna }} />
                            </div>
                          </td>
                          <td className="px-4 py-2 text-right font-semibold text-gray-500">{item.stok_sistem} pcs</td>
                          <td className="px-4 py-2 text-right">
                            <input
                              type="number"
                              min="0"
                              className="w-16 px-2 py-1 text-right border border-gray-200 rounded-lg outline-none focus:border-emerald-500 font-bold"
                              value={item.stok_fisik}
                              onChange={e => handleFisikChange(item.varian_sku, e.target.value)}
                            />
                          </td>
                          <td className={`px-4 py-2 text-right ${diffClass}`}>
                            {diff > 0 ? `+${diff}` : diff}
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              placeholder={diff < 0 ? 'Mengapa hilang/kurang?' : 'Catatan...'}
                              className="w-full px-2 py-1 border border-gray-200 rounded-lg text-xs outline-none focus:border-emerald-500 font-medium"
                              value={item.keterangan}
                              onChange={e => handleKeteranganChange(item.varian_sku, e.target.value)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom summary and discrepancy warning */}
            <div className="px-6 py-4 border-t border-gray-150 bg-gray-50/50 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Live total discrepancy counters */}
                <div className="flex items-center gap-6">
                  <div className="text-xs">
                    <span className="text-gray-400 font-medium block">Total Selisih (+)</span>
                    <span className="text-sm font-extrabold text-emerald-600">+{summary.plus} pcs</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-400 font-medium block">Total Selisih (-)</span>
                    <span className="text-sm font-extrabold text-rose-600">-{summary.minus} pcs</span>
                  </div>
                </div>

                {/* Confirm actions */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('setup')}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/10 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Selesaikan Opname
                  </button>
                </div>
              </div>

              {/* Warning on negative discrepancies */}
              {summary.minus > 0 && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 rounded-xl p-3 flex gap-2 text-xs font-semibold">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-600 mt-0.5" />
                  <span>Terdapat {summary.minus} item dengan selisih negatif (barang fisik hilang/kurang). Pastikan penghitungan ulang fisik sebelum menyelesaikan opname ini.</span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
    , document.body
  );
}

