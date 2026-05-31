import React, { useState, useMemo } from "react";
import { X, Search, CheckCircle2, AlertTriangle, ClipboardList, FileSpreadsheet } from "lucide-react";
import { warehouseProducts } from "@/data/inventoryGudangData";

const stepLabels = [
  { icon: FileSpreadsheet, label: "Pilih Produk" },
  { icon: ClipboardList, label: "Input Stok Aktual" },
  { icon: CheckCircle2, label: "Review & Simpan" },
];

export default function FormOpnameModal({ open, onClose, onSubmit }) {
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [aktualValues, setAktualValues] = useState({});

  const filtered = useMemo(() => {
    if (!search) return warehouseProducts;
    const q = search.toLowerCase();
    return warehouseProducts.filter(p =>
      p.nama_produk.toLowerCase().includes(q) || p.kode_produk.toLowerCase().includes(q)
    );
  }, [search]);

  const selectedProducts = useMemo(() =>
    warehouseProducts.filter(p => selectedIds.includes(p.id)), [selectedIds]
  );

  const toggleProduct = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(p => p.id));
    }
  };

  const setAktual = (produkId, ukuran, val) => {
    setAktualValues(prev => ({
      ...prev,
      [`${produkId}-${ukuran}`]: parseInt(val) || 0,
    }));
  };

  const results = useMemo(() => {
    return selectedProducts.map(p => {
      let totalSistem = 0, totalAktual = 0, totalSelisih = 0;
      const varian = p.varian.map(v => {
        const akt = aktualValues[`${p.id}-${v.ukuran}`] ?? v.stok;
        const selisih = akt - v.stok;
        totalSistem += v.stok;
        totalAktual += akt;
        totalSelisih += selisih;
        return { ...v, aktual: akt, selisih };
      });
      return { ...p, varian, totalSistem, totalAktual, totalSelisih };
    });
  }, [selectedProducts, aktualValues]);

  const grandTotalSistem = useMemo(() => results.reduce((a, r) => a + r.totalSistem, 0), [results]);
  const grandTotalAktual = useMemo(() => results.reduce((a, r) => a + r.totalAktual, 0), [results]);
  const grandTotalSelisih = useMemo(() => results.reduce((a, r) => a + r.totalSelisih, 0), [results]);

  if (!open) return null;

  const handleSubmit = () => {
    const items = results.flatMap(r =>
      r.varian.map(v => ({
        produk_id: r.id,
        nama: r.nama_produk,
        ukuran: v.ukuran,
        qty_sistem: v.stok,
        qty_aktual: v.aktual,
        selisih: v.selisih,
      }))
    );
    onSubmit({
      tanggal: new Date().toISOString(),
      items,
      total_item: results.length,
      total_varian: items.length,
      total_qty_sistem: grandTotalSistem,
      total_qty_aktual: grandTotalAktual,
      total_selisih: grandTotalSelisih,
      status: 'selesai',
    });
    setStep(0);
    setSearch("");
    setSelectedIds([]);
    setAktualValues({});
    onClose();
  };

  const handleClose = () => {
    setStep(0);
    setSearch("");
    setSelectedIds([]);
    setAktualValues({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4" onClick={handleClose}>
      <div className={`bg-white rounded-2xl shadow-xl w-full max-h-[90vh] flex flex-col overflow-hidden ${step === 2 ? 'max-w-4xl' : 'max-w-2xl'}`} onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {stepLabels.map((s, i) => {
                const Icon = s.icon;
                return (
                  <React.Fragment key={i}>
                    {i > 0 && <div className={`w-8 h-0.5 ${i <= step ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold ${i === step ? 'bg-emerald-100 text-emerald-700' : i < step ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {s.label}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 0 && (
            <div>
              <div className="relative mb-4">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Cari produk..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">Dipilih <strong className="text-gray-800">{selectedIds.length}</strong> produk</span>
                <button type="button" onClick={selectAll} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer">
                  {selectedIds.length === filtered.length ? "Hapus Semua" : "Pilih Semua"}
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto space-y-1">
                {filtered.map(p => {
                  const isSelected = selectedIds.includes(p.id);
                  return (
                    <button key={p.id} type="button" onClick={() => toggleProduct(p.id)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${isSelected ? 'bg-emerald-50 border border-emerald-200' : 'border border-transparent hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300'}`}>
                          {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <span className="font-mono text-gray-400">{p.kode_produk}</span>
                        <span className="font-semibold text-gray-800">{p.nama_produk}</span>
                      </div>
                      <span className="text-gray-400">{p.varian.length} varian • {p.total_stok} stok</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end mt-6">
                <button type="button" disabled={selectedIds.length === 0} onClick={() => setStep(1)} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:cursor-not-allowed">
                  Lanjutkan ({selectedIds.length} produk)
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="text-xs text-gray-500 mb-4">Masukkan stok aktual (fisik) untuk setiap varian produk.</p>
              <div className="space-y-4">
                {selectedProducts.map(p => (
                  <div key={p.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs font-bold text-gray-800 mb-2">{p.nama_produk} <span className="font-mono text-gray-400 font-normal">{p.kode_produk}</span></p>
                    <div className="space-y-1.5">
                      {p.varian.map(v => {
                        const akt = aktualValues[`${p.id}-${v.ukuran}`] ?? v.stok;
                        const selisih = akt - v.stok;
                        return (
                          <div key={v.ukuran} className="flex items-center gap-3">
                            <span className="text-[11px] font-semibold text-gray-600 w-12">{v.ukuran}</span>
                            <div className="flex items-center gap-2 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-gray-400">Sistem:</span>
                                <span className="text-xs font-bold text-gray-700 w-8">{v.stok}</span>
                              </div>
                              <span className="text-gray-300">→</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-gray-400">Aktual:</span>
                                <input type="number" min="0" className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-xs text-right font-bold outline-none focus:border-emerald-500" value={akt} onChange={e => setAktual(p.id, v.ukuran, e.target.value)} />
                              </div>
                              <span className={`text-[11px] font-bold ${selisih > 0 ? 'text-emerald-600' : selisih < 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                                {selisih > 0 ? `+${selisih}` : selisih}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <button type="button" onClick={() => setStep(0)} className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 cursor-pointer">Kembali</button>
                <button type="button" onClick={() => setStep(2)} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer">Review Hasil Opname</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center gap-2 mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <ClipboardList className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-emerald-700">Ringkasan Stock Opname</p>
                  <p className="text-[10px] text-emerald-600">{results.length} produk • Total Sistem: <strong>{grandTotalSistem}</strong> • Total Aktual: <strong>{grandTotalAktual}</strong> • Selisih: <strong className={grandTotalSelisih > 0 ? 'text-emerald-700' : grandTotalSelisih < 0 ? 'text-rose-600' : ''}>{grandTotalSelisih > 0 ? `+${grandTotalSelisih}` : grandTotalSelisih}</strong></p>
                </div>
              </div>
              <div className="space-y-3">
                {results.map(r => (
                  <div key={r.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-800">{r.nama_produk} <span className="font-mono text-gray-400 font-normal">{r.kode_produk}</span></span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.totalSelisih > 0 ? 'bg-emerald-100 text-emerald-700' : r.totalSelisih < 0 ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-500'}`}>
                        {r.totalSelisih > 0 ? `+${r.totalSelisih}` : r.totalSelisih}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {r.varian.map(v => (
                        <div key={v.ukuran} className="flex items-center gap-2 text-[11px]">
                          <span className="text-gray-500 w-10">{v.ukuran}</span>
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${v.selisih === 0 ? 'bg-gray-300' : v.selisih > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(100, (v.aktual / (v.stok || 1)) * 100)}%` }} />
                          </div>
                          <span className="text-gray-400 w-8 text-right">{v.stok}</span>
                          <span className="text-gray-300">→</span>
                          <span className="w-8 text-right font-bold">{v.aktual}</span>
                          <span className={`font-bold w-12 text-right ${v.selisih > 0 ? 'text-emerald-600' : v.selisih < 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                            {v.selisih > 0 ? `+${v.selisih}` : v.selisih}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <button type="button" onClick={() => setStep(1)} className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 cursor-pointer">Kembali</button>
                <button type="button" onClick={handleSubmit} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer">Simpan Hasil Opname</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
