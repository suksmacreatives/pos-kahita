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
        'transaction_type',
        'category',
        'amount',
        'description'
    ];
}