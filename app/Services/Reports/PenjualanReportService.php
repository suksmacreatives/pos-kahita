<?php

namespace App\Services\Reports;

use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Outlet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class PenjualanReportService
{
    protected Carbon $dari;
    protected Carbon $sampai;
    protected Carbon $dariLalu;
    protected Carbon $sampaiLalu;
    protected string $outlet;

    public function __construct(Carbon $dari, Carbon $sampai, string $outlet = 'all', ?Carbon $dariLalu = null, ?Carbon $sampaiLalu = null)
    {
        $this->dari      = $dari;
        $this->sampai    = $sampai;
        $this->outlet    = $outlet;
        $this->dariLalu  = $dariLalu ?? $dari->copy()->subDays($sampai->diffInDays($dari) + 1);
        $this->sampaiLalu = $sampaiLalu ?? $dari->copy()->subDay();
    }

    public function all(): array
    {
        return Cache::remember(
            "report_penjualan_{$this->dari->format('Ymd')}_{$this->sampai->format('Ymd')}_{$this->outlet}",
            300,
            fn () => [
                'ringkasan'         => $this->getRingkasanOmset(),
                'omset_harian'      => $this->getOmsetHarian(),
                'per_outlet'        => $this->getPerOutlet(),
                'omset_perbandingan'=> [],
                'metode_bayar'      => $this->getMetodeBayar(),
                'void_list'         => $this->getVoidList(),
                'refund_list'       => $this->getRefundList(),
            ]
        );
    }

    public function getRingkasanOmset(): array
    {
        $current = $this->queryTransaction()
            ->selectRaw('
                COALESCE(SUM(grand_total), 0) as total_pendapatan,
                COUNT(*) as jumlah_transaksi,
                COALESCE(SUM(discount), 0) as diskon_total,
                COALESCE(AVG(grand_total), 0) as rata_transaksi
            ')
            ->where('status', 'completed')
            ->first();

        $lalu = $this->queryTransaction(true)
            ->selectRaw('
                COALESCE(SUM(grand_total), 0) as total_pendapatan,
                COUNT(*) as jumlah_transaksi
            ')
            ->where('status', 'completed')
            ->first();

        $labaKotor = $this->getLabaKotor($this->dari, $this->sampai);
        $labaKotorLalu = $this->getLabaKotor($this->dariLalu, $this->sampaiLalu);

        $nilaiVoid = (int) $this->queryTransaction()
            ->where('status', 'void')
            ->sum('grand_total');

        return [
            'total_pendapatan'       => (int) ($current->total_pendapatan ?? 0),
            'total_pendapatan_lalu'  => (int) ($lalu->total_pendapatan ?? 0),
            'jumlah_transaksi'       => (int) ($current->jumlah_transaksi ?? 0),
            'jumlah_transaksi_lalu'  => (int) ($lalu->jumlah_transaksi ?? 0),
            'laba_kotor'             => (int) $labaKotor,
            'laba_bersih'            => (int) ($labaKotor - $nilaiVoid),
            'rata_transaksi'         => (int) round($current->rata_transaksi ?? 0),
            'diskon_total'           => (int) ($current->diskon_total ?? 0),
            'nilai_void'             => $nilaiVoid,
        ];
    }

    public function getOmsetHarian(): array
    {
        return $this->queryTransaction()
            ->where('status', 'completed')
            ->selectRaw('DATE(created_at) as tanggal, COUNT(*) as transaksi, SUM(grand_total) as omset, SUM(discount) as diskon')
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('tanggal')
            ->get()
            ->toArray();
    }

    public function getPerOutlet(): array
    {
        $outlets = Outlet::aktif()->get(['id', 'name', 'slug', 'warna']);

        return $outlets->map(function ($outlet) {
            $current = Transaction::where('outlet_id', $outlet->id)
                ->where('status', 'completed')
                ->whereBetween('created_at', [$this->dari, $this->sampai->endOfDay()])
                ->selectRaw('COALESCE(SUM(grand_total), 0) as omset, COUNT(*) as transaksi')
                ->first();

            $lalu = Transaction::where('outlet_id', $outlet->id)
                ->where('status', 'completed')
                ->whereBetween('created_at', [$this->dariLalu, $this->sampaiLalu->endOfDay()])
                ->sum('grand_total');

            $omset = (int) ($current->omset ?? 0);
            $transaksi = (int) ($current->transaksi ?? 0);
            $growth = $lalu > 0 ? round((($omset - $lalu) / $lalu) * 100, 1) : 0;

            $target = $outlet->targetBulanIni;

            return [
                'id'         => $outlet->id,
                'nama'       => $outlet->name,
                'slug'       => $outlet->slug,
                'warna'      => $outlet->warna,
                'omset'      => $omset,
                'transaksi'  => $transaksi,
                'growth'     => $growth,
                'target'     => (int) ($target->target_omset ?? 0),
            ];
        })->toArray();
    }

    public function getMetodeBayar(): array
    {
        $results = $this->queryTransaction()
            ->where('status', 'completed')
            ->selectRaw('payment_method, COUNT(*) as jumlah, SUM(grand_total) as nilai')
            ->groupBy('payment_method')
            ->get();

        $metode = [];
        foreach ($results as $row) {
            $key = str_replace(' ', '_', strtolower(trim($row->payment_method)));
            $metode[$key] = [
                'jumlah' => (int) $row->jumlah,
                'nilai'  => (int) $row->nilai,
            ];
        }

        return $metode;
    }

    public function getVoidList(): array
    {
        return $this->queryTransaction()
            ->where('status', 'void')
            ->with(['items', 'user:id,name', 'outlet:id,name'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($t) => [
                'id'                => $t->id,
                'nomor_transaksi'   => $t->invoice_number,
                'outlet_nama'       => $t->outlet->name ?? '',
                'outlet'            => $t->outlet->name ?? '',
                'kasir_nama'        => $t->user->name ?? '',
                'kasir'             => $t->user->name ?? '',
                'tanggal_transaksi' => $t->created_at->toDateTimeString(),
                'total_void'        => (int) $t->grand_total,
                'nilai'             => (int) $t->grand_total,
                'total'             => (int) $t->grand_total,
                'alasan_void'       => $t->void_reason,
                'alasan'            => $t->void_reason,
                'items'             => $t->items->map(fn ($i) => [
                    'nama_produk' => $i->product_name_snapshot,
                    'warna'       => $i->variant_color,
                    'ukuran'      => $i->variant_size,
                    'qty'         => $i->quantity,
                    'harga_jual'  => (int) $i->price_at_sale,
                    'subtotal'    => (int) $i->total_price,
                ])->toArray(),
            ])
            ->toArray();
    }

    public function getRefundList(): array
    {
        // Refunds are tracked via cash_transactions with category 'refund'
        $refunds = \App\Models\CashTransaction::where('transaction_type', 'OUT')
            ->where('category', 'refund')
            ->whereBetween('created_at', [$this->dari, $this->sampai->endOfDay()])
            ->with(['user:id,name', 'shift.outlet:id,name'])
            ->orderByDesc('created_at')
            ->get();

        return $refunds->map(fn ($r) => [
            'id'               => $r->id,
            'nomor_refund'     => 'RF-' . str_pad($r->id, 6, '0', STR_PAD_LEFT),
            'nomor'            => 'RF-' . str_pad($r->id, 6, '0', STR_PAD_LEFT),
            'kasir_nama'       => $r->user->name ?? '',
            'kasir'            => $r->user->name ?? '',
            'outlet_nama'      => $r->shift->outlet->name ?? '',
            'outlet'           => $r->shift->outlet->name ?? '',
            'tanggal'          => $r->created_at->toDateTimeString(),
            'total_refund'     => (int) $r->amount,
            'nilai'            => (int) $r->amount,
            'total'            => (int) $r->amount,
            'metode_refund'    => $r->payment_method ?? 'tunai',
            'metode'           => $r->payment_method ?? 'tunai',
            'alasan_refund'    => $r->description,
            'alasan'           => $r->description,
            'items_refund'     => [],
        ])->toArray();
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

    protected function getLabaKotor(Carbon $dari, Carbon $sampai): int
    {
        $items = TransactionItem::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.status', 'completed')
            ->whereBetween('transactions.created_at', [$dari, $sampai->endOfDay()])
            ->selectRaw('
                SUM(transaction_items.total_price) as total_penjualan,
                SUM(transaction_items.quantity * COALESCE((
                    SELECT p.cost_price FROM products p WHERE p.id = transaction_items.product_id
                ), 0)) as total_hpp
            ')
            ->first();

        $totalPenjualan = (int) ($items->total_penjualan ?? 0);
        $totalHpp = (int) ($items->total_hpp ?? 0);

        return $totalPenjualan - $totalHpp;
    }
}
