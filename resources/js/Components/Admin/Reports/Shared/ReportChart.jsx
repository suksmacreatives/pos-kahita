import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import EmptyReport from './EmptyReport';

const CHART_TYPES = {
  bar: BarChart,
  line: LineChart,
  area: AreaChart,
  pie: PieChart,
  composed: ComposedChart,
};

export default function ReportChart({ type = 'bar', data = [], config = {}, height = 280, loading = false, empty }) {
  if (loading) {
    return (
      <div className="animate-pulse bg-gray-50 rounded-xl" style={{ height }}>
        <div className="h-full flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (empty || !data || data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center">
        <EmptyReport message={empty || 'Tidak ada data untuk ditampilkan'} sub="" />
      </div>
    );
  }

  const ChartComponent = CHART_TYPES[type] || BarChart;

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ChartComponent data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={config.xKey || 'name'} tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            />
            <Legend />
            {(config.bars || [{ dataKey: config.yKey || 'value', fill: '#10b981', name: 'Nilai' }]).map((bar, i) => (
              <Bar key={i} dataKey={bar.dataKey} fill={bar.fill} name={bar.name} radius={[4, 4, 0, 0]} />
            ))}
          </ChartComponent>
        );
      case 'line':
        return (
          <ChartComponent data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={config.xKey || 'name'} tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            />
            <Legend />
            {(config.lines || [{ dataKey: config.yKey || 'value', stroke: '#10b981', name: 'Nilai' }]).map((line, i) => (
              <Line key={i} type="monotone" dataKey={line.dataKey} stroke={line.stroke} name={line.name} strokeWidth={2} dot={{ r: 3 }} />
            ))}
          </ChartComponent>
        );
      case 'area':
        return (
          <ChartComponent data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={config.xKey || 'name'} tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            />
            <Legend />
            {(config.areas || [{ dataKey: config.yKey || 'value', fill: '#10b981', stroke: '#059669', name: 'Nilai' }]).map((area, i) => (
              <Area key={i} type="monotone" dataKey={area.dataKey} fill={area.fill} stroke={area.stroke} name={area.name} strokeWidth={2} />
            ))}
          </ChartComponent>
        );
      case 'pie':
        return (
          <ChartComponent>
            <Pie
              data={data}
              dataKey={config.yKey || 'value'}
              nameKey={config.xKey || 'name'}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={(config.colors || ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'])[index % 8]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </ChartComponent>
        );
      case 'composed':
        return (
          <ChartComponent data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={config.xKey || 'name'} tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            />
            <Legend />
            {(config.bars || []).map((bar, i) => (
              <Bar key={`bar-${i}`} yAxisId="left" dataKey={bar.dataKey} fill={bar.fill} name={bar.name} radius={[4, 4, 0, 0]} />
            ))}
            {(config.lines || []).map((line, i) => (
              <Line key={`line-${i}`} yAxisId="right" type="monotone" dataKey={line.dataKey} stroke={line.stroke} name={line.name} strokeWidth={2} dot={{ r: 3 }} />
            ))}
          </ChartComponent>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
