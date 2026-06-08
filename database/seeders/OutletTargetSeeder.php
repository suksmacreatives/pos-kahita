<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Outlet;
use App\Models\OutletTarget;

class OutletTargetSeeder extends Seeder
{
    public function run(): void
    {
        $outlets = Outlet::all();
        if ($outlets->isEmpty()) return;

        foreach ($outlets as $outlet) {
            OutletTarget::updateOrCreate(
                [
                    'outlet_id' => $outlet->id,
                    'bulan' => now()->month,
                    'tahun' => now()->year,
                ],
                [
                    'target_omset' => 50000000, // 50 juta
                    'target_transaksi' => 500,
                ]
            );
        }
    }
}
