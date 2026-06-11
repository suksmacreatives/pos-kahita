<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\ProductVariant;
use App\Models\Product;
use App\Models\Outlet;
use App\Models\OutletStock;
use App\Models\StockMovement;
use App\Models\PurchaseOrder;
use App\Models\DistributionOrder;
use App\Models\ActivityLog;

class DashboardController extends Controller
{
    protected int $lowStockThreshold = 10;

    public function index(Request $request)
    {
        $outlet = $request->query('outlet', 'all');
        $period = $request->query('period', 'monthly');

        [$start, $end] = $this->dateRange($period);
        [$prevStart, $prevEnd] = $this->prevDateRange($period);

        return Inertia::render('Admin/Dashboard', [
            'dashboard' => [
                'stats' => $this->stats($outlet, $start, $end, $prevStart, $prevEnd),
                'warehouseStats' => $this->warehouseStats($outlet),
                'salesTrend' => $this->salesTrend($outlet, $start, $end, $period),
                'stockMovement' => $this->stockMovement($outlet, $start, $end, $period),
                'incomingGoods' => $this->incomingGoods(),
                'outgoingGoods' => $this->outgoingGoods($outlet),
                'activities' => $this->activities(),
                'lowStockItems' => $this->lowStockItems($outlet),
                'outletPerformance' => $this->outletPerformance($start, $end),
                'topProducts' => $this->topProducts($outlet, $start, $end),
            ],
            'outlets' => Outlet::aktif()->get(['id', 'name']),
        ]);
    }

