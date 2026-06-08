<?php

namespace Database\Seeders;

use App\Models\User;
use Database\Seeders\OutletSeeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            OutletSeeder::class,
            SupplierSeeder::class,
            KasirSeeder::class,
            ShiftSeeder::class,
            OutletTargetSeeder::class,
        ]);

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }
}
