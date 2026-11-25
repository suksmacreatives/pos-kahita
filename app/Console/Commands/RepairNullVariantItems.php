<?php

namespace App\Console\Commands;

use App\Models\DistributionOrderItem;
use App\Models\ProductVariant;
use App\Models\PurchaseOrderItem;
use App\Models\StockOpnameItem;
use App\Models\SupplierReturnItem;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Mengisi `product_variant_id` yang NULL di dokumen inventaris.
 *
 * Dokumen lama bisa punya `product_variant_id` NULL karena varian dibuat
 * setelah PO/DO dibuat: saat itu pencarian varian gagal, dokumen tetap
 * disimpan, dan stok tidak pernah bergerak karena semua jalur stok melewati
 * item yang varian-nya kosong. Perintah ini hanya MENAMBAL relasi varian —
 * angka stok sengaja tidak disentuh supaya tidak ada risiko stok dobel.
 * Koreksi jumlah stok tetap lewat Stock Opname setelah dicek fisik.
 */
class RepairNullVariantItems extends Command
{
    protected $signature = 'inventory:repair-null-variants {--dry-run : Tampilkan saja tanpa mengubah data}';

    protected $description = 'Isi product_variant_id yang NULL di PO/DO/retur/opname tanpa mengubah stok';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $sources = [
            'purchase_order_items' => PurchaseOrderItem::class,
            'distribution_order_items' => DistributionOrderItem::class,
            'supplier_return_items' => SupplierReturnItem::class,
            'stock_opname_items' => StockOpnameItem::class,
        ];

        $totalFixed = 0;
        $totalFailed = 0;

        foreach ($sources as $label => $model) {
            $items = $model::query()->whereNull('product_variant_id')->get();

            if ($items->isEmpty()) {
                $this->line("  <fg=gray>{$label}: tidak ada item varian NULL</>");
                continue;
            }

            $this->newLine();
            $this->line("<fg=cyan>{$label}</> — {$items->count()} item varian NULL");

            foreach ($items as $item) {
                $variant = $this->cariVarian(
                    $item->product_id,
                    $item->ukuran ?? null,
                    $item->warna ?? null
                );

                if (! $variant) {
                    $totalFailed++;
                    $this->line("    <fg=red>GAGAL</>  #{$item->id} '{$item->nama}' (".($item->ukuran ?? '-').' / '.($item->warna ?? '-').") — varian tidak ada");

                    continue;
                }

                $totalFixed++;

                $this->line(sprintf(
                    '    <fg=green>OK</>    #%d %-24s → %s%s',
                    $item->id,
                    $item->nama,
                    $variant->sku,
                    $dryRun ? ' (dry-run, belum disimpan)' : ''
                ));

                if (! $dryRun) {
                    $item->update(['product_variant_id' => $variant->id]);
                    Log::info('Repair null variant', [
                        'model' => $model,
                        'item_id' => $item->id,
                        'product_variant_id' => $variant->id,
                    ]);
                }
            }
        }

        $this->newLine();

        if ($dryRun) {
            $this->info("Dry-run selesai. {$totalFixed} item akan ditambal, {$totalFailed} gagal. Jalankan tanpa --dry-run untuk menerapkan.");
        } else {
            $this->info("Selesai. {$totalFixed} item ditambal, {$totalFailed} gagal. Stok tidak diubah.");
        }

        if ($totalFailed > 0) {
            $this->comment('Item gagal perlu ditangani manual: jalankan Stock Opname untuk menyesuaikan stok fisik.');
        }

        return $totalFailed > 0 ? 1 : 0;
    }

    private function cariVarian(int $productId, ?string $ukuran, ?string $warna): ?ProductVariant
    {
        return ProductVariant::where('product_id', $productId)
            ->when(! empty($warna), fn ($q) => $q->where('color', $warna))
            ->when(empty($warna), fn ($q) => $q->where(fn ($w) => $w->whereNull('color')->orWhere('color', '')))
            ->when(! empty($ukuran), fn ($q) => $q->where('size', $ukuran))
            ->when(empty($ukuran), fn ($q) => $q->where(fn ($w) => $w->whereNull('size')->orWhere('size', '')))
            ->first();
    }
}