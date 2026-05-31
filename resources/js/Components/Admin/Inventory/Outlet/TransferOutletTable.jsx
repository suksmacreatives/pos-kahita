import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Eye, ArrowRightLeft, ShieldAlert } from 'lucide-react';
import { transferAntar } from '@/data/inventoryOutletData';

export default function TransferOutletTable({ selectedOutlet, onCancelTransfer, onConfirmReceive }) {
  const [subView, setSubView] = useState('keluar'); // 'keluar' | 'masuk'
  const [search, setSearch] = useState('');
  const [outletFilter, setOutletFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [alasanFilter, setAlasanFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Compile active list based on view mode (Keluar vs Masuk)
  const activeList = useMemo(() => {
    let list = [...transferAntar];

    if (selectedOutlet !== 'all') {
      if (subView === 'keluar') {
        // transfers sent FROM selectedOutlet
        list = list.filter(t => t.outlet_asal_id === selectedOutlet);
      } else {
        // transfers received BY selectedOutlet
        list = list.filter(t => t.outlet_tujuan_id === selectedOutlet);
      }
    }

    return list;
  }, [selectedOutlet, subView]);

  // Apply filters
  const filteredList = useMemo(() => {
    let items = [...activeList];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(t => t.nomor_transfer.toLowerCase().includes(q));
    }

    // Outlet filter
    if (outletFilter !== 'all') {
      items = items.filter(t => 
        t.outlet_asal_id === outletFilter || t.outlet_tujuan_id === outletFilter
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      items = items.filter(t => t.status === statusFilter);
    }

    // Alasan filter
    if (alasanFilter !== 'all') {
      items = items.filter(t => t.alasan === alasanFilter);
    }

    // Sort descending by date
    items.sort((a, b) => new Date(b.tgl_transfer) - new Date(a.tgl_transfer));

    return items;
  }, [activeList, search, outletFilter, statusFilter, alasanFilter]);

  // Status Badge JSX helper
  const getStatusChip = (status) => {
    const map = {
      menunggu_konfirmasi: {
        bg: 'bg-gray-50 text-gray-600 border-gray-200',
        label: 'Menunggu'
      },
      dikirim: {
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        label: 'Dikirim'
      },
      diterima: {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: 'Diterima'
      }
    };
    const cfg = map[status] || map.menunggu_konfirmasi;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg}`}>
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Sub-view Toggles (Only for specific outlet mode) */}
      {selectedOutlet !== 'all' && (
        <div className="flex border-b border-gray-100 p-4 bg-gray-50/20">
          <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => { setSubView('keluar'); setExpandedRows({}); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                subView === 'keluar'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Transfer Keluar
            </button>
            <button
              onClick={() => { setSubView('masuk'); setExpandedRows({}); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                subView === 'masuk'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Transfer Masuk
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800">
            {selectedOutlet === 'all' 
              ? 'Daftar Mutasi Transfer Antar Outlet'
              : (subView === 'keluar' ? 'Transfer Keluar' : 'Transfer Masuk')}
          </h3>
          <p className="text-[10px] text-gray-400 font-medium">Pemindahan stok internal demi perataan inventori outlet</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari No. Transfer..."
              className="pl-9 pr-4 py-1.5 w-44 md:w-56 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 transition-colors"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Destination/Source Outlet filter (Only in 'all' view) */}
          {selectedOutlet === 'all' && (
            <select
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 focus:border-emerald-500 outline-none cursor-pointer"
              value={outletFilter}
              onChange={e => setOutletFilter(e.target.value)}
            >
              <option value="all">Semua Lokasi</option>
              <option value="denpasar">Denpasar</option>
              <option value="jakarta">Jakarta</option>
              <option value="bandung">Bandung</option>
              <option value="surabaya">Surabaya</option>
            </select>
          )}

          {/* Status filter */}
          <select
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 focus:border-emerald-500 outline-none cursor-pointer"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="menunggu_konfirmasi">Menunggu Konfirmasi</option>
            <option value="dikirim">Dikirim</option>
            <option value="diterima">Diterima</option>
          </select>

          {/* Alasan filter */}
          <select
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 focus:border-emerald-500 outline-none cursor-pointer"
            value={alasanFilter}
            onChange={e => setAlasanFilter(e.target.value)}
          >
            <option value="all">Semua Alasan</option>
            <option value="permintaan">Permintaan</option>
            <option value="kelebihan stok">Kelebihan Stok</option>
            <option value="darurat">Darurat</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500">
              <th className="w-8 px-5 py-3"></th>
              <th className="px-5 py-3">No. Transfer</th>
              {selectedOutlet === 'all' ? (
                <>
                  <th className="px-5 py-3">Asal</th>
                  <th className="px-5 py-3">Tujuan</th>
                </>
              ) : (
                <th className="px-5 py-3">{subView === 'keluar' ? 'Outlet Tujuan' : 'Outlet Asal'}</th>
              )}
              <th className="px-5 py-3">Tgl. Kirim</th>
              <th className="px-5 py-3">Tgl. Terima</th>
              <th className="px-5 py-3">Alasan</th>
              <th className="px-5 py-3 text-right">Total Qty</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={selectedOutlet === 'all' ? 10 : 9} className="text-center py-10 text-gray-400 font-medium">
                  Tidak ada data transfer ditemukan
                </td>
              </tr>
            ) : (
              filteredList.map((row) => {
                const isExpanded = !!expandedRows[row.id];
                const displayOutlet = selectedOutlet === 'all' 
                  ? null 
                  : (subView === 'keluar' ? row.outlet_tujuan_nama : row.outlet_asal_nama);

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
                      <td className="px-5 py-3 font-mono font-semibold text-gray-800">{row.nomor_transfer}</td>
                      {selectedOutlet === 'all' ? (
                        <>
                          <td className="px-5 py-3 font-medium text-gray-800">{row.outlet_asal_nama}</td>
                          <td className="px-5 py-3 font-medium text-gray-800">{row.outlet_tujuan_nama}</td>
                        </>
                      ) : (
                        <td className="px-5 py-3 font-medium text-gray-800">{displayOutlet}</td>
                      )}
                      <td className="px-5 py-3 font-medium text-gray-500">{row.tgl_transfer}</td>
                      <td className="px-5 py-3 font-medium text-gray-500">{row.tgl_diterima || '-'}</td>
                      <td className="px-5 py-3 capitalize font-medium text-gray-600">{row.alasan}</td>
                      <td className="px-5 py-3 text-right font-extrabold text-gray-800">{row.total_qty} pcs</td>
                      <td className="px-5 py-3 text-center">{getStatusChip(row.status)}</td>
                      <td className="px-5 py-3 text-right space-x-1.5">
                        {/* Status Menunggu Konfirmasi action */}
                        {row.status === 'menunggu_konfirmasi' && selectedOutlet !== 'all' ? (
                          subView === 'keluar' ? (
                            <button
                              onClick={() => onCancelTransfer(row.id)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                            >
                              Batalkan
                            </button>
                          ) : (
                            <button
                              onClick={() => onConfirmReceive(row.id)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-sm shadow-emerald-500/10 transition-all cursor-pointer"
                            >
                              Terima Transfer
                            </button>
                          )
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

                    {/* Expandable items detail */}
                    {isExpanded && (
                      <tr className="bg-gray-50/50">
                        <td colSpan={selectedOutlet === 'all' ? 10 : 9} className="px-10 py-4 border-t border-gray-100">
                          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-inner max-w-2xl">
                            <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-200 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                              <span>Detail Item Transfer</span>
                              {row.dibuat_oleh && (
                                <span className="normal-case text-gray-400 font-medium">Petugas: <strong className="text-gray-650">{row.dibuat_oleh}</strong></span>
                              )}
                            </div>
                            <table className="w-full text-left">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr className="text-[10px] font-bold text-gray-500 uppercase">
                                  <th className="px-4 py-2">Produk</th>
                                  <th className="px-4 py-2">Ukuran</th>
                                  <th className="px-4 py-2">Warna</th>
                                  <th className="px-4 py-2 text-right">Qty</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                {row.items.map((it, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-2 font-bold text-gray-850">{it.nama}</td>
                                    <td className="px-4 py-2">
                                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] font-bold">{it.ukuran}</span>
                                    </td>
                                    <td className="px-4 py-2 flex items-center gap-1.5">
                                      <span className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ backgroundColor: it.warna }} />
                                      <span className="text-[10px] text-gray-450 font-mono">{it.warna}</span>
                                    </td>
                                    <td className="px-4 py-2 text-right font-extrabold text-gray-800">{it.qty} pcs</td>
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
