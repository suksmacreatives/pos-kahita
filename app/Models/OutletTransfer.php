<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OutletTransfer extends Model
{
    protected $fillable = [
        'nomor_transfer',
        'outlet_asal_id',
        'outlet_tujuan_id',
        'tgl_transfer',
        'tgl_diterima',
        'alasan',
        'status',
        'dibuat_oleh',
        'catatan',
        'total_item',
        'total_qty',
    ];

    protected $casts = [
        'tgl_transfer' => 'date',
        'tgl_diterima' => 'date',
    ];

    public function outletAsal()
    {
        return $this->belongsTo(Outlet::class, 'outlet_asal_id');
    }

    public function outletTujuan()
    {
        return $this->belongsTo(Outlet::class, 'outlet_tujuan_id');
    }

    public function items()
    {
        return $this->hasMany(OutletTransferItem::class);
    }
}
