<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Shift;
use Carbon\Carbon;

class ShiftSeeder extends Seeder
{
    public function run(): void
    {
        $kasirs = User::kasir()->get();

        foreach ($kasirs as $kasir) {
            if (!$kasir->outlet_id) continue;

            // Seed some past completed shifts
            for ($i = 1; $i <= 3; $i++) {
                $date = Carbon::now()->subDays($i);
                
                Shift::create([
                    'user_id' => $kasir->id,
                    'outlet_id' => $kasir->outlet_id,
                    'opened_at' => clone $date->setTime(9, 0),
                    'closed_at' => clone $date->setTime(17, 0),
                    'starting_cash' => 500000,
                    'system_cash' => 2500000,
                    'physical_cash' => 2500000,
                    'discrepancy' => 0,
                    'status' => 'closed',
                ]);
            }
        }
    }
}
