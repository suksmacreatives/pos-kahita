import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PerformaChart({ data, outletColorHex }) {
    if (!data || data.length === 0) return null;

    const formatRupiah = (value) => {
        if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}Jt`;
        return `Rp ${value.toLocaleString('id-ID')}`;
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur shadow-lg border border-slate-100 rounded-xl p-3 text-xs">
                    <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-3 justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-slate-500">{entry.name}</span>
                            </div>
                            <span className="font-bold text-slate-900">
                                {entry.name === 'Omset' 
                                    ? `Rp ${Number(entry.value).toLocaleString('id-ID')}`
                                    : `${entry.value} trx`}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                        dataKey="tanggal" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#64748b' }} 
                        dy={10}
                    />
                    <YAxis 
                        yAxisId="left"
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        tickFormatter={formatRupiah}
                    />
                    <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#64748b' }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar 
                        yAxisId="left"
                        dataKey="omset" 
                        name="Omset" 
                        fill={outletColorHex || '#10B981'} 
                        radius={[4, 4, 0, 0]} 
                        barSize={32}
                    />
                    <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="transaksi" 
                        name="Transaksi" 
                        stroke="#64748b" 
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#fff', stroke: '#64748b', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#64748b', stroke: '#fff' }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
