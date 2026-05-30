<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreSetting extends Model
{
    protected $fillable = [
        'outlet_id',
        'store_name',
        'phone_number',
        'address',
        'logo_path'
    ];

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }
}