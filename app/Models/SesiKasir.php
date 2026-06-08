<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SesiKasir extends Model
{
    protected $table = 'sesi_kasirs';

    protected $fillable = [
        'user_id',
        'outlet_id',
        'modal_awal',
        'uang_fisik_akhir',
        'status',
        'waktu_buka',
        'waktu_tutup'
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
        return $this->hasMany(Transaction::class);
    }

    public function cashTransactions() // Nama relasi baru
    {
        return $this->hasMany(CashTransaction::class, 'shift_id', 'id'); // Pastikan FK-nya 'shift_id'
    }
    
}