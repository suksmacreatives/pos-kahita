<?php

namespace App\Http\Resources\Outlets;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TargetResource extends JsonResource
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
            'outlet_id' => $this->outlet_id,
            'outlet_nama' => $this->whenLoaded('outlet', fn() => $this->outlet->name),
            'bulan' => $this->bulan,
            'tahun' => $this->tahun,
            'target_omset' => $this->target_omset,
            'target_transaksi' => $this->target_transaksi,
            'realisasi_omset' => $this->realisasi_omset,
            'realisasi_transaksi' => $this->realisasi_transaksi,
            'persen_omset' => $this->persen_omset,
            'persen_transaksi' => $this->persen_transaksi,
            'status' => $this->status_target,
        ];
    }
}
