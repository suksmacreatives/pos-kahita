import React, { useState } from 'react';
import { Calendar, Store, Clock, ChevronDown } from 'lucide-react';
import { format, subDays, startOfMonth, subMonths, startOfYear, subYears, startOfQuarter } from 'date-fns';
import { id } from 'date-fns/locale';

const PERIODE_CEPAT = [
  { label: 'Hari ini', getValue: () => ({ dari: new Date(), sampai: new Date() }) },
  { label: 'Kemarin', getValue: () => ({ dari: subDays(new Date(), 1), sampai: subDays(new Date(), 1) }) },
  { label: '7 hari terakhir', getValue: () => ({ dari: subDays(new Date(), 6), sampai: new Date() }) },
  { label: '30 hari terakhir', getValue: () => ({ dari: subDays(new Date(), 29), sampai: new Date() }) },
  { label: 'Bulan ini', getValue: () => ({ dari: startOfMonth(new Date()), sampai: new Date() }) },
  { label: 'Bulan lalu', getValue: () => ({ dari: startOfMonth(subMonths(new Date(), 1)), sampai: subDays(startOfMonth(new Date()), 1) }) },
  { label: 'Kuartal ini', getValue: () => ({ dari: startOfQuarter(new Date()), sampai: new Date() }) },
  { label: 'Tahun ini', getValue: () => ({ dari: startOfYear(new Date()), sampai: new Date() }) },
];

const BANDINGKAN = [
  { label: 'Tidak dibandingkan', value: 'none' },
  { label: 'Periode sebelumnya', value: 'prev_period' },
  { label: 'Bulan lalu', value: 'last_month' },
  { label: 'Tahun lalu', value: 'last_year' },
];

const PERBANDINGAN_LABEL = {
  none: '',
  prev_period: 'vs Periode Sebelumnya',
  last_month: 'vs Bulan Lalu',
  last_year: 'vs Tahun Lalu',
};

export default function ReportsFilterBar({
  filters,
  onFilterChange,
  outletList = [],
  isLoading,
}) {
  const [isPeriodeOpen, setIsPeriodeOpen] = useState(false);
  const [isBandingkanOpen, setIsBandingkanOpen] = useState(false);

  const periodeLabel = filters.periode_label || '7 hari terakhir';
  const dateDari = filters.dari ? new Date(filters.dari) : subDays(new Date(), 6);
  const dateSampai = filters.sampai ? new Date(filters.sampai) : new Date();

  const handlePeriodeCepat = (p) => {
    const { dari, sampai } = p.getValue();
    onFilterChange({
      ...filters,
      dari: format(dari, 'yyyy-MM-dd'),
      sampai: format(sampai, 'yyyy-MM-dd'),
      periode_label: p.label,
    });
    setIsPeriodeOpen(false);
  };

  const handleDateChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value,
      periode_label: 'Custom',
    });
  };

  const handleBandingkan = (value) => {
    onFilterChange({ ...filters, bandingkan: value });
    setIsBandingkanOpen(false);
  };

  const formatDateInput = (date) => format(date, 'yyyy-MM-dd');

  const compareLabel = PERBANDINGAN_LABEL[filters.bandingkan] || '';

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <Calendar size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">Dari:</span>
            <input
              type="date"
              value={formatDateInput(dateDari)}
              onChange={(e) => handleDateChange('dari', e.target.value)}
              className="bg-transparent border-none text-sm font-medium focus:ring-0 p-0 text-gray-900"
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <Calendar size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">Sampai:</span>
            <input
              type="date"
              value={formatDateInput(dateSampai)}
              onChange={(e) => handleDateChange('sampai', e.target.value)}
              min={formatDateInput(dateDari)}
              className="bg-transparent border-none text-sm font-medium focus:ring-0 p-0 text-gray-900"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsPeriodeOpen(!isPeriodeOpen)}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
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
                    onClick={() => handlePeriodeCepat(p)}
                    className={`w-full text-left px-4 py-2.5 text-sm ${
                      periodeLabel === p.label ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
                <div className="border-t border-gray-100 my-1" />
                <button
                  disabled
                  className={`w-full text-left px-4 py-2 text-sm ${
                    periodeLabel === 'Custom' ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-400'
                  }`}
                >
                  Custom Range
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 h-[38px]">
            <Store size={16} className="text-blue-500" />
            <select
              value={filters.outlet || 'all'}
              onChange={(e) => onFilterChange({ ...filters, outlet: e.target.value })}
              className="bg-transparent border-none text-sm font-medium focus:ring-0 p-0 text-gray-900 pr-8"
            >
              <option value="all">Semua Outlet</option>
              {outletList.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsBandingkanOpen(!isBandingkanOpen)}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              <span className="font-medium text-sm">
                {filters.bandingkan && filters.bandingkan !== 'none'
                  ? PERBANDINGAN_LABEL[filters.bandingkan]
                  : 'Bandingkan dengan'}
              </span>
              <ChevronDown size={16} className={`transition-transform ${isBandingkanOpen ? 'rotate-180' : ''}`} />
            </button>
            {isBandingkanOpen && (
              <div className="absolute top-full mt-2 left-0 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                {BANDINGKAN.map((b, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleBandingkan(b.value)}
                    className={`w-full text-left px-4 py-2.5 text-sm ${
                      filters.bandingkan === b.value
                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="bg-gray-50/80 px-4 py-2 text-sm text-gray-600 flex items-center justify-between border-t border-gray-100">
        <div>
          Menampilkan data{' '}
          <span className="font-semibold text-gray-900">
            {format(dateDari, 'dd MMM yyyy', { locale: id })} - {format(dateSampai, 'dd MMM yyyy', { locale: id })}
          </span>{' '}
          ·{' '}
          <span className="font-semibold text-gray-900">
            {filters.outlet === 'all' ? 'Semua Outlet' : outletList.find((o) => o.id == filters.outlet)?.name || filters.outlet}
          </span>
          {compareLabel && (
            <>
              {' '}· <span className="font-semibold text-emerald-600">{compareLabel}</span>
            </>
          )}
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="w-3 h-3 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
            <span className="text-xs font-medium">Memuat...</span>
          </div>
        )}
      </div>
    </div>
  );
}
