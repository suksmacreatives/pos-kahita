<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashTransaction extends Model
{
    protected $table = 'cash_transactions';

    public $timestamps = false;

    protected $fillable = [
        'shift_id',
        'user_id',
        'name',
        'transaction_type',
        'category',
        'payment_method',
        'name',
        'amount',
        'description'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shift()
    {
        return $this->belongsTo(CashRegisterShift::class, 'shift_id');
    }
}