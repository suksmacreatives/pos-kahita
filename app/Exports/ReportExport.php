<?php

namespace App\Exports;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use Carbon\Carbon;

class ReportExport
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

    public function build(): Spreadsheet
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        match ($this->kategori) {
            'penjualan' => $this->buildPenjualan($sheet),
            'produk'    => $this->buildProduk($sheet),
            'inventori' => $this->buildInventori($sheet),
            'kasir'     => $this->buildKasir($sheet),
            'keuangan'  => $this->buildKeuangan($sheet),
            default     => $sheet->setCellValue('A1', 'Tidak ada data'),
        };

        $sheet->freezePane('A4');
        return $spreadsheet;
    }

    protected function col(int $index): string
    {
        return Coordinate::stringFromColumnIndex($index);
    }

    protected function styleHeader(Worksheet $sheet, int $row, array $headers): void
    {
        $lastCol = $this->col(count($headers));
        $sheet->fromArray($headers, null, "A{$row}", true);
        $sheet->getStyle("A{$row}:{$lastCol}{$row}")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 9],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '10B981']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']]],
        ]);
    }

    protected function writeData(Worksheet $sheet, int &$row, array $rows, int $colCount): void
    {
        if (empty($rows)) return;

        $lastCol = $this->col($colCount);
        $startRow = $row;
        foreach ($rows as $r) {
            $sheet->fromArray($r, null, "A{$row}", true);
            $row++;
        }
        $endRow = $row - 1;
        $sheet->getStyle("A{$startRow}:{$lastCol}{$endRow}")->applyFromArray([
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']]],
        ]);
    }

    protected function applyNumberFmt(Worksheet $sheet, int $startRow, int $endRow, int $colIndex): void
    {
        $cl = $this->col($colIndex);
        $sheet->getStyle("{$cl}{$startRow}:{$cl}{$endRow}")
            ->getNumberFormat()->setFormatCode('#,##0');
        $sheet->getStyle("{$cl}{$startRow}:{$cl}{$endRow}")
            ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
    }

    protected function autoWidth(Worksheet $sheet, int $colCount): void
    {
        for ($c = 1; $c <= $colCount; $c++) {
            $sheet->getColumnDimension($this->col($c))->setAutoSize(true);
        }
    }

    protected function buildPenjualan(Worksheet $sheet): void
    {
        $sheet->setTitle('Penjualan');
        $r = 1;
        $sheet->setCellValue("A{$r}", 'LAPORAN PENJUALAN');
        $sheet->mergeCells("A{$r}:E{$r}");
        $sheet->getStyle("A{$r}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 13, 'color' => ['rgb' => '059669']],
        ]);
        $r += 2;

        $headers = ['Tanggal', 'Transaksi', 'Omset', 'Diskon', 'Total'];
        $this->styleHeader($sheet, $r, $headers);
        $r++;

        $harian = $this->data['omset_harian'] ?? [];
        $rows = [];
        foreach ($harian as $h) {
            $rows[] = [
                $h['tanggal'] ?? '',
                $h['transaksi'] ?? 0,
                $h['omset'] ?? 0,
                $h['diskon'] ?? 0,
                ($h['omset'] ?? 0) - ($h['diskon'] ?? 0),
            ];
        }

        $startRow = $r;
        $this->writeData($sheet, $r, $rows, 5);
        $endRow = $r - 1;

        if ($endRow >= $startRow) {
            foreach ([2, 3, 4, 5] as $ci) {
                $this->applyNumberFmt($sheet, $startRow, $endRow, $ci);
            }
        }

        $this->autoWidth($sheet, 5);
    }

    protected function buildProduk(Worksheet $sheet): void
    {
        $sheet->setTitle('Produk');
        $r = 1;
        $sheet->setCellValue("A{$r}", 'LAPORAN PRODUK');
        $sheet->mergeCells("A{$r}:E{$r}");
        $sheet->getStyle("A{$r}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 13, 'color' => ['rgb' => '059669']],
        ]);
        $r += 2;

        $headers = ['Rank', 'Produk', 'Kategori', 'Terjual', 'Revenue'];
        $this->styleHeader($sheet, $r, $headers);
        $r++;

        $produk = $this->data['top_products'] ?? [];
        $rows = [];
        foreach ($produk as $i => $p) {
            $rows[] = [
                $i + 1,
                $p['nama'] ?? $p['produk'] ?? '-',
                $p['kategori'] ?? '-',
                $p['terjual'] ?? $p['qty'] ?? 0,
                $p['revenue'] ?? $p['omset'] ?? 0,
            ];
        }

        $startRow = $r;
        $this->writeData($sheet, $r, $rows, 5);
        $endRow = $r - 1;

        if ($endRow >= $startRow) {
            foreach ([4, 5] as $ci) {
                $this->applyNumberFmt($sheet, $startRow, $endRow, $ci);
            }
        }

        $this->autoWidth($sheet, 5);
    }

    protected function buildInventori(Worksheet $sheet): void
    {
        $sheet->setTitle('Inventori');
        $r = 1;
        $sheet->setCellValue("A{$r}", 'LAPORAN INVENTORI');
        $sheet->mergeCells("A{$r}:E{$r}");
        $sheet->getStyle("A{$r}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 13, 'color' => ['rgb' => '059669']],
        ]);
        $r += 2;

        $headers = ['Waktu', 'Tipe', 'Produk', 'Qty', 'Referensi'];
        $this->styleHeader($sheet, $r, $headers);
        $r++;

        $mutasi = $this->data['mutasi_log'] ?? [];
        $rows = [];
        foreach ($mutasi as $m) {
            $rows[] = [
                $m['tanggal'] ?? $m['created_at'] ?? '',
                $m['tipe'] ?? $m['type'] ?? '',
                $m['nama_produk'] ?? $m['produk'] ?? '-',
                $m['qty'] ?? 0,
                $m['referensi'] ?? $m['ref'] ?? '-',
            ];
        }

        $startRow = $r;
        $this->writeData($sheet, $r, $rows, 5);
        $endRow = $r - 1;

        if ($endRow >= $startRow) {
            $this->applyNumberFmt($sheet, $startRow, $endRow, 4);
        }

        $this->autoWidth($sheet, 5);
    }

    protected function buildKasir(Worksheet $sheet): void
    {
        $sheet->setTitle('Kasir');
        $r = 1;
        $sheet->setCellValue("A{$r}", 'LAPORAN KASIR');
        $sheet->mergeCells("A{$r}:G{$r}");
        $sheet->getStyle("A{$r}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 13, 'color' => ['rgb' => '059669']],
        ]);
        $r += 2;

        $headers = ['Kasir', 'Outlet', 'Transaksi', 'Omset', 'Rata-rata', 'Void', 'Void Rate'];
        $this->styleHeader($sheet, $r, $headers);
        $r++;

        $kasir = $this->data['kasir_stats'] ?? [];
        $rows = [];
        foreach ($kasir as $k) {
            $rows[] = [
                $k['nama'] ?? $k['kasir'] ?? '-',
                $k['outlet'] ?? '-',
                $k['transaksi'] ?? 0,
                $k['omset'] ?? 0,
                $k['avg_transaksi'] ?? $k['avg'] ?? 0,
                $k['void_count'] ?? $k['void'] ?? 0,
                ($k['void_rate'] ?? $k['rate'] ?? 0) . '%',
            ];
        }

        $startRow = $r;
        $this->writeData($sheet, $r, $rows, 7);
        $endRow = $r - 1;

        if ($endRow >= $startRow) {
            foreach ([3, 4, 5, 6] as $ci) {
                $this->applyNumberFmt($sheet, $startRow, $endRow, $ci);
            }
        }

        $this->autoWidth($sheet, 7);
    }

    protected function buildKeuangan(Worksheet $sheet): void
    {
        $sheet->setTitle('Keuangan');
        $r = 1;
        $sheet->setCellValue("A{$r}", 'LAPORAN KEUANGAN');
        $sheet->mergeCells("A{$r}:B{$r}");
        $sheet->getStyle("A{$r}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 13, 'color' => ['rgb' => '059669']],
        ]);
        $r += 2;

        $headers = ['Komponen', 'Nilai'];
        $this->styleHeader($sheet, $r, $headers);
        $r++;

        $lr = $this->data['laba_rugi'] ?? [];
        $rows = [
            ['Penjualan Bruto', $lr['penjualan_bruto'] ?? 0],
            ['Diskon', '-' . ($lr['diskon'] ?? 0)],
            ['Penjualan Bersih', $lr['penjualan_bersih'] ?? 0],
            ['Total HPP', '-' . ($lr['total_hpp'] ?? 0)],
            ['Laba Kotor', $lr['laba_kotor'] ?? 0],
            ['Nilai Void', '-' . ($lr['nilai_void'] ?? 0)],
            ['Nilai Refund', '-' . ($lr['nilai_refund'] ?? 0)],
            ['Laba Bersih', $lr['laba_bersih'] ?? 0],
        ];

        $startRow = $r;
        $this->writeData($sheet, $r, $rows, 2);
        $endRow = $r - 1;

        if ($endRow >= $startRow) {
            $this->applyNumberFmt($sheet, $startRow, $endRow, 2);
        }

        $this->autoWidth($sheet, 2);
    }
}
