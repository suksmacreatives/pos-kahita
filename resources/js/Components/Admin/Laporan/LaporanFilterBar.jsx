import React, { useState, useEffect } from 'react';
import { Calendar, Store, Clock, ChevronDown } from 'lucide-react';
import { format, subDays, startOfMonth, subMonths, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { OUTLETS } from '../../../data/laporanData';

const PERIODE_CEPAT = [
    { label: 'Hari ini', getValue: () => ({ dari: new Date(), sampai: new Date() }) },
    { label: 'Kemarin', getValue: () => ({ dari: subDays(new Date(), 1), sampai: subDays(new Date(), 1) }) },
    { label: '7 hari terakhir', getValue: () => ({ dari: subDays(new Date(), 6), sampai: new Date() }) },
    { label: '30 hari terakhir', getValue: () => ({ dari: subDays(new Date(), 29), sampai: new Date() }) },
    { label: 'Bulan ini', getValue: () => ({ dari: startOfMonth(new Date()), sampai: new Date() }) },
    { label: 'Bulan lalu', getValue: () => ({ 
        dari: startOfMonth(subMonths(new Date(), 1)), 
        sampai: subDays(startOfMonth(new Date()), 1) 
    }) }
];

export default function LaporanFilterBar({ 
    dateRange, 
    setDateRange, 
    periodeLabel, 
    setPeriodeLabel,
    outletFilter,
    setOutletFilter,
    ringkasanStats // { jumlah_transaksi, total_pendapatan }
}) {
    const [isPeriodeOpen, setIsPeriodeOpen] = useState(false);

    // Auto-detect "Custom" period if manual date picked
    useEffect(() => {
        if (periodeLabel !== 'Custom') {
            const activePeriod = PERIODE_CEPAT.find(p => p.label === periodeLabel);
            if (activePeriod) {
                const dates = activePeriod.getValue();
                if (!isSameDay(dates.dari, dateRange.dari) || !isSameDay(dates.sampai, dateRange.sampai)) {
                    setPeriodeLabel('Custom');
                }
            }
        }
    }, [dateRange.dari, dateRange.sampai]);

    const handleSelectPeriode = (periode) => {
        setPeriodeLabel(periode.label);
        setDateRange(periode.getValue());
        setIsPeriodeOpen(false);
    };

    const formatDateInput = (date) => {
        if (!date) return '';
        return format(date, 'yyyy-MM-dd');
    };

    const handleDateChange = (type, value) => {
        if (!value) return;
        const newDate = new Date(value);
        setPeriodeLabel('Custom');
        setDateRange(prev => ({
            ...prev,
            [type]: newDate
        }));
    };

    return (
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left Side: Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Dari Tanggal */}
                    <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                        <Calendar size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600">Dari:</span>
                        <input 
                            type="date"
                            value={formatDateInput(dateRange.dari)}
                            onChange={(e) => handleDateChange('dari', e.target.value)}
                            className="bg-transparent border-none text-sm font-medium focus:ring-0 p-0 text-gray-900"
                        />
                    </div>

                    {/* Sampai Tanggal */}
                    <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                        <Calendar size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600">Smp:</span>
                        <input 
                            type="date"
                            value={formatDateInput(dateRange.sampai)}
                            onChange={(e) => handleDateChange('sampai', e.target.value)}
                            min={formatDateInput(dateRange.dari)}
                            className="bg-transparent border-none text-sm font-medium focus:ring-0 p-0 text-gray-900"
                        />
                    </div>

                    {/* Periode Cepat Dropdown */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsPeriodeOpen(!isPeriodeOpen)}
                            className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                            <Clock size={16} className="text-emerald-500" />
                            <span className="font-medium text-sm">{periodeLabel}</span>
                            <ChevronDown size={16} className={`transition-transform ${isPeriodeOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isPeriodeOpen && (
                            <div className="absolute top-full mt-2 left-0 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                                {PERIODE_CEPAT.map((p, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelectPeriode(p)}
                                        className={`w-full text-left px-4 py-2.5 text-sm ${periodeLabel === p.label ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                                <div className="border-t border-gray-100 my-1"></div>
                                <button
                                    disabled
                                    className={`w-full text-left px-4 py-2 text-sm ${periodeLabel === 'Custom' ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-400'}`}
                                >
                                    Custom Range
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Outlet Filter */}
                    <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 h-[38px]">
                        <Store size={16} className="text-blue-500" />
                        <select
                            value={outletFilter}
                            onChange={(e) => setOutletFilter(e.target.value)}
                            className="bg-transparent border-none text-sm font-medium focus:ring-0 p-0 text-gray-900 pr-8"
                        >
                            <option value="Semua Outlet">Semua Outlet</option>
                            {OUTLETS.map(outlet => (
                                <option key={outlet} value={outlet}>
                                    {outlet.charAt(0).toUpperCase() + outlet.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Info Summary Bar */}
            <div className="bg-gray-50/80 px-4 py-2 text-sm text-gray-600 flex items-center justify-between border-t border-gray-100">
                <div>
                    Menampilkan data <span className="font-semibold text-gray-900">{periodeLabel !== 'Custom' ? periodeLabel : 'Custom Range'}</span> · <span className="font-semibold text-gray-900">{outletFilter}</span>
                </div>
                <div className="font-medium">
                    <span className="text-blue-600">{ringkasanStats.jumlah_transaksi}</span> transaksi · Total <span className="text-emerald-600">Rp {ringkasanStats.total_pendapatan.toLocaleString('id-ID')}</span>
                </div>
            </div>
        </div>
    );
}
