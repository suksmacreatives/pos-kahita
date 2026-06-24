<?php

namespace App\Services\Export;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductCategory;
use App\Models\DistributionOrder;
use App\Models\DistributionOrderItem;
use App\Models\OutletReturn;
use App\Models\OutletReturnItem;
use App\Models\Outlet;
use App\Models\TransactionItem;
use App\Models\StockMovement;

class DashboardExportDataService
{
    protected int $lowStockThreshold = 10;
    protected int $deadStockDays = 90;
    protected int $fastMovingLimit = 10;

    public function getInventorySummary(?int $outletId = null): array
    {
        $totalProduk = Product::count();
        $totalKategori = ProductCategory::count();
        $totalStokGudang = (int) ProductVariant::sum('stock');
        $lowStockCount = (int) ProductVariant::where('stock', '<', $this->lowStockThreshold)->count();

        $totalNilaiInventaris = (int) ProductVariant::select(
            DB::raw('SUM(stock * cost_price) as total')
        )->whereNotNull('cost_price')->value('total') ?? 0;

        $stokOutletValue = DB::table('outlet_stocks')
            ->join('product_variants', 'outlet_stocks.product_variant_id', '=', 'product_variants.id')
            ->select(DB::raw('SUM(outlet_stocks.stock * COALESCE(product_variants.cost_price, 0)) as total'))
            ->value('total') ?? 0;

        return [
            'total_produk' => $totalProduk,
            'total_kategori' => $totalKategori,
            'total_stok_gudang' => $totalStokGudang,
            'total_nilai_inventaris' => $totalNilaiInventaris + (int) $stokOutletValue,
            'jumlah_produk_low_stock' => $lowStockCount,
        ];
    }

    public function getDistributionData(Carbon $dari, Carbon $sampai, ?int $outletId = null): array
    {
        $cur = DistributionOrderItem::whereHas('distributionOrder', function ($q) use ($dari, $sampai, $outletId) {
            $q->whereBetween('tanggal_kirim', [$dari, $sampai]);
            if ($outletId) $q->where('outlet_id', $outletId);
        });

        $totalQty = (int) $cur->sum('qty');

        $prevDari = (clone $dari)->subMonth();
        $prevSampai = (clone $sampai)->subMonth();
        $prevQty = (int) DistributionOrderItem::whereHas('distributionOrder', function ($q) use ($prevDari, $prevSampai, $outletId) {
            $q->whereBetween('tanggal_kirim', [$prevDari, $prevSampai]);
            if ($outletId) $q->where('outlet_id', $outletId);
        })->sum('qty');

        $growth = $prevQty > 0 ? round((($totalQty - $prevQty) / $prevQty) * 100, 1) : 0;

        $top10 = $cur->select('nama', DB::raw('SUM(qty) as total_qty'))
            ->groupBy('nama')
            ->orderByDesc('total_qty')
            ->take(10)
            ->get()
            ->map(fn ($i) => ['nama_produk' => $i->nama, 'total_qty' => (int) $i->total_qty])
            ->toArray();

        $perOutlet = DistributionOrderItem::select(
                DB::raw('SUM(distribution_order_items.qty) as total_qty'),
                'outlets.name as outlet_name'
            )
            ->join('distribution_orders', 'distribution_order_items.distribution_order_id', '=', 'distribution_orders.id')
            ->join('outlets', 'distribution_orders.outlet_id', '=', 'outlets.id')
            ->whereBetween('distribution_orders.tanggal_kirim', [$dari, $sampai])
            ->groupBy('outlets.id', 'outlets.name')
            ->orderByDesc('total_qty')
            ->get()
            ->map(fn ($i) => ['outlet' => $i->outlet_name, 'total_qty' => (int) $i->total_qty])
            ->toArray();

        return [
            'total_distribusi' => $totalQty,
            'growth' => $growth,
            'top_10' => $top10,
            'per_outlet' => $perOutlet,
        ];
    }

