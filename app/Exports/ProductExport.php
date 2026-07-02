<?php

namespace App\Exports;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use App\Models\Outlet;

class ProductExport
{
    protected array $products;
    protected array $outletNames;

    public function __construct(array $products)
    {
        $this->products = $products;
        $this->outletNames = Outlet::aktif()->pluck('name', 'id')->toArray();
    }

    public function build(): Spreadsheet
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Data Produk');

        $colCount = count($this->outletNames) + 12;
        $lastCol = Coordinate::stringFromColumnIndex($colCount);

        // Title
        $r = 1;
        $sheet->setCellValue("A{$r}", 'KATALOG PRODUK - KAHITA BUSANA');
        $sheet->mergeCells("A{$r}:{$lastCol}{$r}");
        $sheet->getStyle("A{$r}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 13, 'color' => ['rgb' => '059669']],
        ]);
        $r += 2;

        // Headers
        $headers = [
            'Kode Produk', 'Nama Produk', 'Kategori', 'Warna', 'Ukuran',
            'SKU Varian', 'Harga Beli', 'Harga Jual', 'Stok Gudang',
        ];
        foreach ($this->outletNames as $name) {
            $headers[] = 'Stok ' . $name;
        }
        $headers[] = 'Total Stok';
        $headers[] = 'Terjual';
        $headers[] = 'Status';

        $sheet->fromArray($headers, null, "A{$r}", true);
        $sheet->getStyle("A{$r}:{$lastCol}{$r}")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 9],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '10B981']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']]],
        ]);
        $headerRow = $r;
        $r++;

        // Data
        foreach ($this->products as $p) {
            $variants = $p['varian'] ?? [];

            if (empty($variants)) {
                $this->writeRow($sheet, $r, $p, null, $p['stok_gudang'] ?? 0, $p['stok_per_outlet'] ?? []);
                $r++;
            } else {
                foreach ($variants as $v) {
                    $stokOutlet = $v['stok_outlet'] ?? [];
                    $this->writeRow($sheet, $r, $p, $v, $v['stok'] ?? 0, $stokOutlet);
                    $r++;
                }
            }
        }

        // Border + number format
        $dataStart = $headerRow + 1;
        $dataEnd = $r - 1;
        if ($dataEnd >= $dataStart) {
            $range = "A{$dataStart}:{$lastCol}{$dataEnd}";
            $sheet->getStyle($range)->applyFromArray([
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']]],
            ]);

            $numberCols = [7, 8, 9];
            for ($i = 10; $i <= 10 + count($this->outletNames) - 1; $i++) {
                $numberCols[] = $i;
            }
            $totalStokCol = 10 + count($this->outletNames);
            $terjualCol = $totalStokCol + 1;
            $numberCols[] = $totalStokCol;
            $numberCols[] = $terjualCol;

            foreach ($numberCols as $ci) {
                $cl = Coordinate::stringFromColumnIndex($ci);
                $sheet->getStyle("{$cl}{$dataStart}:{$cl}{$dataEnd}")
                    ->getNumberFormat()->setFormatCode('#,##0');
                $sheet->getStyle("{$cl}{$dataStart}:{$cl}{$dataEnd}")
                    ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            }
        }

        // Auto width
        for ($c = 1; $c <= $colCount; $c++) {
            $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($c))->setAutoSize(true);
        }

        $sheet->freezePane('A4');
        return $spreadsheet;
    }

    protected function writeRow(Worksheet $sheet, int $row, array $p, ?array $v, int $stokGudang, array $stokOutlet): void
    {
        $col = 1;
        $sheet->setCellValue(Coordinate::stringFromColumnIndex($col++) . $row, $p['kode_produk'] ?? '-');
        $sheet->setCellValue(Coordinate::stringFromColumnIndex($col++) . $row, $p['nama_produk'] ?? '-');
        $sheet->setCellValue(Coordinate::stringFromColumnIndex($col++) . $row, $p['kategori'] ?? '-');
        $sheet->setCellValue(Coordinate::stringFromColumnIndex($col++) . $row, $v['color_name'] ?? '-');
        $sheet->setCellValue(Coordinate::stringFromColumnIndex($col++) . $row, $v['size_label'] ?? '-');
        $sheet->setCellValue(Coordinate::stringFromColumnIndex($col++) . $row, $v['sku'] ?? '-');
        $sheet->setCellValue(Coordinate::stringFromColumnIndex($col++) . $row, $p['harga_beli'] ?? 0);
        $sheet->setCellValue(Coordinate::stringFromColumnIndex($col++) . $row, $p['harga_jual'] ?? 0);
        $sheet->setCellValue(Coordinate::stringFromColumnIndex($col++) . $row, $stokGudang);

        foreach ($this->outletNames as $outletId => $outletName) {
            $sheet->setCellValue(Coordinate::stringFromColumnIndex($col++) . $row, (int) ($stokOutlet[$outletId] ?? 0));
        }

        $totalStok = $stokGudang + array_sum($stokOutlet);
        $sheet->setCellValue(Coordinate::stringFromColumnIndex($col++) . $row, $totalStok);
        $sheet->setCellValue(Coordinate::stringFromColumnIndex($col++) . $row, $p['terjual'] ?? 0);
        $sheet->setCellValue(Coordinate::stringFromColumnIndex($col++) . $row, $p['status'] ?? 'aktif');
    }
}
