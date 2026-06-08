<?php

namespace App\Http\Resources\Outlets;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KasirResource extends JsonResource
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
            'nama' => $this->name,
            'email' => $this->email,
            'telp' => $this->phone ?? '-',
            'foto_color' => '#10B981', // Placeholder color, add to user if needed
            'outlet_id' => $this->outlet_id,
            'outlet_nama' => $this->whenLoaded('outlet', fn() => $this->outlet->name),
            'shift_default' => $this->shift_default,
            'shifts' => $this->whenLoaded('shifts', fn() => $this->shifts->keyBy('hari')),
            'status' => $this->status,
            'last_login' => '-', // implement logic if there is last_login tracking
            'bergabung' => $this->created_at ? $this->created_at->format('Y-m-d') : null,
            'stats' => $this->kasir_stats,
        ];
    }
}
