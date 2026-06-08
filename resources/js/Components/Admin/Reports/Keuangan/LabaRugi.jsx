import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

export default function LabaRugi({ laba_rugi }) {
  const d = laba_rugi || {};

  const formatRupiah = (val) => {
    if (val == null) return 'Rp 0';
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  const penjualanBruto = d.penjualan_bruto || d.penjualan || 0;
  const diskon = d.diskon || 0;
  const penjualanBersih = d.penjualan_bersih || (penjualanBruto - diskon);
  const hpp = d.total_hpp || d.hpp || 0;
  const labaKotor = d.laba_kotor || (penjualanBersih - hpp);
  const marginKotor = penjualanBersih > 0 ? ((labaKotor / penjualanBersih) * 100).toFixed(1) : '0.0';
  const nilaiVoid = d.nilai_void || d.void || 0;
  const nilaiRefund = d.nilai_refund || d.refund || 0;
  const labaBersih = d.laba_bersih || (labaKotor - nilaiVoid - nilaiRefund);
  const marginBersih = penjualanBersih > 0 ? ((labaBersih / penjualanBersih) * 100).toFixed(1) : '0.0';

  const showTrend = d.trend || {};

  const Line = ({ label, value, type = 'normal', trend }) => (
    <div
      className={`flex items-center justify-between py-3 px-4 rounded-xl cursor-pointer transition-colors ${
        type === 'header' ? 'bg-gray-50 font-bold mt-4' :
        type === 'result' ? 'bg-emerald-50 font-bold border border-emerald-100' :
        type === 'deduction' ? 'text-red-600' :
        'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm">{label}</span>
        {trend != null && (
          <span className={`flex items-center text-[10px] font-medium ${
            trend >= 0 ? 'text-emerald-500' : 'text-red-500'
          }`}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${type === 'deduction' ? 'text-red-600' : 'text-gray-900'}`}>
          {type === 'deduction' ? '-' : ''}{formatRupiah(value)}
        </span>
        {type === 'normal' && (
          <Info size={14} className="text-gray-300 hover:text-gray-500 cursor-help" />
        )}
      </div>
    </div>
  );

  const Section = ({ title, children }) => (
    <div className="mb-2">
      <div className="px-4 py-2">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</h4>
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-xl font-bold text-gray-900">Laporan Laba Rugi</h3>
          <p className="text-sm text-gray-500 mt-1">Kahita Busana — Income Statement Summary</p>
        </div>

        <div className="p-4">
          <Section title="PENDAPATAN">
            <Line label="Penjualan Bruto" value={penjualanBruto} trend={showTrend.penjualan_bruto} />
            <Line label="Diskon" value={diskon} type="deduction" trend={showTrend.diskon} />
            <div className="border-t border-gray-200 my-1" />
            <Line label="Penjualan Bersih" value={penjualanBersih} type="result" />
          </Section>

          <Section title="HARGA POKOK PENJUALAN">
            <Line label="Total HPP" value={hpp} type="deduction" trend={showTrend.hpp} />
            <div className="border-t border-gray-200 my-1" />
            <Line label="LABA KOTOR" value={labaKotor} type="result" />
            <div className="px-4 py-1">
              <span className="text-xs text-gray-500">Margin: </span>
              <span className={`text-xs font-bold ${marginKotor >= 30 ? 'text-emerald-600' : marginKotor >= 20 ? 'text-amber-500' : 'text-red-500'}`}>
                {marginKotor}%
              </span>
            </div>
          </Section>

          <Section title="PENGURANG">
            <Line label="Nilai Void" value={nilaiVoid} type="deduction" trend={showTrend.nilai_void} />
            <Line label="Nilai Refund" value={nilaiRefund} type="deduction" trend={showTrend.nilai_refund} />
            <div className="border-t border-gray-200 my-1" />
            <Line label="LABA BERSIH" value={labaBersih} type="result" />
            <div className="px-4 py-1">
              <span className="text-xs text-gray-500">Margin Bersih: </span>
              <span className={`text-xs font-bold ${marginBersih >= 20 ? 'text-emerald-600' : marginBersih >= 10 ? 'text-amber-500' : 'text-red-500'}`}>
                {marginBersih}%
              </span>
            </div>
          </Section>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase">Margin Kotor</p>
          <p className={`text-3xl font-bold mt-2 ${marginKotor >= 30 ? 'text-emerald-600' : marginKotor >= 20 ? 'text-amber-500' : 'text-red-500'}`}>
            {marginKotor}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Laba Kotor / Penjualan Bersih</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase">Margin Bersih</p>
          <p className={`text-3xl font-bold mt-2 ${marginBersih >= 20 ? 'text-emerald-600' : marginBersih >= 10 ? 'text-amber-500' : 'text-red-500'}`}>
            {marginBersih}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Laba Bersih / Penjualan Bersih</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase">Beban Operasional</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{formatRupiah(d.beban_operasional || d.operasional || 0)}</p>
          <p className="text-xs text-gray-500 mt-1">Biaya operasional periode ini</p>
        </div>
      </div>
    </div>
  );
}
