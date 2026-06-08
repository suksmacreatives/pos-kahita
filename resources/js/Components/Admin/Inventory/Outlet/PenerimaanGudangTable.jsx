import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, CheckCircle, Clock, AlertTriangle, Eye, ArrowRight } from 'lucide-react';

export default function PenerimaanGudangTable({ selectedOutlet, onConfirmClick, penerimaanList = {} }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Compile list based on outlet mode
  const activeList = useMemo(() => {
    if (selectedOutlet === 'all') {
      return Object.entries(penerimaanList || {}).flatMap(([outletId, list]) => 
        (list || []).map(item => ({ ...item, outletId }))
      );
    }
    return penerimaanList[selectedOutlet] || [];
  }, [selectedOutlet, penerimaanList]);

  // Filter items
  const filteredList = useMemo(() => {
    let items = [...activeList];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(item => 
        item.nomor_do.toLowerCase().includes(q) ||
        (item.nomor_terima && item.nomor_terima.toLowerCase().includes(q))
      );
    }

    // Status
    if (statusFilter !== 'all') {
      items = items.filter(item => item.status === statusFilter);
    }

    // Sort descending by date
    items.sort((a, b) => new Date(b.tgl_kirim_gudang) - new Date(a.tgl_kirim_gudang));

    return items;
  }, [activeList, search, statusFilter]);

  // Status Badge JSX helper
  const getStatusChip = (status) => {
    const map = {
      menunggu: {
        bg: 'bg-gray-50 text-gray-700 border-gray-200',
        dot: 'bg-gray-400 animate-pulse',
        label: 'Menunggu Konfirmasi'
      },
      sebagian: {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Diterima Sebagian'
      },
      diterima: {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Diterima Lengkap'
      }
    };

    const cfg = map[status] || map.menunggu;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Search & Filter Bar */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Riwayat Penerimaan Gudang</h3>
          <p className="text-[10px] text-gray-400 font-medium">Pengiriman stok terdistribusikan dari gudang pusat</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari DO / No Terima..."
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
            <option value="menunggu">Menunggu Konfirmasi</option>
            <option value="sebagian">Diterima Sebagian</option>
            <option value="diterima">Diterima Lengkap</option>
          </select>
        </div>
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500">
              <th className="w-8 px-5 py-3"></th>
              {selectedOutlet === 'all' && (
                <th className="px-5 py-3">Outlet</th>
              )}
              <th className="px-5 py-3">No. DO</th>
              <th className="px-5 py-3">No. Terima</th>
              <th className="px-5 py-3">Tgl. Kirim</th>
              <th className="px-5 py-3">Tgl. Terima</th>
              <th className="px-5 py-3 text-right">Total SKU</th>
              <th className="px-5 py-3 text-right">Total Qty</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={selectedOutlet === 'all' ? 10 : 9} className="text-center py-10 text-gray-400 font-medium">
                  Tidak ada dokumen pengiriman ditemukan
                </td>
              </tr>
            ) : (
              filteredList.map((row) => {
                const isExpanded = !!expandedRows[row.id];
                return (
                  <React.Fragment key={row.id}>
                    <tr className="hover:bg-gray-50/50 transition-colors">
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
                      <td className="px-5 py-3 font-mono font-semibold text-gray-800">{row.nomor_do}</td>
                      <td className="px-5 py-3 font-mono text-gray-500">{row.nomor_terima || '-'}</td>
                      <td className="px-5 py-3 font-medium text-gray-650">{row.tgl_kirim_gudang}</td>
                      <td className="px-5 py-3 font-medium text-gray-600">{row.tgl_terima_outlet || '-'}</td>
                      <td className="px-5 py-3 text-right font-bold text-gray-500">{row.total_item}</td>
                      <td className="px-5 py-3 text-right font-extrabold text-gray-800">{row.total_qty} pcs</td>
                      <td className="px-5 py-3 text-center">{getStatusChip(row.status)}</td>
                      <td className="px-5 py-3 text-right">
                        {row.status === 'menunggu' && selectedOutlet !== 'all' ? (
                          <button
                            onClick={() => onConfirmClick(row)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-sm shadow-emerald-500/10 inline-flex items-center gap-1 cursor-pointer transition-all"
                          >
                            Konfirmasi Terima
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleRow(row.id)}
                            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg inline-flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Expandable item details */}
                    {isExpanded && (
                      <tr className="bg-gray-50/50">
                        <td colSpan={selectedOutlet === 'all' ? 10 : 9} className="px-10 py-4 border-t border-gray-100">
                          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-inner max-w-3xl">
                            <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-200 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                              <span>Detail Item DO</span>
                              {row.diterima_oleh && (
                                <span className="normal-case text-gray-400 font-medium">Diterima oleh: <strong className="text-gray-600">{row.diterima_oleh}</strong></span>
                              )}
                            </div>
                            <table className="w-full text-left">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr className="text-[10px] font-bold text-gray-500 uppercase">
                                  <th className="px-4 py-2">Produk</th>
                                  <th className="px-4 py-2">Ukuran</th>
                                  <th className="px-4 py-2">Warna</th>
                                  <th className="px-4 py-2 text-right">Qty Kirim</th>
                                  <th className="px-4 py-2 text-right">Qty Terima</th>
                                  <th className="px-4 py-2">Keterangan</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                {row.items.map((it, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50/55">
                                    <td className="px-4 py-2 font-bold text-gray-800">{it.nama}</td>
                                    <td className="px-4 py-2">
                                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] font-bold">{it.ukuran}</span>
                                    </td>
                                    <td className="px-4 py-2 flex items-center gap-1.5">
                                      <span className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ backgroundColor: it.warna }} />
                                      <span className="text-[10px] text-gray-400 font-mono">{it.warna}</span>
                                    </td>
                                    <td className="px-4 py-2 text-right font-bold text-gray-450">{it.qty_kirim}</td>
                                    <td className={`px-4 py-2 text-right font-extrabold ${it.qty_terima < it.qty_kirim ? 'text-rose-600' : 'text-gray-800'}`}>
                                      {it.qty_terima !== undefined ? it.qty_terima : '-'}
                                    </td>
                                    <td className="px-4 py-2 text-gray-500 font-medium italic">{it.catatan || '-'}</td>
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
