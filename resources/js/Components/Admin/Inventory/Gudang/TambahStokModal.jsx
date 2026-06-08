import React, { useState } from "react";
import { X, Plus, Package } from "lucide-react";

export default function TambahStokModal({ data, onClose, onSubmit }) {
  const [qty, setQty] = useState(1);
  const [catatan, setCatatan] = useState("");
  if (!data) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ produk_id: data.id, nama: data.nama_produk, qty: parseInt(qty), catatan });
    setQty(1);
    setCatatan("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-gray-800">Tambah Stok</h3>
              <p className="text-[10px] text-gray-400 font-mono">{data.kode_produk} — {data.nama_produk}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Stok Saat Ini</label>
            <p className="text-2xl font-bold text-gray-800">{data.total_stok}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Jumlah Tambahan *</label>
            <input type="number" min="1" required className="w-full px-3 py-2 border border-gray-200 rounded-xl text-lg font-bold text-right outline-none focus:border-blue-500" value={qty} onChange={e => setQty(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Catatan</label>
            <textarea className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-500 resize-none" rows="2" placeholder="Opsional" value={catatan} onChange={e => setCatatan(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 cursor-pointer">Batal</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"><Plus className="w-3.5 h-3.5 inline mr-1" />Tambah Stok</button>
          </div>
        </form>
      </div>
    </div>
  );
}
