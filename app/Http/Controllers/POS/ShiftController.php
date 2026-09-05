<?php

namespace App\Http\Controllers\POS;

use App\Http\Controllers\Controller;
use App\Models\CashRegisterShift;
use App\Models\User;
use App\Notifications\ShiftNotification;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ShiftController extends Controller
{
    // ==========================================================
    // BUKA KASIR
    // ==========================================================
    public function bukaKasir(Request $request)
    {
        $request->validate([
            'starting_cash' => 'required|numeric|min:0',
        ]);

        $user = Auth::user();

        $outletId = $user->outlet_id ?? 1;

        $activeShift = CashRegisterShift::where('user_id', $user->id)
            ->where('status', 'open')
            ->first();

        if ($activeShift) {
            return redirect()->back()->with(
                'error',
                'Anda masih memiliki sesi shift yang aktif!'
            );
        }

        $now = Carbon::now('Asia/Makassar');

        $shift = CashRegisterShift::create([
            'user_id'        => $user->id,
            'outlet_id'      => $outletId,
            'opened_at'      => $now,
            'starting_cash'  => $request->starting_cash,
            'system_cash'    => 0,
            'physical_cash'  => $request->starting_cash,
            'status'         => 'open',
        ]);

        session([
            'active_shift_id' => $shift->id
        ]);

        return redirect()->back()->with(
            'success',
            'Kasir berhasil dibuka dengan modal awal.'
        );
    }

    // ==========================================================
    // TUTUP KASIR
    // ==========================================================
    public function tutupKasir(Request $request)
{
    $request->validate([
        'physical_cash' => 'required|numeric|min:0',
    ]);

    $user = Auth::user();

    $shift = CashRegisterShift::where('user_id', $user->id)
        ->where('status', 'open')
        ->first();

    if (!$shift) {
        return response()->json([
            'success' => false,
            'message' => 'Shift tidak ditemukan.'
        ], 404);
    }

    $closedAt = Carbon::now('Asia/Makassar');

    // ==========================================================
    // 1. AMBIL SEMUA TRANSAKSI DALAM SHIFT
    //    Termasuk COMPLETED dan VOID
    // ==========================================================

    $transactions = Transaction::with('items')
        ->where('shift_id', $shift->id)
        ->get();

    // ==========================================================
    // 2. TRANSAKSI COMPLETED
    //    Hanya ini yang dihitung sebagai penjualan
    // ==========================================================

    $completedTransactions = $transactions
        ->where('status', 'completed')
        ->values();

    // ==========================================================
    // 3. TRANSAKSI VOID
    //    Tidak dihitung, tetapi tetap dikirim ke struk
    // ==========================================================

    $voidTransactions = $transactions
        ->where('status', 'void')
        ->values();

    // ==========================================================
    // 4. HITUNG PENJUALAN PER METODE PEMBAYARAN
    // ==========================================================

    $totalTunai = 0;
    $totalTransfer = 0;
    $totalQris = 0;
    $totalDebit = 0;
    $totalEwallet = 0;

    foreach ($completedTransactions as $transaction) {

        $paymentMethod = strtoupper(
            trim($transaction->payment_method ?? '')
        );

        $grandTotal = (float) $transaction->grand_total;

        switch ($paymentMethod) {

            case 'TUNAI':
            case 'CASH':
                $totalTunai += $grandTotal;
                break;

            case 'TRANSFER':
                $totalTransfer += $grandTotal;
                break;

            case 'QRIS':
                $totalQris += $grandTotal;
                break;

            case 'DEBIT':
                $totalDebit += $grandTotal;
                break;

            case 'E-WALLET':
            case 'EWALLET':
                $totalEwallet += $grandTotal;
                break;
        }
    }

    // ==========================================================
    // 5. TOTAL PENJUALAN
    // ==========================================================

    $totalPenjualan =
        $totalTunai
        + $totalTransfer
        + $totalQris
        + $totalDebit
        + $totalEwallet;

    // ==========================================================
    // 6. CASH TRANSACTION
    //    Ambil UANG MASUK / UANG KELUAR dari shift
    // ==========================================================

    $cashTransactions = \App\Models\CashTransaction::where(
        'shift_id',
        $shift->id
    )
        ->orderBy('created_at', 'asc')
        ->get();

    $totalPemasukan = (float) $cashTransactions
        ->where('transaction_type', 'IN')
        ->sum('amount');

    $totalPengeluaran = (float) $cashTransactions
        ->where('transaction_type', 'OUT')
        ->sum('amount');

    // ==========================================================
    // 7. CASH AKTUAL SISTEM
    //
    // Modal Awal
    // + Penjualan Tunai
    // + Uang Masuk
    // - Uang Keluar
    // ==========================================================

    $cashAktualSistem =
        (float) $shift->starting_cash
        + $totalTunai
        + $totalPemasukan
        - $totalPengeluaran;

    // ==========================================================
    // 8. CASH FISIK
    // ==========================================================

    $cashFisik = (float) $request->physical_cash;

    // ==========================================================
    // 9. SELISIH
    // ==========================================================

    $discrepancy = $cashFisik - $cashAktualSistem;

    $selisihJenis = null;

    if ($discrepancy < 0) {
        $selisihJenis = 'KURANG';
    } elseif ($discrepancy > 0) {
        $selisihJenis = 'LEBIH';
    }

    // ==========================================================
    // 10. TOTAL TRANSAKSI
    //     Hanya COMPLETED
    // ==========================================================

    $totalTransaksi = $completedTransactions->count();

    // ==========================================================
    // 11. TOTAL ITEM TERJUAL
    //     Hanya COMPLETED
    // ==========================================================

    $totalItem = 0;

    foreach ($completedTransactions as $trx) {

        foreach ($trx->items as $item) {

            $totalItem += (int) $item->quantity;
        }
    }

    // ==========================================================
    // 12. PRODUK TERJUAL
    //     Hanya COMPLETED
    // ==========================================================

    $produkTerjual = [];

    foreach ($completedTransactions as $trx) {

        foreach ($trx->items as $item) {

            $nama = $item->product_name_snapshot ?? 'Produk';

            if ($item->variant_color || $item->variant_size) {

                $nama .= " (";

                if ($item->variant_color) {
                    $nama .= $item->variant_color;
                }

                if ($item->variant_size) {

                    if ($item->variant_color) {
                        $nama .= " / ";
                    }

                    $nama .= $item->variant_size;
                }

                $nama .= ")";
            }

            if (!isset($produkTerjual[$nama])) {

                $produkTerjual[$nama] = [
                    'nama' => $nama,
                    'qty' => 0,
                ];
            }

            $produkTerjual[$nama]['qty'] += (int) $item->quantity;
        }
    }

    // ==========================================================
    // 13. DATA TRANSAKSI VOID UNTUK STRUK
    // ==========================================================

    $voidData = $voidTransactions
        ->map(function ($transaction) {

            return [
                'invoice_number' => $transaction->invoice_number,
                'customer_name' => $transaction->customer_name,
                'grand_total' => (float) $transaction->grand_total,
                'payment_method' => $transaction->payment_method,
                'voided_at' => $transaction->voided_at
                    ? Carbon::parse($transaction->voided_at)
                        ->format('d-m-Y H:i')
                    : null,
            ];
        })
        ->values()
        ->toArray();

    // ==========================================================
    // 14. UPDATE SHIFT
    // ==========================================================

    $shift->update([
        'closed_at' => $closedAt,
        'physical_cash' => $cashFisik,
        'system_cash' => $cashAktualSistem,
        'discrepancy' => $discrepancy,
        'status' => 'closed',
    ]);

    // ==========================================================
    // 15. NOTIFIKASI ADMIN
    // ==========================================================

    $admins = User::whereIn('role', ['admin', 'owner'])
        ->where('status', 'aktif')
        ->get();

    $severity = abs($discrepancy) > 0
        ? 'warning'
        : 'info';

    foreach ($admins as $admin) {

        $admin->notify(new ShiftNotification([
            'title' => 'Shift Ditutup',

            'message' =>
                "Shift {$user->name} ditutup"
                . (
                    $discrepancy != 0
                        ? " (selisih: Rp "
                        . number_format(
                            abs($discrepancy),
                            0,
                            ',',
                            '.'
                        )
                        . ")"
                        : ""
                ),

            'link' => '/admin/reports?kategori=kasir&sub=performa-kasir',

            'icon' => 'clock',

            'severity' => $severity,
        ]));
    }

    // ==========================================================
    // 16. HAPUS SESSION SHIFT
    // ==========================================================

    session()->forget('active_shift_id');

    // ==========================================================
    // 17. REKAP UNTUK PRINTSHIFTREPORT
    // ==========================================================

    $rekapShiftData = [

        'kasir' => $user->name,

        'opened_at' => Carbon::parse(
            $shift->opened_at
        )->format('d-m-Y H:i'),

        'closed_at' => $closedAt->format(
            'd-m-Y H:i'
        ),

        // ------------------------------
        // CASH
        // ------------------------------

        'starting_cash' => (float) $shift->starting_cash,

        'physical_cash' => $cashFisik,

        'cash_aktual_sistem' => $cashAktualSistem,

        'cash_expected' => $cashAktualSistem,

        'system_cash' => $cashAktualSistem,

        'discrepancy' => abs($discrepancy),

        'selisih' => abs($discrepancy),

        'selisih_jenis' => $selisihJenis,

        // ------------------------------
        // PENJUALAN
        // ------------------------------

        'tunai' => $totalTunai,

        'transfer' => $totalTransfer,

        'qris' => $totalQris,

        'debit' => $totalDebit,

        'ewallet' => $totalEwallet,

        'total_penjualan' => $totalPenjualan,

        // ------------------------------
        // CASH TRANSACTION
        // ------------------------------

        'pemasukan' => $totalPemasukan,

        'cash_in' => $totalPemasukan,

        'pengeluaran' => $totalPengeluaran,

        'cash_out' => $totalPengeluaran,

        // ------------------------------
        // TRANSAKSI
        // ------------------------------

        'total_transaksi' => $totalTransaksi,

        'total_item' => $totalItem,

        'products' => array_values($produkTerjual),

        // ------------------------------
        // VOID
        // ------------------------------

        'total_void' => count($voidData),

        'void_transactions' => $voidData,

        // ------------------------------
        // DETAIL CASH TRANSACTION
        // ------------------------------

        'cash_transactions' => $cashTransactions
            ->map(function ($item) {

                return [
                    'id' => $item->id,
                    'nama' => $item->name,

                    'jenis' =>
                        $item->transaction_type === 'IN'
                            ? 'Uang Masuk'
                            : 'Uang Keluar',

                    'kategori' => $item->category,

                    'jumlah' => (float) $item->amount,

                    'deskripsi' => $item->description,

                    'created_at' => $item->created_at
                        ? Carbon::parse($item->created_at)
                            ->format('d-m-Y H:i')
                        : null,
                ];
            })
            ->values()
            ->toArray(),
    ];

    return response()->json([
        'success' => true,
        'shift_report' => $rekapShiftData,
    ]);
}

    // ==========================================================
    // RIWAYAT SHIFT
    // ==========================================================
    public function riwayatShiftHariIni()
    {
        $riwayat = CashRegisterShift::whereDate(
                'created_at',
                Carbon::today()
            )
            ->with('user:id,name')
            ->orderBy('opened_at', 'desc')
            ->get();

        return response()->json($riwayat);
    }
    public function logoutAfterPrint(Request $request)
{
    Auth::logout();

    $request->session()->invalidate();

    $request->session()->regenerateToken();

    return response()->json([
        'success' => true
    ]);
}
}