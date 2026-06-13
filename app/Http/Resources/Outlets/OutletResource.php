<?php

namespace App\Http\Resources\Outlets;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\UserResource; // If exists, otherwise minimal array

class OutletResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'kode' => $this->kode,
            'nama' => $this->name, // mapping 'name' to 'nama' for frontend compatibility
            'tipe' => $this->tipe,
            'warna' => $this->warna,
            'warna_hex' => $this->warna_hex,
            'kota' => $this->kota,
            'provinsi' => $this->provinsi,
            'status' => $this->status,
            'manajer_nama' => $this->whenLoaded('manajer', fn() => $this->manajer->name, '-'),
            'manajer_telp' => $this->whenLoaded('manajer', fn() => $this->manajer->phone ?? '-', '-'),
            'kasir_count' => $this->kasirs_count ?? 0,
            'telp' => $this->phone ?? '-',
            'email' => $this->email ?? '-',
            'alamat' => $this->address ?? '-',
            'luas_m2' => $this->luas_m2 ?? 0,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'foto_color' => $this->foto_color ?? '#10B981',
            'foto_icon' => $this->foto_icon ?? 'Store',
            'jam_operasional' => $this->jam_operasional,
            'konfigurasi' => $this->konfigurasi,
            'stats' => $this->stats,
            'target' => $this->relationLoaded('targets') && $this->targets->isNotEmpty() ? new TargetResource($this->targets->first()) : null,
        ];
    }
}
