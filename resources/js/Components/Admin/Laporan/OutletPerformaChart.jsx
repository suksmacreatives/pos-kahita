import React from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';

const OUTLET_COLORS = {
    denpasar: '#10B981', // emerald
    jakarta: '#3B82F6',  // blue
    bandung: '#8B5CF6',  // purple
    surabaya: '#F59E0B'  // amber
};

export default function OutletPerformaChart({ data, chartType = 'bar' }) {
    const formatRupiahSingkat = (value) => {
        if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}jt`;
        if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)}k`;
        return `Rp ${value}`;
    };

    const formatTanggalSingkat = (dateStr) => {
        try {
            return format(new Date(dateStr), 'dd/MM');
        } catch {
            return dateStr;
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                    <p className="text-sm font-medium text-gray-900 mb-2 border-b border-gray-100 pb-2">
                        {format(new Date(label), 'dd MMM yyyy')}
                    </p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between space-x-6 text-sm mb-1">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-gray-600 capitalize">{entry.name}:</span>
                            </div>
                            <span className="font-semibold text-gray-900">
                                Rp {entry.value.toLocaleString('id-ID')}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const ChartComponent = chartType === 'bar' ? BarChart : LineChart;
    const DataComponent = chartType === 'bar' ? Bar : Line;

    return (
        <div className="h-[260px] w-full">
            {data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <ChartComponent
                        data={data}
                        margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis 
                            dataKey="tanggal" 
                            tickFormatter={formatTanggalSingkat}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis 
                            tickFormatter={formatRupiahSingkat}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            dx={-10}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
                        
                        {Object.keys(OUTLET_COLORS).map(outlet => (
                            chartType === 'bar' ? (
                                <Bar 
                                    key={outlet}
                                    dataKey={outlet} 
                                    name={outlet.charAt(0).toUpperCase() + outlet.slice(1)}
                                    fill={OUTLET_COLORS[outlet]} 
                                    radius={[4, 4, 0, 0]}
                                />
                            ) : (
                                <Line
                                    key={outlet}
                                    type="monotone"
                                    dataKey={outlet}
                                    name={outlet.charAt(0).toUpperCase() + outlet.slice(1)}
                                    stroke={OUTLET_COLORS[outlet]}
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2 }}
                                    activeDot={{ r: 6 }}
                                />
                            )
                        ))}
                    </ChartComponent>
                </ResponsiveContainer>
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Tidak ada data untuk periode ini
                </div>
            )}
        </div>
    );
}
