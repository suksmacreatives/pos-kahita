import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { ArrowUpDown, BarChart3 } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-xs">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-500">{entry.name}: </span>
          <span className="font-bold text-gray-800">{entry.value.toLocaleString()} pcs</span>
        </div>
      ))}
    </div>
  );
};

export default function MutasiChart({ data, emptyMessage }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <ArrowUpDown className="h-5 w-5 mr-2 text-emerald-600" /> Mutasi Barang
        </h3>
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <BarChart3 className="h-12 w-12 mb-3 text-gray-300" />
          <p className="text-sm font-medium">{emptyMessage || 'Belum ada data mutasi'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <ArrowUpDown className="h-5 w-5 mr-2 text-emerald-600" /> Mutasi Barang Bulan Ini
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, fontWeight: 500 }} />
          <Line type="monotone" dataKey="MASUK" name="Barang Masuk" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="KELUAR" name="Barang Keluar" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
