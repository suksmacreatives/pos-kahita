import React, { useState, useEffect } from 'react';
import { X, Save, TrendingUp, ShoppingBag } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function TargetFormModal({ isOpen, onClose, outlets = [] }) {
    if (!isOpen) return null;

    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState(outlets.length > 0 ? outlets[0].id : null);

    const [formData, setFormData] = useState({});

    useEffect(() => {
        const initial = {};
        outlets.forEach(o => {
            initial[o.id] = {
                target_omset: '',
                target_transaksi: ''
            };
        });
        setFormData(initial);
        if (outlets.length > 0) setActiveTab(outlets[0].id);
    }, [isOpen, outlets]);

    const handleTabChange = (id) => {
        setActiveTab(id);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [activeTab]: {
                ...formData[activeTab],
                [e.target.name]: e.target.value
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        const targets = Object.entries(formData).map(([outlet_id, data]) => ({
            outlet_id,
            bulan: new Date().getMonth() + 1,
            tahun: new Date().getFullYear(),
            target_omset: Number(data.target_omset) || 0,
            target_transaksi: Number(data.target_transaksi) || 0,
        }));
        router.post(route('admin.outlets.target.store'), { targets }, {
            onFinish: () => { setIsSaving(false); onClose(); },
            onError: () => setIsSaving(false),
        });
    };

    const activeData = formData[activeTab] || {};
    const daysInMonth = 31;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-extrabold text-gray-900">
                        Set Target Bulanan — {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row h-[400px]">
                    {/* Tabs (Left on Desktop, Top on Mobile) */}
                    <div className="w-full md:w-48 bg-slate-50 border-r border-gray-100 flex md:flex-col overflow-x-auto shrink-0">
                        {outlets.map(out => (
                            <button
                                key={out.id}
                                type="button"
                                onClick={() => handleTabChange(out.id)}
                                className={`px-4 py-3 text-left text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
                                    activeTab === out.id 
                                        ? 'bg-white text-gray-900 border-l-4' 
                                        : 'text-gray-500 hover:bg-slate-100 border-l-4 border-transparent'
                                }`}
                                    style={{ borderLeftColor: activeTab === out.id ? (out.warna_hex || '#10B981') : 'transparent' }}
                                >
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: out.warna_hex || '#10B981' }} />
                                    {out.nama || out.name}
                            </button>
                        ))}
                    </div>

                    {/* Form Area */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        <form id="target-form" onSubmit={handleSubmit} className="space-y-6">
                            
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Target Omset (Rp)
                                </h4>
                                <input
                                    type="number"
                                    name="target_omset"
                                    value={activeData.target_omset}
                                    onChange={handleChange}
                                    placeholder="Contoh: 150000000"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold"
                                />
                                {activeData.target_omset && (
                                    <div className="mt-2 text-[10px] text-gray-500 bg-slate-50 p-2 rounded-lg border border-gray-100 flex justify-between">
                                        <span>Rata-rata omset harian diperlukan:</span>
                                        <span className="font-bold text-emerald-700">Rp {Math.round(activeData.target_omset / daysInMonth).toLocaleString('id-ID')} / hari</span>
                                    </div>
                                )}
                            </div>

                            <hr className="border-gray-100" />

                            <div>
                                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                                    <ShoppingBag className="w-4 h-4 text-blue-500" /> Target Transaksi
                                </h4>
                                <input
                                    type="number"
                                    name="target_transaksi"
                                    value={activeData.target_transaksi}
                                    onChange={handleChange}
                                    placeholder="Contoh: 1000"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold"
                                />
                                {activeData.target_transaksi && (
                                    <div className="mt-2 text-[10px] text-gray-500 bg-slate-50 p-2 rounded-lg border border-gray-100 flex justify-between">
                                        <span>Rata-rata transaksi harian diperlukan:</span>
                                        <span className="font-bold text-blue-700">{Math.round(activeData.target_transaksi / daysInMonth)} trx / hari</span>
                                    </div>
                                )}
                            </div>

                        </form>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-white transition-colors shadow-sm"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="target-form"
                        disabled={isSaving}
                        className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                    >
                        {isSaving ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" /> Simpan Semua Target
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
