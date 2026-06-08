import React from 'react';
import { Map, MapPin } from 'lucide-react';

export default function OutletMapPlaceholder({ outlets = [] }) {
    const getPosition = (outlet, index) => {
        if (outlet.latitude && outlet.longitude) {
            return { left: `${((outlet.longitude + 180) / 360) * 70 + 15}%`, top: `${((90 - outlet.latitude) / 180) * 60 + 20}%` };
        }
        const presets = [
            { left: '85%', top: '75%' },
            { left: '70%', top: '60%' },
            { left: '40%', top: '65%' },
            { left: '30%', top: '55%' },
            { left: '55%', top: '45%' },
            { left: '20%', top: '70%' },
            { left: '75%', top: '40%' },
            { left: '45%', top: '80%' },
        ];
        return presets[index % presets.length] || { left: '50%', top: '50%' };
    };

    return (
        <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl h-[200px] relative overflow-hidden shadow-sm border border-slate-200 flex items-center justify-center">
            
            <Map className="w-48 h-48 text-slate-300 absolute opacity-30" />
            
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.5 }}></div>

            {outlets.map((outlet, index) => {
                const pos = getPosition(outlet, index);
                
                return (
                    <div 
                        key={outlet.id}
                        className="absolute flex flex-col items-center group cursor-pointer"
                        style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)' }}
                    >
                        {outlet.status === 'aktif' && (
                            <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: outlet.warna_hex || '#10B981' }}></div>
                        )}
                        
                        <div 
                            className="w-4 h-4 rounded-full relative z-10 shadow-md border-2 border-white"
                            style={{ backgroundColor: outlet.warna_hex || '#10B981' }}
                        />

                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                            <div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg flex flex-col items-center font-medium">
                                <span>{outlet.nama}</span>
                                <div className="absolute top-full w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-900"></div>
                            </div>
                        </div>
                    </div>
                );
            })}

            <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md text-[9px] text-gray-500 font-medium flex items-center gap-1 shadow-sm">
                <MapPin className="w-3 h-3" /> Peta simulasi lokasi
            </div>
        </div>
    );
}
