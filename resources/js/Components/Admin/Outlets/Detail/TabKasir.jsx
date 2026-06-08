import React, { useState } from 'react';
import KasirTable from "@/Components/Admin/Outlets/Kasir/KasirTable";
import ShiftTable from "@/Components/Admin/Outlets/Kasir/ShiftTable";
import KasirFormModal from "@/Components/Admin/Outlets/Kasir/KasirFormModal";
import KasirDetailDrawer from "@/Components/Admin/Outlets/Kasir/KasirDetailDrawer";
import ShiftFormModal from "@/Components/Admin/Outlets/Kasir/ShiftFormModal";
import { Plus, Users } from 'lucide-react';

export default function TabKasir({ outlet, kasirs = [], shifts = [] }) {
    if (!outlet) return null;

    const [isKasirModalOpen, setKasirModalOpen] = useState(false);
    const [isShiftModalOpen, setShiftModalOpen] = useState(false);
    const [selectedKasir, setSelectedKasir] = useState(null);

    const outletKasirs = kasirs.filter(k => k.outlet_id == outlet.id);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-extrabold text-gray-900">Kasir & Staff</h2>
                        <p className="text-xs text-gray-500 font-medium">{outletKasirs.length} Kasir terdaftar di {outlet.nama}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setKasirModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow"
                    >
                        <Plus className="w-4 h-4" /> Tambah Kasir
                    </button>
                </div>
            </div>

            <KasirTable 
                kasirs={outletKasirs}
                outletId={outlet.id} 
                onOpenDetail={(kasir) => setSelectedKasir(kasir)} 
                onEditKasir={() => setKasirModalOpen(true)} 
            />

            <div className="pt-4">
                <ShiftTable 
                    mode="outlet" 
                    outletId={outlet.id}
                    kasirs={outletKasirs}
                    shifts={shifts}
                    outlets={[outlet]}
                    onEditShift={() => setShiftModalOpen(true)}
                />
            </div>

            <KasirFormModal 
                isOpen={isKasirModalOpen} 
                onClose={() => setKasirModalOpen(false)} 
                kasir={null}
                outlets={[outlet]}
            />

            <ShiftFormModal 
                isOpen={isShiftModalOpen} 
                onClose={() => setShiftModalOpen(false)}
                outletId={outlet.id}
                kasirs={outletKasirs}
            />

            <KasirDetailDrawer 
                isOpen={!!selectedKasir} 
                onClose={() => setSelectedKasir(null)} 
                kasir={selectedKasir} 
            />

        </div>
    );
}
