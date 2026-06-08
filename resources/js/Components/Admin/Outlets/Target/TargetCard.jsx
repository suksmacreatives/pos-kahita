import React from 'react';
import OutletBadge from '../Shared/OutletBadge';
import ProgressBar from '../Shared/ProgressBar';
import { Edit3 } from 'lucide-react';

export default function TargetCard({ target, outlets = [] }) {
    if (!target) return null;

    const formatRupiah = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

    const outlet = outlets.find(o => String(o.id) === String(target.outlet_id)) || { nama: target.outlet_nama || `Outlet #${target.outlet_id}`, warna: 'emerald', warna_hex: '#10B981' };

    const statusConfig = {
        achieved: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: '✓ Achieved' },
        on_track: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'On Track' },
        at_risk: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: '⚠ At Risk' },
        behind: { bg: 'bg-red-50 text-red-700 border-red-200', label: 'Behind' },
    };

    const cfg = statusConfig[target.status] || statusConfig.on_track;

    return (
        <div 
            className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden flex flex-col border-l-4"
            style={{ borderLeftColor: outlet.warna_hex || '#10B981' }}
        >
            <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                <OutletBadge outlet={outlet} showDot={true} />
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${cfg.bg}`}>
                    {cfg.label}
                </span>
            </div>

            <div className="p-5 flex-1 flex flex-col gap-6">
                <div className="space-y-1.5">
                    <ProgressBar 
                        label="Target Omset"
                        sublabel={`${formatRupiah(target.realisasi_omset || 0)} / ${formatRupiah(target.target_omset || 0)}`}
                        value={target.persen_omset || 0}
                        status={target.status}
                    />
                </div>

                <div className="space-y-1.5 pt-4 border-t border-gray-50">
                    <ProgressBar 
                        label="Target Transaksi"
                        sublabel={`${target.realisasi_transaksi || 0} / ${target.target_transaksi || 0} trx`}
                        value={target.persen_transaksi || 0}
                        status={target.status}
                    />
                </div>
            </div>

            <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                <button className="w-full flex justify-center items-center gap-1.5 py-2 px-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-gray-700 transition-colors shadow-sm">
                    <Edit3 className="w-3.5 h-3.5" /> Edit Target
                </button>
            </div>
        </div>
    );
}
