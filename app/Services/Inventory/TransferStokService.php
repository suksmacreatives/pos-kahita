<?php

namespace App\Services\Inventory;

use App\Models\Outlet;
use App\Models\OutletStock;
use App\Models\OutletTransfer;
use App\Models\OutletTransferItem;
use App\Models\StockMovement;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TransferStokService
{
    public function getTransferList(?int $outletId = null, string $view = 'all'): array
    {
        $query = OutletTransfer::with(['outletAsal', 'outletTujuan', 'items']);

        if ($outletId && $view === 'keluar') {
            $query->where('outlet_asal_id', $outletId);
        } elseif ($outletId && $view === 'masuk') {
            $query->where('outlet_tujuan_id', $outletId);
        } elseif ($outletId) {
            $query->where(function ($q) use ($outletId) {
                $q->where('outlet_asal_id', $outletId)
                  ->orWhere('outlet_tujuan_id', $outletId);
            });
        }

        return $query->latest()->get()->map(fn ($t) => [
            'id' => $t->id,
            'nomor_transfer' => $t->nomor_transfer,
            'outlet_asal_id' => $t->outletAsal?->slug ?? $t->outlet_asal_id,
            'outlet_asal_nama' => $t->outletAsal?->name ?? '',
            'outlet_tujuan_id' => $t->outletTujuan?->slug ?? $t->outlet_tujuan_id,
            'outlet_tujuan_nama' => $t->outletTujuan?->name ?? '',
            'tgl_transfer' => $t->tgl_transfer?->format('Y-m-d'),
            'tgl_diterima' => $t->tgl_diterima?->format('Y-m-d'),
            'items' => $t->items->map(fn ($item) => [
                'produk_id' => $item->product_id,
                'nama' => $item->nama,
                'ukuran' => $item->ukuran ?? '',
                'warna' => $item->warna ?? '#000000',
                'qty' => (int) $item->qty,
            ])->toArray(),
            'total_item' => $t->items->count(),
            'total_qty' => (int) $t->total_qty,
            'alasan' => $t->alasan,
            'status' => $t->status,
            'dibuat_oleh' => $t->dibuat_oleh ?? '',
        ])->toArray();
    }

    public function processTransfer(array $data): OutletTransfer
    {
        return DB::transaction(function () use ($data) {
            $asalSlug = $data['outlet_asal_id'];
            $tujuanSlug = $data['outlet_tujuan_id'];

            if ($asalSlug === $tujuanSlug) {
                throw new \App\Exceptions\InsufficientStockException('Outlet asal dan tujuan harus berbeda');
            }

            $asal = Outlet::where('slug', $asalSlug)->firstOrFail();
            $tujuan = Outlet::where('slug', $tujuanSlug)->firstOrFail();

            if ($tujuan->status === 'nonaktif') {
                throw new \App\Exceptions\InsufficientStockException('Outlet tujuan tidak aktif');
            }

            $asalId = $asal->id;
            $tujuanId = $tujuan->id;

            $items = $data['items'];
            $totalQty = 0;
            $errors = [];

            foreach ($items as $idx => $item) {
                $variantId = $item['product_variant_id'];
                $qty = (int) $item['qty'];

                $outletStock = OutletStock::where('outlet_id', $asalId)
                    ->where('product_variant_id', $variantId)
                    ->first();

                $stokTersedia = (int) ($outletStock?->stock ?? 0);
                if ($stokTersedia < $qty) {
                    $errors[] = "Stok {$item['nama']} ukuran {$item['ukuran']} tidak mencukupi. Tersedia: {$stokTersedia}";
                }

                $totalQty += $qty;
            }

            if (!empty($errors)) {
                throw new \App\Exceptions\InsufficientStockException(implode('; ', $errors));
            }

            $nomorTransfer = 'TF-' . now()->format('Ymd') . '-' . str_pad(
                OutletTransfer::max('id') + 1, 3, '0', STR_PAD_LEFT
            );

            $transfer = OutletTransfer::create([
                'nomor_transfer' => $nomorTransfer,
                'outlet_asal_id' => $asalId,
                'outlet_tujuan_id' => $tujuanId,
                'tgl_transfer' => $data['tgl_transfer'],
                'alasan' => $data['alasan'],
                'status' => 'menunggu_konfirmasi',
                'dibuat_oleh' => Auth::user()?->name ?? 'System',
                'catatan' => $data['catatan'] ?? null,
                'total_item' => count($items),
                'total_qty' => $totalQty,
            ]);

            foreach ($items as $item) {
                $variantId = $item['product_variant_id'];
                $qty = (int) $item['qty'];

                OutletTransferItem::create([
                    'outlet_transfer_id' => $transfer->id,
                    'product_id' => $item['product_id'],
                    'product_variant_id' => $variantId,
                    'nama' => $item['nama'],
                    'ukuran' => $item['ukuran'] ?? null,
                    'warna' => $item['warna'] ?? null,
                    'qty' => $qty,
                ]);

                OutletStock::where('outlet_id', $asalId)
                    ->where('product_variant_id', $variantId)
                    ->decrement('stock', $qty);

                StockMovement::create([
                    'product_variant_id' => $variantId,
                    'outlet_id' => $asalId,
                    'type' => 'transfer_keluar',
                    'reference_type' => 'outlet_transfer',
                    'reference_id' => $transfer->id,
                    'qty' => -$qty,
                    'note' => "Transfer ke outlet: {$tujuan->name} - {$item['nama']}",
                    'user_id' => Auth::id(),
                ]);
            }

            return $transfer;
        });
    }

    public function confirmReceive(int $transferId): void
    {
        DB::transaction(function () use ($transferId) {
            $transfer = OutletTransfer::with('items')->findOrFail($transferId);

            if ($transfer->status !== 'menunggu_konfirmasi' && $transfer->status !== 'dikirim') {
                throw new \App\Exceptions\InsufficientStockException('Status transfer tidak valid untuk konfirmasi');
            }

            foreach ($transfer->items as $item) {
                $variantId = $item->product_variant_id;
                $qty = (int) $item->qty;

                $outletStock = OutletStock::where([
                    'outlet_id' => $transfer->outlet_tujuan_id,
                    'product_variant_id' => $variantId,
                ])->first();

                if ($outletStock) {
                    $outletStock->increment('stock', $qty);
                } else {
                    OutletStock::create([
                        'outlet_id' => $transfer->outlet_tujuan_id,
                        'product_variant_id' => $variantId,
                        'stock' => $qty,
                    ]);
                }

                StockMovement::create([
                    'product_variant_id' => $variantId,
                    'outlet_id' => $transfer->outlet_tujuan_id,
                    'type' => 'transfer_masuk',
                    'reference_type' => 'outlet_transfer',
                    'reference_id' => $transfer->id,
                    'qty' => $qty,
                    'note' => "Terima transfer dari: {$transfer->outletAsal?->name} - {$item->nama}",
                    'user_id' => Auth::id(),
                ]);
            }

            $transfer->update([
                'tgl_diterima' => now()->format('Y-m-d'),
                'status' => 'diterima',
            ]);
        });
    }

    public function cancelTransfer(int $transferId): void
    {
        DB::transaction(function () use ($transferId) {
            $transfer = OutletTransfer::with('items')->findOrFail($transferId);

            if ($transfer->status !== 'menunggu_konfirmasi') {
                throw new \App\Exceptions\InsufficientStockException(
                    'Hanya transfer dengan status menunggu yang bisa dibatalkan'
                );
            }

            foreach ($transfer->items as $item) {
                $outletStock = OutletStock::where([
                    'outlet_id' => $transfer->outlet_asal_id,
                    'product_variant_id' => $item->product_variant_id,
                ])->first();

                if ($outletStock) {
                    $outletStock->increment('stock', $item->qty);
                } else {
                    OutletStock::create([
                        'outlet_id' => $transfer->outlet_asal_id,
                        'product_variant_id' => $item->product_variant_id,
                        'stock' => $item->qty,
                    ]);
                }
            }

            $transfer->update(['status' => 'dibatalkan']);
        });
    }

    public function validateStokCukup(int $outletId, array $items): array
    {
        $valid = true;
        $errors = [];

        foreach ($items as $item) {
            $stok = OutletStock::where('outlet_id', $outletId)
                ->where('product_variant_id', $item['product_variant_id'])
                ->value('stock') ?? 0;

            if ($stok < $item['qty']) {
                $valid = false;
                $errors[] = [
                    'product_variant_id' => $item['product_variant_id'],
                    'message' => "Stok tidak cukup. Tersedia: {$stok}, diminta: {$item['qty']}",
                ];
            }
        }

        return ['valid' => $valid, 'errors' => $errors];
    }
}
