<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'invoice_number',
        'outlet_id',
        'user_id',
        'shift_id',
        'sesi_kasir_id',
        'customer_name',
        'subtotal',
        'discount',
        'tax',
        'grand_total',
        'paid_amount',
        'change_amount',
        'payment_method',
        'promo_id',
        'notes',
        'status'
    ];

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }
    public function transaction_items()
    {
        // Sesuaikan 'transaction_id' dengan nama foreign key di tabel transaction_items Anda
        return $this->hasMany(TransactionItem::class, 'transaction_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shift()
    {
        return $this->belongsTo(CashRegisterShift::class, 'shift_id');
    }

    public function sesiKasir()
    {
        return $this->belongsTo(SesiKasir::class, 'sesi_kasir_id');
    }

    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }
}