import React, { useState } from "react";
import { ChevronDown, ChevronUp, Play } from "lucide-react";

export default function StockOpnameTable({ data = [], onLanjutkan }) {
  const [expandedRows, setExpandedRows] = useState({});
  const [filterStatus, setFilterStatus] = useState("semua");
  const toggleRow = (id) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));

  const filtered = filterStatus === "semua" ? data : data.filter(op => op.status === filterStatus);

  const getStatusChip = (status) => {
    const map = {
      draft: "bg-gray-100 text-gray-600",
      berlangsung: "bg-blue-100 text-blue-700",
      selesai: "bg-emerald-100 text-emerald-700",
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] || map.draft}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Stock Opname Gudang</h3>
        <div className="flex gap-2">
          {["semua", "draft", "berlangsung", "selesai"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterStatus === s ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-8 px-3 py-2"></th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">No. Opname</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Tgl. Mulai</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Tgl. Selesai</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Petugas</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Total Item</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Selisih (+)</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Selisih (-)</th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">Status</th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan="10" className="text-center py-8 text-sm text-gray-400 italic">Tidak ada data opname</td>
              </tr>
            )}
            {filtered.map(op => {
              const isExpanded = !!expandedRows[op.id];
              return (
                <React.Fragment key={op.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => toggleRow(op.id)} className="p-1 rounded text-gray-400 hover:text-gray-600 cursor-pointer">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-800 font-semibold">{op.nomor_opname}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{op.tanggal_mulai}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{op.tanggal_selesai || '-'}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{op.petugas || '-'}</td>
                    <td className="px-3 py-2 text-right text-xs font-bold text-gray-700">{op.total_item}</td>
                    <td className="px-3 py-2 text-right text-xs font-bold text-emerald-600">+{op.total_selisih_plus}</td>
                    <td className="px-3 py-2 text-right text-xs font-bold text-rose-600">-{op.total_selisih_minus}</td>
                    <td className="px-3 py-2 text-center">{getStatusChip(op.status)}</td>
                    <td className="px-3 py-2 text-center">
                      {op.status === 'berlangsung' && onLanjutkan && (
                        <button onClick={() => onLanjutkan(op)} className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 mx-auto cursor-pointer">
                          <Play className="w-3 h-3" /> Lanjutkan
                        </button>
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-gray-50">
                      <td colSpan="10" className="px-8 py-3">
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <table className="w-full text-xs">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-3 py-2 text-left font-semibold text-gray-500">Produk</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-500">Ukuran</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-500">Warna</th>
                                <th className="px-3 py-2 text-right font-semibold text-gray-500">Sistem</th>
                                <th className="px-3 py-2 text-right font-semibold text-gray-500">Fisik</th>
                                <th className="px-3 py-2 text-right font-semibold text-gray-500">Selisih</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-500">Keterangan</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {op.items.map((it, idx) => {
                                const diff = it.selisih;
                                const dc = diff > 0 ? "text-emerald-600 font-bold" : diff < 0 ? "text-rose-600 font-bold" : "text-gray-400";
                                return (
                                  <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-3 py-1.5 font-medium text-gray-800">{it.nama}</td>
                                    <td className="px-3 py-1.5 text-gray-600">{it.ukuran}</td>
                                    <td className="px-3 py-1.5">
                                      <span className="w-3.5 h-3.5 rounded-full inline-block border border-gray-200" style={{ backgroundColor: it.warna }} />
                                    </td>
                                    <td className="px-3 py-1.5 text-right text-gray-500">{it.stok_sistem}</td>
                                    <td className="px-3 py-1.5 text-right font-bold text-gray-800">{it.stok_fisik}</td>
                                    <td className={`px-3 py-1.5 text-right ${dc}`}>{diff > 0 ? `+${diff}` : diff}</td>
                                    <td className="px-3 py-1.5 text-gray-500 italic">{it.keterangan || '-'}</td>
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
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
