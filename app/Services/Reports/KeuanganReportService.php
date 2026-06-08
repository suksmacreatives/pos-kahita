<?php

namespace App\Services\Reports;

use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Outlet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class KeuanganReportService
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
            "report_keuangan_{$this->dari->format('Ymd')}_{$this->sampai->format('Ymd')}_{$this->outlet}",
            300,
            fn () => [
                'laba_rugi'         => $this->getLabaRugi(),
                'hpp_stats'         => $this->getHppStats(),
                'margin_per_produk' => $this->getMarginPerProduk(),
                'diskon_stats'      => $this->getDiskonStats(),
                'promo_performance' => $this->getPromoPerformance(),
            ]
        );
    }

    public function getLabaRugi(): array
    {
        // Current period
        $current = $this->queryTransaction()
            ->where('status', 'completed')
            ->selectRaw('
                COALESCE(SUM(subtotal), 0) as penjualan_bruto,
                COALESCE(SUM(discount), 0) as total_diskon,
                COALESCE(SUM(grand_total), 0) as penjualan_bersih
            ')
            ->first();

        $void = $this->queryTransaction()
            ->where('status', 'void')
            ->sum('grand_total');

        $hpp = TransactionItem::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.status', 'completed')
            ->whereBetween('transactions.created_at', [$this->dari, $this->sampai->endOfDay()])
            ->join('products', 'transaction_items.product_id', '=', 'products.id')
            ->sum(DB::raw('transaction_items.quantity * products.cost_price'));

        $refundTotal = \App\Models\CashTransaction::where('transaction_type', 'OUT')
            ->where('category', 'refund')
            ->whereBetween('created_at', [$this->dari, $this->sampai->endOfDay()])
            ->sum('amount');

        $penjualanBruto   = (int) ($current->penjualan_bruto ?? 0);
        $totalDiskon      = (int) ($current->total_diskon ?? 0);
        $penjualanBersih  = (int) ($current->penjualan_bersih ?? 0);
        $totalHpp         = (int) $hpp;
        $labaKotor        = $penjualanBersih - $totalHpp;
        $nilaiVoid        = (int) $void;
        $nilaiRefund      = (int) $refundTotal;
        $labaBersih       = $labaKotor - $nilaiVoid - $nilaiRefund;

        return [
            'penjualan_bruto'  => $penjualanBruto,
            'penjualan'        => $penjualanBruto,
            'diskon'           => $totalDiskon,
            'penjualan_bersih' => $penjualanBersih,
            'total_hpp'        => $totalHpp,
            'hpp'              => $totalHpp,
            'hpp_total'        => $totalHpp,
            'laba_kotor'       => $labaKotor,
            'nilai_void'       => $nilaiVoid,
            'void'             => $nilaiVoid,
            'nilai_refund'     => $nilaiRefund,
            'refund'           => $nilaiRefund,
            'laba_bersih'      => $labaBersih,
            'margin_kotor'     => $penjualanBersih > 0 ? round(($labaKotor / $penjualanBersih) * 100, 1) : 0,
            'margin_bersih'    => $penjualanBersih > 0 ? round(($labaBersih / $penjualanBersih) * 100, 1) : 0,
            'beban_operasional' => 0,
            'operasional'      => 0,
            'trend'            => [
                'penjualan_bruto' => 0,
                'diskon'         => 0,
                'hpp'            => 0,
                'nilai_void'     => 0,
                'nilai_refund'   => 0,
            ],
        ];
    }

    public function getHppStats(): array
    {
        $kategoriMargin = ProductCategory::leftJoin('products', 'product_categories.id', '=', 'products.category_id')
            ->selectRaw('
                product_categories.name as nama,
                product_categories.name as kategori,
                COALESCE(AVG(products.price - products.cost_price) / NULLIF(AVG(products.price), 0) * 100, 0) as margin,
                COALESCE(AVG(products.price - products.cost_price) / NULLIF(AVG(products.price), 0) * 100, 0) as margin_persen
            ')
            ->where('products.status', 'aktif')
            ->groupBy('product_categories.id', 'product_categories.name')
            ->get();

        $allProducts = Product::where('status', 'aktif')
            ->selectRaw('
                COALESCE(AVG(price - cost_price), 0) as avg_margin,
                SUM(cost_price) as total_hpp
            ')
            ->first();

        return [
            'per_kategori'  => $kategoriMargin->toArray(),
            'kategori'      => $kategoriMargin->toArray(),
            'rata_margin'   => round((float) ($allProducts->avg_margin ?? 0), 1),
            'avg_margin'    => round((float) ($allProducts->avg_margin ?? 0), 1),
            'total_hpp'     => (int) ($allProducts->total_hpp ?? 0),
            'total'         => (int) ($allProducts->total_hpp ?? 0),
            'detail'        => $this->getMarginPerProduk(),
            'margin_per_produk' => $this->getMarginPerProduk(),
        ];
    }

    public function getMarginPerProduk(): array
    {
        return Product::leftJoin('product_categories', 'products.category_id', '=', 'product_categories.id')
            ->where('products.status', 'aktif')
            ->selectRaw('
                products.id,
                products.name as nama,
                products.name as produk,
                COALESCE(product_categories.name, \'Umum\') as kategori,
                products.cost_price as harga_beli,
                products.cost_price as hpp,
                products.cost_price as beli,
                products.price as harga_jual,
                products.price as jual,
                (products.price - products.cost_price) as margin_rp,
                (products.price - products.cost_price) as margin_rupiah,
                CASE WHEN products.price > 0 
                    THEN ROUND((products.price - products.cost_price) / products.price * 100, 1)
                    ELSE 0 
                END as margin_persen,
                CASE WHEN products.price > 0 
                    THEN ROUND((products.price - products.cost_price) / products.price * 100, 1)
                    ELSE 0 
                END as margin
            ')
            ->orderByDesc('margin_persen')
            ->limit(100)
            ->get()
            ->toArray();
    }

    public function getDiskonStats(): array
    {
        $current = $this->queryTransaction()
            ->where('status', 'completed')
            ->selectRaw('
                COUNT(*) as total_pemakaian,
                COALESCE(SUM(discount), 0) as total_diskon,
                COALESCE(SUM(grand_total), 0) as total_revenue
            ')
            ->first();

        $totalDiskon   = (int) ($current->total_diskon ?? 0);
        $totalRevenue  = (int) ($current->total_revenue ?? 0);
        $totalPemakaian = (int) ($current->total_pemakaian ?? 0);

        $er = $totalDiskon > 0 ? round(($totalDiskon / $totalRevenue) * 100, 1) : 0;

        return [
            'total_diskon'     => $totalDiskon,
            'total'            => $totalDiskon,
            'revenue_impact'   => $totalRevenue,
            'dampak_revenue'   => $totalRevenue,
            'total_pemakaian'  => $totalPemakaian,
            'pemakaian'        => $totalPemakaian,
            'efektivitas'      => $er,
            'effectiveness'    => $er,
            'roi_rata'         => $totalDiskon > 0 ? round($totalRevenue / $totalDiskon, 1) : 0,
            'avg_roi'          => $totalDiskon > 0 ? round($totalRevenue / $totalDiskon, 1) : 0,
            'trend_efektivitas' => 0,
        ];
    }

    public function getPromoPerformance(): array
    {
        // Group by discount amount ranges as proxy for promo performance
        // In production, this would query a promos/promotions table
        $promos = $this->queryTransaction()
            ->where('status', 'completed')
            ->where('discount', '>', 0)
            ->selectRaw('
                CASE 
                    WHEN discount < 10000 THEN \'Diskon Kecil\'
                    WHEN discount < 50000 THEN \'Diskon Sedang\'
                    WHEN discount < 100000 THEN \'Diskon Besar\'
                    ELSE \'Diskon Spesial\'
                END as nama,
                discount as nilai_diskon,
                grand_total as revenue,
                COUNT(*) as pemakaian
            ')
            ->groupBy('nama', 'nilai_diskon', 'revenue')
            ->orderByDesc('pemakaian')
            ->limit(20)
            ->get()
            ->map(function ($p) {
                $nilaiDiskon = (int) $p->nilai_diskon;
                $revenue = (int) $p->revenue;
                return [
                    'nama'         => $p->nama,
                    'promo'        => $p->nama,
                    'kode'         => '-',
                    'pemakaian'    => (int) $p->pemakaian,
                    'count'        => (int) $p->pemakaian,
                    'nilai_diskon' => $nilaiDiskon,
                    'diskon'       => $nilaiDiskon,
                    'revenue'      => $revenue,
                    'pendapatan'   => $revenue,
                    'roi'          => $nilaiDiskon > 0 ? round($revenue / $nilaiDiskon, 1) : 0,
                ];
            })
            ->toArray();

        return $promos;
    }

    protected function queryTransaction(bool $periodLalu = false): \Illuminate\Database\Eloquent\Builder
    {
        $dari   = $periodLalu ? $this->dariLalu : $this->dari;
        $sampai = $periodLalu ? $this->sampaiLalu : $this->sampai;

        $query = Transaction::whereBetween('created_at', [$dari, $sampai->endOfDay()]);

        if ($this->outlet !== 'all') {
            $outlet = Outlet::where('slug', $this->outlet)->orWhere('id', $this->outlet)->first();
            if ($outlet) {
                $query->where('outlet_id', $outlet->id);
            }
        }

        return $query;
    }
}
