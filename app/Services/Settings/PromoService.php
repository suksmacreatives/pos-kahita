<?php

namespace App\Services\Settings;

use App\Models\Promo;
use Illuminate\Support\Str;

class PromoService
{
    public function getAll(array $filters = []): array
    {
        $query = Promo::with('creator:id,name')->orderBy('created_at', 'desc');

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('nama_promo', 'like', "%{$filters['search']}%")
                  ->orWhere('kode_promo', 'like', "%{$filters['search']}%");
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['tipe'])) {
            $query->where('tipe', $filters['tipe']);
        }

        $promos = $query->get()->map(function ($promo) {
            return [
                'id' => $promo->id,
                'nama_promo' => $promo->nama_promo,
                'kode_promo' => $promo->kode_promo,
                'deskripsi' => $promo->deskripsi,
                'tipe' => $promo->tipe,
                'nilai_diskon' => (float) $promo->nilai_diskon,
                'min_transaksi' => (float) $promo->min_transaksi,
                'max_diskon' => $promo->max_diskon ? (float) $promo->max_diskon : null,
                'berlaku_dari' => $promo->berlaku_dari,
                'berlaku_sampai' => $promo->berlaku_sampai,
                'berlaku_di' => $promo->berlaku_di,
                'berlaku_untuk' => $promo->berlaku_untuk,
                'kuota' => $promo->kuota,
                'terpakai' => $promo->terpakai,
                'status' => $promo->status,
                'dibuat_oleh' => $promo->creator?->name,
                'created_at' => $promo->created_at,
            ];
        });

        $stats = $this->computeStats($promos);

        return [
            'promos' => $promos->values()->toArray(),
            'promo_stats' => $stats,
        ];
    }

    public function find(int $id): array
    {
        $promo = Promo::with('creator:id,name')->findOrFail($id);

        return [
            'id' => $promo->id,
            'nama_promo' => $promo->nama_promo,
            'kode_promo' => $promo->kode_promo,
            'deskripsi' => $promo->deskripsi,
            'tipe' => $promo->tipe,
            'nilai_diskon' => (float) $promo->nilai_diskon,
            'min_transaksi' => (float) $promo->min_transaksi,
            'max_diskon' => $promo->max_diskon ? (float) $promo->max_diskon : null,
            'berlaku_dari' => $promo->berlaku_dari,
            'berlaku_sampai' => $promo->berlaku_sampai,
            'berlaku_di' => $promo->berlaku_di,
            'berlaku_untuk' => $promo->berlaku_untuk,
            'kuota' => $promo->kuota,
            'terpakai' => $promo->terpakai,
            'status' => $promo->status,
            'dibuat_oleh' => $promo->creator?->name,
            'created_at' => $promo->created_at,
        ];
    }

    public function create(array $data): Promo
    {
        $data['kode_promo'] = $data['kode_promo'] ?? $this->generateCode();

        return Promo::create($data);
    }

    public function update(int $id, array $data): Promo
    {
        $promo = Promo::findOrFail($id);
        $promo->update($data);

        return $promo;
    }

    public function toggleStatus(int $id): Promo
    {
        $promo = Promo::findOrFail($id);
        $statusMap = [
            'aktif' => 'nonaktif',
            'nonaktif' => 'aktif',
        ];
        $promo->update(['status' => $statusMap[$promo->status] ?? 'nonaktif']);

        return $promo;
    }

    public function duplicate(int $id): Promo
    {
        $original = Promo::findOrFail($id);
        $data = $original->toArray();
        unset($data['id'], $data['created_at'], $data['updated_at']);
        $data['kode_promo'] = $this->generateCode();
        $data['status'] = 'nonaktif';
        $data['terpakai'] = 0;

        return Promo::create($data);
    }

    public function delete(int $id): void
    {
        Promo::findOrFail($id)->delete();
    }

    public function generateCode(): string
    {
        return strtoupper(Str::random(8));
    }

    private function computeStats($promos): array
    {
        $all = $promos->collect();
        $now = now();

        return [
            'total' => $all->count(),
            'aktif' => $all->where('status', 'aktif')->count(),
            'hampir_habis' => $all->filter(function ($p) use ($now) {
                if ($p['status'] !== 'aktif') return false;
                $s = is_string($p['berlaku_sampai']) ? new \DateTime($p['berlaku_sampai']) : $p['berlaku_sampai'];
                $diff = $s->diff($now)->days;
                return $diff >= 0 && $diff <= 3;
            })->count(),
            'total_terpakai' => $all->sum('terpakai'),
        ];
    }
}
