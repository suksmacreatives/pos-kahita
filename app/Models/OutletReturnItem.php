<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OutletReturnItem extends Model
{
    protected $fillable = [
        'outlet_return_id',
        'product_id',
        'product_variant_id',
        'nama',
        'ukuran',
        'warna',
        'qty',
        'catatan',
    ];

    public function outletReturn()
    {
        return $this->belongsTo(OutletReturn::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }
}
