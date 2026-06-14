import { useState } from "react";
import { X, Check } from "lucide-react";

export default function VariantBulkEdit({ selected, variants, colors, sizes, onApplyBulk, onActivateAll, onClear, readonlyStok = false }) {
  const [bulkHargaJual, setBulkHargaJual] = useState("");
  const [bulkHargaBeli, setBulkHargaBeli] = useState("");
  const [bulkStok, setBulkStok] = useState("");

  if (selected.size === 0) return null;

  const selectedArr = variants.filter(v => selected.has(v.id));

  const handleApply = (field) => {
    const value = (field === "harga_jual" ? bulkHargaJual : field === "harga_beli" ? bulkHargaBeli : bulkStok);
    if (value === "" || value === undefined) return;
    onApplyBulk(field, Number(value));
    if (field === "harga_jual") setBulkHargaJual("");
    else if (field === "harga_beli") setBulkHargaBeli("");
    else setBulkStok("");
  };

  return (
    <div className="border-l-4 border-emerald-500 bg-white rounded-xl shadow-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
            <Check className="w-3 h-3" />
          </span>
          <span className="text-xs font-bold text-gray-800">{selected.size} varian dipilih</span>
        </div>
        <button onClick={onClear} className="text-[10px] text-gray-400 hover:text-red-500 font-semibold flex items-center gap-0.5">
          <X className="w-3 h-3" /> Batal
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-gray-500">Harga Jual</label>
          <div className="flex gap-1">
            <input type="number" value={bulkHargaJual} onChange={e => setBulkHargaJual(e.target.value)}
              placeholder="Rp" className="w-full p-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            <button onClick={() => handleApply("harga_jual")} disabled={!bulkHargaJual}
              className="px-2 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-600 disabled:opacity-40 transition-colors cursor-pointer">Terapkan</button>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-gray-500">Harga Beli</label>
          <div className="flex gap-1">
            <input type="number" value={bulkHargaBeli} onChange={e => setBulkHargaBeli(e.target.value)}
              placeholder="Rp" className="w-full p-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            <button onClick={() => handleApply("harga_beli")} disabled={!bulkHargaBeli}
              className="px-2 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-600 disabled:opacity-40 transition-colors cursor-pointer">Terapkan</button>
          </div>
        </div>
        {!readonlyStok && (
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-500">Stok</label>
            <div className="flex gap-1">
              <input type="number" value={bulkStok} onChange={e => setBulkStok(e.target.value)}
                placeholder="0" className="w-full p-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              <button onClick={() => handleApply("stok")} disabled={!bulkStok && bulkStok !== 0}
                className="px-2 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-600 disabled:opacity-40 transition-colors cursor-pointer">Terapkan</button>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={() => { onActivateAll(true); onClear(); }}
          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer">
          Aktifkan Semua
        </button>
        <button onClick={() => { onActivateAll(false); onClear(); }}
          className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[10px] font-bold hover:bg-red-100 transition-colors cursor-pointer">
          Nonaktifkan Semua
        </button>
      </div>
    </div>
  );
}
