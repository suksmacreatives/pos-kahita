import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronUp, Search, AlertCircle, RefreshCw, ArrowRightLeft, Eye, HelpCircle, X, Package } from 'lucide-react';
import SelectDropdown from '@/Components/Admin/SelectDropdown';

export default function StokOutletTable({ selectedOutlet, onAction, outletStok = {}, outlets = [] }) {
  // Local state for search, filters and sort
  const [search, setSearch] = useState('');
  const [kategori, setKategori] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortField, setSortField] = useState('nama'); // nama, banyak, sedikit, terjual
  const [expandedRows, setExpandedRows] = useState({});
  const [detailItem, setDetailItem] = useState(null);

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 1. Get Categories from active data
  const categories = useMemo(() => {
    const allItems = selectedOutlet === 'all' 
      ? Object.values(outletStok).flat()
      : (outletStok[selectedOutlet] || []);
    const unique = new Set(allItems.map(i => i.kategori));
    return ['all', ...Array.from(unique)];
  }, [selectedOutlet]);

  // 2. Filter & Sort logic for Single Outlet
  const filteredSingle = useMemo(() => {
    if (selectedOutlet === 'all') return [];

    let items = [...(outletStok[selectedOutlet] || [])];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(item => 
        item.nama_produk.toLowerCase().includes(q) ||
        item.kode_produk.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (kategori !== 'all') {
      items = items.filter(item => item.kategori === kategori);
    }

    // Status filter
    if (status !== 'all') {
      items = items.filter(item => item.status === status);
    }

    // Sorting
    items.sort((a, b) => {
      if (sortField === 'nama') {
        return a.nama_produk.localeCompare(b.nama_produk);
      }
      if (sortField === 'banyak') {
        return b.total_stok - a.total_stok;
      }
      if (sortField === 'sedikit') {
        return a.total_stok - b.total_stok;
      }
      if (sortField === 'terjual') {
        return new Date(b.tgl_terakhir_terjual) - new Date(a.tgl_terakhir_terjual);
      }
      return 0;
    });

    return items;
  }, [selectedOutlet, search, kategori, status, sortField]);

  // 3. Filter logic for Semua Outlet (combined table)
  const filteredAll = useMemo(() => {
    if (selectedOutlet !== 'all') return [];

    const outletSlugs = outlets.map(o => o.slug);
    if (!outletSlugs.length) return [];

    // Use the first outlet as baseline for product list
    const firstSlug = outletSlugs[0];
    const baseline = [...(outletStok[firstSlug] || [])];

    let items = baseline.map(base => {
      const outletCols = {};
      let total = 0;
      outletSlugs.forEach(slug => {
        const match = (outletStok[slug] || []).find(p => p.kode_produk === base.kode_produk);
        outletCols[slug] = match?.total_stok || 0;
        outletCols[`${slug}Status`] = match?.status || 'habis';
        total += outletCols[slug];
      });

      return {
        ...base,
        ...outletCols,
        total_stok: total
      };
    });

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(item => 
        item.nama_produk.toLowerCase().includes(q) ||
        item.kode_produk.toLowerCase().includes(q)
      );
    }

    // Category
    if (kategori !== 'all') {
      items = items.filter(item => item.kategori === kategori);
    }

    return items;
  }, [selectedOutlet, search, kategori]);

  // Helper to format stock labels
  const formatStok = (qty) => `${qty} pcs`;

  // Status Badge JSX helper
  const getStatusBadge = (stat) => {
    const classes = {
      normal: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      menipis: 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse',
      habis: 'bg-rose-50 text-rose-700 border-rose-100',
    };
    const labels = {
      normal: 'Normal',
      menipis: 'Menipis',
      habis: 'Habis',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${classes[stat] || classes.normal}`}>
        {labels[stat] || 'Normal'}
      </span>
    );
  };

  // Helper cell background for Multi Outlet view
  const getCellClass = (stat) => {
    if (stat === 'habis') return 'text-rose-600 font-bold bg-rose-50/40';
    if (stat === 'menipis') return 'text-amber-600 font-semibold bg-amber-50/40';
    return 'text-emerald-600 bg-emerald-50/20';
  };

  const getStatusLabel = (stat) => {
    if (stat === 'habis') return { label: 'Habis', cls: 'bg-rose-50 text-rose-700 border-rose-100' };
    if (stat === 'menipis') return { label: 'Menipis', cls: 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' };
    return { label: 'Normal', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Detail Product Modal */}
      {detailItem && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setDetailItem(null)}>
              <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{detailItem.nama_produk}</h3>
                      <p className="text-[11px] text-gray-500 font-semibold">{detailItem.kode_produk}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDetailItem(null)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Summary */}
                <div className="px-6 py-4 grid grid-cols-2 gap-4 border-b border-gray-100">
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-extrabold text-emerald-700">{detailItem.total_stok}</p>
                    <p className="text-[10px] font-bold text-emerald-600 mt-0.5">Total Stok</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-extrabold text-gray-700">{detailItem.stok_minimum}</p>
                    <p className="text-[10px] font-bold text-gray-500 mt-0.5">Min. Stok</p>
                  </div>
                </div>

                {/* Variants Table */}
                <div className="px-6 py-4">
                  <h4 className="text-xs font-bold text-gray-700 mb-3">
                    Detail Varian
                    <span className="ml-1.5 text-gray-400 font-normal">({detailItem.varian?.length || 0} varian)</span>
                  </h4>
                  <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-100/60">
                          <th className="px-3 py-2 text-[10px] font-bold uppercase text-gray-500">Ukuran</th>
                          <th className="px-3 py-2 text-[10px] font-bold uppercase text-gray-500">Warna</th>
                          <th className="px-3 py-2 text-[10px] font-bold uppercase text-gray-500 text-right">Stok</th>
                          <th className="px-3 py-2 text-[10px] font-bold uppercase text-gray-500 text-right">SKU</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {detailItem.varian?.map((v) => {
                          const s = getStatusLabel(v.status || (v.stok > 0 ? (v.stok < 10 ? 'menipis' : 'normal') : 'habis'));
                          return (
                            <tr key={v.sku} className="hover:bg-white/80">
                              <td className="px-3 py-2 text-xs font-bold text-gray-800">{v.ukuran}</td>
                              <td className="px-3 py-2 flex items-center gap-2 text-xs text-gray-600">
                                <span className="w-3 h-3 rounded-full border border-gray-200 shrink-0" style={{ backgroundColor: v.warna }} />
                                <span className="font-medium">{v.warna_label || v.warna}</span>
                              </td>
                              <td className="px-3 py-2 text-xs text-right font-bold text-gray-800">{v.stok} pcs</td>
                              <td className="px-3 py-2 text-xs text-right text-gray-400 font-mono">{v.sku}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-slate-50/50 flex justify-end">
                  <button
                    onClick={() => setDetailItem(null)}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>,
        document.body
      )}
      {/* Table Header / Action Bar */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Daftar Stok Produk</h3>
          <p className="text-[10px] text-gray-400 font-medium">Data inventori fisik real-time produk terdaftar</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kode / nama..."
              className="pl-9 pr-4 py-2 w-44 md:w-56 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 transition-colors"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Kategori filter */}
          <SelectDropdown
            value={kategori}
            onChange={setKategori}
            options={[
              { value: 'all', label: 'Semua Kategori' },
              ...categories.filter(c => c !== 'all').map(cat => ({ value: cat, label: cat })),
            ]}
            placeholder="Semua Kategori"
            className="w-44"
          />

          {/* Sort & Status logic only for Single Outlet */}
          {selectedOutlet !== 'all' && (
            <>
              {/* Status filter */}
              <SelectDropdown
                value={status}
                onChange={setStatus}
                options={[
                  { value: 'all', label: 'Semua Status' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'menipis', label: 'Menipis' },
                  { value: 'habis', label: 'Habis / Kosong' },
                ]}
                placeholder="Semua Status"
                className="w-40"
              />

              {/* Sort filter */}
              <SelectDropdown
                value={sortField}
                onChange={setSortField}
                options={[
                  { value: 'nama', label: 'Urutkan: Abjad A-Z' },
                  { value: 'banyak', label: 'Urutkan: Stok Terbanyak' },
                  { value: 'sedikit', label: 'Urutkan: Stok Tersedikit' },
                  { value: 'terjual', label: 'Urutkan: Terjual Terakhir' },
                ]}
                placeholder="Urutkan: Abjad A-Z"
                className="w-48"
              />
            </>
          )}
        </div>
      </div>

      {/* Actual Data Table */}
      <div className="overflow-x-auto">
        {selectedOutlet === 'all' ? (
          /* ========================================================
             SEMAUA OUTLET VIEW (Multi-columns)
             ======================================================== */
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500">Produk</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500">Kategori</th>
                {outlets.filter(o => o.slug).map(o => (
                  <th key={o.slug} className="px-5 py-3 text-xs font-semibold text-gray-500 text-center">{o.nama}</th>
                ))}
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 text-right">Stok Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAll.length === 0 ? (
                <tr>
                  <td colSpan={outlets.length + 3} className="text-center py-10 text-xs font-medium text-gray-400">Tidak ada produk ditemukan</td>
                </tr>
              ) : (
                filteredAll.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <span className="font-bold text-gray-800 text-xs">{item.nama_produk}</span>
                        <span className="block text-[9px] text-gray-400 font-semibold">{item.kode_produk}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold">{item.kategori}</span>
                    </td>
                    {outlets.filter(o => o.slug).map(o => (
                      <td key={o.slug} className={`px-5 py-3 text-center text-xs font-bold ${getCellClass(item[`${o.slug}Status`] || 'habis')}`}>
                        {formatStok(item[o.slug] || 0)}
                      </td>
                    ))}
                    <td className="px-5 py-3 text-right text-xs font-bold text-gray-800 bg-gray-50/20">
                      {formatStok(item.total_stok)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          /* ========================================================
             SINGLE OUTLET VIEW (Expandable accordion)
             ======================================================== */
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="w-8 px-5 py-3"></th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500">Kode & Produk</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500">Kategori</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 text-right">Stok Total</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 text-right">Min. Stok</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500">Terjual Terakhir</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 text-center">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSingle.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-xs font-medium text-gray-400">Tidak ada produk ditemukan</td>
                </tr>
              ) : (
                filteredSingle.map((item) => {
                  const isExpanded = !!expandedRows[item.id];
                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 text-center">
                          <button
                            onClick={() => toggleRow(item.id)}
                            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="px-5 py-3">
                          <div>
                            <span className="font-bold text-gray-800 text-xs">{item.nama_produk}</span>
                            <span className="block text-[9px] text-gray-400 font-semibold">{item.kode_produk}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold">{item.kategori}</span>
                        </td>
                        <td className="px-5 py-3 text-right text-xs font-extrabold text-gray-850">
                          {formatStok(item.total_stok)}
                        </td>
                        <td className="px-5 py-3 text-right text-xs font-medium text-gray-500">
                          {formatStok(item.stok_minimum)}
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-600 font-medium">
                          {item.tgl_terakhir_terjual || '-'}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-5 py-3 text-right space-x-1.5">
                          <button
                            onClick={() => setDetailItem(item)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors inline-flex items-center justify-center cursor-pointer"
                            title="Detail Produk"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onAction('history', item)}
                            className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors inline-flex items-center justify-center cursor-pointer"
                            title="Lihat Mutasi"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>

                      {/* Accordion Varian Detail */}
                      {isExpanded && (
                        <tr className="bg-gray-50/80">
                          <td colSpan="8" className="px-8 py-3.5 border-t border-gray-100">
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-inner max-w-2xl">
                              <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                  <tr>
                                    <th className="px-4 py-2 text-[10px] font-bold uppercase text-gray-500">Ukuran</th>
                                    <th className="px-4 py-2 text-[10px] font-bold uppercase text-gray-500">Warna</th>
                                    <th className="px-4 py-2 text-[10px] font-bold uppercase text-gray-500 text-right">Stok Fisik</th>
                                    <th className="px-4 py-2 text-[10px] font-bold uppercase text-gray-500 text-right">SKU</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {item.varian.map((v) => (
                                    <tr key={v.sku} className="hover:bg-gray-50/50">
                                      <td className="px-4 py-1.5 text-xs font-bold text-gray-800">{v.ukuran}</td>
                                      <td className="px-4 py-1.5 flex items-center gap-2 text-xs text-gray-600">
                                        <span 
                                          className="w-3.5 h-3.5 rounded-full border border-gray-200 shrink-0" 
                                          style={{ backgroundColor: v.warna }}
                                        />
                                        <span>{v.warna}</span>
                                      </td>
                                      <td className="px-4 py-1.5 text-xs text-right font-extrabold text-gray-800">{formatStok(v.stok)}</td>
                                      <td className="px-4 py-1.5 text-xs text-right text-gray-400 font-mono">{v.sku}</td>
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
        )}
      </div>
    </div>
  );
}
