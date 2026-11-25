<?php

namespace Database\Factories;

use App\Models\Outlet;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Outlet>
 */
class OutletFactory extends Factory
{
    protected $model = Outlet::class;

    public function definition(): array
    {
        $nama = fake()->unique()->company();

        return [
            'kode' => strtoupper(Str::random(3)),
            'name' => $nama,
            'slug' => Str::slug($nama),
            'warna' => 'emerald',
            'warna_hex' => '#10B981',
            'status' => 'aktif',
            'tipe' => 'cabang',
        ];
    }

    public function nonaktif(): static
    {
        return $this->state(fn () => ['status' => 'nonaktif']);
    }
}
