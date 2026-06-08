<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Outlet;
use Illuminate\Support\Str;

class OutletSeeder extends Seeder
{
    public function run(): void
    {
        $outlets = [
            [
                'kode' => 'KHT-001',
                'name' => 'Kahita Busana Pusat',
                'tipe' => 'flagship',
                'warna' => 'blue',
                'warna_hex' => '#3B82F6',
                'address' => 'Jl. Sudirman No. 123, Jakarta Pusat',
                'kota' => 'Jakarta Pusat',
                'provinsi' => 'DKI Jakarta',
                'kode_pos' => '10220',
                'latitude' => -6.2088,
                'longitude' => 106.8456,
                'phone' => '021-555-0101',
                'email' => 'pusat@kahita.com',
                'status' => 'aktif',
                'luas_m2' => 250,
                'dibuka_sejak' => '2020-01-15 09:00:00',
                'jam_operasional' => [
                    ['hari' => 'Senin', 'buka' => '09:00', 'tutup' => '21:00', 'libur' => false],
                    ['hari' => 'Selasa', 'buka' => '09:00', 'tutup' => '21:00', 'libur' => false],
                    ['hari' => 'Rabu', 'buka' => '09:00', 'tutup' => '21:00', 'libur' => false],
                    ['hari' => 'Kamis', 'buka' => '09:00', 'tutup' => '21:00', 'libur' => false],
                    ['hari' => 'Jumat', 'buka' => '09:00', 'tutup' => '22:00', 'libur' => false],
                    ['hari' => 'Sabtu', 'buka' => '10:00', 'tutup' => '22:00', 'libur' => false],
                    ['hari' => 'Minggu', 'buka' => '10:00', 'tutup' => '20:00', 'libur' => false],
                ],
                'konfigurasi' => [
                    'pajak_persen' => 11,
                    'cetak_struk_otomatis' => true,
                    'metode_pembayaran_aktif' => ['tunai', 'qris', 'debit', 'kredit'],
                ]
            ],
            [
                'kode' => 'KHT-002',
                'name' => 'Kahita Cabang Kuta',
                'tipe' => 'cabang',
                'warna' => 'emerald',
                'warna_hex' => '#10B981',
                'address' => 'Jl. Legian No. 45, Kuta',
                'kota' => 'Badung',
                'provinsi' => 'Bali',
                'kode_pos' => '80361',
                'latitude' => -8.7185,
                'longitude' => 115.1724,
                'phone' => '0361-555-0102',
                'email' => 'kuta@kahita.com',
                'status' => 'aktif',
                'luas_m2' => 120,
                'dibuka_sejak' => '2021-05-10 10:00:00',
                'jam_operasional' => [
                    ['hari' => 'Senin', 'buka' => '10:00', 'tutup' => '22:00', 'libur' => false],
                    ['hari' => 'Selasa', 'buka' => '10:00', 'tutup' => '22:00', 'libur' => false],
                    ['hari' => 'Rabu', 'buka' => '10:00', 'tutup' => '22:00', 'libur' => false],
                    ['hari' => 'Kamis', 'buka' => '10:00', 'tutup' => '22:00', 'libur' => false],
                    ['hari' => 'Jumat', 'buka' => '10:00', 'tutup' => '22:00', 'libur' => false],
                    ['hari' => 'Sabtu', 'buka' => '10:00', 'tutup' => '22:00', 'libur' => false],
                    ['hari' => 'Minggu', 'buka' => '10:00', 'tutup' => '22:00', 'libur' => false],
                ],
                'konfigurasi' => [
                    'pajak_persen' => 11,
                    'cetak_struk_otomatis' => false,
                    'metode_pembayaran_aktif' => ['tunai', 'qris'],
                ]
            ],
        ];

        foreach ($outlets as $data) {
            $data['slug'] = Str::slug($data['kode'] . '-' . $data['name']);
            Outlet::updateOrCreate(['kode' => $data['kode']], $data);
        }
    }
}
