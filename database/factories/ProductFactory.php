<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(3, true),
            'sku' => 'KHT-'.strtoupper(Str::random(8)),
            'price' => fake()->numberBetween(50_000, 500_000),
            'cost_price' => fake()->numberBetween(20_000, 300_000),
            'status' => 'aktif',
        ];
    }

    /**
     * Products are normally assigned outlets through `outlet_ids`, which is
     * stored as a JSON array of STRINGS. Everything that writes the column
     * must keep that shape, otherwise `whereJsonContains('outlet_ids', '1')`
     * silently stops matching.
     */
    public function tersediaDiOutlet(mixed ...$outletIds): static
    {
        return $this->state(fn () => [
            'outlet_ids' => array_map('strval', $outletIds),
        ]);
    }
}
