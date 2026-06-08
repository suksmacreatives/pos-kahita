<?php

namespace App\Http\Resources\Inventory\Outlet;

use Illuminate\Http\Resources\Json\JsonResource;

class StokOutletResource extends JsonResource
{
    public function toArray($request)
    {
        $varian = $this->resource['varian'] ?? [];
        $totalStok = $this->resource['total_stok'] ?? 0;
        $minStok = $this->resource['stok_minimum'] ?? 10;

        return [
            'id' => $this->resource['id'],
            'kode_produk' => $this->resource['kode_produk'],
            'nama_produk' => $this->resource['nama_produk'],
            'kategori' => $this->resource['kategori'],
            'harga_beli' => (int) ($this->resource['harga_beli'] ?? 0),
            'warna_hex' => $this->resource['warna_hex'] ?? '#000000',
            'foto_color' => $this->resource['warna_hex'] ?? '#000000',
            'varian' => collect($varian)->map(fn ($v) => [
                'ukuran' => $v['ukuran'] ?? '',
                'warna' => $v['warna'] ?? '#000000',
                'stok' => (int) ($v['stok'] ?? 0),
                'sku' => $v['sku'] ?? '',
            ])->toArray(),
            'total_stok' => $totalStok,
            'stok_minimum' => $minStok,
            'tgl_terakhir_masuk' => $this->resource['tgl_terakhir_masuk'] ?? null,
            'tgl_terakhir_terjual' => $this->resource['tgl_terakhir_terjual'] ?? null,
            'status' => $this->getStokStatus($totalStok, $minStok),
        ];
    }

    private function getStokStatus($total, $min)
    {
        if ($total <= 0) return 'habis';
        if ($total < $min) return 'menipis';
        return 'normal';
    }
}
