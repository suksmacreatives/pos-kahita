<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OutletStock extends Model
{
    protected $fillable = [
        'outlet_id',
        'product_variant_id',
        'stock',
    ];

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }
}
