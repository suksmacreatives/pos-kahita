<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $suppliers = [
            ['nama' => 'PT. Busana Indah', 'kota' => 'Jakarta'],
            ['nama' => 'CV. Kain Sutra Jaya', 'kota' => 'Bandung'],
            ['nama' => 'UD. Tekstil Makmur', 'kota' => 'Surabaya'],
            ['nama' => 'PT. Fashion Global', 'kota' => 'Jakarta'],
            ['nama' => 'CV. Rajut Nusantara', 'kota' => 'Semarang'],
            ['nama' => 'UD. Asesoris Busana', 'kota' => 'Denpasar'],
        ];

        foreach ($suppliers as $s) {
            Supplier::create($s);
        }
    }
}
