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
        'barcode',
        'price',
        'cost_price',
        'stock',
        'min_stock',
        'image',
        'description',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function transactionItems()
    {
        return $this->hasMany(TransactionItem::class);
    }
    public function variants()
{
    return $this->hasMany(ProductVariant::class);
}
}