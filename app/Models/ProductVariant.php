<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'color',
        'size',
        'stock',
        'sku',
        'price',
        'cost_price',
    ];

    protected $casts = [
        'color' => 'string',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function outletStocks()
    {
        return $this->hasMany(OutletStock::class, 'product_variant_id');
    }
}