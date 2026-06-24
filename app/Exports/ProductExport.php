<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use App\Models\Outlet;

class ProductExport implements FromArray, WithHeadings, WithTitle, WithStyles, WithColumnWidths
{
    protected array $products;
    protected array $outletNames;

    public function __construct(array $products)
    {
        $this->products = $products;
        $this->outletNames = Outlet::aktif()->pluck('name', 'id')->toArray();
    }

    public function array(): array
    {
        $rows = [];

        foreach ($this->products as $p) {
            $variants = $p['varian'] ?? [];

            if (empty($variants)) {
                $rows[] = $this->buildRow($p, null, $p['stok_gudang'] ?? 0, $p['stok_per_outlet'] ?? []);
            } else {
                foreach ($variants as $v) {
                    $stokOutlet = $v['stok_outlet'] ?? [];
                    $rows[] = $this->buildRow($p, $v, $v['stok'] ?? 0, $stokOutlet);
                }
            }
        }

        return $rows;
    }

    protected function buildRow(array $p, ?array $v, int $stokGudang, array $stokOutlet): array
    {
        $row = [
            $p['kode_produk'] ?? '-',
            $p['nama_produk'] ?? '-',
            $p['kategori'] ?? '-',
            $v['color_name'] ?? '-',
            $v['size_label'] ?? '-',
            $v['sku'] ?? '-',
            $p['harga_beli'] ?? 0,
            $p['harga_jual'] ?? 0,
            $stokGudang,
        ];

        foreach ($this->outletNames as $outletId => $outletName) {
            $row[] = (int) ($stokOutlet[$outletId] ?? 0);
        }

        $totalStok = $stokGudang + array_sum($stokOutlet);
        $row[] = $totalStok;
        $row[] = $p['terjual'] ?? 0;
        $row[] = $p['status'] ?? 'aktif';

        return $row;
    }

    public function headings(): array
    {
        $headers = [
            'Kode Produk',
            'Nama Produk',
            'Kategori',
            'Warna',
            'Ukuran',
            'SKU Varian',
            'Harga Beli',
            'Harga Jual',
            'Stok Gudang',
        ];

        foreach ($this->outletNames as $outletName) {
            $headers[] = 'Stok ' . $outletName;
        }

        $headers[] = 'Total Stok';
        $headers[] = 'Terjual';
        $headers[] = 'Status';

        return $headers;
    }

    public function title(): string
    {
        return 'Data Produk';
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']], 'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '10B981']]],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 15,
            'B' => 30,
            'C' => 15,
            'D' => 12,
            'E' => 8,
            'F' => 18,
            'G' => 12,
            'H' => 12,
            'I' => 12,
        ];
    }
}
