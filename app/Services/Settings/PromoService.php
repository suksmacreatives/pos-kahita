<?php

namespace App\Services\Settings;

use App\Models\Promo;
use Illuminate\Support\Str;

class PromoService
{
    public function getAll(array $filters = []): array
    {
        Promo::where('status', 'aktif')
            ->where('berlaku_sampai', '<', now())
            ->update(['status' => 'nonaktif']);

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
                'beli' => $promo->beli,
                'gratis' => $promo->gratis,
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
            'beli' => $promo->beli,
            'gratis' => $promo->gratis,
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

        return Promo::create($this->normalizeDates($data));
    }

    public function update(int $id, array $data): Promo
    {
        $promo = Promo::findOrFail($id);
        $promo->update($this->normalizeDates($data));

        return $promo;
    }

    private function normalizeDates(array $data): array
    {
        if (!empty($data['berlaku_dari']) && is_string($data['berlaku_dari'])) {
            $data['berlaku_dari'] = $this->normalizeDate($data['berlaku_dari'], true);
        }

        if (!empty($data['berlaku_sampai']) && is_string($data['berlaku_sampai'])) {
            $data['berlaku_sampai'] = $this->normalizeDate($data['berlaku_sampai'], false);
        }

        return $data;
    }

    private function normalizeDate(string $value, bool $startOfDay): string
    {
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            return $value . ($startOfDay ? ' 00:00:00' : ' 23:59:59');
        }

        return $value;
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
