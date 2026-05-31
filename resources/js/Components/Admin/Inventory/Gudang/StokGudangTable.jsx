import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Eye, Plus, Search, ArrowUpDown } from 'lucide-react';

export default function StokGudangTable({ data = [], onDetail, onTambahStok, onLihatMutasi }) {
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('semua');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [sortBy, setSortBy] = useState('nama');
  const [expandedRows, setExpandedRows] = useState({});
  const [page, setPage] = useState(1);
  const perPage = 10;

  const toggleRow = (id) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));

  const kategoriList = useMemo(() => {
    const set = new Set(data.map(p => p.kategori));
    return ['semua', ...Array.from(set)];
  }, [data]);

  const filtered = useMemo(() => {
    let result = [...data];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.nama_produk.toLowerCase().includes(q) || p.kode_produk.toLowerCase().includes(q));
    }
    if (filterKategori !== 'semua') result = result.filter(p => p.kategori === filterKategori);
    if (filterStatus !== 'semua') result = result.filter(p => p.status === filterStatus);
    result.sort((a, b) => {
      if (sortBy === 'nama') return a.nama_produk.localeCompare(b.nama_produk);
      if (sortBy === 'stok') return b.total_stok - a.total_stok;
      if (sortBy === 'kode') return a.kode_produk.localeCompare(b.kode_produk);
      return 0;
    });
    return result;
  }, [data, search, filterKategori, filterStatus, sortBy]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const statusConfig = {
    normal: { label: 'Normal', class: 'bg-emerald-100 text-emerald-700' },
    menipis: { label: 'Menipis', class: 'bg-amber-100 text-amber-700' },
    habis: { label: 'Habis', class: 'bg-rose-100 text-rose-700' },
  };

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Stok Gudang</h3>
        <div className="flex items-center gap-2">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 outline-none focus:border-emerald-500 cursor-pointer">
            <option value="nama">Sort: Nama</option>
            <option value="stok">Sort: Stok</option>
            <option value="kode">Sort: Kode</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari nama/kode produk..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={filterKategori} onChange={e => { setFilterKategori(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 outline-none focus:border-emerald-500 cursor-pointer">
          {kategoriList.map(k => <option key={k} value={k}>{k === 'semua' ? 'Semua Kategori' : k}</option>)}
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 outline-none focus:border-emerald-500 cursor-pointer">
          <option value="semua">Semua Status</option>
          <option value="normal">Normal</option>
          <option value="menipis">Menipis</option>
          <option value="habis">Habis</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="w-8 px-3 py-2"></th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Kode</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Produk</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Kategori</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Total Stok</th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">Status</th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-10 text-sm text-gray-400 italic">Tidak ada produk ditemukan</td>
              </tr>
            )}
            {paginated.map(p => {
              const isExpanded = !!expandedRows[p.id];
              const stokPct = p.stok_minimum > 0 ? Math.min(100, Math.round((p.total_stok / (p.stok_minimum * 3)) * 100)) : 0;
              const sc = statusConfig[p.status] || statusConfig.normal;
              return (
                <React.Fragment key={p.id}>
                  <tr className={`hover:bg-gray-50 ${p.status === 'menipis' ? 'border-l-2 border-l-amber-400' : p.status === 'habis' ? 'border-l-2 border-l-rose-400' : ''}`}>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => toggleRow(p.id)} className="p-1 rounded text-gray-400 hover:text-gray-600 cursor-pointer">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-600">{p.kode_produk}</td>
                    <td className="px-3 py-2 font-medium text-gray-800">{p.nama_produk}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">{p.kategori}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold text-gray-800">{p.total_stok}</span>
                      <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-1 ml-auto">
                        <div className={`h-full rounded-full ${p.status === 'habis' ? 'bg-rose-500' : p.status === 'menipis' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${stokPct}%` }} />
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${sc.class}`}>{sc.label}</span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => onDetail?.(p)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer" title="Detail"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => onTambahStok?.(p)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer" title="Tambah Stok"><Plus className="w-3.5 h-3.5" /></button>
                        <button onClick={() => onLihatMutasi?.(p)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer" title="Lihat Mutasi"><ArrowUpDown className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-gray-50">
                      <td colSpan="7" className="px-8 py-3">
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <table className="w-full text-xs">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-3 py-2 text-left font-semibold text-gray-500">Ukuran</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-500">Warna</th>
                                <th className="px-3 py-2 text-right font-semibold text-gray-500">Stok</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-500">SKU</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {p.varian.map((v, vi) => (
                                <tr key={vi} className="hover:bg-gray-50">
                                  <td className="px-3 py-1.5 font-medium text-gray-700">{v.ukuran}</td>
                                  <td className="px-3 py-1.5">
                                    <span className="w-3.5 h-3.5 rounded-full inline-block border border-gray-200 align-middle" style={{ backgroundColor: v.warna }} />
                                  </td>
                                  <td className="px-3 py-1.5 text-right font-bold text-gray-800">{v.stok}</td>
                                  <td className="px-3 py-1.5 font-mono text-gray-500 text-[10px]">{v.sku}</td>
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
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-400">{filtered.length} produk total</span>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${page === i + 1 ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{i + 1}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
