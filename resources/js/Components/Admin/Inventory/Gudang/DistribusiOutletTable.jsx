import React, { useState, useMemo } from 'react';
import { Eye, CheckSquare, Printer, Send, XCircle } from 'lucide-react';
import SelectDropdown from '@/Components/Admin/SelectDropdown';

export default function DistribusiOutletTable({ data = [], onLihat, onKonfirmasiTerima, onCetak, onProses, onBatalDO }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [filterOutlet, setFilterOutlet] = useState('semua');

  const outletList = useMemo(() => {
    const set = new Set(data.map(d => d.outlet_tujuan));
    return ['semua', ...Array.from(set)];
  }, [data]);

  const filtered = useMemo(() => {
    let result = [...data];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d => d.nomor_do.toLowerCase().includes(q) || d.outlet_tujuan.toLowerCase().includes(q));
    }
    if (filterStatus !== 'semua') result = result.filter(d => d.status === filterStatus);
    if (filterOutlet !== 'semua') result = result.filter(d => d.outlet_tujuan === filterOutlet);
    return result;
  }, [data, search, filterStatus, filterOutlet]);

  const statusConfig = {
    draft: { label: 'Draft', class: 'text-gray-500 bg-gray-100' },
    dikirim: { label: 'Dikirim', class: 'text-blue-600 bg-blue-50' },
    diterima: { label: 'Diterima', class: 'text-emerald-600 bg-emerald-50' },
  };

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Outlet</h3>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input type="text" placeholder="Cari DO / Outlet..." className="flex-1 min-w-[200px] max-w-xs px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500" value={search} onChange={e => setSearch(e.target.value)} />
        <SelectDropdown
          value={filterStatus}
          onChange={(v) => setFilterStatus(v)}
          options={[
            { value: 'semua', label: 'Semua Status' },
            { value: 'draft', label: 'Draft' },
            { value: 'dikirim', label: 'Dikirim' },
            { value: 'diterima', label: 'Diterima' },
          ]}
          placeholder="Semua Status"
          className="w-40"
        />
        <SelectDropdown
          value={filterOutlet}
          onChange={(v) => setFilterOutlet(v)}
          options={outletList.map(o => ({ value: o, label: o === 'semua' ? 'Semua Outlet' : o }))}
          placeholder="Semua Outlet"
          className="w-44"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left text-xs font-semibold text-gray-500">No. DO</th>
              <th className="p-2 text-left text-xs font-semibold text-gray-500">Outlet</th>
              <th className="p-2 text-left text-xs font-semibold text-gray-500">Tgl Kirim</th>
              <th className="p-2 text-left text-xs font-semibold text-gray-500">Tgl Terima</th>
              <th className="p-2 text-right text-xs font-semibold text-gray-500">Total Qty</th>
              <th className="p-2 text-center text-xs font-semibold text-gray-500">Status</th>
              <th className="p-2 text-center text-xs font-semibold text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-10 text-sm text-gray-400 italic">Tidak ada data distribusi</td>
              </tr>
            )}
            {filtered.map(d => {
              const sc = statusConfig[d.status] || statusConfig.draft;
              return (
                <tr key={d.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-mono text-xs text-gray-800">{d.nomor_do}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.outlet_hexColor }} />
                      <span className="text-sm text-gray-700">{d.outlet_tujuan}</span>
                    </div>
                  </td>
                  <td className="p-2 text-xs text-gray-500">{d.tanggal_kirim || '-'}</td>
                  <td className="p-2 text-xs text-gray-500">{d.tanggal_terima || '-'}</td>
                  <td className="p-2 text-right text-sm font-bold text-gray-800">{d.total_qty}</td>
                  <td className="p-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${sc.class}`}>{sc.label}</span>
                  </td>
                  <td className="p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onLihat?.(d)} className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg cursor-pointer" title="Lihat"><Eye className="w-3.5 h-3.5" /></button>
                      {d.status === 'draft' && (
                        <button onClick={() => onProses?.(d)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer" title="Proses"><Send className="w-3.5 h-3.5" /></button>
                      )}
                      {d.status === 'draft' && (
                        <button onClick={() => onBatalDO?.(d)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer" title="Batalkan"><XCircle className="w-3.5 h-3.5" /></button>
                      )}
                      {d.status === 'dikirim' && (
                        <button onClick={() => onKonfirmasiTerima?.(d)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer" title="Konfirmasi Terima"><CheckSquare className="w-3.5 h-3.5" /></button>
                      )}
                      <button onClick={() => onCetak?.(d)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer" title="Cetak"><Printer className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
