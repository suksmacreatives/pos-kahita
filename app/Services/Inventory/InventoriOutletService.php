<?php

namespace App\Services\Inventory;

use App\Models\DistributionOrder;
use App\Models\DistributionOrderItem;
use App\Models\Outlet;
use App\Models\OutletStock;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use App\Models\StockOpname;
use App\Models\StockOpnameItem;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InventoriOutletService
{
    public const STATUS_NORMAL = 'normal';
    public const STATUS_MENIPIS = 'menipis';
    public const STATUS_HABIS = 'habis';

    public function getStokPerOutlet(?int $outletId = null): array
    {
        $outlets = $outletId ? Outlet::where('id', $outletId)->get() : Outlet::all();

        $result = [];
        foreach ($outlets as $outlet) {
            $products = Product::whereJsonContains('outlet_ids', (string) $outlet->id)
                ->orWhere('outlet_id', $outlet->id)
                ->with(['variants', 'category'])
                ->get();

            $stokPerVariant = OutletStock::where('outlet_id', $outlet->id)
                ->get()
                ->keyBy('product_variant_id');

            $result[$outlet->slug] = $products->map(function ($p) use ($outlet, $stokPerVariant) {
                $variants = $p->variants->map(function ($v) use ($stokPerVariant) {
                    $stok = $stokPerVariant->get($v->id);
                    return [
                        'ukuran' => $v->size ?? '',
                        'warna' => is_array($v->color) ? ($v->color['hex'] ?? '#000000') : ($v->color ?? '#000000'),
                        'stok' => (int) ($stok?->stock ?? 0),
                        'sku' => $v->sku,
                    ];
                });

                $totalStok = $variants->sum('stok');
                $stokMinimum = 10;

                return [
                    'id' => $p->id,
                    'kode_produk' => $p->sku,
                    'nama_produk' => $p->name,
                    'kategori' => $p->category?->name ?? '',
                    'harga_beli' => (int) $p->cost_price,
                    'warna_hex' => $this->getFirstVariantColor($p->variants),
                    'foto_color' => $this->getFirstVariantColor($p->variants),
                    'varian' => $variants->toArray(),
                    'total_stok' => $totalStok,
                    'stok_minimum' => $stokMinimum,
                    'tgl_terakhir_masuk' => null,
                    'tgl_terakhir_terjual' => null,
                    'status' => $this->getStatusLabel($totalStok, $stokMinimum),
                ];
            })->values()->toArray();
        }

        return $result;
    }

    public function getStatsPerOutlet(?int $outletId = null): array
    {
        $outlets = $outletId ? Outlet::where('id', $outletId)->get() : Outlet::all();

        $result = [];
        foreach ($outlets as $outlet) {
            $products = Product::whereJsonContains('outlet_ids', (string) $outlet->id)
                ->orWhere('outlet_id', $outlet->id)
                ->with('variants')
                ->get();

            $stokPerVariant = OutletStock::where('outlet_id', $outlet->id)
                ->get()
                ->keyBy('product_variant_id');

            $totalSku = $products->count();
            $totalStok = 0;
            $nilaiStok = 0;
            $menipis = 0;
            $habis = 0;

            foreach ($products as $p) {
                $stok = 0;
                foreach ($p->variants as $v) {
                    $os = $stokPerVariant->get($v->id);
                    $stok += (int) ($os?->stock ?? 0);
                }
                $totalStok += $stok;
                $nilaiStok += $stok * (int) $p->cost_price;

                if ($stok <= 0) {
                    $habis++;
                } elseif ($stok < 10) {
                    $menipis++;
                }
            }

            $pendingTerima = DistributionOrder::where('outlet_id', $outlet->id)
                ->whereIn('status', ['dikirim', 'sebagian'])
                ->count();

            $result[$outlet->slug] = [
                'total_sku' => $totalSku,
                'total_stok' => $totalStok,
                'nilai_stok' => $nilaiStok,
                'menipis' => $menipis,
                'habis' => $habis,
                'pending_terima' => $pendingTerima,
            ];
        }

        return $result;
    }

    public function getPerbandinganStok(int $hari = 7): array
    {
        $outlets = Outlet::all();
        $data = [];

        for ($i = $hari - 1; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $label = $date->format('d M');

            $entry = ['tanggal' => $label];

            foreach ($outlets as $outlet) {
                $movements = StockMovement::where('outlet_id', $outlet->id)
                    ->whereDate('created_at', '<=', $date)
                    ->whereDate('created_at', '>=', $date->copy()->subDays(30))
                    ->get();

                $totalIn = $movements->whereIn('type', ['penerimaan_outlet', 'transfer_masuk'])->sum('qty');
                $totalOut = $movements->whereIn('type', ['transfer_keluar', 'retur_gudang', 'sale', 'koreksi_opname'])->sum('qty');

                $entry[$outlet->slug] = max(0, $totalIn - $totalOut);
            }

            $data[] = $entry;
        }

        return $data;
    }

    public function getPenerimaanList(?int $outletId = null): array
    {
        $query = DistributionOrder::with(['items', 'outlet'])
            ->whereIn('status', ['dikirim', 'sebagian', 'diterima']);

        if ($outletId) {
            $query->where('outlet_id', $outletId);
        }

        $orders = $query->latest()->get();

        $result = [];
        foreach ($orders as $do) {
            $slug = $do->outlet?->slug ?? 'unknown';
            $result[$slug][] = [
                'id' => $do->id,
                'nomor_do' => $do->nomor_do,
                'nomor_terima' => $do->tanggal_terima ? ('TR-' . $do->nomor_do) : null,
                'tgl_kirim_gudang' => $do->tanggal_kirim?->format('Y-m-d'),
                'tgl_terima_outlet' => $do->tanggal_terima?->format('Y-m-d'),
                'items' => $do->items->map(fn ($item) => [
                    'id' => $item->id,
                    'produk_id' => $item->product_id,
                    'nama' => $item->nama,
                    'ukuran' => $item->ukuran ?? '',
                    'warna' => $item->warna ?? '#000000',
                    'qty_kirim' => (int) $item->qty,
                    'qty_terima' => (int) ($item->qty_terima ?? 0),
                    'catatan' => $item->catatan ?? '',
                ])->toArray(),
                'total_item' => $do->items->count(),
                'total_qty' => (int) $do->total_qty,
                'status' => $this->mapPenerimaanStatus($do->status),
                'diterima_oleh' => null,
            ];
        }

        return $result;
    }

    public function konfirmasiTerima(int $doId, array $items, ?string $penerima = null): void
    {
        $do = DistributionOrder::with('items.product', 'items.productVariant')->findOrFail($doId);

        DB::transaction(function () use ($do, $items, $penerima) {
            $totalTerima = 0;
            $totalSebagian = 0;
            $outletId = $do->outlet_id;

            foreach ($items as $itemData) {
                $item = $do->items()->findOrFail($itemData['id']);

                $qtyTerima = (int) ($itemData['qty_terima'] ?? 0);
                $kondisi = $itemData['kondisi'] ?? 'baik';
                $catatan = $itemData['catatan'] ?? '';

                if ($qtyTerima > $item->qty) {
                    throw new \App\Exceptions\InsufficientStockException(
                        "Qty terima {$item->nama} melebihi qty kirim ({$item->qty})"
                    );
                }

                $item->update([
                    'qty_terima' => $qtyTerima,
                    'kondisi' => $kondisi,
                    'catatan' => $catatan,
                ]);

                if ($qtyTerima > 0) {
                    $variant = $item->productVariant;
                    if ($variant) {
                        $outletStock = OutletStock::where([
                            'outlet_id' => $outletId,
                            'product_variant_id' => $variant->id,
                        ])->first();

                        if ($outletStock) {
                            $outletStock->increment('stock', $qtyTerima);
                        } else {
                            OutletStock::create([
                                'outlet_id' => $outletId,
                                'product_variant_id' => $variant->id,
                                'stock' => $qtyTerima,
                            ]);
                        }
                    }

                    $product = $item->product;
                    if ($product) {
                        $ids = $product->outlet_ids ?? [];
                        if (!in_array((string) $outletId, $ids, true)) {
                            $ids[] = (string) $outletId;
                            $product->update(['outlet_ids' => $ids]);
                        }
                    }

                    StockMovement::create([
                        'product_variant_id' => $variant?->id,
                        'outlet_id' => $outletId,
                        'type' => 'penerimaan_outlet',
                        'reference_type' => 'distribution_order',
                        'reference_id' => $do->id,
                        'qty' => $qtyTerima,
                        'note' => 'Penerimaan dari gudang: ' . ($item->nama ?? ''),
                        'user_id' => Auth::id(),
                    ]);
                }

                $totalTerima += $qtyTerima;
                if ($qtyTerima < $item->qty) {
                    $totalSebagian++;
                }
            }

            $status = $totalSebagian > 0 ? 'sebagian' : 'diterima';

            $do->update([
                'tanggal_terima' => now()->format('Y-m-d'),
                'status' => $status,
            ]);
        });
    }

    public function getOutletList(): array
    {
        return Outlet::all()->map(fn ($o) => [
            'id' => $o->slug,
            'nama' => $o->name,
            'warna' => $o->warna ?? 'emerald',
            'kota' => $o->kota ?? '',
            'hexColor' => $o->warna_hex ?? '#10B981',
        ])->toArray();
    }

    private function getStatusLabel(int $total, int $min): string
    {
        if ($total <= 0) return self::STATUS_HABIS;
        if ($total < $min) return self::STATUS_MENIPIS;
        return self::STATUS_NORMAL;
    }

    private function getFirstVariantColor($variants): string
    {
        $first = $variants->first();
        if (!$first) return '#000000';
        return is_array($first->color) ? ($first->color['hex'] ?? '#000000') : ($first->color ?? '#000000');
    }

    private function mapPenerimaanStatus(string $status): string
    {
        return match ($status) {
            'dikirim' => 'menunggu',
            'sebagian' => 'sebagian',
            'diterima' => 'diterima',
            default => $status,
        };
    }
}