    public function getReturnData(Carbon $dari, Carbon $sampai, ?int $outletId = null): array
    {
        $cur = OutletReturnItem::whereHas('outletReturn', function ($q) use ($dari, $sampai, $outletId) {
            $q->whereBetween('tgl_retur', [$dari, $sampai]);
            if ($outletId) $q->where('outlet_id', $outletId);
        });

        $totalQty = (int) $cur->sum('qty');

        $prevDari = (clone $dari)->subMonth();
        $prevSampai = (clone $sampai)->subMonth();
        $prevQty = (int) OutletReturnItem::whereHas('outletReturn', function ($q) use ($prevDari, $prevSampai, $outletId) {
            $q->whereBetween('tgl_retur', [$prevDari, $prevSampai]);
            if ($outletId) $q->where('outlet_id', $outletId);
        })->sum('qty');

        $growth = $prevQty > 0 ? round((($totalQty - $prevQty) / $prevQty) * 100, 1) : 0;

        $top10 = $cur->select('nama', DB::raw('SUM(qty) as total_qty'))
            ->groupBy('nama')
            ->orderByDesc('total_qty')
            ->take(10)
            ->get()
            ->map(fn ($i) => ['nama_produk' => $i->nama, 'total_qty' => (int) $i->total_qty])
            ->toArray();

        $totalDistribusi = DistributionOrderItem::whereHas('distributionOrder', function ($q) use ($dari, $sampai) {
            $q->whereBetween('tanggal_kirim', [$dari, $sampai]);
        })->sum('qty');

        $persentaseRetur = $totalDistribusi > 0 ? round(($totalQty / $totalDistribusi) * 100, 2) : 0;

        return [
            'total_retur' => $totalQty,
            'growth' => $growth,
            'persentase_retur' => $persentaseRetur,
            'top_10' => $top10,
        ];
    }

    public function getLowStockData(?int $outletId = null): array
    {
        $query = ProductVariant::with(['product.category', 'outletStocks.outlet'])
            ->where('stock', '<', $this->lowStockThreshold);

        return $query->get()->map(function ($v) {
            return [
                'nama_produk' => $v->product?->name ?? '-',
                'kategori' => $v->product?->category?->name ?? '-',
                'sku' => $v->sku ?? '-',
                'stok_saat_ini' => (int) $v->stock,
                'minimum_stock' => $this->lowStockThreshold,
                'status' => $v->stock <= 3 ? 'kritis' : ($v->stock <= 6 ? 'warning' : 'aman'),
                'outlet_stok' => $v->outletStocks->map(fn ($os) => [
                    'outlet' => $os->outlet?->name ?? '-',
                    'stok' => (int) $os->stock,
                ])->toArray(),
            ];
        })->sortBy('stok_saat_ini')->values()->toArray();
    }

    public function getFastSlowMoving(Carbon $dari, Carbon $sampai, ?int $outletId = null): array
    {
        $items = TransactionItem::select(
                'product_name_snapshot',
                'product_id',
                DB::raw('SUM(quantity) as total_qty'),
            )
            ->whereHas('transaction', function ($q) use ($dari, $sampai, $outletId) {
                $q->whereBetween('created_at', [$dari, $sampai])->where('status', 'completed');
                if ($outletId) $q->where('outlet_id', $outletId);
            })
            ->groupBy('product_name_snapshot', 'product_id')
            ->orderByDesc('total_qty')
            ->get();

        $fastMoving = $items->take($this->fastMovingLimit)->map(function ($i) {
            $p = Product::with('category')->find($i->product_id);
            return [
                'nama_produk' => $i->product_name_snapshot,
                'kategori' => $p?->category?->name ?? '-',
                'qty' => (int) $i->total_qty,
            ];
        })->toArray();

        $slowMoving = $items->filter(fn ($i) => (int) $i->total_qty <= 2)
            ->map(function ($i) {
                $p = Product::with('category')->find($i->product_id);
                return [
                    'nama_produk' => $i->product_name_snapshot,
                    'kategori' => $p?->category?->name ?? '-',
                    'qty' => (int) $i->total_qty,
                ];
            })->values()->toArray();

        $terjualIds = $items->pluck('product_id')->unique()->toArray();

        $allVariants = ProductVariant::with('product.category')
            ->whereHas('product', fn ($q) => $q->where('status', 'aktif'))
            ->get();

        $deadStock = $allVariants->filter(function ($v) use ($terjualIds) {
            return !in_array($v->product_id, $terjualIds) && $v->stock > 0;
        })->map(function ($v) {
            return [
                'nama_produk' => $v->product?->name ?? '-',
                'kategori' => $v->product?->category?->name ?? '-',
                'stok' => (int) $v->stock,
                'hari_tanpa_pergerakan' => $this->deadStockDays,
            ];
        })->values()->toArray();

        return [
            'fast_moving' => $fastMoving,
            'slow_moving' => $slowMoving,
            'dead_stock' => $deadStock,
        ];
    }

