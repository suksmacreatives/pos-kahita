<?php

namespace App\Http\Resources\Outlets;

use Illuminate\Http\Request;

class OutletDetailResource extends OutletResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'alamat' => $this->address ?? '-',
            'kode_pos' => $this->kode_pos ?? '-',
            'telp' => $this->phone ?? '-',
            'email' => $this->email ?? '-',
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'luas_m2' => $this->luas_m2 ?? 0,
            'dibuka_sejak' => $this->dibuka_sejak ? $this->dibuka_sejak->format('Y-m-d') : null,
            'jam_operasional' => $this->jam_operasional ?? [],
            'konfigurasi' => $this->konfigurasi ?? [],
            'foto_color' => $this->foto_color ?? '#10B981',
            'foto_icon' => $this->foto_icon ?? 'Store',
        ]);
    }
}
