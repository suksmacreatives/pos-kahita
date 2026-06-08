import React, { useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useFilter } from '@/Context/FilterContext';
import { 
  warehouseStats, 
  outletStats, 
  stockMovementData, 
  salesTrendData, 
  incomingGoods, 
  outgoingGoods, 
  activityLog, 
  lowStockItems, 
  outletPerformance, 
  topProducts 
} from '@/data/dummyData';

import StatCard from '@/Components/Admin/StatCard';
import ChartCard from '@/Components/Admin/ChartCard';
import ActivityCard from '@/Components/Admin/ActivityCard';
import DataTable from '@/Components/Admin/DataTable';
import LowStockAlert from '@/Components/Admin/LowStockAlert';
import PerformanceTable from '@/Components/Admin/PerformanceTable';

import { 
  AreaChart, Area, 
  BarChart, Bar, 
  XAxis, YAxis, 
  CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';

import { 
  DollarSign, 
  ShoppingCart, 
  Percent, 
  Layers, 
  Download, 
  RefreshCw
} from 'lucide-react';

export default function Dashboard() {
  const { outlet, period } = useFilter();

  // 1. Format Helpers
  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  // 2. Client-side state filtering & aggregation using useMemo
  const filteredStats = useMemo(() => {
    const oStats = outletStats[outlet]?.[period] || outletStats.all[period];
    const wStats = warehouseStats[outlet]?.[period] || warehouseStats.all[period];
    return { ...oStats, ...wStats };
  }, [outlet, period]);

  const filteredSalesTrend = useMemo(() => {
    return salesTrendData[outlet]?.[period] || salesTrendData.all[period];
  }, [outlet, period]);

  const filteredStockMovement = useMemo(() => {
    return stockMovementData[outlet]?.[period] || stockMovementData.all[period];
  }, [outlet, period]);

  const filteredIncomingGoods = useMemo(() => {
    if (outlet === 'all') return incomingGoods.slice(0, 5);
    return incomingGoods.filter(item => item.outlet === outlet).slice(0, 5);
  }, [outlet]);

  const filteredOutgoingGoods = useMemo(() => {
    if (outlet === 'all') return outgoingGoods.slice(0, 5);
    return outgoingGoods.filter(item => item.outlet === outlet).slice(0, 5);
  }, [outlet]);

  const filteredActivities = useMemo(() => {
    if (outlet === 'all') return activityLog;
    return activityLog.filter(act => act.outlet === outlet || act.outlet === 'all');
  }, [outlet]);

  const filteredLowStock = useMemo(() => {
    if (outlet === 'all') return lowStockItems.slice(0, 4);
    return lowStockItems.filter(item => item.outlet === outlet).slice(0, 4);
  }, [outlet]);

  // BUGFIX DI SINI: Menambahkan penanganan kondisi outlet === 'all'
  const filteredTopProducts = useMemo(() => {
    if (outlet === 'all') {
      return topProducts.filter(item => item.period === period);
    }
    return topProducts.filter(item => item.outlet === outlet && item.period === period);
  }, [outlet, period]);

  const filteredPerformanceList = useMemo(() => {
    if (outlet === 'all') {
      return outletPerformance[period] || [];
    }
    const matched = outletPerformance[period]?.find(item =>
      item.name.toLowerCase().includes(outlet.toLowerCase())
    );
    return matched ? [matched] : [];
  }, [outlet, period]);

  // 3. Custom Chart Tooltip styling
  const CustomTooltip = ({ active, payload, label, formatter }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 font-sans leading-none">
          <p className="font-semibold text-[10px] text-slate-400 border-b border-slate-800 pb-1.5 mb-1.5">{label}</p>
          {payload.map((item, index) => (
            <div key={index} className="flex items-center gap-4 justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
              </span>
              <span className="font-bold font-mono">
                {formatter ? formatter(item.value) : formatNumber(item.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // 4. Headers definition for incoming / outgoing data tables
  const incomingTableHeaders = [
    { key: 'id', label: 'ID Transaksi' },
    { key: 'name', label: 'Nama Barang' },
    { key: 'from', label: 'Asal Pengirim' },
    { key: 'qty', label: 'Qty', align: 'center', render: (row) => `${formatNumber(row.qty)} pcs` },
    { key: 'status', label: 'Status', align: 'center' }
  ];

  const outgoingTableHeaders = [
    { key: 'id', label: 'ID Transaksi' },
    { key: 'name', label: 'Nama Barang' },
    { key: 'to', label: 'Tujuan Outlet' },
    { key: 'qty', label: 'Qty', align: 'center', render: (row) => `${formatNumber(row.qty)} pcs` },
    { key: 'status', label: 'Status', align: 'center' }
  ];

  return (
    <div className="space-y-6 w-full min-h-screen pb-12 box-border">
      {/* 1. Welcoming Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-none">Ringkasan Bisnis Kahita</h1>
          <p className="text-xs font-semibold text-gray-400 mt-2">
            Pemantauan multi-outlet dan aktivitas gudang secara langsung
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => window.location.reload()}
            className="p-2 bg-white border border-gray-100 hover:border-gray-200 text-gray-500 hover:text-gray-800 rounded-xl shadow-sm transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/10 hover:shadow-md transition-all duration-200 cursor-pointer">
            <Download className="w-4 h-4" />
            <span>Ekspor PDF</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <StatCard
          title="Total Pendapatan"
          value={formatIDR(filteredStats.totalSales)}
          change={filteredStats.growthSales}
          trend={filteredStats.growthSales >= 0 ? 'up' : 'down'}
          comparisonText={`vs ${period === 'daily' ? 'kemarin' : period === 'weekly' ? 'minggu lalu' : 'bulan lalu'}`}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Total Transaksi"
          value={formatNumber(filteredStats.transactions)}
          change={filteredStats.growthTransactions}
          trend={filteredStats.growthTransactions >= 0 ? 'up' : 'down'}
          comparisonText={`vs ${period === 'daily' ? 'kemarin' : period === 'weekly' ? 'minggu lalu' : 'bulan lalu'}`}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="Rata-Rata Tiket (AOV)"
          value={formatIDR(filteredStats.aov)}
          change={filteredStats.growthAov}
          trend={filteredStats.growthAov >= 0 ? 'up' : 'down'}
          comparisonText={`vs ${period === 'daily' ? 'kemarin' : period === 'weekly' ? 'minggu lalu' : 'bulan lalu'}`}
          icon={Percent}
          color="indigo"
        />
        <StatCard
          title="Total Stok Fisik"
          value={`${formatNumber(filteredStats.totalStock)} pcs`}
          change={undefined}
          trend="neutral"
          comparisonText={`${filteredStats.lowStockCount} barang kritis perlu reorder`}
          icon={Layers}
          color="amber"
        />
      </div>

      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard 
          title="Tren Pendapatan & Volume Transaksi" 
          subtitle={`Segmentasi ${period === 'daily' ? 'per jam' : period === 'weekly' ? 'harian' : 'mingguan'} cabang`}
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={filteredSalesTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000000}M`} dx={-5} />
              <Tooltip content={<CustomTooltip formatter={formatIDR} />} />
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 600, color: '#334155' }} />
              <Area name="Pendapatan (Rp)" type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Pergerakan Stok Gudang" subtitle="Rasio Stock In vs Stock Out barang">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredStockMovement} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dx={-5} />
              <Tooltip content={<CustomTooltip formatter={(val) => `${formatNumber(val)} pcs`} />} />
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 600, color: '#334155' }} />
              <Bar name="Stock In (Pemasukan)" dataKey="stockIn" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar name="Stock Out (Pengeluaran)" dataKey="stockOut" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ========================================================================= */}
      {/* 4. BARIS GRID INSIGHTS (DIISOLASI PENUH) */}
      {/* ========================================================================= */}
      <div className="block w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          
          {/* Kolom Kiri */}
          <div className="space-y-5 lg:col-span-1">
            <LowStockAlert items={filteredLowStock} />
            <ActivityCard activities={filteredActivities} />
          </div>

          {/* Kolom Kanan */}
          <div className="space-y-5 lg:col-span-2">
            <PerformanceTable data={filteredPerformanceList} />

            {/* Top Selling Products */}
            <div className="bg-white border border-gray-100/80 rounded-2xl shadow-sm overflow-hidden p-5 flex flex-col">
              <div className="pb-4 border-b border-gray-50/60 mb-4 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-sm text-gray-900 leading-none tracking-tight">Produk Paling Laris</h5>
                  <p className="text-[11px] text-gray-400 mt-1.5 font-medium">Berdasarkan volume unit terjual & omzet</p>
                </div>
                <span className="text-[10px] text-gray-400 font-semibold bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
                  Top 5 Item
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/20">
                      <th className="py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Produk</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kategori</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Unit Terjual</th>
                      <th className="py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Omzet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50/50">
                    {filteredTopProducts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-xs text-gray-400">
                          Tidak ada data produk terjual pada filter ini.
                        </td>
                      </tr>
                    ) : (
                      filteredTopProducts.slice(0, 5).map((prod) => (
                        <tr key={prod.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="py-3 text-xs">
                            <p className="font-bold text-gray-800 leading-none">{prod.name}</p>
                            <span className="text-[9px] text-gray-400 font-mono mt-1 block uppercase tracking-wider">{prod.sku}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 font-semibold">{prod.category}</td>
                          <td className="px-4 py-3 text-xs text-gray-600 text-center font-mono font-medium">{formatNumber(prod.sold)} pcs</td>
                          <td className="py-3 text-xs font-bold text-gray-900 text-right font-mono">{formatIDR(prod.revenue)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. BARIS GRID MUTASI GUDANG (TERPISAH SEPENUHNYA DALAM DIV BARU) */}
      {/* ========================================================================= */}
      <div className="block w-full pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <DataTable 
            title="Stok Masuk Terbaru (Incoming)" 
            subtitle="Pengiriman pasokan barang masuk" 
            headers={incomingTableHeaders} 
            data={filteredIncomingGoods} 
            emptyMessage="Tidak ada aktivitas stok masuk" 
          />
          <DataTable 
            title="Stok Keluar Terbaru (Outgoing)" 
            subtitle="Pengeluaran atau distribusi mutasi" 
            headers={outgoingTableHeaders} 
            data={filteredOutgoingGoods} 
            emptyMessage="Tidak ada aktivitas stok keluar" 
          />
        </div>
      </div>

    </div>
  );
}

Dashboard.layout = (page) => <AdminLayout>{page}</AdminLayout>;