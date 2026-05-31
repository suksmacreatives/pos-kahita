import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function OmsetChart({ data, mode = 'keduanya' }) {
    // Format Y Axis Kiri (Rupiah Singkat)
    const formatRupiahSingkat = (value) => {
        if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}jt`;
        if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)}k`;
        return `Rp ${value}`;
    };

    // Format X Axis (Tanggal Singkat)
    const formatTanggalSingkat = (dateStr) => {
        try {
            return format(new Date(dateStr), 'dd/MM');
        } catch {
            return dateStr;
        }
    };

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                    <p className="text-sm font-medium text-gray-900 mb-2 border-b border-gray-100 pb-2">
                        {format(new Date(label), 'dd MMM yyyy', { locale: id })}
                    </p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm mb-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-gray-600">{entry.name}:</span>
                            <span className="font-semibold text-gray-900">
                                {entry.dataKey === 'omset' 
                                    ? `Rp ${entry.value.toLocaleString('id-ID')}` 
                                    : `${entry.value} transaksi`}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-[280px] w-full">
            {data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={data}
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
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
                        
                        {(mode === 'omset' || mode === 'keduanya') && (
                            <YAxis 
                                yAxisId="kiri"
                                tickFormatter={formatRupiahSingkat}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                dx={-10}
                            />
                        )}
                        
                        {(mode === 'transaksi' || mode === 'keduanya') && (
                            <YAxis 
                                yAxisId="kanan"
                                orientation="right"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                dx={10}
                            />
                        )}

                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />

                        {(mode === 'omset' || mode === 'keduanya') && (
                            <Bar 
                                yAxisId="kiri" 
                                dataKey="omset" 
                                name="Omset" 
                                fill="#10B981" 
                                radius={[4, 4, 0, 0]} 
                                barSize={maxBarSize(data.length)}
                            />
                        )}
                        
                        {(mode === 'transaksi' || mode === 'keduanya') && (
                            <Line 
                                yAxisId={mode === 'keduanya' ? "kanan" : "kanan"} // Use right axis for line when both, or standard if alone but let's keep it consistent
                                type="monotone" 
                                dataKey="transaksi_count" 
                                name="Transaksi" 
                                stroke="#3B82F6" 
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Tidak ada data untuk periode ini
                </div>
            )}
        </div>
    );
}

// Helper to prevent bars from being too wide if there's only a few data points
function maxBarSize(dataLength) {
    if (dataLength <= 7) return 40;
    if (dataLength <= 14) return 20;
    return undefined; // Let recharts handle it
}
