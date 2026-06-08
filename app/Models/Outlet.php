<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Outlet extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode', 'slug', 'name', 'warna', 'warna_hex', 'address', 'kota', 'provinsi', 
        'kode_pos', 'latitude', 'longitude', 'phone', 'email', 'manajer_id', 
        'status', 'tipe', 'luas_m2', 'dibuka_sejak', 'foto_color', 'foto_icon', 
        'jam_operasional', 'konfigurasi'
    ];

    protected $casts = [
        'status' => 'string',
        'tipe' => 'string',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'luas_m2' => 'integer',
        'dibuka_sejak' => 'datetime',
        'jam_operasional' => 'array',
        'konfigurasi' => 'array',
    ];

    public function manajer()
    {
        return $this->belongsTo(User::class, 'manajer_id');
    }

    public function kasirs()
    {
        return $this->hasMany(User::class, 'outlet_id')->where('role', 'cashier');
    }

    public function shifts()
    {
        return $this->hasMany(Shift::class, 'outlet_id');
    }

    public function targets()
    {
        return $this->hasMany(OutletTarget::class, 'outlet_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'outlet_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'outlet_id');
    }

    public function categories()
    {
        return $this->hasMany(ProductCategory::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function scopeAktif($query)
    {
        return $query->where('status', 'aktif');
    }

    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($query) use ($search) {
                $query->where('name', 'like', '%'.$search.'%')
                      ->orWhere('kode', 'like', '%'.$search.'%')
                      ->orWhere('kota', 'like', '%'.$search.'%');
            });
        })->when($filters['status'] ?? null, function ($query, $status) {
            $query->where('status', $status);
        })->when($filters['tipe'] ?? null, function ($query, $tipe) {
            $query->where('tipe', $tipe);
        });
    }

    public function getStatsAttribute()
    {
        $cacheKey = "outlet_stats_{$this->id}";
        return Cache::remember($cacheKey, 60, function () {
            $now = now();
            // Start of month
            $startOfMonth = $now->copy()->startOfMonth();
            $endOfMonth = $now->copy()->endOfMonth();

            $startOfLastMonth = clone $startOfMonth->subMonth();
            $endOfLastMonth = clone $endOfMonth->subMonth();

            $bulanIni = $this->transactions()
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->where('status', 'completed')
                ->selectRaw('COUNT(id) as transaksi_count, SUM(grand_total) as omset')
                ->first();

            $bulanLalu = $this->transactions()
                ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
                ->where('status', 'completed')
                ->sum('grand_total');

            $omsetBulanIni = $bulanIni->omset ?? 0;
            $transaksiBulanIni = $bulanIni->transaksi_count ?? 0;

            $growth = 0;
            if ($bulanLalu > 0) {
                $growth = (($omsetBulanIni - $bulanLalu) / $bulanLalu) * 100;
            }

            $kasirAktif = $this->kasirs()->where('status', 'aktif')->count();

            $stokMenipis = 0;

            return [
                'omset_bulan_ini' => (int)$omsetBulanIni,
                'transaksi_bulan' => (int)$transaksiBulanIni,
                'transaksi_hari_ini' => $this->transactions()->whereDate('created_at', today())->count(),
                'rata_transaksi' => $transaksiBulanIni > 0 ? (int)round($omsetBulanIni / $transaksiBulanIni) : 0,
                'growth_persen' => round($growth, 1),
                'kasir_aktif_count' => $kasirAktif,
                'stok_menipis' => $stokMenipis,
                'stok_habis' => 0,
                'produk_terlaris' => [
                    'nama' => '-',
                    'qty_terjual' => 0,
                    'revenue' => 0,
                ],
            ];
        });
    }

    public function getTargetBulanIniAttribute()
    {
        return $this->targets()
            ->where('bulan', now()->month)
            ->where('tahun', now()->year)
            ->first();
    }
}