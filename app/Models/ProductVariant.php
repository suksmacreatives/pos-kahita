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
        'sku'
    ];

    /**
     * RELASI KE PRODUCT
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}