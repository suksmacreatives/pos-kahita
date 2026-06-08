import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const METODE_COLORS = {
    cash: '#10B981',     // emerald
    qris: '#8B5CF6',     // purple
    transfer: '#3B82F6', // blue
    debit: '#F59E0B',    // amber
    kredit: '#F43F5E'    // rose
};

export default function MetodePembayaranChart({ data }) {
    // Convert object to array for Recharts
    const chartData = Object.entries(data).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        key: key,
        value: value.total,
        count: value.count,
        persentase: value.persentase
    })).filter(item => item.value > 0);

    const totalOmset = chartData.reduce((sum, item) => sum + item.value, 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: METODE_COLORS[data.key] }} />
                        <span className="font-semibold text-gray-900">{data.name}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                        Total: <span className="font-medium text-gray-900">Rp {data.value.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                        Porsi: <span className="font-medium text-gray-900">{data.persentase}%</span> ({data.count} trx)
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col md:flex-row items-center gap-8 w-full h-[300px]">
            {/* Donut Chart */}
            <div className="w-full md:w-3/5 h-full relative">
                {chartData.length > 0 ? (
                    <>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={METODE_COLORS[entry.key]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xs text-gray-500 uppercase font-medium">Total</span>
                            <span className="text-lg font-bold text-gray-900">
                                {totalOmset > 1000000 ? `${(totalOmset / 1000000).toFixed(1)}jt` : 'Rp 0'}
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-full max-w-[200px] max-h-[200px] mx-auto">
                        Tidak ada data
                    </div>
                )}
            </div>

            {/* Legend Detail */}
            <div className="w-full md:w-2/5 space-y-4">
                {chartData.map((item, index) => (
                    <div key={index} className="flex flex-col">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: METODE_COLORS[item.key] }} />
                                <span className="text-sm font-medium text-gray-900">{item.name}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{item.persentase}%</span>
                        </div>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xs text-gray-500">{item.count} transaksi</span>
                            <span className="text-xs text-gray-500">Rp {item.value.toLocaleString('id-ID')}</span>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div 
                                className="h-1.5 rounded-full" 
                                style={{ width: `${item.persentase}%`, backgroundColor: METODE_COLORS[item.key] }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
