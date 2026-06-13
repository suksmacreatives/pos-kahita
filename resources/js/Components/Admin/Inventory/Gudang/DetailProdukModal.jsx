import React from "react";
import { createPortal } from 'react-dom';
import { X, Package } from "lucide-react";

export default function DetailProdukModal({ data, onClose }) {
  if (!data) return null;
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-gray-800">{data.nama_produk}</h3>
              <p className="text-[10px] text-gray-400 font-mono">{data.kode_produk}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 font-medium">Kategori</p>
              <p className="font-bold text-gray-800 mt-0.5">{data.kategori}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 font-medium">Total Stok</p>
              <p className="font-bold text-gray-800 mt-0.5">{data.total_stok}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 font-medium">Harga Beli</p>
              <p className="font-bold text-gray-800 mt-0.5">Rp {data.harga_beli?.toLocaleString()}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-600 mb-2">Varian</p>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">Ukuran</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">Warna</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Stok</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">SKU</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.varian?.map((v, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-700">{v.ukuran || '\u2014'}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          {v.warna && <span className="w-3 h-3 rounded-full inline-block border border-gray-200 shrink-0" style={{ backgroundColor: v.warna_hex || '#6b7280' }} />}
                          <span className="text-gray-600">{v.warna || '\u2014'}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-gray-800">{v.stok}</td>
                      <td className="px-3 py-2 font-mono text-gray-500">{v.sku}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {data.stok_minimum > 0 && (
            <div className="flex items-center gap-2 text-xs p-3 bg-amber-50 rounded-xl border border-amber-200">
              <span className="font-semibold text-amber-700">Stok Minimum:</span>
              <span className="font-bold text-amber-800">{data.stok_minimum}</span>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer">Tutup</button>
        </div>
      </div>
    </div>
    , document.body
  );
}

