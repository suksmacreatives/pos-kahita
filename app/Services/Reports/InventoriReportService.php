<?php

namespace App\Services\Reports;

use App\Models\StockMovement;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockOpname;
use App\Models\Outlet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class InventoriReportService
{
    protected Carbon $dari;
    protected Carbon $sampai;
    protected Carbon $dariLalu;
    protected Carbon $sampaiLalu;
    protected string $outlet;

    public function __construct(Carbon $dari, Carbon $sampai, string $outlet = 'all', ?Carbon $dariLalu = null, ?Carbon $sampaiLalu = null)
    {
        $this->dari = $dari;
        $this->sampai = $sampai;
        $this->outlet = $outlet;
        $this->dariLalu = $dariLalu ?? $dari->copy()->subDays($sampai->diffInDays($dari) + 1);
        $this->sampaiLalu = $sampaiLalu ?? $dari->copy()->subDay();
    }

    public function all(): array
    {
        return Cache::remember(
            "report_inventori_{$this->dari->format('Ymd')}_{$this->sampai->format('Ymd')}_{$this->outlet}",
            300,
            fn() => [
                'mutasi_log' => $this->getMutasiStok(),
                'mutasi_summary' => $this->getMutasiSummary(),
                'nilai_per_lokasi' => $this->getNilaiPerLokasi(),
                'nilai_per_kategori' => $this->getNilaiPerKategori(),
                'stok_menipis' => $this->getStokMenipis(),
                'stok_habis' => $this->getStokHabis(),
                'opname_sessions' => $this->getHasilOpname(),
            ]
        );
    }

    public function getMutasiStok(): array
    {
        $query = StockMovement::with([
            'productVariant.product:id,name,category_id',
            'productVariant.product.category:id,name',
            'user:id,name'
        ])
            ->whereBetween('created_at', [$this->dari, $this->sampai->endOfDay()]);

        return $query->orderByDesc('created_at')
            ->limit(500)
            ->get()
            ->map(fn($m) => [
                'id' => $m->id,
                'tipe' => $this->normalizeTipeMutasi($m->type),
                'type' => $this->normalizeTipeMutasi($m->type),
                'qty' => $m->qty,
                'quantity' => $m->qty,
                'nama_produk' => $m->productVariant?->product?->name ?? 'Produk Dihapus',
                'produk' => $m->productVariant?->product?->name ?? 'Produk Dihapus',
                'nama' => $m->productVariant?->product?->name ?? 'Produk Dihapus',
                'kategori' => $m->productVariant?->product?->category?->name ?? '-',
                'dari' => $this->getSourceLocation($m),
                'sumber' => $this->getSourceLocation($m),
                'ke' => $this->getDestLocation($m),
                'tujuan' => $this->getDestLocation($m),
                'referensi' => $m->note,
                'ref' => $m->note,
                'tanggal' => $m->created_at->toDateTimeString(),
                'date' => $m->created_at->toDateTimeString(),
                'created_at' => $m->created_at->toDateTimeString(),
                'user' => $m->user?->name ?? 'Sistem',
            ])
            ->toArray();
    }

    public function getMutasiSummary(): array
    {
        $query = StockMovement::whereBetween('created_at', [$this->dari, $this->sampai->endOfDay()]);

        $summary = $query->selectRaw("
                SUM(CASE WHEN type IN ('restock','penerimaan','adjustment_plus') THEN qty ELSE 0 END) as masuk_qty,
                SUM(CASE WHEN type IN ('restock','penerimaan','adjustment_plus') THEN 1 ELSE 0 END) as masuk_trx,
                SUM(CASE WHEN type IN ('sale','adjustment_minus','rusak') THEN qty ELSE 0 END) as keluar_qty,
                SUM(CASE WHEN type IN ('sale','adjustment_minus','rusak') THEN 1 ELSE 0 END) as keluar_trx,
                SUM(CASE WHEN type = 'transfer' THEN qty ELSE 0 END) as transfer_qty,
                SUM(CASE WHEN type = 'transfer' THEN 1 ELSE 0 END) as transfer_trx,
                SUM(CASE WHEN type IN ('return','retur') THEN qty ELSE 0 END) as retur_qty,
                SUM(CASE WHEN type IN ('return','retur') THEN 1 ELSE 0 END) as retur_trx
            ")
            ->first();

        return [
            'masuk' => (int) ($summary->masuk_qty ?? 0),
            'masuk_qty' => (int) ($summary->masuk_qty ?? 0),
            'masuk_trx' => (int) ($summary->masuk_trx ?? 0),
            'keluar' => (int) ($summary->keluar_qty ?? 0),
            'keluar_qty' => (int) ($summary->keluar_qty ?? 0),
            'keluar_trx' => (int) ($summary->keluar_trx ?? 0),
            'transfer' => (int) ($summary->transfer_qty ?? 0),
            'transfer_qty' => (int) ($summary->transfer_qty ?? 0),
            'transfer_trx' => (int) ($summary->transfer_trx ?? 0),
            'retur' => (int) ($summary->retur_qty ?? 0),
            'retur_qty' => (int) ($summary->retur_qty ?? 0),
            'retur_trx' => (int) ($summary->retur_trx ?? 0),
        ];
    }

    public function getNilaiPerLokasi(): array
    {
        $outlets = Outlet::aktif()->get(['id', 'name']);

        return $outlets->map(function ($outlet) {
            $variants = ProductVariant::whereHas('product', function ($q) use ($outlet) {
                $q->where('outlet_id', $outlet->id)->orWhereJsonContains('outlet_ids', (string) $outlet->id);
            })
                ->selectRaw('COUNT(*) as total_sku, SUM(stock) as total_qty')
                ->first();

            $nilai = ProductVariant::whereHas('product', function ($q) use ($outlet) {
                $q->where('outlet_id', $outlet->id)->orWhereJsonContains('outlet_ids', (string) $outlet->id);
            })
                ->join('products', 'product_variants.product_id', '=', 'products.id')
                ->sum(DB::raw('product_variants.stock * products.cost_price'));

            return [
                'nama' => $outlet->name,
                'lokasi' => $outlet->name,
                'nilai' => (int) $nilai,
                'total' => (int) $nilai,
                'total_sku' => (int) ($variants->total_sku ?? 0),
                'sku' => (int) ($variants->total_sku ?? 0),
                'total_qty' => (int) ($variants->total_qty ?? 0),
                'qty' => (int) ($variants->total_qty ?? 0),
            ];
        })->toArray();
    }

    public function getNilaiPerKategori(): array
    {
        return Product::leftJoin('product_categories', 'products.category_id', '=', 'product_categories.id')
            ->leftJoin('product_variants', 'products.id', '=', 'product_variants.product_id')
            ->selectRaw('
                COALESCE(product_categories.name, \'Umum\') as nama,
                COALESCE(product_categories.name, \'Umum\') as kategori,
                COUNT(DISTINCT products.id) as total_produk,
                COALESCE(SUM(product_variants.stock), 0) as qty,
                COALESCE(SUM(product_variants.stock * products.cost_price), 0) as nilai
            ')
            ->groupBy('product_categories.id', 'product_categories.name')
            ->orderByDesc('nilai')
            ->get()
            ->map(fn($k) => [
                'nama' => $k->nama,
                'kategori' => $k->kategori,
                'qty' => (int) $k->qty,
                'stok' => (int) $k->qty,
                'nilai' => (int) $k->nilai,
                'nilai_total' => (int) $k->nilai,
                'total' => (int) $k->nilai,
                'harga_beli' => 0,
                'hpp' => 0,
            ])
            ->toArray();
    }

    public function getStokMenipis(): array
    {
        return ProductVariant::join('products', 'product_variants.product_id', '=', 'products.id')
            ->leftJoin('product_categories', 'products.category_id', '=', 'product_categories.id')
            ->where('products.status', 'aktif')
            ->where('product_variants.stock', '>', 0)
            ->where('product_variants.stock', '<', 10)
            ->selectRaw('
                products.name as nama,
                products.name as produk,
                COALESCE(product_categories.name, \'Umum\') as kategori,
                product_variants.stock,
                product_variants.stock as qty,
                10 as min,
                10 as minimum,
                10 as min_stok,
                \'Beberapa hari lagi\' as estimasi,
                \'Beberapa hari lagi\' as estimasi_habis
            ')
            ->limit(50)
            ->get()
            ->toArray();
    }

    public function getStokHabis(): array
    {
        return ProductVariant::join('products', 'product_variants.product_id', '=', 'products.id')
            ->leftJoin('product_categories', 'products.category_id', '=', 'product_categories.id')
            ->where('products.status', 'aktif')
            ->where('product_variants.stock', '<=', 0)
            ->selectRaw('
                products.name as nama,
                products.name as produk,
                COALESCE(product_categories.name, \'Umum\') as kategori,
                0 as stok,
                \'-\' as terakhir_ada,
                \'-\' as terakhir,
                0 as hari,
                0 as hari_habis
            ')
            ->limit(50)
            ->get()
            ->toArray();
    }

    public function getHasilOpname(): array
    {
        return StockOpname::with(['items.product:id,name', 'items.product.category:id,name'])
            ->where('status', 'selesai')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($so) => [
                'id' => $so->id,
                'nama' => $so->nomor_opname,
                'label' => $so->nomor_opname,
                'tanggal' => $so->tanggal_selesai?->format('Y-m-d'),
                'date' => $so->tanggal_selesai?->format('Y-m-d'),
                'lokasi' => $so->scope ?? 'Gudang',
                'outlet' => $so->scope ?? 'Gudang',
                'petugas' => $so->petugas,
                'kasir' => $so->petugas,
                'total_selisih' => (int) $so->total_selisih_plus - (int) $so->total_selisih_minus,
                'total_selisih_positif' => (int) $so->total_selisih_plus,
                'selisih_plus' => (int) $so->total_selisih_plus,
                'total_selisih_negatif' => (int) $so->total_selisih_minus,
                'selisih_minus' => (int) $so->total_selisih_minus,
                'kerugian' => (int) ($so->total_selisih_minus * 50000),
                'total_kerugian' => (int) ($so->total_selisih_minus * 50000),
                'detail' => $so->items->map(fn($i) => [
                    'nama' => $i->product?->name ?? $i->nama,
                    'produk' => $i->product?->name ?? $i->nama,
                    'kategori' => $i->product?->category?->name ?? '-',
                    'stok_sistem' => (int) $i->stok_sistem,
                    'sistem' => (int) $i->stok_sistem,
                    'stok_fisik' => (int) $i->stok_fisik,
                    'fisik' => (int) $i->stok_fisik,
                    'selisih' => (int) $i->selisih,
                    'nilai' => (int) ($i->selisih * ($i->product?->cost_price ?? 50000)),
                    'nilai_selisih' => (int) ($i->selisih * ($i->product?->cost_price ?? 50000)),
                    'harga_beli' => (int) ($i->product?->cost_price ?? 0),
                    'hpp' => (int) ($i->product?->cost_price ?? 0),
                ])->toArray(),
                'items' => $so->items->map(fn($i) => [
                    'nama' => $i->product?->name ?? $i->nama,
                    'produk' => $i->product?->name ?? $i->nama,
                    'kategori' => $i->product?->category?->name ?? '-',
                    'stok_sistem' => (int) $i->stok_sistem,
                    'sistem' => (int) $i->stok_sistem,
                    'stok_fisik' => (int) $i->stok_fisik,
                    'fisik' => (int) $i->stok_fisik,
                    'selisih' => (int) $i->selisih,
                    'nilai' => (int) ($i->selisih * ($i->product?->cost_price ?? 50000)),
                    'nilai_selisih' => (int) ($i->selisih * ($i->product?->cost_price ?? 50000)),
                    'harga_beli' => (int) ($i->product?->cost_price ?? 0),
                    'hpp' => (int) ($i->product?->cost_price ?? 0),
                ])->toArray(),
                'selisih' => $so->items->map(fn($i) => [
                    'nama' => $i->product?->name ?? $i->nama,
                    'produk' => $i->product?->name ?? $i->nama,
                    'kategori' => $i->product?->category?->name ?? '-',
                    'stok_sistem' => (int) $i->stok_sistem,
                    'sistem' => (int) $i->stok_sistem,
                    'stok_fisik' => (int) $i->stok_fisik,
                    'fisik' => (int) $i->stok_fisik,
                    'selisih' => (int) $i->selisih,
                    'nilai' => (int) ($i->selisih * ($i->product?->cost_price ?? 50000)),
                    'nilai_selisih' => (int) ($i->selisih * ($i->product?->cost_price ?? 50000)),
                    'harga_beli' => (int) ($i->product?->cost_price ?? 0),
                    'hpp' => (int) ($i->product?->cost_price ?? 0),
                ])->toArray(),
            ])
            ->toArray();
    }

    protected function normalizeTipeMutasi(string $type): string
    {
        return match ($type) {
            'restock', 'penerimaan', 'adjustment_plus' => 'masuk',
            'sale', 'adjustment_minus', 'rusak' => 'keluar',
            'transfer' => 'transfer',
            'return', 'retur' => 'retur',
            default => $type,
        };
    }

    protected function getSourceLocation(StockMovement $m): string
    {
        $note = $m->note ?? '';
        // Try to extract location from note or default
        return str_contains($note, 'Gudang') ? 'Gudang Pusat' : (str_contains($note, 'Outlet') ? $note : 'Gudang');
    }

    protected function getDestLocation(StockMovement $m): string
    {
        $note = $m->note ?? '';
        return str_contains($note, 'Outlet') ? $note : 'Gudang';
    }
}
