<?php

namespace App\Services\Reports;

use App\Models\Product;
use App\Models\TransactionItem;
use App\Models\ProductVariant;
use App\Models\Outlet;
use App\Models\ProductCategory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class ProdukReportService
{
    protected Carbon $dari;
    protected Carbon $sampai;
    protected Carbon $dariLalu;
    protected Carbon $sampaiLalu;
    protected string $outlet;

    public function __construct(Carbon $dari, Carbon $sampai, string $outlet = 'all', ?Carbon $dariLalu = null, ?Carbon $sampaiLalu = null)
    {
        $this->dari       = $dari;
        $this->sampai     = $sampai;
        $this->outlet     = $outlet;
        $this->dariLalu   = $dariLalu ?? $dari->copy()->subDays($sampai->diffInDays($dari) + 1);
        $this->sampaiLalu = $sampaiLalu ?? $dari->copy()->subDay();
    }

    public function all(): array
    {
        return Cache::remember(
            "report_produk_{$this->dari->format('Ymd')}_{$this->sampai->format('Ymd')}_{$this->outlet}",
            300,
            fn () => [
                'top_products'   => $this->getTerlaris(),
                'slow_moving'    => $this->getSlowMoving(),
                'dead_stock'     => $this->getDeadStock(),
                'kategori_stats' => $this->getAnalisisKategori(),
                'varian_stats'   => $this->getAnalisisVarian(),
                'per_kategori'   => $this->getPerKategori(),
            ]
        );
    }

    public function getTerlaris(int $limit = 10, string $sortBy = 'qty'): array
    {
        $query = TransactionItem::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->join('products', 'transaction_items.product_id', '=', 'products.id')
            ->leftJoin('product_categories', 'products.category_id', '=', 'product_categories.id')
            ->where('transactions.status', 'completed')
            ->whereBetween('transactions.created_at', [$this->dari, $this->sampai->endOfDay()])
            ->selectRaw('
                products.id,
                products.name as nama,
                products.sku as kode_produk,
                products.image as foto,
                COALESCE(product_categories.name, \'Umum\') as kategori,
                SUM(transaction_items.quantity) as terjual,
                SUM(transaction_items.total_price) as revenue,
                AVG(transaction_items.price_at_sale) as avg_harga
            ')
            ->groupBy('products.id', 'products.name', 'products.sku', 'products.image', 'product_categories.name')
            ->orderByDesc($sortBy === 'qty' ? 'terjual' : 'revenue');

        if ($this->outlet !== 'all') {
            $outlet = Outlet::where('slug', $this->outlet)->orWhere('id', $this->outlet)->first();
            if ($outlet) {
                $query->where('transactions.outlet_id', $outlet->id);
            }
        }

        return collect($query->limit($limit)->get()->toArray())
            ->map(fn ($item) => array_merge($item, [
                'foto' => $item['foto'] ? Storage::url($item['foto']) : null,
            ]))
            ->toArray();
    }

    public function getSlowMoving(): array
    {
        // Produk with total qty sold < 3 in the period
        $subQuery = TransactionItem::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.status', 'completed')
            ->whereBetween('transactions.created_at', [$this->dari, $this->sampai->endOfDay()])
            ->groupBy('transaction_items.product_id')
            ->selectRaw('transaction_items.product_id, SUM(transaction_items.quantity) as total_terjual');

        $query = Product::leftJoinSub($subQuery, 'sales_stats', function ($join) {
                $join->on('products.id', '=', 'sales_stats.product_id');
            })
            ->leftJoin('product_categories', 'products.category_id', '=', 'product_categories.id')
            ->where(function ($q) {
                $q->whereNull('sales_stats.total_terjual')
                  ->orWhere('sales_stats.total_terjual', '<', 3);
            })
            ->where('products.status', 'aktif')
            ->selectRaw('
                products.id,
                products.name as nama,
                COALESCE(product_categories.name, \'Umum\') as kategori,
                COALESCE(sales_stats.total_terjual, 0) as terjual,
                \'-\' as terakhir_terjual,
                30 as hari_tanpa_penjualan
            ')
            ->limit(20);

        // Get stock from variants
        $products = $query->get();

        return $products->map(function ($p) {
            $stok = ProductVariant::where('product_id', $p->id)->sum('stock');
            $p->stok = (int) $stok;
            $p->qty = $p->stok;
            return $p;
        })->toArray();
    }

    public function getDeadStock(): array
    {
        // Products that were never sold in the period but still have stock
        $productIdsWithSales = TransactionItem::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.status', 'completed')
            ->whereBetween('transactions.created_at', [$this->dari, $this->sampai->endOfDay()])
            ->distinct()
            ->pluck('transaction_items.product_id');

        $products = Product::whereNotIn('products.id', $productIdsWithSales)
            ->where('status', 'aktif')
            ->leftJoin('product_categories', 'products.category_id', '=', 'product_categories.id')
            ->selectRaw('
                products.id,
                products.name as nama,
                products.cost_price,
                COALESCE(product_categories.name, \'Umum\') as kategori
            ')
            ->limit(20)
            ->get();

        return $products->map(function ($p) {
            $stok = ProductVariant::where('product_id', $p->id)->sum('stock');
            return [
                'nama'        => $p->nama,
                'produk'      => $p->nama,
                'kategori'    => $p->kategori,
                'stok'        => (int) $stok,
                'qty'         => (int) $stok,
                'nilai_stok'  => (int) $stok * (int) $p->cost_price,
                'nilai'       => (int) $stok * (int) $p->cost_price,
                'tersedia_di' => 'Semua Outlet',
                'outlet'      => 'Semua Outlet',
            ];
        })->toArray();
    }

    public function getAnalisisKategori(): array
    {
        return ProductCategory::leftJoin('products', 'product_categories.id', '=', 'products.category_id')
            ->leftJoin('transaction_items', 'products.id', '=', 'transaction_items.product_id')
            ->leftJoin('transactions', function ($join) {
                $join->on('transaction_items.transaction_id', '=', 'transactions.id')
                     ->where('transactions.status', 'completed')
                     ->whereBetween('transactions.created_at', [$this->dari, $this->sampai->endOfDay()]);
            })
            ->selectRaw('
                product_categories.name as nama,
                COALESCE(SUM(transaction_items.quantity), 0) as terjual,
                COALESCE(SUM(transaction_items.total_price), 0) as revenue,
                COALESCE(AVG(transaction_items.price_at_sale - (
                    SELECT p2.cost_price FROM products p2 WHERE p2.id = transaction_items.product_id
                )) / NULLIF(AVG(transaction_items.price_at_sale), 0) * 100, 0) as margin,
                \'neutral\' as trend
            ')
            ->groupBy('product_categories.id', 'product_categories.name')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn ($k) => [
                'nama'         => $k->nama,
                'kategori'     => $k->nama,
                'terjual'      => (int) $k->terjual,
                'qty'          => (int) $k->terjual,
                'revenue'      => (int) $k->revenue,
                'omset'        => (int) $k->revenue,
                'margin'       => round((float) $k->margin, 1),
                'margin_rata'  => round((float) $k->margin, 1),
                'trend'        => $k->trend,
            ])
            ->toArray();
    }

    public function getPerKategori(): array
    {
        return $this->getAnalisisKategori();
    }

    public function getAnalisisVarian(): array
    {
        $results = TransactionItem::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.status', 'completed')
            ->whereBetween('transactions.created_at', [$this->dari, $this->sampai->endOfDay()])
            ->selectRaw('
                transaction_items.variant_color as warna,
                transaction_items.variant_size as ukuran,
                SUM(transaction_items.quantity) as total
            ')
            ->whereNotNull('variant_color')
            ->whereNotNull('variant_size')
            ->groupBy('transaction_items.variant_color', 'transaction_items.variant_size')
            ->get();

        $warnaList = $results->pluck('warna')->unique()->values()->toArray();
        $ukuranList = $results->pluck('ukuran')->unique()->values()->toArray();

        $heatmap = [];
        foreach ($warnaList as $warna) {
            $row = ['warna' => $warna, 'label' => $warna, 'data' => [], 'values' => []];
            foreach ($ukuranList as $ukuran) {
                $val = $results->firstWhere(fn ($r) => $r->warna === $warna && $r->ukuran === $ukuran);
                $row['data'][] = (int) ($val->total ?? 0);
                $row['values'][] = (int) ($val->total ?? 0);
            }
            $heatmap[] = $row;
        }

        $totalQty = $results->sum('total');
        $insights = [];

        // Most sold size
        $topSize = $results->groupBy('ukuran')->map(fn ($g) => $g->sum('total'))->sortDesc();
        if ($topSize->isNotEmpty()) {
            $sizeName = $topSize->keys()->first();
            $sizePct = $totalQty > 0 ? round(($topSize->first() / $totalQty) * 100) : 0;
            $insights[] = "Ukuran {$sizeName} paling banyak terjual ({$sizePct}%)";
        }

        // Most sold color
        $topColor = $results->groupBy('warna')->map(fn ($g) => $g->sum('total'))->sortDesc();
        if ($topColor->isNotEmpty()) {
            $colorName = $topColor->keys()->first();
            $colorPct = $totalQty > 0 ? round(($topColor->first() / $totalQty) * 100) : 0;
            $insights[] = "Warna {$colorName} paling diminati ({$colorPct}%)";
        }

        return [
            'ukuran'   => $ukuranList,
            'sizes'    => $ukuranList,
            'warna'    => $warnaList,
            'colors'   => $warnaList,
            'heatmap'  => $heatmap,
            'matrix'   => $heatmap,
            'insights' => $insights,
        ];
    }
}