    public function getRestockRecommendation(): array
    {
        $thirtyDaysAgo = now()->subDays(30);

        $avgMonthly = TransactionItem::select(
                'product_name_snapshot',
                'product_id',
                DB::raw('SUM(quantity) as total_qty'),
            )
            ->whereHas('transaction', fn ($q) => $q->where('created_at', '>=', $thirtyDaysAgo)->where('status', 'completed'))
            ->groupBy('product_name_snapshot', 'product_id')
            ->get()
            ->keyBy('product_id');

        return ProductVariant::with('product.category')
            ->where('stock', '<', $this->lowStockThreshold)
            ->get()
            ->map(function ($v) use ($avgMonthly) {
                $avg = $avgMonthly->get($v->product_id);
                $rataDistribusi = $avg ? (int) ceil($avg->total_qty / 4) : 1;
                $leadTimeWeeks = 2;
                $rekomendasi = max(0, ($rataDistribusi * $leadTimeWeeks) - $v->stock + $this->lowStockThreshold);
                $estimasiHari = $rataDistribusi > 0 ? (int) ceil($v->stock / $rataDistribusi * 7) : 999;

                return [
                    'nama_produk' => $v->product?->name ?? '-',
                    'kategori' => $v->product?->category?->name ?? '-',
                    'stok_saat_ini' => (int) $v->stock,
                    'minimum_stock' => $this->lowStockThreshold,
                    'rata_distribusi_bulanan' => $rataDistribusi,
                    'estimated_days_remaining' => $estimasiHari,
                    'rekomendasi_qty' => $rekomendasi,
                ];
            })
            ->sortBy('stok_saat_ini')
            ->values()
            ->toArray();
    }

    public function getInventoryValue(): array
    {
        $perProduk = ProductVariant::select(
                'products.name as nama_produk',
                'product_categories.name as kategori',
                DB::raw('SUM(product_variants.stock * COALESCE(product_variants.cost_price, 0)) as nilai'),
                DB::raw('SUM(product_variants.stock) as stok'),
            )
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->leftJoin('product_categories', 'products.category_id', '=', 'product_categories.id')
            ->groupBy('products.id', 'products.name', 'product_categories.name')
            ->orderByDesc('nilai')
            ->get()
            ->map(fn ($i) => [
                'nama_produk' => $i->nama_produk,
                'kategori' => $i->kategori ?? '-',
                'stok' => (int) $i->stok,
                'nilai' => (int) $i->nilai,
            ])
            ->toArray();

        $perKategori = ProductVariant::select(
                'product_categories.name as kategori',
                DB::raw('COUNT(DISTINCT products.id) as total_produk'),
                DB::raw('SUM(product_variants.stock) as total_stok'),
                DB::raw('SUM(product_variants.stock * COALESCE(product_variants.cost_price, 0)) as total_nilai'),
            )
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->leftJoin('product_categories', 'products.category_id', '=', 'product_categories.id')
            ->groupBy('product_categories.id', 'product_categories.name')
            ->orderByDesc('total_nilai')
            ->get()
            ->map(fn ($i) => [
                'kategori' => $i->kategori ?? 'Tanpa Kategori',
                'total_produk' => (int) $i->total_produk,
                'total_stok' => (int) $i->total_stok,
                'total_nilai' => (int) $i->total_nilai,
            ])
            ->toArray();

        $total = array_sum(array_column($perProduk, 'nilai'));

        $stokOutletValue = DB::table('outlet_stocks')
            ->join('product_variants', 'outlet_stocks.product_variant_id', '=', 'product_variants.id')
            ->select(DB::raw('SUM(outlet_stocks.stock * COALESCE(product_variants.cost_price, 0)) as total'))
            ->value('total') ?? 0;

        return [
            'total' => $total + (int) $stokOutletValue,
            'total_gudang' => $total,
            'total_outlet' => (int) $stokOutletValue,
            'per_produk' => $perProduk,
            'per_kategori' => $perKategori,
        ];
    }
}
