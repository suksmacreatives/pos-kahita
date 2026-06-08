<?php

namespace App\Http\Resources\Inventory\Outlet;

use Illuminate\Http\Resources\Json\JsonResource;

class TransferResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'nomor_transfer' => $this->nomor_transfer,
            'outlet_asal_id' => $this->outletAsal?->slug ?? $this->outlet_asal_id,
            'outlet_asal_nama' => $this->outletAsal?->name ?? '',
            'outlet_tujuan_id' => $this->outletTujuan?->slug ?? $this->outlet_tujuan_id,
            'outlet_tujuan_nama' => $this->outletTujuan?->name ?? '',
            'tgl_transfer' => $this->tgl_transfer?->format('Y-m-d'),
            'tgl_diterima' => $this->tgl_diterima?->format('Y-m-d'),
            'items' => $this->items->map(fn ($item) => [
                'produk_id' => $item->product_id,
                'nama' => $item->nama,
                'ukuran' => $item->ukuran ?? '',
                'warna' => $item->warna ?? '#000000',
                'qty' => (int) $item->qty,
            ])->toArray(),
            'total_item' => $this->items->count(),
            'total_qty' => (int) $this->total_qty,
            'alasan' => $this->alasan,
            'status' => $this->status,
            'dibuat_oleh' => $this->dibuat_oleh ?? '',
        ];
    }
}
