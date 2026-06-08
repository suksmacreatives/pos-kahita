<?php

namespace App\Http\Resources\Inventory\Outlet;

use Illuminate\Http\Resources\Json\JsonResource;

class PenerimaanGudangResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'nomor_do' => $this->nomor_do,
            'nomor_terima' => $this->tanggal_terima ? 'TR-' . $this->nomor_do : null,
            'tgl_kirim_gudang' => $this->tanggal_kirim?->format('Y-m-d'),
            'tgl_terima_outlet' => $this->tanggal_terima?->format('Y-m-d'),
            'items' => $this->items->map(fn ($item) => [
                'produk_id' => $item->product_id,
                'nama' => $item->nama,
                'ukuran' => $item->ukuran ?? '',
                'warna' => $item->warna ?? '#000000',
                'qty_kirim' => (int) $item->qty,
                'qty_terima' => (int) ($item->qty_terima ?? 0),
                'catatan' => $item->catatan ?? '',
            ])->toArray(),
            'total_item' => $this->items->count(),
            'total_qty' => (int) $this->total_qty,
            'status' => $this->status === 'diterima' ? 'diterima'
                : ($this->status === 'dikirim' ? 'menunggu' : $this->status),
            'diterima_oleh' => $this->penerima ?? null,
        ];
    }
}
