import React from 'react';

export default function ProgressBar({ value = 0, status = 'on_track', label, sublabel }) {
    const percentage = Math.min(Math.max(value, 0), 100);
    
    // Status color mapping
    const colors = {
        achieved: 'bg-emerald-500',
        on_track: 'bg-blue-500',
        at_risk: 'bg-amber-500',
        behind: 'bg-red-500',
    };

    const textColors = {
        achieved: 'text-emerald-700',
        on_track: 'text-blue-700',
        at_risk: 'text-amber-700',
        behind: 'text-red-700',
    };

    const statusIcons = {
        achieved: '✓ Achieved',
        on_track: 'On Track',
        at_risk: '⚠ At Risk',
        behind: 'Behind',
    };

    const barColor = colors[status] || colors.on_track;
    const textColor = textColors[status] || textColors.on_track;
    const statusText = statusIcons[status] || 'On Track';

    return (
        <div className="space-y-1.5 w-full">
            {(label || sublabel) && (
                <div className="flex justify-between items-end">
                    <span className="text-[11px] font-bold text-gray-700">{label}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{sublabel}</span>
                </div>
            )}
            
            <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <div className={`text-[10px] font-bold min-w-[80px] text-right ${textColor}`}>
                    {value}% — {statusText}
                </div>
            </div>
        </div>
    );
}
