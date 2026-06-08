<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    protected $fillable = [
        'nama',
        'kota',
        'telepon',
        'alamat',
    ];

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    public function supplierReturns()
    {
        return $this->hasMany(SupplierReturn::class);
    }
}
