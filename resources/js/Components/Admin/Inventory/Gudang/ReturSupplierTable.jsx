import React, { useState, useMemo } from 'react';
import { Eye, Printer, XCircle } from 'lucide-react';
import SelectDropdown from '@/Components/Admin/SelectDropdown';

function DetailReturModal({ data, onClose }) {
  if (!data) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Detail Retur Supplier</h3>
            <p className="text-[10px] text-gray-400">{data.nomor_retur} — {data.supplier_nama}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 cursor-pointer"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div><span className="font-semibold text-gray-500">Supplier</span><p className="font-bold text-gray-800 mt-0.5">{data.supplier_nama}</p></div>
            <div><span className="font-semibold text-gray-500">Tanggal</span><p className="font-bold text-gray-800 mt-0.5">{data.tanggal}</p></div>
            <div><span className="font-semibold text-gray-500">Alasan</span><p className="font-bold text-gray-800 mt-0.5">{data.alasan}</p></div>
          </div>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-500">Produk</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-500">Ukuran</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-500">Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data.items || []).map((it, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-800">{it.nama}</td>
                    <td className="px-3 py-2 text-gray-500">{it.ukuran}</td>
                    <td className="px-3 py-2 text-right font-bold text-gray-800">{it.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.catatan && (
            <div className="bg-gray-50 rounded-xl p-3 text-xs">
              <span className="font-semibold text-gray-500">Catatan:</span>
              <p className="text-gray-700 mt-0.5">{data.catatan}</p>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 cursor-pointer">Tutup</button>
        </div>
      </div>
    </div>
  );
}

export default function ReturSupplierTable({ data = [], onCetak, onBatalReturSupplier }) {
  const [filterAlasan, setFilterAlasan] = useState('semua');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [detailItem, setDetailItem] = useState(null);

  const alasanList = useMemo(() => {
    const set = new Set(data.map(r => r.alasan));
    return ['semua', ...Array.from(set)];
  }, [data]);

  const filtered = useMemo(() => {
    let result = [...data];
    if (filterAlasan !== 'semua') result = result.filter(r => r.alasan === filterAlasan);
    if (filterStatus !== 'semua') result = result.filter(r => r.status === filterStatus);
    return result;
  }, [data, filterAlasan, filterStatus]);

  const statusConfig = {
    selesai: { label: 'Selesai', class: 'bg-emerald-200 text-emerald-800' },
    dibatalkan: { label: 'Dibatalkan', class: 'bg-rose-200 text-rose-800' },
    diajukan: { label: 'Diajukan', class: 'bg-gray-200 text-gray-800' },
    diproses: { label: 'Diproses', class: 'bg-amber-200 text-amber-800' },
    diterima: { label: 'Diterima', class: 'bg-emerald-200 text-emerald-800' },
    ditolak: { label: 'Ditolak', class: 'bg-rose-200 text-rose-800' },
  };

  const alasanColors = {
    'Produk cacat': 'text-rose-600 bg-rose-50 border-rose-200',
    'Stok berlebih': 'text-amber-600 bg-amber-50 border-amber-200',
    'Tidak laku': 'text-gray-600 bg-gray-50 border-gray-200',
    'Salah kirim': 'text-blue-600 bg-blue-50 border-blue-200',
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Retur Supplier</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <SelectDropdown
            value={filterAlasan}
            onChange={(v) => setFilterAlasan(v)}
            options={alasanList.map(a => ({ value: a, label: a === 'semua' ? 'Semua Alasan' : a }))}
            placeholder="Semua Alasan"
            className="w-44"
          />
          {/* <SelectDropdown
            value={filterStatus}
            onChange={(v) => setFilterStatus(v)}
            options={[
              { value: 'semua', label: 'Semua Status' },
              { value: 'selesai', label: 'Selesai' },
              { value: 'dibatalkan', label: 'Dibatalkan' },
              { value: 'diajukan', label: 'Diajukan' },
              { value: 'diproses', label: 'Diproses' },
              { value: 'diterima', label: 'Diterima' },
              { value: 'ditolak', label: 'Ditolak' },
            ]}
            placeholder="Semua Status"
            className="w-40"
          /> */}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor Retur</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alasan</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Item</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Qty</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-sm text-gray-400 italic">Tidak ada data retur</td>
                </tr>
              )}
              {filtered.map((r, idx) => {
                const sc = statusConfig[r.status] || statusConfig.diajukan;
                const ac = alasanColors[r.alasan] || 'text-gray-600 bg-gray-50 border-gray-200';
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-700">{idx + 1}</td>
                    <td className="px-4 py-2 font-mono text-xs text-gray-800 font-semibold">{r.nomor_retur}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{r.supplier_nama}</td>
                    <td className="px-4 py-2 text-xs text-gray-500">{r.tanggal}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${ac}`}>{r.alasan}</span>
                    </td>
                    <td className="px-4 py-2 text-right text-sm text-gray-700">{r.total_item}</td>
                    <td className="px-4 py-2 text-right text-sm font-bold text-gray-800">{r.total_qty}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${sc.class}`}>{sc.label}</span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setDetailItem(r)} className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg cursor-pointer" title="Detail"><Eye className="w-3.5 h-3.5" /></button>
                        {r.status === 'selesai' && Date.now() - new Date(r.created_at).getTime() <= 2 * 24 * 60 * 60 * 1000 && (
                          <button onClick={() => onBatalReturSupplier?.(r)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer" title="Batalkan"><XCircle className="w-3.5 h-3.5" /></button>
                        )}
                        <button onClick={() => onCetak?.(r)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer" title="Cetak"><Printer className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {detailItem && <DetailReturModal data={detailItem} onClose={() => setDetailItem(null)} />}
    </>
  );
}
