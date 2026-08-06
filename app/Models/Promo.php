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
        'beli',
        'gratis',
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
            ->where('berlaku_dari', '<=', now())
            ->where('berlaku_sampai', '>=', now())
            ->where(function ($q) {
                $q->whereNull('kuota')
                  ->orWhereColumn('terpakai', '<', 'kuota');
            });
    }

    public function scopeBerlakuUntukOutlet($query, ?int $outletId, ?string $outletSlug = null)
    {
        return $query->where(function ($q) use ($outletId, $outletSlug) {
            $q->where('berlaku_di', 'semua')
              ->orWhere('berlaku_di', (string) $outletId);

            if ($outletSlug) {
                $q->orWhere('berlaku_di', $outletSlug);
            }
        });
    }

    public function hitungDiskon(float $subtotal, array $items = []): float
    {
        if ($this->tipe === 'persentase') {
            $diskon = $subtotal * ((float) $this->nilai_diskon / 100);
            if ($this->max_diskon) {
                $diskon = min($diskon, (float) $this->max_diskon);
            }

            return min(max($diskon, 0), $subtotal);
        }

        if ($this->tipe === 'nominal') {
            return min(max((float) $this->nilai_diskon, 0), $subtotal);
        }

        if ($this->tipe === 'beli_x_gratis_y') {
            $beli = (int) ($this->beli ?: 1);
            $gratis = (int) ($this->gratis ?: 0);
            if ($beli <= 0 || $gratis <= 0) {
                return 0;
            }

            $totalQty = array_sum(array_map(fn ($i) => (int) ($i['quantity'] ?? 1), $items));
            $freeQty = intdiv($totalQty, $beli + $gratis) * $gratis;
            if ($freeQty <= 0) {
                return 0;
            }

            $cheapest = INF;
            foreach ($items as $i) {
                $cheapest = min($cheapest, (float) ($i['price'] ?? 0));
            }

            if (!is_finite($cheapest)) {
                return 0;
            }

            return min($freeQty * $cheapest, $subtotal);
        }

        if ($this->tipe === 'bundle') {
            return min(max($subtotal - (float) $this->nilai_diskon, 0), $subtotal);
        }

        return 0;
    }

    public function scopeSudahExpired($query)
    {
        return $query->where('status', 'aktif')
            ->where('berlaku_sampai', '<', now());
    }
}
