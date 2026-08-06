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

        $shift = CashRegisterShift::create([
            'user_id'        => $user->id,
            'outlet_id'      => $outletId,
            'opened_at'      => Carbon::now(),
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

        $closedAt = Carbon::now();

        $transactions = Transaction::with('items')
        ->where('outlet_id', $shift->outlet_id)
        ->whereBetween(
            'created_at',
            [$shift->opened_at, $closedAt]
        )
        ->where('status','!=','void')
        ->get();

        $totalTunai = $transactions
            ->where('payment_method', 'Tunai')
            ->sum('grand_total');

        $totalTransfer = $transactions
            ->where('payment_method', 'Transfer')
            ->sum('grand_total');

        $totalQris = $transactions
            ->where('payment_method', 'QRIS')
            ->sum('grand_total');

        $totalDebit = $transactions
            ->where('payment_method', 'Debit')
            ->sum('grand_total');

        $totalEwallet = $transactions
            ->where('payment_method', 'E-Wallet')
            ->sum('grand_total');

        $totalVoid = Transaction::where('outlet_id', $shift->outlet_id)
            ->whereBetween(
                'created_at',
                [$shift->opened_at, $closedAt]
            )
            ->where('status', 'void')
            ->sum('grand_total');

        $totalPenjualan = $transactions->sum('grand_total');

        $totalTransaksi = $transactions->count();

        $totalItem = TransactionItem::whereIn(
                'transaction_id',
                $transactions->pluck('id')
            )
            ->sum('quantity');

        $totalCash = $shift->starting_cash + $totalTunai;

        $discrepancy =
            $request->physical_cash - $totalCash;

        $shift->update([
            'closed_at'      => $closedAt,
            'physical_cash'  => $request->physical_cash,
            'system_cash'    => $totalCash,
            'discrepancy'    => $discrepancy,
            'status'         => 'closed',
        ]);

        // Notify admins about shift closure
        $admins = User::whereIn('role', ['admin', 'owner'])->where('status', 'aktif')->get();
        $severity = abs($discrepancy) > 0 ? 'warning' : 'info';
        foreach ($admins as $admin) {
            $admin->notify(new ShiftNotification([
                'title'    => 'Shift Ditutup',
                'message'  => "Shift {$user->name} ditutup" . ($discrepancy != 0 ? " (selisih: Rp " . number_format(abs($discrepancy), 0, ',', '.') . ")" : ""),
                'link'     => '/admin/reports?kategori=kasir&sub=performa-kasir',
                'icon'     => 'clock',
                'severity' => $severity,
            ]));
        }

        session()->forget('active_shift_id');

        $produkTerjual = [];

foreach ($transactions as $trx) {

    foreach ($trx->items as $item) {

        $nama = $item->product_name_snapshot;

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

        $produkTerjual[$nama]['qty'] += $item->quantity;
    }
}

        $rekapShiftData = [
            'kasir'            => $user->name,
            'opened_at'        => Carbon::parse($shift->opened_at)->format('d-m-Y H:i'),
            'closed_at'        => Carbon::parse($closedAt)->format('d-m-Y H:i'),

            'starting_cash'    => $shift->starting_cash,
            'cash_expected'    => $totalCash,
            'system_cash'      => $totalCash,
            'physical_cash'    => $shift->physical_cash,
            'discrepancy'      => $shift->discrepancy,

            'tunai'            => $totalTunai,
            'transfer'         => $totalTransfer,
            'qris'             => $totalQris,
            'debit'            => $totalDebit,
            'ewallet'          => $totalEwallet,
            'void'             => $totalVoid,

            'total_penjualan' => $totalPenjualan,
            'total_transaksi' => $totalTransaksi,
            'total_item'      => $totalItem,
            'products' => array_values($produkTerjual),
        ];

        return response()->json([
            'success'      => true,
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