<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OutletReturn extends Model
{
    protected $fillable = [
        'nomor_retur',
        'outlet_id',
        'tgl_retur',
        'alasan',
        'status',
        'catatan',
        'total_item',
        'total_qty',
    ];

    protected $casts = [
        'tgl_retur' => 'date',
    ];

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function items()
    {
        return $this->hasMany(OutletReturnItem::class);
    }
}
