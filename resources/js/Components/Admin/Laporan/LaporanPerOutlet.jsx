import React, { useState } from 'react';
import { Store, Medal, ChevronDown, ChevronUp } from 'lucide-react';
import OutletPerformaChart from './OutletPerformaChart';

const OUTLET_COLORS = {
    denpasar: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500', badge: 'bg-emerald-100' },
    jakarta: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500', badge: 'bg-blue-100' },
    bandung: { bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500', badge: 'bg-purple-100' },
    surabaya: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', badge: 'bg-amber-100' }
};

export default function LaporanPerOutlet({ perOutletStats, omsetHarianData, filteredTransaksi }) {
    const [chartType, setChartType] = useState('bar');
    const [expandedOutlet, setExpandedOutlet] = useState(null);

    const formatRupiah = (val) => `Rp ${val.toLocaleString('id-ID')}`;

    // Format data for Chart (transform omsetHarianData array format for multi-line)
    const chartData = omsetHarianData.map(day => {
        const result = { tanggal: day.tanggal };
        perOutletStats.forEach(outlet => {
            // Find total for this outlet on this day from filteredTransaksi
            const omsetHariIni = filteredTransaksi
                .filter(t => t.tanggal.startsWith(day.tanggal) && t.outlet_id === outlet.id)
                .reduce((sum, t) => sum + t.total, 0);
            result[outlet.id] = omsetHariIni;
        });
        return result;
    });

    // Top products per outlet
    const getTopProductsByOutlet = (outletId) => {
        const prodMap = {};
        filteredTransaksi
            .filter(t => t.outlet_id === outletId)
            .forEach(t => {
                t.items.forEach(item => {
                    if (!prodMap[item.nama_produk]) {
                        prodMap[item.nama_produk] = { nama: item.nama_produk, qty: 0, revenue: 0 };
                    }
                    prodMap[item.nama_produk].qty += item.qty;
                    prodMap[item.nama_produk].revenue += item.subtotal;
                });
            });
        
        return Object.values(prodMap).sort((a, b) => b.qty - a.qty).slice(0, 5);
    };

    return (
        <div className="space-y-6">
            {/* 4 Cards Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {perOutletStats.map((outlet, index) => {
                    const colors = OUTLET_COLORS[outlet.id] || OUTLET_COLORS.denpasar;
                    const isPositive = outlet.growth_vs_periode_lalu >= 0;
                    
                    return (
                        <div key={outlet.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-gray-50 px-3 py-1 rounded-bl-xl font-bold text-gray-400 text-sm border-b border-l border-gray-100">
                                #{index + 1}
                            </div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
                                <h3 className="font-bold text-gray-900">{outlet.nama}</h3>
                            </div>
                            
                            <div className="mb-4">
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                    {formatRupiah(outlet.omset)}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {outlet.transaksi} transaksi
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                <div className="text-xs text-gray-500 truncate pr-2" title={outlet.produk_terlaris}>
                                    <span className="font-medium">Top:</span> {outlet.produk_terlaris}
                                </div>
                                <div className={`text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                    {isPositive ? '+' : ''}{outlet.growth_vs_periode_lalu}%
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Grafik Perbandingan */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Performa Outlet</h3>
                        <p className="text-sm text-gray-500">Perbandingan pendapatan antar cabang</p>
                    </div>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setChartType('bar')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${chartType === 'bar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Bar Chart
                        </button>
                        <button
                            onClick={() => setChartType('line')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${chartType === 'line' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Line Chart
                        </button>
                    </div>
                </div>
                <OutletPerformaChart data={chartData} chartType={chartType} />
            </div>

            {/* Tabel Ranking */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Ranking Performa Outlet</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outlet</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Omset</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Transaksi</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Avg/Transaksi</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Growth</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {perOutletStats.map((outlet, index) => {
                                const isPositive = outlet.growth_vs_periode_lalu >= 0;
                                const avgTrx = outlet.transaksi > 0 ? outlet.omset / outlet.transaksi : 0;
                                return (
                                    <tr key={outlet.id} className={`${index === 0 ? 'bg-emerald-50/30' : 'hover:bg-gray-50'} transition-colors`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {index === 0 ? <Medal className="text-yellow-500" size={24} /> :
                                             index === 1 ? <Medal className="text-gray-400" size={24} /> :
                                             index === 2 ? <Medal className="text-amber-600" size={24} /> :
                                             <span className="text-gray-400 font-bold px-2">{index + 1}</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-2 h-2 rounded-full ${OUTLET_COLORS[outlet.id]?.dot || 'bg-gray-400'}`} />
                                                <span className="font-bold text-gray-900">{outlet.nama}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                                            {formatRupiah(outlet.omset)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600">
                                            {outlet.transaksi}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600">
                                            {formatRupiah(Math.round(avgTrx))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                {isPositive ? '+' : ''}{outlet.growth_vs_periode_lalu}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Produk Terlaris Per Outlet (Collapsible) */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Produk Terlaris Per Outlet</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {perOutletStats.map(outlet => {
                        const topProducts = getTopProductsByOutlet(outlet.id);
                        const isExpanded = expandedOutlet === outlet.id;
                        const colors = OUTLET_COLORS[outlet.id] || OUTLET_COLORS.denpasar;

                        return (
                            <div key={outlet.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <button 
                                    onClick={() => setExpandedOutlet(isExpanded ? null : outlet.id)}
                                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.badge} ${colors.text}`}>
                                            <Store size={20} />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="font-bold text-gray-900">{outlet.nama}</h4>
                                            <p className="text-xs text-gray-500">Top 5 Produk Terjual</p>
                                        </div>
                                    </div>
                                    {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                </button>
                                
                                {isExpanded && (
                                    <div className="border-t border-gray-100 p-0">
                                        <table className="min-w-full divide-y divide-gray-50">
                                            <thead className="bg-gray-50/50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs text-gray-500 font-medium">Produk</th>
                                                    <th className="px-4 py-2 text-center text-xs text-gray-500 font-medium">Qty</th>
                                                    <th className="px-4 py-2 text-right text-xs text-gray-500 font-medium">Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {topProducts.length > 0 ? topProducts.map((prod, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">{prod.nama}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-600 text-center">{prod.qty}</td>
                                                        <td className="px-4 py-2 text-sm text-emerald-600 font-medium text-right">{formatRupiah(prod.revenue)}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="3" className="px-4 py-4 text-center text-sm text-gray-400">Tidak ada data</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
