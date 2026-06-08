import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Eye, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function StockOpnameOutletTable({ selectedOutlet, opnameList = {} }) {
  const [search, setSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // If "all" is active, render explanation block
  if (selectedOutlet === 'all') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-amber-50 rounded-full text-amber-500">
          <ShieldAlert className="w-10 h-10 stroke-[1.5]" />
        </div>
        <div className="max-w-md">
          <h3 className="text-sm font-bold text-gray-800">Pilih Outlet Terlebih Dahulu</h3>
          <p className="text-xs text-gray-500 font-medium mt-1">Stock Opname fisik hanya dapat dikelola saat melihat satu lokasi outlet tertentu saja untuk menjaga sinkronisasi data fisik.</p>
        </div>
      </div>
    );
  }

  const activeList = opnameList[selectedOutlet] || [];

  // Filter list
  const filteredList = useMemo(() => {
    let items = [...activeList];
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(o => o.nomor_opname.toLowerCase().includes(q));
    }
    // Sort descending by start date
    items.sort((a, b) => new Date(b.tgl_mulai) - new Date(a.tgl_mulai));
    return items;
  }, [activeList, search]);

  const getStatusChip = (status) => {
    if (status === 'berlangsung') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Berlangsung
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Selesai
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Search Filter bar */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Daftar Sesi Stock Opname</h3>
          <p className="text-[10px] text-gray-400 font-medium">Rekaman rekonsiliasi berkala stok fisik dan sistem</p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari No. Opname..."
            className="pl-9 pr-4 py-1.5 w-44 md:w-56 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 transition-colors"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500">
              <th className="w-8 px-5 py-3"></th>
              <th className="px-5 py-3">No. Opname</th>
              <th className="px-5 py-3">Tgl. Mulai</th>
              <th className="px-5 py-3">Tgl. Selesai</th>
              <th className="px-5 py-3 text-right">Total Item</th>
              <th className="px-5 py-3 text-right">Selisih (+)</th>
              <th className="px-5 py-3 text-right">Selisih (-)</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-10 text-gray-400 font-medium">
                  Belum ada sesi stock opname terdaftar
                </td>
              </tr>
            ) : (
              filteredList.map((row) => {
                const isExpanded = !!expandedRows[row.id];
                return (
                  <React.Fragment key={row.id}>
                    <tr className="hover:bg-gray-55/50 transition-colors">
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => toggleRow(row.id)}
                          className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-5 py-3 font-mono font-semibold text-gray-800">{row.nomor_opname}</td>
                      <td className="px-5 py-3 font-medium text-gray-500">{row.tgl_mulai}</td>
                      <td className="px-5 py-3 font-medium text-gray-500">{row.tgl_selesai || '-'}</td>
                      <td className="px-5 py-3 text-right font-bold text-gray-500">{row.total_item}</td>
                      <td className="px-5 py-3 text-right font-bold text-emerald-600">+{row.total_selisih_plus}</td>
                      <td className="px-5 py-3 text-right font-bold text-rose-600">-{row.total_selisih_minus}</td>
                      <td className="px-5 py-3 text-center">{getStatusChip(row.status)}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => toggleRow(row.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg inline-flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>

                    {/* Expandable item details */}
                    {isExpanded && (
                      <tr className="bg-gray-50/50">
                        <td colSpan="9" className="px-10 py-4 border-t border-gray-100">
                          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-inner max-w-3xl">
                            <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-200 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                              <span>Checklist Hasil Opname</span>
                              {row.dilakukan_oleh && (
                                <span className="normal-case text-gray-400 font-medium">Diperiksa oleh: <strong className="text-gray-650 font-semibold">{row.dilakukan_oleh}</strong></span>
                              )}
                            </div>
                            <table className="w-full text-left">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr className="text-[10px] font-bold text-gray-500 uppercase">
                                  <th className="px-4 py-2">Produk</th>
                                  <th className="px-4 py-2">Ukuran</th>
                                  <th className="px-4 py-2">Warna</th>
                                  <th className="px-4 py-2 text-right">Stok Sistem</th>
                                  <th className="px-4 py-2 text-right">Stok Fisik</th>
                                  <th className="px-4 py-2 text-right">Selisih</th>
                                  <th className="px-4 py-2">Keterangan</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                {row.items.map((it, idx) => {
                                  let diffClass = 'text-gray-400';
                                  if (it.selisih > 0) diffClass = 'text-emerald-600 font-bold';
                                  if (it.selisih < 0) diffClass = 'text-rose-600 font-bold';

                                  return (
                                    <tr key={idx} className="hover:bg-gray-55/50">
                                      <td className="px-4 py-2 font-bold text-gray-850">{it.nama}</td>
                                      <td className="px-4 py-2">
                                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] font-bold">{it.ukuran}</span>
                                      </td>
                                      <td className="px-4 py-2 flex items-center gap-1.5">
                                        <span className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ backgroundColor: it.warna }} />
                                        <span className="text-[10px] text-gray-400 font-mono">{it.warna}</span>
                                      </td>
                                      <td className="px-4 py-2 text-right font-medium text-gray-450">{it.stok_sistem} pcs</td>
                                      <td className="px-4 py-2 text-right font-bold text-gray-800">{it.stok_fisik} pcs</td>
                                      <td className={`px-4 py-2 text-right ${diffClass}`}>
                                        {it.selisih > 0 ? `+${it.selisih}` : it.selisih}
                                      </td>
                                      <td className="px-4 py-2 font-medium italic text-gray-500">{it.keterangan || '-'}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
