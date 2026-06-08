import React, { useMemo } from "react";
import { X, ArrowUpDown } from "lucide-react";

export default function LihatMutasiModal({ data, onClose, mutasiLog = [] }) {
  if (!data) return null;

  const filtered = useMemo(() =>
    mutasiLog.filter(m => m.produk_id === data.id || m.nama_produk === data.nama_produk),
  [data, mutasiLog]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <ArrowUpDown className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-sm font-bold text-gray-800">Riwayat Mutasi</h3>
              <p className="text-[10px] text-gray-400">{data.kode_produk} — {data.nama_produk}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-center py-10 text-xs text-gray-400 italic">Tidak ada mutasi untuk produk ini</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">{m.keterangan || m.tipe}</p>
                    <p className="text-[10px] text-gray-400">{m.timestamp ? new Date(m.timestamp).toLocaleDateString('id-ID') : ''}</p>
                  </div>
                  <span className={`text-xs font-bold ${m.tipe === 'MASUK' ? 'text-emerald-600' : m.tipe === 'KELUAR' ? 'text-blue-600' : 'text-gray-600'}`}>
                    {m.tipe === 'MASUK' ? '+' : ''}{m.qty}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer">Tutup</button>
        </div>
      </div>
    </div>
  );
}
