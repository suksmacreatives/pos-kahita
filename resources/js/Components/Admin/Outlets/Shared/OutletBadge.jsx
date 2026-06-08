import React from 'react';

export default function OutletBadge({ outlet, outletId, showDot = true }) {
    const outletData = outlet || null;

    if (!outletData && outletId) {
        return <span className="text-gray-400 text-xs">Outlet #{outletId}</span>;
    }

    if (!outletData) return <span className="text-gray-400">—</span>;

    const colorMap = {
        emerald: 'text-emerald-700 bg-emerald-500',
        blue: 'text-blue-700 bg-blue-500',
        purple: 'text-purple-700 bg-purple-500',
        amber: 'text-amber-700 bg-amber-500',
    };

    const warna = outletData.warna || 'emerald';
    const c = colorMap[warna] || colorMap.emerald;
    const textClass = c.split(' ')[0];
    const bgClass = c.split(' ')[1];

    return (
        <div className="flex items-center gap-1.5 font-medium">
            {showDot && (
                <div className={`w-2 h-2 rounded-full ${bgClass}`} />
            )}
            <span className={`text-xs ${textClass}`}>{outletData.nama}</span>
        </div>
    );
}
