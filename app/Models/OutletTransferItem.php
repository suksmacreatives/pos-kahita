<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OutletTransferItem extends Model
{
    protected $fillable = [
        'outlet_transfer_id',
        'product_id',
        'product_variant_id',
        'nama',
        'ukuran',
        'warna',
        'qty',
    ];

    public function outletTransfer()
    {
        return $this->belongsTo(OutletTransfer::class);
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
