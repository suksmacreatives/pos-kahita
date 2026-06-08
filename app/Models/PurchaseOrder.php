<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    protected $fillable = [
        'nomor_po',
        'supplier_id',
        'tanggal_po',
        'tanggal_estimasi',
        'tanggal_terima',
        'total_qty',
        'total_nilai',
        'status',
        'notes',
    ];

    protected $casts = [
        'tanggal_po' => 'date',
        'tanggal_estimasi' => 'date',
        'tanggal_terima' => 'date',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }
}
