<?php

namespace App\Services\Inventory;

use App\Models\OutletStock;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use App\Models\StockOpname;
use App\Models\StockOpnameItem;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OpnameOutletService
{
    public function getOpnameList(?int $outletId = null): array
    {
        $query = StockOpname::with('items');

        if ($outletId) {
            $query->where('outlet_id', $outletId);
        }

        $result = [];
        foreach ($query->latest()->get() as $o) {
            $slug = $o->outlet?->slug ?? 'unknown';
            $result[$slug][] = [
                'id' => $o->id,
                'nomor_opname' => $o->nomor_opname,
                'outlet_id' => $slug,
                'tgl_mulai' => $o->tanggal_mulai?->format('Y-m-d'),
                'tgl_selesai' => $o->tanggal_selesai?->format('Y-m-d'),
                'status' => $o->status,
                'items' => $o->items->map(fn ($item) => [
                    'produk_id' => $item->product_id,
                    'nama' => $item->nama,
                    'ukuran' => $item->ukuran ?? '',
                    'warna' => $item->warna ?? '#000000',
                    'stok_sistem' => (int) $item->stok_sistem,
                    'stok_fisik' => (int) $item->stok_fisik,
                    'selisih' => (int) $item->selisih,
                    'keterangan' => $item->keterangan ?? '',
                ])->toArray(),
                'total_item' => $o->items->count(),
                'total_selisih_plus' => (int) $o->total_selisih_plus,
                'total_selisih_minus' => (int) $o->total_selisih_minus,
                'dilakukan_oleh' => $o->petugas ?? '',
            ];
        }

        return $result;
    }

    public function startOpname(array $data): array
    {
        $outletId = $data['outlet_id'];
        $petugas = $data['petugas'];
        $scope = $data['scope'] ?? 'all';

        $products = Product::whereJsonContains('outlet_ids', (string) $outletId)
            ->orWhere('outlet_id', $outletId)
            ->with('variants');

        if ($scope !== 'all') {
            $products->whereHas('category', fn ($q) => $q->where('name', $scope));
        }

        $products = $products->get();

        $stokPerVariant = OutletStock::where('outlet_id', $outletId)
            ->get()
            ->keyBy('product_variant_id');

        $snapshotItems = [];
        foreach ($products as $p) {
            foreach ($p->variants as $v) {
                $stokSistem = (int) ($stokPerVariant->get($v->id)?->stock ?? 0);
                $snapshotItems[] = [
                    'product_id' => $p->id,
                    'product_variant_id' => $v->id,
                    'nama' => $p->name,
                    'kategori' => $p->category?->name ?? '',
                    'ukuran' => $v->size ?? '',
                    'warna' => is_array($v->color) ? ($v->color['hex'] ?? '#000000') : ($v->color ?? '#000000'),
                    'stok_sistem' => $stokSistem,
                ];
            }
        }

        return [
            'outlet_id' => $outletId,
            'petugas' => $petugas,
            'scope' => $scope,
            'items' => $snapshotItems,
            'total_item' => count($snapshotItems),
        ];
    }

    public function finishOpname(int $opnameId, array $items): void
    {
        DB::transaction(function () use ($opnameId, $items) {
            $opname = StockOpname::findOrFail($opnameId);

            if ($opname->status !== 'berlangsung') {
                throw new \App\Exceptions\InsufficientStockException(
                    'Opname sudah selesai atau tidak dalam status berlangsung'
                );
            }

            $totalSelisihPlus = 0;
            $totalSelisihMinus = 0;

            foreach ($items as $itemData) {
                $stokSistem = (int) ($itemData['stok_sistem'] ?? 0);
                $stokFisik = (int) ($itemData['stok_fisik'] ?? 0);
                $selisih = $stokFisik - $stokSistem;

                if ($selisih > 0) {
                    $totalSelisihPlus += $selisih;
                } elseif ($selisih < 0) {
                    $totalSelisihMinus += abs($selisih);
                }

                StockOpnameItem::create([
                    'stock_opname_id' => $opnameId,
                    'product_id' => $itemData['product_id'],
                    'product_variant_id' => $itemData['product_variant_id'],
                    'nama' => $itemData['nama'],
                    'ukuran' => $itemData['ukuran'] ?? null,
                    'warna' => $itemData['warna'] ?? null,
                    'stok_sistem' => $stokSistem,
                    'stok_fisik' => $stokFisik,
                    'selisih' => $selisih,
                    'keterangan' => $itemData['keterangan'] ?? null,
                ]);

                if ($selisih !== 0) {
                    $variantId = $itemData['product_variant_id'];

                    OutletStock::updateOrCreate(
                        [
                            'outlet_id' => $opname->outlet_id,
                            'product_variant_id' => $variantId,
                        ],
                        [
                            'stock' => max(0, $stokFisik),
                        ]
                    );

                    StockMovement::create([
                        'product_variant_id' => $variantId,
                        'outlet_id' => $opname->outlet_id,
                        'type' => 'koreksi_opname',
                        'reference_type' => 'stock_opname',
                        'reference_id' => $opnameId,
                        'qty' => $selisih,
                        'note' => "Koreksi opname: {$itemData['nama']} (sistem: {$stokSistem}, fisik: {$stokFisik})",
                        'user_id' => Auth::id(),
                    ]);
                }
            }

            $opname->update([
                'tanggal_selesai' => now()->format('Y-m-d'),
                'total_item' => count($items),
                'total_selisih_plus' => $totalSelisihPlus,
                'total_selisih_minus' => $totalSelisihMinus,
                'status' => 'selesai',
            ]);
        });
    }

    public function createOpnameSession(int $outletId, string $petugas, string $scope = 'all'): StockOpname
    {
        $nomorOpname = 'OPO-' . now()->format('Ymd') . '-' . str_pad(
            StockOpname::where('outlet_id', $outletId)->count() + 1, 3, '0', STR_PAD_LEFT
        );

        return StockOpname::create([
            'nomor_opname' => $nomorOpname,
            'outlet_id' => $outletId,
            'tanggal_mulai' => now()->format('Y-m-d'),
            'petugas' => $petugas,
            'scope' => $scope,
            'status' => 'berlangsung',
            'total_item' => 0,
            'total_selisih_plus' => 0,
            'total_selisih_minus' => 0,
        ]);
    }

    public function getOpnameSessionById(int $opnameId): ?StockOpname
    {
        return StockOpname::with('items')->find($opnameId);
    }
}
