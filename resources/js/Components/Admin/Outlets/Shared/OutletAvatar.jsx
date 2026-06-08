import React from 'react';

export default function OutletAvatar({ outletId, size = 'md' }) {
    const outlets = {
        denpasar: { inisial: 'D', color: 'bg-emerald-100 text-emerald-700' },
        jakarta: { inisial: 'J', color: 'bg-blue-100 text-blue-700' },
        bandung: { inisial: 'B', color: 'bg-purple-100 text-purple-700' },
        surabaya: { inisial: 'S', color: 'bg-amber-100 text-amber-700' },
    };

    const out = outlets[outletId] || { inisial: '?', color: 'bg-gray-100 text-gray-500' };

    const sizeClasses = {
        sm: 'w-6 h-6 text-[10px]',
        md: 'w-8 h-8 text-xs',
        lg: 'w-12 h-12 text-lg',
    };

    return (
        <div className={`rounded-full flex items-center justify-center font-bold shrink-0 ${sizeClasses[size]} ${out.color}`}>
            {out.inisial}
        </div>
    );
}
