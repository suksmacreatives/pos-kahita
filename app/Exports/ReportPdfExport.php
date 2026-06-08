<?php

namespace App\Exports;

use Carbon\Carbon;

class ReportPdfExport
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

    public function getData(): array
    {
        return $this->data;
    }

    public function getKategori(): string
    {
        return $this->kategori;
    }

    public function getSub(): string
    {
        return $this->sub;
    }

    public function getDari(): Carbon
    {
        return $this->dari;
    }

    public function getSampai(): Carbon
    {
        return $this->sampai;
    }

    public function getTitle(): string
    {
        $labels = [
            'penjualan' => 'Laporan Penjualan',
            'produk'    => 'Laporan Produk',
            'inventori' => 'Laporan Inventori',
            'kasir'     => 'Laporan Kasir',
            'keuangan'  => 'Laporan Keuangan',
        ];

        return $labels[$this->kategori] ?? 'Laporan';
    }
}
