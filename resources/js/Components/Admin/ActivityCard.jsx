import React from "react";
import {
    ShoppingBag,
    ArrowUpRight,
    AlertTriangle,
    Cpu,
    Circle,
} from "lucide-react";

export default function ActivityCard({ activities = [] }) {
    // Helpers to assign icons and colors based on activity log type
    const getTypeMeta = (type) => {
        switch (type) {
            case "sale":
                return {
                    icon: ShoppingBag,
                    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
                    dot: "bg-emerald-500",
                };
            case "stock":
                return {
                    icon: ArrowUpRight,
                    color: "text-blue-600 bg-blue-50 border-blue-100",
                    dot: "bg-blue-500",
                };
            case "alert":
                return {
                    icon: AlertTriangle,
                    color: "text-rose-600 bg-rose-50 border-rose-100",
                    dot: "bg-rose-500 animate-pulse",
                };
            case "system":
            default:
                return {
                    icon: Cpu,
                    color: "text-gray-600 bg-gray-50 border-gray-100",
                    dot: "bg-gray-400",
                };
        }
    };

    return (
        <div className="bg-white border border-gray-100/80 rounded-2xl p-5 shadow-sm flex flex-col h-[480px]">
            {" "}
            {/* FIX 1: Set tinggi statis/pasti pada parent card utama */}
            {/* Header */}
            <div className="pb-4 border-b border-gray-50/60 mb-5 shrink-0">
                {" "}
                {/* FIX 2: Tambahkan shrink-0 agar header tidak ikut menyusut */}
                <h5 className="font-bold text-sm text-gray-900 leading-none tracking-tight">
                    Aktivitas Sistem Terbaru
                </h5>
                <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
                    Log tindakan operasional gudang & outlet
                </p>
            </div>
            {/* Timeline List Container */}
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
                {" "}
                {/* FIX 3: Bersihkan max-h bentrok, biarkan flex-1 & overflow mengontrol scroll */}
                {activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                        <Circle className="w-8 h-8 text-gray-200 stroke-1 mb-2.5" />
                        <p className="text-xs text-gray-400 font-medium">
                            Belum ada aktivitas terekam
                        </p>
                    </div>
                ) : (
                    /* FIX 4: Tambahkan ml-2 untuk mengamankan posisi spasi dot penanda agar tidak terpotong garis overflow scroll */
                    <div className="relative ml-2 pl-6 border-l border-gray-100 space-y-5 py-1">
                        {activities.map((act) => {
                            const meta = getTypeMeta(act.type);
                            const IconComp = meta.icon;
                            return (
                                <div key={act.id} className="relative group">
                                    {/* Timeline Indicator Connector Dot */}
                                    <span
                                        className={`absolute -left-[30px] top-1.5 w-2 h-2 rounded-full ring-4 ring-white z-10 ${meta.dot}`}
                                    />

                                    <div className="flex gap-3 items-start">
                                        {/* Compact Icon */}
                                        <div
                                            className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${meta.color}`}
                                        >
                                            <IconComp className="w-4 h-4" />
                                        </div>

                                        {/* Content text */}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs text-gray-800 font-medium leading-relaxed break-words">
                                                {" "}
                                                {/* FIX 5: Tambahkan break-words agar teks panjang bungkus ke bawah */}
                                                {act.action}
                                            </p>

                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-gray-400 font-medium bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                                                    {act.user}
                                                </span>
                                                <span className="text-[10px] text-gray-300 font-semibold">
                                                    &bull;
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                                    {act.time}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
