<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashRegisterShift extends Model
{
    protected $fillable = [
        'user_id',
        'outlet_id',
        'opened_at',
        'closed_at',
        'starting_cash',
        'system_cash',
        'physical_cash',
        'discrepancy',
        'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'shift_id');
    }
}