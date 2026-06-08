import React from 'react';

export default function KasirAvatar({ nama, fotoColor = '#94a3b8', size = 'md' }) {
    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    const sizeClasses = {
        sm: 'w-6 h-6 text-[10px]',
        md: 'w-9 h-9 text-xs',
        lg: 'w-12 h-12 text-base',
        xl: 'w-14 h-14 text-lg'
    };

    // Extract hex to rgba for light background
    const hexToRgba = (hex, alpha) => {
        if (!hex) return `rgba(148, 163, 184, ${alpha})`;
        let c;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
            c = hex.substring(1).split('');
            if(c.length === 3){
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
        }
        return `rgba(148, 163, 184, ${alpha})`;
    };

    return (
        <div 
            className={`rounded-full flex items-center justify-center font-bold shrink-0 ${sizeClasses[size]} border border-white/50 shadow-sm`}
            style={{ 
                backgroundColor: hexToRgba(fotoColor, 0.15), 
                color: fotoColor 
            }}
        >
            {getInitials(nama)}
        </div>
    );
}
