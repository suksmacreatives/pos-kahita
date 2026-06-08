<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DistributionOrderItem extends Model
{
    protected $fillable = [
        'distribution_order_id',
        'product_id',
        'product_variant_id',
        'nama',
        'ukuran',
        'warna',
        'qty',
        'qty_terima',
        'kondisi',
        'catatan',
    ];

    public function distributionOrder()
    {
        return $this->belongsTo(DistributionOrder::class);
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
