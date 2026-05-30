<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrinterSetting extends Model
{
    protected $fillable = [
        'outlet_id',
        'printer_name',
        'connection_type',
        'printer_address',
        'paper_width_mm'
    ];

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }
}