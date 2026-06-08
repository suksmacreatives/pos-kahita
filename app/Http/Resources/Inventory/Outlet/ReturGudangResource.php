<?php

namespace App\Http\Resources\Inventory\Outlet;

use Illuminate\Http\Resources\Json\JsonResource;

class ReturGudangResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'nomor_retur' => $this->nomor_retur,
            'outlet_id' => $this->outlet?->slug ?? $this->outlet_id,
            'outlet_nama' => $this->outlet?->name ?? '',
            'tgl_retur' => $this->tgl_retur?->format('Y-m-d'),
            'alasan' => $this->alasan,
            'items' => $this->items->map(fn ($item) => [
                'produk_id' => $item->product_id,
                'nama' => $item->nama,
                'ukuran' => $item->ukuran ?? '',
                'warna' => $item->warna ?? '#000000',
                'qty' => (int) $item->qty,
                'catatan' => $item->catatan ?? '',
            ])->toArray(),
            'total_item' => $this->items->count(),
            'total_qty' => (int) $this->total_qty,
            'status' => $this->status,
            'catatan' => $this->catatan ?? '',
        ];
    }
}
