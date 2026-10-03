<?php

namespace Database\Factories;

use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    protected $model = ProductVariant::class;

    public function definition(): array
    {
        return [
            'color' => fake()->safeColorName(),
            'size' => (string) fake()->numberBetween(30, 44),
            'sku' => 'V-'.strtoupper(Str::random(10)),
            'stock' => 0,
            'price' => fake()->numberBetween(50_000, 500_000),
            'cost_price' => fake()->numberBetween(20_000, 300_000),
        ];
    }
}