    protected function dateRange(string $period): array
    {
        $now = now();
        return match ($period) {
            'daily' => [$now->copy()->startOfDay(), $now->copy()->endOfDay()],
            'weekly' => [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()],
            default => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()],
        };
    }

    protected function prevDateRange(string $period): array
    {
        $then = now()->subDay();
        return match ($period) {
            'daily' => [$then->copy()->startOfDay(), $then->copy()->endOfDay()],
            'weekly' => [$then->copy()->subWeek()->startOfWeek(), $then->copy()->subWeek()->endOfWeek()],
            default => [$then->copy()->subMonth()->startOfMonth(), $then->copy()->subMonth()->endOfMonth()],
        };
    }

    protected function resolveOutletId(string $outlet): ?int
    {
        if ($outlet === 'all' || $outlet === '') return null;
        if (is_numeric($outlet)) return (int) $outlet;
        $found = Outlet::where('slug', $outlet)->orWhere('name', 'like', "%$outlet%")->first();
        return $found?->id;
    }

    protected function outletFilter($query, string $outlet, string $column = 'outlet_id')
    {
        $id = $this->resolveOutletId($outlet);
        if ($id) {
            $query->where($column, $id);
        }
    }

    protected function stats(string $outlet, Carbon $start, Carbon $end, Carbon $prevStart, Carbon $prevEnd): array
    {
        $cur = Transaction::whereBetween('created_at', [$start, $end])->where('status', 'completed');
        $prev = Transaction::whereBetween('created_at', [$prevStart, $prevEnd])->where('status', 'completed');
        $this->outletFilter($cur, $outlet);
        $this->outletFilter($prev, $outlet);

        $curSales = (int) $cur->sum('grand_total');
        $curCount = (int) $cur->count();
        $prevSales = (int) $prev->sum('grand_total');
        $prevCount = (int) $prev->count();

        $curAov = $curCount > 0 ? (int) round($curSales / $curCount) : 0;
        $prevAov = $prevCount > 0 ? (int) round($prevSales / $prevCount) : 0;

        $growthSales = $prevSales > 0 ? round((($curSales - $prevSales) / $prevSales) * 100, 1) : 0;
        $growthTransactions = $prevCount > 0 ? round((($curCount - $prevCount) / $prevCount) * 100, 1) : 0;
        $growthAov = $prevAov > 0 ? round((($curAov - $prevAov) / $prevAov) * 100, 1) : 0;

        $totalStock = (int) ProductVariant::sum('stock');
        $lowStockCount = (int) ProductVariant::where('stock', '<', $this->lowStockThreshold)->count();

        return [
            'totalSales' => $curSales,
            'transactions' => $curCount,
            'aov' => $curAov,
            'growthSales' => $growthSales,
            'growthTransactions' => $growthTransactions,
            'growthAov' => $growthAov,
            'totalStock' => $totalStock,
            'lowStockCount' => $lowStockCount,
        ];
    }

    protected function warehouseStats(string $outlet): array
    {
        $totalStock = (int) ProductVariant::sum('stock');
        $lowStockCount = (int) ProductVariant::where('stock', '<', $this->lowStockThreshold)->count();

        return [
            'totalStock' => $totalStock,
            'stockInValue' => 0,
            'stockOutValue' => 0,
            'lowStockCount' => $lowStockCount,
        ];
    }

    protected function salesTrend(string $outlet, Carbon $start, Carbon $end, string $period): array
    {
        $data = Transaction::whereBetween('created_at', [$start, $end])
            ->where('status', 'completed');
        $this->outletFilter($data, $outlet);

        $rows = $data->select(
            DB::raw(match ($period) {
                'daily' => "DATE_FORMAT(created_at, '%H:00')",
                'weekly' => 'DAYNAME(created_at)',
                default => "CEIL(DAY(created_at) / 7)",
            } . ' as label'),
            DB::raw('SUM(grand_total) as sales'),
            DB::raw('COUNT(id) as transactions'),
        )->groupBy('label')->orderBy('label')->get();

        if ($period === 'daily') {
            $buckets = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
            $labels = array_combine($buckets, $buckets);
        } elseif ($period === 'weekly') {
            $labels = ['Monday' => 'Senin', 'Tuesday' => 'Selasa', 'Wednesday' => 'Rabu', 'Thursday' => 'Kamis', 'Friday' => 'Jumat', 'Saturday' => 'Sabtu', 'Sunday' => 'Minggu'];
        } else {
            $labels = ['1' => 'Minggu 1', '2' => 'Minggu 2', '3' => 'Minggu 3', '4' => 'Minggu 4', '5' => 'Minggu 5'];
        }

        $map = [];
        foreach ($rows as $r) {
            $map[(string) $r->label] = $r;
        }

        $result = [];
        foreach ($labels as $dbKey => $displayName) {
            $found = $map[$dbKey] ?? null;
            $result[] = [
                'name' => $displayName,
                'sales' => $found ? (int) $found->sales : 0,
                'transactions' => $found ? (int) $found->transactions : 0,
            ];
        }

        return $result;
    }

    protected function stockMovement(string $outlet, Carbon $start, Carbon $end, string $period): array
    {
        $in = StockMovement::where('type', 'penerimaan_outlet')->whereBetween('created_at', [$start, $end]);
        $out = StockMovement::where('type', 'distribusi')->whereBetween('created_at', [$start, $end]);
        $this->outletFilter($in, $outlet);
        $this->outletFilter($out, $outlet);

        $inRows = $in->select(
            DB::raw(match ($period) {
                'daily' => "DATE_FORMAT(created_at, '%H:00')",
                'weekly' => 'DAYNAME(created_at)',
                default => "CEIL(DAY(created_at) / 7)",
            } . ' as label'),
            DB::raw('SUM(qty) as qty'),
        )->groupBy('label')->orderBy('label')->pluck('qty', 'label');

        $outRows = $out->select(
            DB::raw(match ($period) {
                'daily' => "DATE_FORMAT(created_at, '%H:00')",
                'weekly' => 'DAYNAME(created_at)',
                default => "CEIL(DAY(created_at) / 7)",
            } . ' as label'),
            DB::raw('SUM(ABS(qty)) as qty'),
        )->groupBy('label')->orderBy('label')->pluck('qty', 'label');

        $labels = $period === 'daily'
            ? ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']
            : ($period === 'weekly'
                ? ['Monday' => 'Senin', 'Tuesday' => 'Selasa', 'Wednesday' => 'Rabu', 'Thursday' => 'Kamis', 'Friday' => 'Jumat', 'Saturday' => 'Sabtu', 'Sunday' => 'Minggu']
                : ['1' => 'Minggu 1', '2' => 'Minggu 2', '3' => 'Minggu 3', '4' => 'Minggu 4', '5' => 'Minggu 5']);

        $result = [];
        foreach ($labels as $dbKey => $displayName) {
            $result[] = [
                'name' => $displayName,
                'stockIn' => (int) ($inRows[$dbKey] ?? 0),
                'stockOut' => (int) ($outRows[$dbKey] ?? 0),
            ];
        }

        return $result;
    }

    protected function incomingGoods(): array
    {
        return PurchaseOrder::with('supplier:id,nama', 'items')
            ->latest()
            ->take(5)
            ->get()
            ->flatMap(fn ($po) => $po->items->map(fn ($item) => [
                'id' => $po->nomor_po,
                'name' => $item->nama,
                'from' => $po->supplier?->nama ?? '-',
                'qty' => (int) $item->qty_pesan,
                'status' => ucfirst($po->status),
            ]))
            ->toArray();
    }

    protected function outgoingGoods(string $outlet): array
    {
        $query = DistributionOrder::with('outlet:id,name', 'items')->latest()->take(5);
        $this->outletFilter($query, $outlet, 'outlet_id');

        return $query->get()
            ->flatMap(fn ($do) => $do->items->map(fn ($item) => [
                'id' => $do->nomor_do,
                'name' => $item->nama,
                'to' => $do->outlet?->name ?? '-',
                'qty' => (int) $item->qty,
                'status' => ucfirst($do->status),
            ]))
            ->toArray();
    }

    protected function activities(): array
    {
        $typeMap = [
            'Barang' => 'stock',
            'Promo' => 'system',
            'Akun' => 'system',
            'Transaksi' => 'sale',
        ];

        return ActivityLog::with('user:id,name')
            ->latest()
            ->take(7)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'time' => $log->created_at->format('H:i'),
                'user' => $log->user?->name ?? 'Sistem',
                'action' => $log->aksi . ' ' . $log->modul . ($log->target_label ? ': ' . $log->target_label : ''),
                'outlet' => is_array($log->detail) && isset($log->detail['outlet']) ? $log->detail['outlet'] : 'all',
                'type' => $typeMap[$log->modul] ?? 'system',
            ])
            ->toArray();
    }

    protected function lowStockItems(string $outlet): array
    {
        $query = ProductVariant::with(['product.category', 'outletStocks.outlet'])
            ->where('stock', '<', $this->lowStockThreshold);

        $outletId = $this->resolveOutletId($outlet);
        if ($outletId) {
            $query->whereHas('outletStocks', fn ($q) => $q->where('outlet_id', $outletId));
        }

        return $query->get()->map(fn ($v) => [
            'id' => 'VAR-' . $v->id,
            'name' => $v->product?->name ?? '-',
            'sku' => $v->sku ?? '-',
            'stock' => (int) $v->stock,
            'minStock' => $this->lowStockThreshold,
            'outlet' => $v->outletStocks->first()?->outlet?->slug ?? 'pusat',
            'category' => $v->product?->category?->name ?? '-',
        ])->toArray();
    }

    protected function outletPerformance(Carbon $start, Carbon $end): array
    {
        $data = Transaction::whereBetween('created_at', [$start, $end])
            ->where('status', 'completed')
            ->select('outlet_id',
                DB::raw('SUM(grand_total) as revenue'),
                DB::raw('COUNT(id) as transactions'),
                DB::raw('AVG(grand_total) as aov'))
            ->groupBy('outlet_id')
            ->get();

        $prev = Transaction::whereBetween('created_at', [$start->copy()->subMonth(), $end->copy()->subMonth()])
            ->where('status', 'completed')
            ->select('outlet_id', DB::raw('SUM(grand_total) as prev_revenue'))
            ->groupBy('outlet_id')
            ->pluck('prev_revenue', 'outlet_id');

        $outlets = Outlet::pluck('name', 'id');

        return $data->map(function ($row) use ($outlets, $prev) {
            $prevRev = (int) ($prev[$row->outlet_id] ?? 0);
            $curRev = (int) $row->revenue;
            $growth = $prevRev > 0 ? round((($curRev - $prevRev) / $prevRev) * 100, 1) : 0;

            return [
                'id' => $row->outlet_id,
                'name' => $outlets[$row->outlet_id] ?? 'Outlet #' . $row->outlet_id,
                'revenue' => $curRev,
                'transactions' => (int) $row->transactions,
                'aov' => (int) round($row->aov ?? 0),
                'growth' => $growth,
            ];
        })->values()->toArray();
    }

    protected function topProducts(string $outlet, Carbon $start, Carbon $end): array
    {
        $query = TransactionItem::select(
                'product_name_snapshot',
                'product_id',
                DB::raw('SUM(quantity) as sold'),
                DB::raw('SUM(total_price) as revenue'),
            )
            ->whereHas('transaction', fn ($q) => $q->whereBetween('created_at', [$start, $end])->where('status', 'completed'))
            ->groupBy('product_name_snapshot', 'product_id')
            ->orderByDesc('sold')
            ->take(5);

        $outletId = $this->resolveOutletId($outlet);
        if ($outletId) {
            $query->whereHas('transaction', fn ($q) => $q->where('outlet_id', $outletId));
        }

        return $query->get()->map(function ($item) {
            $product = Product::with('category')->find($item->product_id);
            return [
                'id' => 'P-' . ($item->product_id ?? 0),
                'name' => $item->product_name_snapshot,
                'sku' => $product?->sku ?? '-',
                'category' => $product?->category?->name ?? '-',
                'sold' => (int) $item->sold,
                'revenue' => (int) $item->revenue,
            ];
        })->toArray();
    }
}
