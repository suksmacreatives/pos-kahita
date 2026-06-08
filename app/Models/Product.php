<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'outlet_id',
        'category_id',
        'name',
        'sku',
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

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
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