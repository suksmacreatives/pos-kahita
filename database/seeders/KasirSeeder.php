<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Outlet;
use Illuminate\Support\Facades\Hash;

class KasirSeeder extends Seeder
{
    public function run(): void
    {
        $outlets = Outlet::all();
        if ($outlets->isEmpty()) return;

        $kasirs = [
            ['name' => 'Budi Kasir', 'email' => 'budi@kahita.com', 'shift_default' => 'pagi'],
            ['name' => 'Siti Kasir', 'email' => 'siti@kahita.com', 'shift_default' => 'siang'],
            ['name' => 'Andi Kasir', 'email' => 'andi@kahita.com', 'shift_default' => 'malam'],
            ['name' => 'Rina Kasir', 'email' => 'rina@kahita.com', 'shift_default' => 'pagi'],
        ];

        foreach ($kasirs as $index => $k) {
            $outlet = $outlets[$index % $outlets->count()];
            User::updateOrCreate(
                ['email' => $k['email']],
                [
                    'name' => $k['name'],
                    'password' => Hash::make('password'),
                    'role' => 'cashier', // using "cashier" per User model
                    'outlet_id' => $outlet->id,
                    'shift_default' => $k['shift_default'],
                    'status' => 'aktif',
                ]
            );
        }
    }
}
