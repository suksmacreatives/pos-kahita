import React, { useState, useMemo } from 'react';
import { Eye, CheckSquare, Send, XCircle } from 'lucide-react';
import SelectDropdown from '@/Components/Admin/SelectDropdown';

export default function DistribusiOutletTable({ data = [], title = 'Distribusi Outlet', showTanggalTerima = true, showStatus = true, batalUntil = null, onLihat, onKonfirmasiTerima, onProses, onBatalDO }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [filterOutlet, setFilterOutlet] = useState('semua');
  const [filterTipe, setFilterTipe] = useState('semua');

  const canBatal = (d) => {
    if (!batalUntil) return false;
    const created = d.created_at ? new Date(d.created_at).getTime() : null;
    const until = new Date(batalUntil).getTime();
    return created != null && created >= until - 24 * 60 * 60 * 1000 && created <= until;
  };

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
    if (filterTipe !== 'semua') result = result.filter(d => (d.tipe_tujuan || 'outlet') === filterTipe);
    return result;
  }, [data, search, filterStatus, filterOutlet, filterTipe]);

  const statusConfig = {
    draft: { label: 'Draft', class: 'text-gray-500 bg-gray-100' },
    dikirim: { label: 'Dikirim', class: 'text-blue-600 bg-blue-50' },
    diterima: { label: 'Diterima', class: 'text-emerald-600 bg-emerald-50' },
  };

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input type="text" placeholder="Cari DO / Tujuan..." className="flex-1 min-w-[200px] max-w-xs px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500" value={search} onChange={e => setSearch(e.target.value)} />
        <SelectDropdown
          value={filterTipe}
          onChange={(v) => setFilterTipe(v)}
          options={[
            { value: 'semua', label: 'Semua Tujuan' },
            { value: 'outlet', label: 'Outlet' },
            { value: 'online', label: 'Online Shop' },
          ]}
          placeholder="Semua Tujuan"
          className="w-40"
        />
        {showStatus && (
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
        )}
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
              <th className="p-2 text-left text-xs font-semibold text-gray-500">Tujuan</th>
              <th className="p-2 text-left text-xs font-semibold text-gray-500">Outlet / Online Shop</th>
              <th className="p-2 text-left text-xs font-semibold text-gray-500">Tgl Kirim</th>
              {showTanggalTerima && (
                <th className="p-2 text-left text-xs font-semibold text-gray-500">Tgl Terima</th>
              )}
              <th className="p-2 text-right text-xs font-semibold text-gray-500">Total Qty</th>
              {showStatus && (
                <th className="p-2 text-center text-xs font-semibold text-gray-500">Status</th>
              )}
              <th className="p-2 text-center text-xs font-semibold text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={((showTanggalTerima ? 1 : 0) + (showStatus ? 1 : 0) + 6)} className="text-center py-10 text-sm text-gray-400 italic">Tidak ada data distribusi</td>
              </tr>
            )}
            {filtered.map(d => {
              const sc = statusConfig[d.status] || statusConfig.draft;
              const isOnline = (d.tipe_tujuan || 'outlet') === 'online';
              return (
                  <tr key={d.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono text-xs text-gray-800">
                          {d.nomor_do}
                      </td>
                      <td className="p-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${isOnline ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600'}`}>
                              {isOnline ? 'Online Shop' : 'Outlet'}
                          </span>
                      </td>
                      <td className="p-2">
                          <div className="flex items-center gap-2">
                              <span
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: d.outlet_hexColor }}
                              />
                              <span className="text-sm text-gray-700">
                                  {d.outlet_tujuan}
                              </span>
                          </div>
                      </td>
                      <td className="p-2 text-xs text-gray-500">
                          {d.tanggal_kirim || "-"}
                      </td>
                      {showTanggalTerima && (
                        <td className="p-2 text-xs text-gray-500">
                            {d.tanggal_terima || "-"}
                        </td>
                      )}
                      <td className="p-2 text-right text-sm font-bold text-gray-800">
                          {d.total_qty}
                      </td>
                      {showStatus && (
                        <td className="p-2 text-center">
                            <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${sc.class}`}
                            >
                                {sc.label}
                            </span>
                        </td>
                      )}
                      <td className="p-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                              <button
                                  onClick={() => onLihat?.(d)}
                                  className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg cursor-pointer"
                                  title="Lihat"
                              >
                                  <Eye className="w-3.5 h-3.5" />
                              </button>
                              {d.status === "draft" && (
                                  <button
                                      onClick={() => onProses?.(d)}
                                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                                      title="Proses"
                                  >
                                      <Send className="w-3.5 h-3.5" />
                                  </button>
                              )}
                              {d.status === "draft" && (
                                  <button
                                      onClick={() => onBatalDO?.(d)}
                                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                      title="Batalkan"
                                  >
                                      <XCircle className="w-3.5 h-3.5" />
                                  </button>
                              )}
                              {!showStatus && canBatal(d) && (
                                  <button
                                      onClick={() => onBatalDO?.(d)}
                                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                      title="Batalkan"
                                  >
                                      <XCircle className="w-3.5 h-3.5" />
                                  </button>
                              )}
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
