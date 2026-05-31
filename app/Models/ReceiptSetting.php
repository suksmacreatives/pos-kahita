<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReceiptSetting extends Model
{
    protected $fillable = [
        'outlet_id',
        'header_text_1',
        'header_text_2',
        'footer_text',
        'show_customer_name'
    ];

    protected $casts = [
        'show_customer_name' => 'boolean'
    ];

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }
}