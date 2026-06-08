import React from 'react';

export default function AvatarInitials({ name, color, size = 36 }) {
    // Get up to 2 initials
    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ').filter(Boolean);
        if (parts.length === 0) return '??';
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const initials = getInitials(name);

    return (
        <div 
            className="rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm"
            style={{ 
                backgroundColor: color || '#9CA3AF', 
                width: size, 
                height: size, 
                fontSize: size * 0.4 
            }}
            title={name}
        >
            {initials}
        </div>
    );
}
