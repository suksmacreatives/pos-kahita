<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role', // changing from 'user' to 'role' assuming standard
        'outlet_id',
        'shift_default',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'status' => 'string',
        ];
    }
    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function sesiKasirs()
    {
        return $this->hasMany(SesiKasir::class);
    }

    public function shifts()
    {
        return $this->hasMany(Shift::class, 'user_id');
    }

    public function getKasirStatsAttribute()
    {
        $now = now();
        $bulanIni = $this->transactions()
            ->whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->selectRaw('
                COUNT(id) as total_transaksi,
                SUM(CASE WHEN status = "completed" THEN grand_total ELSE 0 END) as total_omset,
                SUM(CASE WHEN status = "void" THEN 1 ELSE 0 END) as void_count
            ')
            ->first();

        $totalTransaksi = $bulanIni->total_transaksi ?? 0;
        $totalOmset = (int)($bulanIni->total_omset ?? 0);
        $voidCount = (int)($bulanIni->void_count ?? 0);

        $rataTransaksi = $totalTransaksi > 0 ? $totalOmset / $totalTransaksi : 0;
        $voidRate = $totalTransaksi > 0 ? ($voidCount / $totalTransaksi) * 100 : 0;

        return [
            'total_transaksi_bulan' => $totalTransaksi,
            'total_omset_bulan' => $totalOmset,
            'rata_transaksi' => (int)$rataTransaksi,
            'void_count_bulan' => $voidCount,
            'void_rate' => round($voidRate, 1),
            'refund_count_bulan' => 0, // placeholder if refund logic added
            'shift_hadir_bulan' => $this->attendances()->whereMonth('date', $now->month)->count(),
            'shift_total_bulan' => 22, // placeholder logic
        ];
    }

    public function hasRole($roles): bool
    {
        $roles = is_array($roles) ? $roles : [$roles];
        return in_array($this->role, $roles);
    }

    public function scopeKasir($query)
    {
        return $query->where('role', 'cashier'); // updated from "kasir" per user spec
    }
}
