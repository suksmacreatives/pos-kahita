import React from 'react';

export default function OutletAvatar({ outletId, size = 'md', outlet }) {
    const nama = outlet?.nama || '';
    const inisial = nama ? nama.charAt(0).toUpperCase() : '?';
    const warna = outlet?.warna || 'emerald';

    const colorMap = {
        emerald: 'bg-emerald-100 text-emerald-700',
        blue: 'bg-blue-100 text-blue-700',
        purple: 'bg-purple-100 text-purple-700',
        amber: 'bg-amber-100 text-amber-700',
        red: 'bg-red-100 text-red-700',
        indigo: 'bg-indigo-100 text-indigo-700',
        rose: 'bg-rose-100 text-rose-700',
    };

    const color = colorMap[warna] || 'bg-gray-100 text-gray-500';

    const sizeClasses = {
        sm: 'w-6 h-6 text-[10px]',
        md: 'w-8 h-8 text-xs',
        lg: 'w-12 h-12 text-lg',
    };

    return (
        <div className={`rounded-full flex items-center justify-center font-bold shrink-0 ${sizeClasses[size]} ${color}`}>
            {inisial}
        </div>
    );
}
