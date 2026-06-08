<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    use HasFactory;

    protected $table = 'cash_register_shifts';

    protected $fillable = [
        'user_id',
        'outlet_id',
        'hari',
        'shift',
        'jam_masuk',
        'jam_keluar',
        'status',
        'opened_at',
        'closed_at',
        'starting_cash',
        'system_cash',
        'physical_cash',
        'discrepancy'
    ];

    protected $casts = [
        'status' => 'string',
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
        'starting_cash' => 'integer',
        'system_cash' => 'integer',
        'physical_cash' => 'integer',
        'discrepancy' => 'integer'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function kasir()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class, 'outlet_id');
    }

    public static function getShiftTimes(): array
    {
        return [
            'pagi' =>  ['buka' => '09:00', 'tutup' => '17:00'],
            'siang' => ['buka' => '17:00', 'tutup' => '01:00'],
            'malam' => ['buka' => '01:00', 'tutup' => '09:00'], // Example if 24hr, but user asked from 9 to 5
        ];
    }
}
