import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { perbandinganStok } from '@/data/inventoryOutletData';

export default function StokPerbandinganChart() {
  const [activeLines, setActiveLines] = useState({
    denpasar: true,
    jakarta: true,
    bandung: true,
    surabaya: true,
  });

  const handleLegendClick = (e) => {
    const { dataKey } = e;
    setActiveLines(prev => ({
      ...prev,
      [dataKey]: !prev[dataKey]
    }));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-800">Perbandingan Stok 7 Hari Terakhir</h3>
          <p className="text-[10px] text-gray-400 font-medium">Tren stok gabungan harian per outlet</p>
        </div>
      </div>

      <div className="w-full" style={{ height: '180px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={perbandinganStok} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey="tanggal" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }} 
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #f1f5f9', 
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                fontSize: '11px'
              }} 
            />
            <Legend 
              onClick={handleLegendClick}
              wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#475569', paddingTop: '10px' }}
              iconType="circle"
              cursor="pointer"
            />
            
            {activeLines.denpasar && (
              <Line 
                name="Denpasar" 
                type="monotone" 
                dataKey="denpasar" 
                stroke="#10B981" 
                strokeWidth={2.5} 
                dot={{ r: 3, strokeWidth: 1.5 }} 
                activeDot={{ r: 5 }} 
              />
            )}
            {activeLines.jakarta && (
              <Line 
                name="Jakarta" 
                type="monotone" 
                dataKey="jakarta" 
                stroke="#3B82F6" 
                strokeWidth={2.5} 
                dot={{ r: 3, strokeWidth: 1.5 }} 
                activeDot={{ r: 5 }} 
              />
            )}
            {activeLines.bandung && (
              <Line 
                name="Bandung" 
                type="monotone" 
                dataKey="bandung" 
                stroke="#8B5CF6" 
                strokeWidth={2.5} 
                dot={{ r: 3, strokeWidth: 1.5 }} 
                activeDot={{ r: 5 }} 
              />
            )}
            {activeLines.surabaya && (
              <Line 
                name="Surabaya" 
                type="monotone" 
                dataKey="surabaya" 
                stroke="#F59E0B" 
                strokeWidth={2.5} 
                dot={{ r: 3, strokeWidth: 1.5 }} 
                activeDot={{ r: 5 }} 
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
