import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Eye, FileSpreadsheet, Trash2 } from 'lucide-react';
import { returKeGudang } from '@/data/inventoryOutletData';

export default function ReturGudangTable({ selectedOutlet, onCancelRetur }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [alasanFilter, setAlasanFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Compile active list based on outlet mode
  const activeList = useMemo(() => {
    if (selectedOutlet === 'all') {
      return Object.entries(returKeGudang).flatMap(([outletId, list]) => 
        list.map(item => ({ ...item, outletId }))
      );
    }
    return returKeGudang[selectedOutlet] || [];
  }, [selectedOutlet]);

  // Apply filters
  const filteredList = useMemo(() => {
    let items = [...activeList];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(r => r.nomor_retur.toLowerCase().includes(q));
    }

    // Status
    if (statusFilter !== 'all') {
      items = items.filter(r => r.status === statusFilter);
    }

    // Alasan
    if (alasanFilter !== 'all') {
      items = items.filter(r => r.alasan === alasanFilter);
    }

    // Sort descending by date
    items.sort((a, b) => new Date(b.tgl_retur) - new Date(a.tgl_retur));

    return items;
  }, [activeList, search, statusFilter, alasanFilter]);

  // Status Badge JSX helper
  const getStatusChip = (status) => {
    const map = {
      diajukan: {
        bg: 'bg-gray-50 text-gray-600 border-gray-200',
        label: 'Diajukan'
      },
      diproses: {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        label: 'Diproses'
      },
      diterima_gudang: {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: 'Diterima Gudang'
      }
    };
    const cfg = map[status] || map.diajukan;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg}`}>
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Search & Filter Bar */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Daftar Retur Barang ke Gudang</h3>
          <p className="text-[10px] text-gray-400 font-medium">Pengembalian stok rusak/slow-moving ke gudang pusat</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari No. Retur..."
              className="pl-9 pr-4 py-1.5 w-44 md:w-56 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 transition-colors"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <select
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 focus:border-emerald-500 outline-none cursor-pointer"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="diajukan">Diajukan</option>
            <option value="diproses">Diproses</option>
            <option value="diterima_gudang">Diterima Gudang</option>
          </select>

          {/* Alasan filter */}
          <select
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 focus:border-emerald-500 outline-none cursor-pointer"
            value={alasanFilter}
            onChange={e => setAlasanFilter(e.target.value)}
          >
            <option value="all">Semua Alasan</option>
            <option value="kelebihan stok">Kelebihan Stok</option>
            <option value="cacat">Produk Cacat</option>
            <option value="tidak laku">Tidak Laku</option>
            <option value="salah kirim">Salah Kirim</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500">
              <th className="w-8 px-5 py-3"></th>
              {selectedOutlet === 'all' && (
                <th className="px-5 py-3">Outlet</th>
              )}
              <th className="px-5 py-3">No. Retur</th>
              <th className="px-5 py-3">Tgl. Retur</th>
              <th className="px-5 py-3">Alasan</th>
              <th className="px-5 py-3 text-right">Total Item</th>
              <th className="px-5 py-3 text-right">Total Qty</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={selectedOutlet === 'all' ? 9 : 8} className="text-center py-10 text-gray-400 font-medium">
                  Tidak ada data retur ditemukan
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
                      {selectedOutlet === 'all' && (
                        <td className="px-5 py-3 font-semibold text-gray-800 capitalize">
                          {row.outletId}
                        </td>
                      )}
                      <td className="px-5 py-3 font-mono font-semibold text-gray-800">{row.nomor_retur}</td>
                      <td className="px-5 py-3 font-medium text-gray-500">{row.tgl_retur}</td>
                      <td className="px-5 py-3 capitalize font-medium text-gray-600">{row.alasan}</td>
                      <td className="px-5 py-3 text-right font-bold text-gray-500">{row.total_item}</td>
                      <td className="px-5 py-3 text-right font-extrabold text-gray-800">{row.total_qty} pcs</td>
                      <td className="px-5 py-3 text-center">{getStatusChip(row.status)}</td>
                      <td className="px-5 py-3 text-right">
                        {row.status === 'diajukan' && selectedOutlet !== 'all' ? (
                          <button
                            onClick={() => onCancelRetur(row.id)}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-105 text-rose-700 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Batalkan
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleRow(row.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg inline-flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Expandable item details */}
                    {isExpanded && (
                      <tr className="bg-gray-50/50">
                        <td colSpan={selectedOutlet === 'all' ? 9 : 8} className="px-10 py-4 border-t border-gray-100">
                          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-inner max-w-2xl">
                            <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-200 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                              <span>Detail Item Retur</span>
                              {row.catatan && (
                                <span className="normal-case text-gray-400 font-medium">Catatan: <strong className="text-gray-600 font-semibold">{row.catatan}</strong></span>
                              )}
                            </div>
                            <table className="w-full text-left">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr className="text-[10px] font-bold text-gray-500 uppercase">
                                  <th className="px-4 py-2">Produk</th>
                                  <th className="px-4 py-2">Ukuran</th>
                                  <th className="px-4 py-2">Warna</th>
                                  <th className="px-4 py-2 text-right">Qty Retur</th>
                                  <th className="px-4 py-2">Catatan Item</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                {row.items.map((it, idx) => (
                                  <tr key={idx} className="hover:bg-gray-55/50">
                                    <td className="px-4 py-2 font-bold text-gray-850">{it.nama}</td>
                                    <td className="px-4 py-2">
                                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] font-bold">{it.ukuran}</span>
                                    </td>
                                    <td className="px-4 py-2 flex items-center gap-1.5">
                                      <span className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ backgroundColor: it.warna }} />
                                      <span className="text-[10px] text-gray-400 font-mono">{it.warna}</span>
                                    </td>
                                    <td className="px-4 py-2 text-right font-extrabold text-gray-850">{it.qty} pcs</td>
                                    <td className="px-4 py-2 font-medium italic text-gray-500">{it.catatan || '-'}</td>
                                  </tr>
                                ))}
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
