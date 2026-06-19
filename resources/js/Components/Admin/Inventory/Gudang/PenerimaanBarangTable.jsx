import React, { useState, useMemo } from 'react';
import { Eye, CheckSquare, Printer, Send, XCircle } from 'lucide-react';
import SelectDropdown from '@/Components/Admin/SelectDropdown';

function DetailPenerimaanModal({ data, onClose }) {
  if (!data) return null;
  return (
      <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
      >
          <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
          >
              <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
                  <div>
                      <h3 className="text-sm font-bold text-gray-800">
                          Detail Penerimaan Barang
                      </h3>
                      <p className="text-[10px] text-gray-400">
                          PO: {data.nomor_po} - {data.supplier_nama}
                      </p>
                  </div>
                  <button
                      onClick={onClose}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 cursor-pointer"
                  >
                      <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                      >
                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                          />
                      </svg>
                  </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                          <span className="font-semibold text-gray-500">
                              Supplier
                          </span>
                          <p className="font-bold text-gray-800 mt-0.5">
                              {data.supplier_nama}
                          </p>
                      </div>
                      <div>
                          <span className="font-semibold text-gray-500">
                              Tgl PO
                          </span>
                          <p className="font-bold text-gray-800 mt-0.5">
                              {data.tanggal_po}
                          </p>
                      </div>
                      <div>
                          <span className="font-semibold text-gray-500">
                              Tgl Terima
                          </span>
                          <p className="font-bold text-gray-800 mt-0.5">
                              {data.tanggal_terima || "-"}
                          </p>
                      </div>
                  </div>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                          <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                  <th className="px-3 py-2 text-left font-semibold text-gray-500">
                                      Produk
                                  </th>
                                  <th className="px-3 py-2 text-left font-semibold text-gray-500">
                                      Ukuran
                                  </th>
                                  <th className="px-3 py-2 text-left font-semibold text-gray-500">
                                      Warna
                                  </th>
                                  <th className="px-3 py-2 text-right font-semibold text-gray-500">
                                      Qty Pesan
                                  </th>
                                  <th className="px-3 py-2 text-right font-semibold text-gray-500">
                                      Qty Terima
                                  </th>
                                  <th className="px-3 py-2 text-right font-semibold text-gray-500">
                                      Harga
                                  </th>
                                  <th className="px-3 py-2 text-right font-semibold text-gray-500">
                                      Subtotal
                                  </th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {(data.items || []).map((it, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50">
                                      <td className="px-3 py-2 font-medium text-gray-800">
                                          {it.nama}
                                      </td>
                                      <td className="px-3 py-2 text-gray-500">
                                          <span
                                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                                                  it.ukuran
                                                      ? "bg-gray-100 border-gray-200 text-gray-800"
                                                      : "bg-gray-50 border-gray-200 text-gray-400"
                                              }`}
                                          >
                                              {it.ukuran || "-"}
                                          </span>
                                      </td>
                                      <td className="px-3 py-2 text-gray-500">
                                          {it.warna}
                                      </td>
                                      <td className="px-3 py-2 text-right text-gray-700">
                                          {it.qty_pesan}
                                      </td>
                                      <td className="px-3 py-2 text-right font-bold text-gray-800">
                                          {it.qty_terima}
                                      </td>
                                      <td className="px-3 py-2 text-right text-gray-600">
                                          {it.harga_beli?.toLocaleString()}
                                      </td>
                                      <td className="px-3 py-2 text-right font-bold text-gray-800">
                                          {(
                                              it.qty_terima * it.harga_beli
                                          ).toLocaleString()}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                          <tfoot className="bg-gray-50 border-t border-gray-200">
                              <tr>
                                  <td colSpan="4" />
                                  <td className="px-3 py-2 text-right font-semibold text-gray-600">
                                      Total
                                  </td>
                                  <td className="px-3 py-2 text-right font-bold text-gray-900">
                                      {data.total_nilai?.toLocaleString()}
                                  </td>
                              </tr>
                          </tfoot>
                      </table>
                  </div>
              </div>
              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
                  <button
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 cursor-pointer"
                  >
                      Tutup
                  </button>
              </div>
          </div>
      </div>
  );
}

export default function PenerimaanBarangTable({ data = [], onTandaiTerima, onProsesPenerimaan, onCetak, onBatalPO }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [filterSupplier, setFilterSupplier] = useState('semua');
  const [detailItem, setDetailItem] = useState(null);

  const supplierList = useMemo(() => {
    const set = new Set(data.map(p => p.supplier_nama));
    return ['semua', ...Array.from(set)];
  }, [data]);

  const filtered = useMemo(() => {
    let result = [...data];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.nomor_po.toLowerCase().includes(q) || p.supplier_nama.toLowerCase().includes(q));
    }
    if (filterStatus !== 'semua') result = result.filter(p => p.status === filterStatus);
    if (filterSupplier !== 'semua') result = result.filter(p => p.supplier_nama === filterSupplier);
    return result;
  }, [data, search, filterStatus, filterSupplier]);

  const statusConfig = {
    draft: { label: 'Draft', class: 'text-gray-400 bg-gray-50' },
    menunggu: { label: 'Menunggu', class: 'text-amber-600 bg-amber-50' },
    sebagian: { label: 'Sebagian', class: 'text-blue-600 bg-blue-50' },
    lengkap: { label: 'Lengkap', class: 'text-emerald-600 bg-emerald-50' },
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Penerimaan Barang</h3>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <input type="text" placeholder="Cari PO / Supplier..." className="flex-1 min-w-[200px] max-w-xs px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500" value={search} onChange={e => setSearch(e.target.value)} />
          <SelectDropdown
            value={filterStatus}
            onChange={(v) => setFilterStatus(v)}
            options={[
              { value: 'semua', label: 'Semua Status' },
              { value: 'draft', label: 'Draft' },
              { value: 'menunggu', label: 'Menunggu' },
              { value: 'sebagian', label: 'Sebagian' },
              { value: 'lengkap', label: 'Lengkap' },
            ]}
            placeholder="Semua Status"
            className="w-40"
          />
          <SelectDropdown
            value={filterSupplier}
            onChange={(v) => setFilterSupplier(v)}
            options={supplierList.map(s => ({ value: s, label: s === 'semua' ? 'Semua Supplier' : s }))}
            placeholder="Semua Supplier"
            className="w-44"
            searchable
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left text-xs font-semibold text-gray-500">No. PO</th>
                <th className="p-2 text-left text-xs font-semibold text-gray-500">Supplier</th>
                <th className="p-2 text-left text-xs font-semibold text-gray-500">Tgl PO</th>
                <th className="p-2 text-left text-xs font-semibold text-gray-500">Tgl Terima</th>
                <th className="p-2 text-right text-xs font-semibold text-gray-500">Total Qty</th>
                <th className="p-2 text-right text-xs font-semibold text-gray-500">Total Nilai</th>
                <th className="p-2 text-center text-xs font-semibold text-gray-500">Status</th>
                <th className="p-2 text-center text-xs font-semibold text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-sm text-gray-400 italic">Tidak ada data penerimaan</td>
                </tr>
              )}
              {filtered.map(p => {
                const sc = statusConfig[p.status] || statusConfig.draft;
                return (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono text-xs text-gray-800">{p.nomor_po}</td>
                    <td className="p-2 text-sm text-gray-700">{p.supplier_nama}</td>
                    <td className="p-2 text-xs text-gray-500">{p.tanggal_po}</td>
                    <td className="p-2 text-xs text-gray-500">{p.tanggal_terima || '-'}</td>
                    <td className="p-2 text-right text-sm font-bold text-gray-800">{p.total_qty}</td>
                    <td className="p-2 text-right text-sm text-gray-700">{p.total_nilai?.toLocaleString()}</td>
                    <td className="p-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${sc.class}`}>{sc.label}</span>
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setDetailItem(p)} className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg cursor-pointer" title="Lihat Detail"><Eye className="w-3.5 h-3.5" /></button>
                        {p.status === 'draft' && (
                          <button onClick={() => onProsesPenerimaan?.(p)} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer" title="Proses PO"><Send className="w-3.5 h-3.5" /></button>
                        )}
                        {p.status === 'menunggu' && (
                          <button onClick={() => onTandaiTerima?.(p)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer" title="Tandai Terima"><CheckSquare className="w-3.5 h-3.5" /></button>
                        )}
                        {['draft', 'menunggu'].includes(p.status) && (
                          <button onClick={() => onBatalPO?.(p)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer" title="Batalkan"><XCircle className="w-3.5 h-3.5" /></button>
                        )}
                        <button onClick={() => onCetak?.(p)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer" title="Cetak"><Printer className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {detailItem && <DetailPenerimaanModal data={detailItem} onClose={() => setDetailItem(null)} />}
    </>
  );
}
