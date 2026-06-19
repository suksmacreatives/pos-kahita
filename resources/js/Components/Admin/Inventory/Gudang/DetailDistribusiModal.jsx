import React from "react";
import { createPortal } from 'react-dom';
import { X, Send } from "lucide-react";

export default function DetailDistribusiModal({ data, onClose }) {
  if (!data) return null;
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <Send className="w-5 h-5 text-sky-600" />
            <div>
              <h3 className="text-sm font-bold text-gray-800">Detail Distribusi Outlet</h3>
              <p className="text-[10px] text-gray-400">{data.nomor_do} — {data.outlet_tujuan}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 font-medium">Outlet</p>
              <p className="font-bold text-gray-800 mt-0.5 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.outlet_hexColor }} />
                {data.outlet_tujuan}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 font-medium">Tgl Kirim</p>
              <p className="font-bold text-gray-800 mt-0.5">{data.tanggal_kirim || '-'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 font-medium">Tgl Terima</p>
              <p className="font-bold text-gray-800 mt-0.5">{data.tanggal_terima || '-'}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-600 mb-2">Item Produk</p>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">Produk</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">Ukuran</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">Warna</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.items?.map((it, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-800">{it.nama}</td>
                      <td className="px-3 py-2 text-gray-500">{it.ukuran}</td>
                      <td className="px-3 py-2 text-gray-500">{it.warna || '-'}</td>
                      <td className="px-3 py-2 text-right font-bold text-gray-800">{it.qty}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan="2" className="px-3 py-2 text-right font-semibold text-gray-600">Total</td>
                    <td className="px-3 py-2 text-right font-bold text-gray-900">{data.total_qty}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold cursor-pointer">Tutup</button>
        </div>
      </div>
    </div>
    , document.body
  );
}

