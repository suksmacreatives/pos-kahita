<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Carbon\Carbon;

class ReportExport implements FromArray, WithHeadings, WithStyles, WithTitle
{
    protected array $data;
    protected string $kategori;
    protected string $sub;
    protected Carbon $dari;
    protected Carbon $sampai;

    public function __construct(array $data, string $kategori, string $sub, Carbon $dari, Carbon $sampai)
    {
        $this->data     = $data;
        $this->kategori = $kategori;
        $this->sub      = $sub;
        $this->dari     = $dari;
        $this->sampai   = $sampai;
    }

    public function array(): array
    {
        $rows = [];

        match ($this->kategori) {
            'penjualan' => $this->buildPenjualanRows($rows),
            'produk'    => $this->buildProdukRows($rows),
            'inventori' => $this->buildInventoriRows($rows),
            'kasir'     => $this->buildKasirRows($rows),
            'keuangan'  => $this->buildKeuanganRows($rows),
            default     => $rows,
        };

        return $rows;
    }

    public function headings(): array
    {
        return match ($this->kategori) {
            'penjualan' => ['Tanggal', 'Transaksi', 'Omset', 'Diskon', 'Total'],
            'produk'    => ['Rank', 'Produk', 'Kategori', 'Terjual', 'Revenue'],
            'inventori' => ['Waktu', 'Tipe', 'Produk', 'Qty', 'Referensi'],
            'kasir'     => ['Kasir', 'Outlet', 'Transaksi', 'Omset', 'Void Rate'],
            'keuangan'  => ['Komponen', 'Nilai'],
            default     => ['Data'],
        };
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']], 'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '10B981']]],
        ];
    }

    public function title(): string
    {
        return match ($this->kategori) {
            'penjualan' => 'Laporan Penjualan',
            'produk'    => 'Laporan Produk',
            'inventori' => 'Laporan Inventori',
            'kasir'     => 'Laporan Kasir',
            'keuangan'  => 'Laporan Keuangan',
            default     => 'Laporan',
        };
    }

    protected function buildPenjualanRows(array &$rows): void
    {
        $harian = $this->data['omset_harian'] ?? [];
        foreach ($harian as $h) {
            $rows[] = [
                $h['tanggal'] ?? '',
                $h['transaksi'] ?? 0,
                $h['omset'] ?? 0,
                $h['diskon'] ?? 0,
                ($h['omset'] ?? 0) - ($h['diskon'] ?? 0),
            ];
        }
    }

    protected function buildProdukRows(array &$rows): void
    {
        $produk = $this->data['top_products'] ?? [];
        foreach ($produk as $i => $p) {
            $rows[] = [
                $i + 1,
                $p['nama'] ?? $p['produk'] ?? '-',
                $p['kategori'] ?? '-',
                $p['terjual'] ?? $p['qty'] ?? 0,
                $p['revenue'] ?? $p['omset'] ?? 0,
            ];
        }
    }

    protected function buildInventoriRows(array &$rows): void
    {
        $mutasi = $this->data['mutasi_log'] ?? [];
        foreach ($mutasi as $m) {
            $rows[] = [
                $m['tanggal'] ?? $m['created_at'] ?? '',
                $m['tipe'] ?? $m['type'] ?? '',
                $m['nama_produk'] ?? $m['produk'] ?? '-',
                $m['qty'] ?? 0,
                $m['referensi'] ?? $m['ref'] ?? '-',
            ];
        }
    }

    protected function buildKasirRows(array &$rows): void
    {
        $kasir = $this->data['kasir_stats'] ?? [];
        foreach ($kasir as $k) {
            $rows[] = [
                $k['nama'] ?? $k['kasir'] ?? '-',
                $k['outlet'] ?? '-',
                $k['transaksi'] ?? 0,
                $k['omset'] ?? 0,
                $k['void_rate'] ?? 0,
            ];
        }
    }

    protected function buildKeuanganRows(array &$rows): void
    {
        $lr = $this->data['laba_rugi'] ?? [];
        $rows[] = ['Penjualan Bruto', $lr['penjualan_bruto'] ?? 0];
        $rows[] = ['Diskon', '-' . ($lr['diskon'] ?? 0)];
        $rows[] = ['Penjualan Bersih', $lr['penjualan_bersih'] ?? 0];
        $rows[] = ['Total HPP', '-' . ($lr['total_hpp'] ?? 0)];
        $rows[] = ['Laba Kotor', $lr['laba_kotor'] ?? 0];
        $rows[] = ['Nilai Void', '-' . ($lr['nilai_void'] ?? 0)];
        $rows[] = ['Nilai Refund', '-' . ($lr['nilai_refund'] ?? 0)];
        $rows[] = ['Laba Bersih', $lr['laba_bersih'] ?? 0];
    }
}
