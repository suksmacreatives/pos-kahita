<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OutletTarget extends Model
{
    use HasFactory;

    protected $table = 'outlet_targets';

    protected $fillable = [
        'outlet_id',
        'bulan',
        'tahun',
        'target_omset',
        'target_transaksi'
    ];

    public function outlet()
    {
        return $this->belongsTo(Outlet::class, 'outlet_id');
    }

    public function getRealisasiOmsetAttribute()
    {
        return $this->outlet->transactions()
            ->whereMonth('created_at', $this->bulan)
            ->whereYear('created_at', $this->tahun)
            ->where('status', 'completed')
            ->sum('grand_total') ?? 0;
    }

    public function getRealisasiTransaksiAttribute()
    {
        return $this->outlet->transactions()
            ->whereMonth('created_at', $this->bulan)
            ->whereYear('created_at', $this->tahun)
            ->where('status', 'completed')
            ->count() ?? 0;
    }

    public function getPersenOmsetAttribute()
    {
        if ($this->target_omset <= 0) return 0;
        return round(($this->realisasi_omset / $this->target_omset) * 100, 1);
    }

    public function getPersenTransaksiAttribute()
    {
        if ($this->target_transaksi <= 0) return 0;
        return round(($this->realisasi_transaksi / $this->target_transaksi) * 100, 1);
    }

    public function getStatusTargetAttribute()
    {
        $pct = $this->persen_omset;
        if ($pct >= 100) return 'achieved';
        if ($pct >= 80) return 'on_track';
        if ($pct >= 50) return 'at_risk';
        return 'behind';
    }
}
