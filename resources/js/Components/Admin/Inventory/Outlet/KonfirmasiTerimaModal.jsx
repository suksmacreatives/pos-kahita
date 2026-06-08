import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function KonfirmasiTerimaModal({ isOpen, onClose, data, onConfirm }) {
  // Initialize received quantities from items (stable seed via stringify)
  const seed = data && data.items ? JSON.stringify(data.items.map(i => i.id || i.produk_id)) : '';
  const [itemsState, setItemsState] = useState(() => {
    if (!data || !data.items) return [];
    return data.items.map(item => ({
      ...item,
      qty_terima: item.qty_kirim || item.qty || 0,
      kondisi: 'baik',
      catatan: ''
    }));
  });

  // Sync itemsState when a new distribution order is opened
  useEffect(() => {
    if (data && data.items && data.items.length) {
      setItemsState(
        data.items.map(item => ({
          ...item,
          qty_terima: item.qty_kirim || item.qty || 0,
          kondisi: 'baik',
          catatan: ''
        }))
      );
    }
  }, [seed]);

  if (!isOpen || !data) return null;

  const handleQtyChange = (idx, val) => {
    const nextVal = Math.max(0, parseInt(val) || 0);
    setItemsState(prev => {
      const copy = [...prev];
      copy[idx].qty_terima = Math.min(copy[idx].qty_kirim, nextVal); // Can't exceed sent qty
      return copy;
    });
  };

  const handleKondisiChange = (idx, kondisi) => {
    setItemsState(prev => {
      const copy = [...prev];
      copy[idx].kondisi = kondisi;
      if (kondisi === 'baik') {
        copy[idx].catatan = ''; // reset notes if marked good
      }
      return copy;
    });
  };

  const handleCatatanChange = (idx, notes) => {
    setItemsState(prev => {
      const copy = [...prev];
      copy[idx].catatan = notes;
      return copy;
    });
  };

  // Calculations
  const totalQtyKirim = (data?.items || []).reduce((acc, it) => acc + (it.qty_kirim || it.qty || 0), 0);
  const totalQtyTerima = itemsState.reduce((acc, it) => acc + (it.qty_terima || 0), 0);
  const diffQty = totalQtyKirim - totalQtyTerima;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Status is 'diterima' if everything matches, otherwise 'sebagian'
    const finalStatus = diffQty === 0 ? 'diterima' : 'sebagian';
    
    onConfirm({
      id: data.id,
      nomor_do: data.nomor_do,
      nomor_terima: `TR-20260528-${Math.floor(100 + Math.random() * 900)}`,
      tgl_kirim_gudang: data.tgl_kirim_gudang,
      tgl_terima_outlet: new Date().toISOString().split('T')[0],
      items: itemsState,
      total_item: itemsState.length,
      total_qty: totalQtyTerima,
      status: finalStatus,
      diterima_oleh: 'Admin Outlet'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-base font-bold text-gray-800">Konfirmasi Terima Barang</h3>
            <p className="text-[10px] text-gray-400 font-medium">No. DO: <span className="font-mono text-gray-600 font-bold">{data.nomor_do}</span> • Tanggal Kirim: <span className="font-semibold text-gray-600">{data.tgl_kirim_gudang}</span></p>
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
          {/* Information summary */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-700">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1 font-medium">
              <p>Periksa kembali fisik barang yang dikirim oleh gudang pusat. Anda bisa menyesuaikan jumlah unit jika terdapat ketidaksesuaian/kerusakan.</p>
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-150 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Produk</th>
                  <th className="px-4 py-3">Ukuran & Warna</th>
                  <th className="px-4 py-3 text-right">Qty Kirim</th>
                  <th className="px-4 py-3 text-right">Qty Terima</th>
                  <th className="px-4 py-3 text-center">Kondisi</th>
                  <th className="px-4 py-3">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {itemsState.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-55 transition-colors">
                    <td className="px-4 py-3 font-bold text-gray-800">{item.nama}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] font-bold">{item.ukuran}</span>
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ backgroundColor: item.warna }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-500">{item.qty_kirim} pcs</td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        min="0"
                        max={item.qty_kirim}
                        className="w-16 px-2 py-1 text-right border border-gray-200 rounded-lg outline-none focus:border-emerald-500 font-bold"
                        value={item.qty_terima}
                        onChange={e => handleQtyChange(idx, e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-3">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`kondisi-${idx}`}
                            checked={item.kondisi === 'baik'}
                            onChange={() => handleKondisiChange(idx, 'baik')}
                            className="text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                          />
                          <span className="font-semibold text-gray-600">Baik</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`kondisi-${idx}`}
                            checked={item.kondisi === 'rusak'}
                            onChange={() => handleKondisiChange(idx, 'rusak')}
                            className="text-rose-600 focus:ring-rose-500 w-3.5 h-3.5"
                          />
                          <span className="font-semibold text-rose-600">Cacat</span>
                        </label>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        placeholder={item.kondisi === 'rusak' ? 'Detail kerusakan...' : 'Catatan tambahan...'}
                        disabled={item.kondisi === 'baik'}
                        className="w-full px-2.5 py-1 border border-gray-200 disabled:bg-gray-50 rounded-lg text-xs outline-none focus:border-emerald-500 font-medium"
                        value={item.catatan}
                        onChange={e => handleCatatanChange(idx, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Warning discrepancy alert */}
          {diffQty > 0 && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-3 text-rose-700 animate-bounce">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Perbedaan Selisih Stok Terdeteksi!</p>
                <p className="font-medium">Sebanyak <span className="font-bold underline">{diffQty} item</span> tidak diterima/rusak. Item selisih ini akan diretur otomatis kembali ke gudang pusat setelah konfirmasi disimpan.</p>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-150 bg-gray-50/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/10 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            Konfirmasi Penerimaan
          </button>
        </div>
      </div>
    </div>
  );
}
