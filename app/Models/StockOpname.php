<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockOpname extends Model
{
    protected $fillable = [
        'nomor_opname',
        'outlet_id',
        'tanggal_mulai',
        'tanggal_selesai',
        'total_item',
        'total_selisih_plus',
        'total_selisih_minus',
        'petugas',
        'scope',
        'status',
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
    ];

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function items()
    {
        return $this->hasMany(StockOpnameItem::class);
    }
}
