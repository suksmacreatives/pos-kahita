<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductVariant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_id',
        'color',
        'size',
        'stock',
        'sku',
        'original_sku',
        'archived_at',
        'price',
        'cost_price',
    ];

    protected $casts = [
        'color' => 'string',
    ];

    public function getBarcodeCodeAttribute(): string
    {
        return $this->attributes['barcode_code']
            ?? 'V'.str_pad((string) $this->id, 6, '0', STR_PAD_LEFT);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function outletStocks()
    {
        return $this->hasMany(OutletStock::class, 'product_variant_id');
    }
}
