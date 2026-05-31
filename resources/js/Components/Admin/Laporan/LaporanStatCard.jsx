import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const colorStyles = {
    emerald: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        border: 'border-emerald-100',
        iconBg: 'bg-emerald-100'
    },
    blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-100',
        iconBg: 'bg-blue-100'
    },
    purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-100',
        iconBg: 'bg-purple-100'
    },
    amber: {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        border: 'border-amber-100',
        iconBg: 'bg-amber-100'
    },
    red: {
        bg: 'bg-red-50',
        text: 'text-red-600',
        border: 'border-red-100',
        iconBg: 'bg-red-100'
    },
    rose: {
        bg: 'bg-rose-50',
        text: 'text-rose-600',
        border: 'border-rose-100',
        iconBg: 'bg-rose-100'
    },
    gray: {
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        border: 'border-gray-200',
        iconBg: 'bg-gray-200'
    }
};

export default function LaporanStatCard({ icon: Icon, title, value, sub, color = 'emerald', trend }) {
    const style = colorStyles[color] || colorStyles.gray;

    return (
        <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${style.iconBg} ${style.text}`}>
                    <Icon size={24} strokeWidth={2} />
                </div>
                {trend && (
                    <div className={`flex items-center space-x-1 text-sm font-medium px-2 py-1 rounded-full ${trend.value >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {trend.value >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        <span>{Math.abs(trend.value)}%</span>
                    </div>
                )}
            </div>
            
            <div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
                <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
                <div className="text-sm text-gray-500">{sub}</div>
            </div>
        </div>
    );
}
