<?php

namespace App\Services\Inventory;

use App\Models\Outlet;
use App\Models\OutletReturn;
use App\Models\OutletReturnItem;
use App\Models\OutletStock;
use App\Models\StockMovement;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ReturGudangService
{
    public function getReturList(?int $outletId = null): array
    {
        $query = OutletReturn::with(['outlet', 'items']);

        if ($outletId) {
            $query->where('outlet_id', $outletId);
        }

        $returns = $query->latest()->get();

        $result = [];
        foreach ($returns as $r) {
            $slug = $r->outlet?->slug ?? 'unknown';
            $result[$slug][] = [
                'id' => $r->id,
                'nomor_retur' => $r->nomor_retur,
                'outlet_id' => $r->outlet?->slug ?? $r->outlet_id,
                'outlet_nama' => $r->outlet?->name ?? '',
                'tgl_retur' => $r->tgl_retur?->format('Y-m-d'),
                'alasan' => $r->alasan,
                'items' => $r->items->map(fn ($item) => [
                    'produk_id' => $item->product_id,
                    'nama' => $item->nama,
                    'ukuran' => $item->ukuran ?? '',
                    'warna' => $item->warna ?? '#000000',
                    'qty' => (int) $item->qty,
                    'catatan' => $item->catatan ?? '',
                ])->toArray(),
                'total_item' => $r->items->count(),
                'total_qty' => (int) $r->total_qty,
                'status' => $r->status,
                'catatan' => $r->catatan ?? '',
            ];
        }

        return $result;
    }

    public function processRetur(array $data): OutletReturn
    {
        return DB::transaction(function () use ($data) {
            $outletId = $data['outlet_id'];
            $items = $data['items'];
            $totalQty = 0;

            foreach ($items as $item) {
                $stok = OutletStock::where('outlet_id', $outletId)
                    ->where('product_variant_id', $item['product_variant_id'])
                    ->value('stock') ?? 0;

                if ($stok < $item['qty']) {
                    throw new \App\Exceptions\InsufficientStockException(
                        "Stok {$item['nama']} tidak mencukupi untuk retur. Tersedia: {$stok}"
                    );
                }
                $totalQty += (int) $item['qty'];
            }

            $nomorRetur = 'RO-' . now()->format('Ymd') . '-' . str_pad(
                OutletReturn::max('id') + 1, 3, '0', STR_PAD_LEFT
            );

            $retur = OutletReturn::create([
                'nomor_retur' => $nomorRetur,
                'outlet_id' => $outletId,
                'tgl_retur' => $data['tgl_retur'],
                'alasan' => $data['alasan'],
                'status' => 'diajukan',
                'catatan' => $data['catatan'] ?? null,
                'total_item' => count($items),
                'total_qty' => $totalQty,
            ]);

            foreach ($items as $item) {
                OutletReturnItem::create([
                    'outlet_return_id' => $retur->id,
                    'product_id' => $item['product_id'],
                    'product_variant_id' => $item['product_variant_id'],
                    'nama' => $item['nama'],
                    'ukuran' => $item['ukuran'] ?? null,
                    'warna' => $item['warna'] ?? null,
                    'qty' => (int) $item['qty'],
                    'catatan' => $item['catatan'] ?? null,
                ]);

                OutletStock::where('outlet_id', $outletId)
                    ->where('product_variant_id', $item['product_variant_id'])
                    ->decrement('stock', (int) $item['qty']);

                StockMovement::create([
                    'product_variant_id' => $item['product_variant_id'],
                    'outlet_id' => $outletId,
                    'type' => 'retur_gudang',
                    'reference_type' => 'outlet_return',
                    'reference_id' => $retur->id,
                    'qty' => -((int) $item['qty']),
                    'note' => "Retur ke gudang: {$item['nama']} - {$data['alasan']}",
                    'user_id' => Auth::id(),
                ]);
            }

            return $retur;
        });
    }

    public function cancelRetur(int $returId): void
    {
        DB::transaction(function () use ($returId) {
            $retur = OutletReturn::with('items')->findOrFail($returId);

            if ($retur->status !== 'diajukan') {
                throw new \App\Exceptions\InsufficientStockException(
                    'Hanya retur dengan status diajukan yang bisa dibatalkan'
                );
            }

            foreach ($retur->items as $item) {
                $outletStock = OutletStock::where([
                    'outlet_id' => $retur->outlet_id,
                    'product_variant_id' => $item->product_variant_id,
                ])->first();

                if ($outletStock) {
                    $outletStock->increment('stock', $item->qty);
                } else {
                    OutletStock::create([
                        'outlet_id' => $retur->outlet_id,
                        'product_variant_id' => $item->product_variant_id,
                        'stock' => $item->qty,
                    ]);
                }
            }

            $retur->update(['status' => 'dibatalkan']);
        });
    }
}
