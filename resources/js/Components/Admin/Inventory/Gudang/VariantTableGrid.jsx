import React, { useState } from "react";
import { Trash2 } from "lucide-react";

export default function VariantTableGrid({
  nama,
  kode,
  variants,
  onRemove,
  onQtyChange,
  onHargaChange,
  showHarga = false,
  maxKey = null,
}) {
  const [bulkVal, setBulkVal] = useState("");

  const handleBulkFill = () => {
    const v = parseInt(bulkVal);
    if (isNaN(v) || v < 0) return;
    variants.forEach((_, i) => onQtyChange(i, v));
    setBulkVal("");
  };

  const totalQty = variants.reduce((a, v) => a + (parseInt(v.qty) || 0), 0);
  const totalHarga = showHarga
    ? variants.reduce((a, v) => a + ((parseInt(v.qty) || 0) * (parseInt(v.harga_beli) || 0)), 0)
    : 0;

  return (
    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate">{nama}</p>
          <p className="text-[10px] text-gray-400 font-mono">{kode}</p>
        </div>
        <button type="button" onClick={onRemove} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer ml-2 shrink-0">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[10px] text-gray-400 uppercase">
              <th className="text-left py-1 pr-2 font-medium">Warna</th>
              <th className="text-left py-1 px-2 font-medium">Ukuran</th>
              {maxKey && <th className="text-right py-1 px-2 font-medium">{maxKey === 'stok' ? 'Stok' : maxKey}</th>}
              <th className="text-right py-1 px-2 font-medium">Qty</th>
              {showHarga && <th className="text-right py-1 px-2 font-medium">Harga Beli</th>}
              {showHarga && <th className="text-right py-1 pl-2 font-medium">Subtotal</th>}
            </tr>
          </thead>
          <tbody>
            {variants.map((v, i) => {
              const qty = parseInt(v.qty) || 0;
              const harga = parseInt(v.harga_beli) || 0;
              const maxVal = maxKey ? (v[maxKey] ?? Infinity) : Infinity;
              const overMax = maxKey && qty > maxVal;
              const subtotal = showHarga ? qty * harga : 0;

              return (
                <tr key={`${v.warna}-${v.ukuran}-${i}`} className={`border-t border-gray-200 ${overMax ? 'bg-rose-50' : ''}`}>
                  <td className="py-1.5 pr-2">
                    <div className="flex items-center gap-1.5">
                      {v.warna && <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-gray-300" style={{ backgroundColor: v.warna_hex || '#6b7280' }} />}
                      <span className="text-gray-600 truncate">{v.warna || '\u2014'}</span>
                    </div>
                  </td>
                  <td className="py-1.5 px-2">
                    <span className="font-semibold text-gray-700">{v.ukuran || '\u2014'}</span>
                  </td>
                  {maxKey && (
                    <td className="py-1.5 px-2 text-right">
                      <span className="text-gray-500">{v[maxKey]}</span>
                    </td>
                  )}
                  <td className="py-1.5 px-2">
                    <input
                      type="number"
                      min="0"
                      max={maxVal === Infinity ? undefined : maxVal}
                      className={`w-16 px-2 py-1 border rounded-lg text-xs text-right font-bold outline-none focus:border-emerald-500 ${overMax ? 'border-rose-400 bg-rose-100' : 'border-gray-200'}`}
                      value={v.qty}
                      onChange={e => onQtyChange(i, parseInt(e.target.value) || 0)}
                    />
                  </td>
                  {showHarga && (
                    <td className="py-1.5 px-2">
                      <input
                        type="number"
                        min="0"
                        className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-xs text-right outline-none focus:border-emerald-500"
                        value={v.harga_beli}
                        onChange={e => onHargaChange(i, parseInt(e.target.value) || 0)}
                      />
                    </td>
                  )}
                  {showHarga && (
                    <td className="py-1.5 pl-2 text-right">
                      <span className="font-bold text-gray-600">{subtotal.toLocaleString()}</span>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-400 font-medium">Isi Semua:</span>
          <input
            type="number"
            min="0"
            className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-xs text-right outline-none focus:border-emerald-500"
            placeholder="qty"
            value={bulkVal}
            onChange={e => setBulkVal(e.target.value)}
          />
          <button
            type="button"
            onClick={handleBulkFill}
            disabled={!bulkVal || parseInt(bulkVal) < 0}
            className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold hover:bg-emerald-200 cursor-pointer disabled:opacity-50"
          >
            Terapkan
          </button>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-gray-500">Qty: <strong className="text-gray-800">{totalQty}</strong></span>
          {showHarga && <span className="text-gray-500">Total: <strong className="text-gray-800">Rp {totalHarga.toLocaleString()}</strong></span>}
        </div>
      </div>
    </div>
  );
}
