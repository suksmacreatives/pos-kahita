<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'outlet_id',
        'category_id',
        'name',
        'sku',
        'original_sku',
        'price',
        'cost_price',
        'description',
        'image',
        'sub_kategori',
        'status',
        'outlet_ids',
    ];

    protected $casts = [
        'outlet_ids' => 'array',
    ];

    public function getBarcodeCodeAttribute(): string
    {
        return $this->attributes['barcode_code']
            ?? 'P'.str_pad((string) $this->id, 6, '0', STR_PAD_LEFT);
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function outlets()
    {
        return $this->belongsToMany(Outlet::class, 'outlet_product');
    }

    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }
}
