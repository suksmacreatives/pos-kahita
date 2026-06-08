import React, { useState } from 'react';
import { ClipboardCheck, Plus, Minus, DollarSign, ChevronDown, ChevronRight } from 'lucide-react';
import ReportStatCard from '../Shared/ReportStatCard';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function HasilOpname({ opname_sessions }) {
  const [expandedSession, setExpandedSession] = useState(null);

  const formatRupiah = (val) => {
    if (val == null) return 'Rp 0';
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  const sessions = opname_sessions || [];

  const totalSelisihPositif = sessions.reduce(
    (sum, s) => sum + (s.total_selisih_positif || s.selisih_plus || 0),
    0
  );
  const totalSelisihNegatif = sessions.reduce(
    (sum, s) => sum + (s.total_selisih_negatif || s.selisih_minus || 0),
    0
  );
  const totalKerugian = sessions.reduce(
    (sum, s) => sum + (s.kerugian || s.total_kerugian || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportStatCard
          title="Selisih (+) Total"
          value={totalSelisihPositif.toString()}
          sub="item lebih"
          color="emerald"
          icon={Plus}
        />
        <ReportStatCard
          title="Selisih (-) Total"
          value={totalSelisihNegatif.toString()}
          sub="item kurang"
          color="red"
          icon={Minus}
        />
        <ReportStatCard
          title="Kerugian Akibat Selisih"
          value={formatRupiah(totalKerugian)}
          sub="total kerugian"
          color="amber"
          icon={DollarSign}
        />
      </div>

      {sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session, idx) => {
            const isExpanded = expandedSession === idx;
            const selisih = session.detail || session.items || session.selisih || [];
            return (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setExpandedSession(isExpanded ? null : idx)}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-gray-900">
                        Opname {session.nama || session.label || `Sesi ${idx + 1}`}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {session.tanggal || session.date
                          ? format(new Date(session.tanggal || session.date), 'dd MMM yyyy', { locale: id })
                          : '-'}{' '}
                        · {session.lokasi || session.outlet || '-'} · {session.petugas || session.kasir || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {session.total_selisih || session.total_selisih != null ? (
                        <span className={`font-bold text-sm ${session.total_selisih >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {session.total_selisih >= 0 ? '+' : ''}{session.total_selisih || 0}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">{selisih.length} item</span>
                      )}
                    </div>
                    {isExpanded ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
                  </div>
                </button>
                {isExpanded && (
                  <div className="border-t border-gray-100 p-5">
                    {selisih.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Sistem</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Fisik</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Selisih</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Nilai</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {selisih.map((item, i) => {
                              const stokSistem = item.stok_sistem || item.sistem || 0;
                              const stokFisik = item.stok_fisik || item.fisik || 0;
                              const diff = stokFisik - stokSistem;
                              const nilai = item.nilai_selisih || item.nilai || Math.abs(diff) * (item.harga_beli || item.hpp || 0);
                              return (
                                <tr key={i} className="hover:bg-gray-50">
                                  <td className="px-4 py-3">
                                    <div className="font-medium text-sm text-gray-900">{item.nama || item.produk || '-'}</div>
                                    {item.kategori && <div className="text-xs text-gray-500">{item.kategori}</div>}
                                  </td>
                                  <td className="px-4 py-3 text-center text-sm text-gray-600">{stokSistem}</td>
                                  <td className="px-4 py-3 text-center text-sm text-gray-600">{stokFisik}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                      diff > 0 ? 'bg-emerald-50 text-emerald-700' :
                                      diff < 0 ? 'bg-red-50 text-red-700' :
                                      'bg-gray-50 text-gray-500'
                                    }`}>
                                      {diff > 0 ? '+' : ''}{diff}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                    {formatRupiah(nilai)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-400">Tidak ada selisih</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" strokeWidth={1} />
          <h3 className="text-lg font-semibold text-gray-500 mb-1">Belum Ada Sesi Opname</h3>
          <p className="text-sm">Data opname akan muncul setelah melakukan stock opname</p>
        </div>
      )}
    </div>
  );
}
