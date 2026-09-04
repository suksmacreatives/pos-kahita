<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DistributionOrder extends Model
{
    protected $fillable = [
        'nomor_do',
        'outlet_id',
        'tipe_tujuan',
        'online_shop_id',
        'tanggal_kirim',
        'tanggal_terima',
        'total_qty',
        'status',
        'notes',
    ];

    protected $casts = [
        'tanggal_kirim' => 'date',
        'tanggal_terima' => 'date',
    ];

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function onlineShop()
    {
        return $this->belongsTo(OnlineShop::class);
    }

    public function items()
    {
        return $this->hasMany(DistributionOrderItem::class);
    }
}
