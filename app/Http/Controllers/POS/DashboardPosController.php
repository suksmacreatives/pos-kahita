<?php

namespace App\Http\Controllers\POS;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\CashRegisterShift;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardPosController extends Controller
{
    public function dapatkanDataSidebar()
    {
        $user = Auth::user();
        $outletId = $user->outlet_id ?? 1;

        // 1. DATA TRANSAKSI UTAMA (Untuk DataPenjualan.jsx & VoidTransaksi.jsx)
        $shiftAktif = CashRegisterShift::where('user_id', $user->id)
    ->where('status', 'open')
    ->first();

$semuaTransaksi = collect();

if ($shiftAktif) {
    $semuaTransaksi = Transaction::where('shift_id', $shiftAktif->id)
        ->with(['transaction_items', 'user'])
        ->orderBy('id', 'desc')
        ->get();
}

        // 2. LAPORAN KASIR AKTIVITAS SESI (Untuk KasirAktivitas.jsx)
        $riwayatShift = CashRegisterShift::where('outlet_id', $outletId)
            ->with('user')
            ->orderBy('id', 'desc')
            ->get();

        $kasKasirMasaKini = [
            'modal_awal' => $shiftAktif ? $shiftAktif->starting_cash : 0,
            'total_tunai_masuk' => $shiftAktif ? $shiftAktif->system_cash : 0,
            'total_refund' => 0, // Bisa dikembangkan jika ada fitur refund khusus
            'total_kas_di_laci_sistem' => $shiftAktif ? ($shiftAktif->starting_cash + $shiftAktif->system_cash) : 0,
            'total_penjualan_semua_metode' => $shiftAktif ? Transaction::where('shift_id', $shiftAktif->id)->where('status', 'completed')->sum('grand_total') : 0
        ];

        // 4. LAPORAN PRODUK TERJUAL (Untuk ProdukTerjual.jsx)
        $totalOmset = Transaction::where('outlet_id', $outletId)->where('status', 'completed')->sum('grand_total');
        $volumeTerjual = TransactionItem::whereHas('transaction', function($q) use ($outletId) {
                $q->where('outlet_id', $outletId)->where('status', 'completed');
            })->sum('quantity');

        // Menghitung model/variasi unik yang laku terjual
        $variasiUnikTerjual = TransactionItem::whereHas('transaction', function($q) use ($outletId) {
                $q->where('outlet_id', $outletId)->where('status', 'completed');
            })
            ->distinct(['product_id', 'variant_color', 'variant_size'])
            ->count();

        $rataRataOmsetPerNota = Transaction::where('outlet_id', $outletId)->where('status', 'completed')->avg('grand_total') ?? 0;

        // Data Tabel Produk Terjual Terlaris (Menyesuaikan dengan tabel bawah)
        $tabelProdukTerjual = DB::table('transaction_items')
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->select(
                'transaction_items.product_name_snapshot as nama_produk',
                'transaction_items.variant_color as warna',
                'transaction_items.variant_size as ukuran',
                DB::raw('SUM(transaction_items.quantity) as total_qty'),
                DB::raw('SUM(transaction_items.total_price) as total_omset')
            )
            ->where('transactions.outlet_id', $outletId)
            ->where('transactions.status', 'completed')
            ->groupBy('product_name_snapshot', 'variant_color', 'variant_size')
            ->orderBy('total_qty', 'desc')
            ->get();

        // 5. JENIS BAYAR PIE-CHART DATA (Untuk JenisBayar.jsx)
        $laporanJenisBayar = DB::table('transactions')
            ->select('payment_method as metode', DB::raw('SUM(grand_total) as total_dana'), DB::raw('COUNT(id) as total_transaksi'))
            ->where('outlet_id', $outletId)
            ->where('status', 'completed')
            ->groupBy('payment_method')
            ->get();

        // Kumpulkan semua data untuk di-return
        return [
            'semua_transaksi' => $semuaTransaksi,
            'riwayat_shift' => $riwayatShift,
            'kas_kasir_aktif' => $kasKasirMasaKini,
            'analisis_produk' => [
                'total_omset' => $totalOmset,
                'volume_terjual' => $volumeTerjual,
                'variasi_terjual' => $variasiUnikTerjual,
                'rata_rata_omset' => round($rataRataOmsetPerNota),
                'list_tabel' => $tabelProdukTerjual
            ],
            'jenis_bayar' => $laporanJenisBayar
        ];
    }
}