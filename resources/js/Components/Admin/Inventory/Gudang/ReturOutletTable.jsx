import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Eye, CheckCircle, XCircle } from 'lucide-react';
import SelectDropdown from '@/Components/Admin/SelectDropdown';

export default function ReturOutletTable({ data, onTerimaRetur, onBatalRetur }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredList = useMemo(() => {
    let items = [...(data || [])];
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(r => r.nomor_retur.toLowerCase().includes(q) || r.outlet_nama.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      items = items.filter(r => r.status === statusFilter);
    }
    return items;
  }, [data, search, statusFilter]);

  const statusChip = (status) => {
    const map = {
      diajukan: 'bg-amber-50 text-amber-700 border-amber-100',
      diterima_gudang: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      dibatalkan: 'bg-gray-50 text-gray-500 border-gray-200',
    };
    const labels = { diajukan: 'Menunggu', diterima_gudang: 'Diterima', dibatalkan: 'Dibatalkan' };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${map[status] || map.diajukan}`}>
        {labels[status] || status}
      </span>
    );
  };

  const alasanLabel = (alasan) => {
    const map = { 'kelebihan stok': 'Kelebihan Stok', cacat: 'Cacat', 'tidak laku': 'Tidak Laku', 'salah kirim': 'Salah Kirim' };
    return map[alasan] || alasan;
  };

  return (
    <div className="overflow-x-auto">
      <div className="p-4 border-b border-gray-100 bg-gray-50/40 flex flex-col md:flex-row justify-between gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari nomor retur / outlet..." className="pl-9 pr-4 py-1.5 w-56 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 transition-colors" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <SelectDropdown
          value={statusFilter}
          onChange={(v) => setStatusFilter(v)}
          options={[
            { value: 'all', label: 'Semua Status' },
            { value: 'diajukan', label: 'Menunggu' },
            { value: 'diterima_gudang', label: 'Diterima' },
            { value: 'dibatalkan', label: 'Dibatalkan' },
          ]}
          placeholder="Semua Status"
          className="w-40"
        />
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            <th className="w-8 px-5 py-3"></th>
            <th className="px-5 py-3">No. Retur</th>
            <th className="px-5 py-3">Outlet</th>
            <th className="px-5 py-3">Tgl Retur</th>
            <th className="px-5 py-3">Alasan</th>
            <th className="px-5 py-3 text-right">Item</th>
            <th className="px-5 py-3 text-right">Qty</th>
            <th className="px-5 py-3 text-center">Status</th>
            <th className="px-5 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
          {filteredList.length === 0 ? (
            <tr><td colSpan="9" className="text-center py-10 text-xs font-medium text-gray-400">Tidak ada retur outlet ditemukan</td></tr>
          ) : (
            filteredList.map((row) => {
              const isExpanded = !!expandedRows[row.id];
              return (
                <React.Fragment key={row.id}>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => toggleRow(row.id)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-5 py-3 font-mono font-semibold text-gray-800">{row.nomor_retur}</td>
                    <td className="px-5 py-3 font-semibold text-gray-800">{row.outlet_nama}</td>
                    <td className="px-5 py-3 font-medium text-gray-600">{row.tgl_retur}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold">{alasanLabel(row.alasan)}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-gray-500">{row.total_item}</td>
                    <td className="px-5 py-3 text-right font-extrabold text-gray-800">{row.total_qty} pcs</td>
                    <td className="px-5 py-3 text-center">{statusChip(row.status)}</td>
                    <td className="px-5 py-3 text-right space-x-1">
                      {row.status === 'diajukan' && (
                        <>
                          <button onClick={() => onTerimaRetur(row)} className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-all">
                            <CheckCircle className="w-3 h-3" />
                            Terima
                          </button>
                          <button onClick={() => onBatalRetur(row)} className="px-2.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-all">
                            <XCircle className="w-3 h-3" />
                            Batal
                          </button>
                        </>
                      )}
                      {row.status !== 'diajukan' && (
                        <button onClick={() => toggleRow(row.id)} className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg inline-flex items-center justify-center cursor-pointer transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-gray-50/50">
                      <td colSpan="9" className="px-10 py-4 border-t border-gray-100">
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-inner max-w-3xl">
                          <div className="px-4 py-2 bg-gray-50/80 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Detail Item Retur</div>
                          <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr className="text-[10px] font-bold text-gray-500 uppercase">
                                <th className="px-4 py-2">Produk</th>
                                <th className="px-4 py-2">Ukuran</th>
                                <th className="px-4 py-2 text-right">Qty</th>
                                <th className="px-4 py-2">Catatan</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                              {(row.items || []).map((it, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/55">
                                  <td className="px-4 py-2 font-bold text-gray-800">{it.nama}</td>
                                  <td className="px-4 py-2">
                                    <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] font-bold">{it.ukuran}</span>
                                  </td>
                                  <td className="px-4 py-2 text-right font-extrabold text-gray-800">{it.qty} pcs</td>
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
  );
}
