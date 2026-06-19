<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Promo extends Model
{
    protected $fillable = [
        'kode_promo',
        'nama_promo',
        'deskripsi',
        'tipe',
        'nilai_diskon',
        'min_transaksi',
        'max_diskon',
        'berlaku_dari',
        'berlaku_sampai',
        'berlaku_di',
        'berlaku_untuk',
        'kuota',
        'terpakai',
        'status',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'nilai_diskon' => 'decimal:2',
            'min_transaksi' => 'decimal:2',
            'max_diskon' => 'decimal:2',
            'berlaku_dari' => 'datetime',
            'berlaku_sampai' => 'datetime',
            'terpakai' => 'integer',
            'kuota' => 'integer',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeAktif($query)
    {
        return $query->where('status', 'aktif')
            ->where('berlaku_sampai', '>=', now())
            ->where(function ($q) {
                $q->whereNull('kuota')
                  ->orWhereColumn('terpakai', '<', 'kuota');
            });
    }

    public function scopeSudahExpired($query)
    {
        return $query->where('status', 'aktif')
            ->where('berlaku_sampai', '<', now());
    }
}
