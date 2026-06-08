<?php

namespace App\Http\Resources\Inventory\Outlet;

use Illuminate\Http\Resources\Json\JsonResource;

class OpnameOutletResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'nomor_opname' => $this->nomor_opname,
            'outlet_id' => $this->outlet?->slug ?? $this->outlet_id,
            'tgl_mulai' => $this->tanggal_mulai?->format('Y-m-d'),
            'tgl_selesai' => $this->tanggal_selesai?->format('Y-m-d'),
            'status' => $this->status,
            'items' => $this->items->map(fn ($item) => [
                'produk_id' => $item->product_id,
                'nama' => $item->nama,
                'ukuran' => $item->ukuran ?? '',
                'warna' => $item->warna ?? '#000000',
                'stok_sistem' => (int) $item->stok_sistem,
                'stok_fisik' => (int) $item->stok_fisik,
                'selisih' => (int) $item->selisih,
                'keterangan' => $item->keterangan ?? '',
            ])->toArray(),
            'total_item' => $this->items->count(),
            'total_selisih_plus' => (int) $this->total_selisih_plus,
            'total_selisih_minus' => (int) $this->total_selisih_minus,
            'dilakukan_oleh' => $this->petugas ?? '',
        ];
    }
}
