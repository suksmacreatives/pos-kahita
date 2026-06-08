import React, { useState, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

import ReportsFilterBar from '@/Components/Admin/Reports/ReportsFilterBar';
import ExportButton from '@/Components/Admin/Reports/ExportButton';
import ReportSkeleton from '@/Components/Admin/Reports/Shared/ReportSkeleton';

import RingkasanOmset from '@/Components/Admin/Reports/Penjualan/RingkasanOmset';
import LaporanPerOutlet from '@/Components/Admin/Reports/Penjualan/LaporanPerOutlet';
import LaporanMetodeBayar from '@/Components/Admin/Reports/Penjualan/LaporanMetodeBayar';
import LaporanVoidRefund from '@/Components/Admin/Reports/Penjualan/LaporanVoidRefund';

import ProdukTerlaris from '@/Components/Admin/Reports/Produk/ProdukTerlaris';
import ProdukTidakLaku from '@/Components/Admin/Reports/Produk/ProdukTidakLaku';
import AnalisisKategori from '@/Components/Admin/Reports/Produk/AnalisisKategori';
import AnalisisVarian from '@/Components/Admin/Reports/Produk/AnalisisVarian';

import MutasiStok from '@/Components/Admin/Reports/Inventori/MutasiStok';
import NilaiInventori from '@/Components/Admin/Reports/Inventori/NilaiInventori';
import StokMenipisReport from '@/Components/Admin/Reports/Inventori/StokMenipisReport';
import HasilOpname from '@/Components/Admin/Reports/Inventori/HasilOpname';

import PerformaKasir from '@/Components/Admin/Reports/Kasir/PerformaKasir';
import LaporanShift from '@/Components/Admin/Reports/Kasir/LaporanShift';
import VoidRateKasir from '@/Components/Admin/Reports/Kasir/VoidRateKasir';

import LabaRugi from '@/Components/Admin/Reports/Keuangan/LabaRugi';
import HppMargin from '@/Components/Admin/Reports/Keuangan/HppMargin';
import AnalisisDiskon from '@/Components/Admin/Reports/Keuangan/AnalisisDiskon';

const KATEGORI_DEFAULT = 'penjualan';
const SUB_DEFAULT = 'ringkasan-omset';

function ReportsContent({ kategori, sub, data, filters, isLoading }) {
  if (isLoading) {
    return <ReportSkeleton />;
  }

  switch (kategori) {
    case 'penjualan':
      switch (sub) {
        case 'ringkasan-omset':
          return <RingkasanOmset ringkasan={data?.ringkasan} omset_harian={data?.omset_harian} />;
        case 'per-outlet':
          return <LaporanPerOutlet per_outlet={data?.per_outlet} omset_perbandingan={data?.omset_perbandingan} />;
        case 'metode-bayar':
          return <LaporanMetodeBayar metode_bayar={data?.metode_bayar} />;
        case 'void-refund':
          return <LaporanVoidRefund void_list={data?.void_list} refund_list={data?.refund_list} />;
        default:
          return <RingkasanOmset ringkasan={data?.ringkasan} omset_harian={data?.omset_harian} />;
      }

    case 'produk':
      switch (sub) {
        case 'produk-terlaris':
          return <ProdukTerlaris top_products={data?.top_products} per_kategori={data?.per_kategori} />;
        case 'produk-tidak-laku':
          return <ProdukTidakLaku slow_moving={data?.slow_moving} dead_stock={data?.dead_stock} />;
        case 'analisis-kategori':
          return <AnalisisKategori kategori_stats={data?.kategori_stats} />;
        case 'analisis-varian':
          return <AnalisisVarian varian_stats={data?.varian_stats} />;
        default:
          return <ProdukTerlaris top_products={data?.top_products} per_kategori={data?.per_kategori} />;
      }

    case 'inventori':
      switch (sub) {
        case 'mutasi-stok':
          return <MutasiStok mutasi_log={data?.mutasi_log} mutasi_summary={data?.mutasi_summary} />;
        case 'nilai-inventori':
          return <NilaiInventori nilai_per_lokasi={data?.nilai_per_lokasi} nilai_per_kategori={data?.nilai_per_kategori} />;
        case 'stok-menipis':
          return <StokMenipisReport stok_menipis={data?.stok_menipis} stok_habis={data?.stok_habis} />;
        case 'hasil-opname':
          return <HasilOpname opname_sessions={data?.opname_sessions} />;
        default:
          return <MutasiStok mutasi_log={data?.mutasi_log} mutasi_summary={data?.mutasi_summary} />;
      }

    case 'kasir':
      switch (sub) {
        case 'performa-kasir':
          return <PerformaKasir kasir_stats={data?.kasir_stats} />;
        case 'laporan-shift':
          return <LaporanShift shift_stats={data?.shift_stats} />;
        case 'void-rate-kasir':
          return <VoidRateKasir void_stats={data?.void_stats} />;
        default:
          return <PerformaKasir kasir_stats={data?.kasir_stats} />;
      }

    case 'keuangan':
      switch (sub) {
        case 'laba-rugi':
          return <LabaRugi laba_rugi={data?.laba_rugi} />;
        case 'hpp-margin':
          return <HppMargin hpp_stats={data?.hpp_stats} margin_per_produk={data?.margin_per_produk} />;
        case 'analisis-diskon':
          return <AnalisisDiskon diskon_stats={data?.diskon_stats} promo_performance={data?.promo_performance} />;
        default:
          return <LabaRugi laba_rugi={data?.laba_rugi} />;
      }

    default:
      return <RingkasanOmset ringkasan={data?.ringkasan} omset_harian={data?.omset_harian} />;
  }
}

export default function Reports() {
  const { kategori, sub, data, filters, outlet_list } = usePage().props;

  const activeKategori = kategori || KATEGORI_DEFAULT;
  const activeSub = sub || SUB_DEFAULT;
  const [isLoading, setIsLoading] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(filters || {});

  const handleFilterChange = useCallback(
    (newFilters) => {
      setCurrentFilters(newFilters);
      setIsLoading(true);
      router.get(
      route('admin.reports.index'),
      { kategori: activeKategori, sub: activeSub, ...newFilters },
        {
          preserveState: true,
          preserveScroll: true,
          replace: true,
          onFinish: () => setIsLoading(false),
        }
      );
    },
    [activeKategori, activeSub]
  );

  const categoryLabel = {
    penjualan: 'Penjualan',
    produk: 'Produk',
    inventori: 'Inventori',
    kasir: 'Kasir',
    keuangan: 'Keuangan',
  }[activeKategori] || 'Penjualan';

  const subLabel = {
    'ringkasan-omset': 'Ringkasan Omset',
    'per-outlet': 'Per Outlet',
    'metode-bayar': 'Metode Pembayaran',
    'void-refund': 'Void & Refund',
    'produk-terlaris': 'Produk Terlaris',
    'produk-tidak-laku': 'Produk Tidak Laku',
    'analisis-kategori': 'Analisis Kategori',
    'analisis-varian': 'Analisis Varian',
    'mutasi-stok': 'Mutasi Stok',
    'nilai-inventori': 'Nilai Inventori',
    'stok-menipis': 'Stok Menipis',
    'hasil-opname': 'Hasil Opname',
    'performa-kasir': 'Performa Kasir',
    'laporan-shift': 'Laporan Shift',
    'void-rate-kasir': 'Void Rate Kasir',
    'laba-rugi': 'Laba Rugi',
    'hpp-margin': 'HPP & Margin',
    'analisis-diskon': 'Analisis Diskon',
  }[activeSub] || 'Ringkasan Omset';

  return (
    <div className="min-h-screen">
      <Head title={`${subLabel} - Laporan ${categoryLabel} - Kahita Busana`} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-sm text-gray-500 mb-1">
            Dashboard <span className="mx-2">›</span> Laporan{' '}
            <span className="mx-2">›</span>{' '}
            <span className="text-gray-900 font-medium">{categoryLabel}</span>
            <span className="mx-2">›</span>{' '}
            <span className="text-gray-900 font-medium">{subLabel}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan {categoryLabel}</h1>
          <p className="text-sm text-gray-500 mt-1">Kahita Busana — {subLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton kategori={activeKategori} sub={activeSub} filters={currentFilters} />
        </div>
      </div>

      <ReportsFilterBar
        filters={{ ...currentFilters, dari: filters?.dari, sampai: filters?.sampai }}
        onFilterChange={handleFilterChange}
        outletList={outlet_list || []}
        isLoading={isLoading}
      />

      <div className="mt-6">
        <ReportsContent
          kategori={activeKategori}
          sub={activeSub}
          data={data || {}}
          filters={currentFilters}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

Reports.layout = (page) => <AdminLayout>{page}</AdminLayout>;
