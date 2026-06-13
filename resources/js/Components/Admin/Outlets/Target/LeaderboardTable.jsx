import React, { useState } from 'react';
import OutletBadge from '../Shared/OutletBadge';
import { TrendingUp, TrendingDown, Minus, Medal } from 'lucide-react';

export default function LeaderboardTable({ leaderboard }) {
    if (!leaderboard) return null;

    const formatRupiah = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-slate-50/50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Medal className="w-5 h-5 text-amber-500" /> Ranking Outlet Bulan Ini
                </h3>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="bg-white border-b border-gray-100 text-gray-500">
                        <tr>
                            <th className="px-6 py-3 font-semibold w-16 text-center">Rank</th>
                            <th className="px-6 py-3 font-semibold">Outlet</th>
                            <th className="px-6 py-3 font-semibold">Omset</th>
                            <th className="px-6 py-3 font-semibold">Growth (MoM)</th>
                            <th className="px-6 py-3 font-semibold">Transaksi</th>
                            <th className="px-6 py-3 font-semibold text-right">Avg / Trx</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {leaderboard.map(item => {
                            // Highlight styles for top 3
                            let rowClass = 'hover:bg-slate-50 transition-colors';
                            let rankDisplay = <span className="font-bold text-gray-500">{item.rank}</span>;

                            if (item.rank === 1) {
                                rowClass = 'bg-amber-50/30 hover:bg-amber-50 transition-colors';
                                rankDisplay = <span className="text-xl" title="Peringkat 1">🥇</span>;
                            } else if (item.rank === 2) {
                                rowClass = 'bg-slate-50/50 hover:bg-slate-100 transition-colors';
                                rankDisplay = <span className="text-xl" title="Peringkat 2">🥈</span>;
                            } else if (item.rank === 3) {
                                rowClass = 'hover:bg-orange-50/30 transition-colors';
                                rankDisplay = <span className="text-xl" title="Peringkat 3">🥉</span>;
                            }

                            // Growth display
                            const g = item.growth;
                            let growthDisplay;
                            if (g > 0) {
                                growthDisplay = (
                                    <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 w-max">
                                        <TrendingUp className="w-3 h-3" /> +{g}%
                                    </span>
                                );
                            } else if (g < 0) {
                                growthDisplay = (
                                    <span className="flex items-center gap-1 text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100 w-max">
                                        <TrendingDown className="w-3 h-3" /> {g}%
                                    </span>
                                );
                            } else {
                                growthDisplay = (
                                    <span className="flex items-center gap-1 text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded w-max">
                                        <Minus className="w-3 h-3" /> 0%
                                    </span>
                                );
                            }

                            return (
                                <tr key={item.outlet_id} className={rowClass}>
                                    <td className="px-6 py-4 text-center">
                                        {rankDisplay}
                                    </td>
                                    <td className="px-6 py-4">
                                        <OutletBadge outlet={{ id: item.outlet_id, nama: item.outlet_nama || item.name, warna: item.warna }} showDot={true} />
                                        <p className="text-[9px] text-gray-400 mt-1 truncate max-w-[150px]">Top: {item.top_produk || '-'}</p>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900 text-sm">
                                        {formatRupiah(item.omset || 0)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {growthDisplay}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-900">{item.transaksi}</span>
                                        <span className="text-[10px] text-gray-400 ml-1">trx</span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-gray-700">
                                        {formatRupiah(item.rata_transaksi || 0)}
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
