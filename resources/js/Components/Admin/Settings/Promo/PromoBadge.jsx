import React from 'react';
import { Tag } from 'lucide-react';

export default function PromoBadge({ tipe, status, label }) {
    if (tipe) {
        const typeStyles = {
            persentase: { bg: 'bg-blue-100', text: 'text-blue-800' },
            nominal: { bg: 'bg-green-100', text: 'text-green-800' },
            bundle: { bg: 'bg-amber-100', text: 'text-amber-800' }
        };
        const style = typeStyles[tipe] || { bg: 'bg-gray-100', text: 'text-gray-800' };
        
        let defaultLabel = '';
        if (tipe === 'persentase') defaultLabel = '% Diskon';
        if (tipe === 'nominal') defaultLabel = 'Rp Potongan';
        if (tipe === 'bundle') defaultLabel = 'Bundle';

        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${style.bg} ${style.text}`}>
                <Tag size={12} className="mr-1" />
                {label || defaultLabel}
            </span>
        );
    }

    if (status) {
        const statusStyles = {
            aktif: { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: true },
            nonaktif: { bg: 'bg-gray-100', text: 'text-gray-600', dot: false },
            habis: { bg: 'bg-red-100', text: 'text-red-800', dot: false },
            kadaluarsa: { bg: 'bg-gray-100', text: 'text-gray-500 line-through', dot: false }
        };
        const style = statusStyles[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${style.bg} ${style.text}`}>
                {style.dot && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                {status}
            </span>
        );
    }

    return null;
}
