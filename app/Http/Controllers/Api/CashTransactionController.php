<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashTransaction;
use App\Models\CashRegisterShift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CashTransactionController extends Controller
{
    public function store(Request $request)
{
    $user = Auth::user();
    if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

    // 1. Cari shift aktif
    $activeShift = \App\Models\CashRegisterShift::where('user_id', $user->id)
        ->where('status', 'open')
        ->latest() // Tambahkan latest()
        ->first();

    if (!$activeShift) {
        return response()->json(['message' => 'Tidak ada shift kasir yang terbuka!'], 400);
    }

    // 2. Simpan Transaksi
    $isMasuk = $request->jenis === 'Uang Masuk';
    
    CashTransaction::create([
        'shift_id'         => $activeShift->id,
        'user_id'          => $user->id,
        'name'             => $request->nama,
        'transaction_type' => $isMasuk ? 'IN' : 'OUT',
        'category'         => $request->kategoriDetail,
        'amount'           => $request->jumlah,
        'description'      => $request->deskripsi,
    ]);

    // 3. Update Otomatis Physical Cash di tabel CashRegisterShift
    if ($isMasuk) {
    $activeShift->increment('system_cash', $request->jumlah);
} else {
    $activeShift->decrement('system_cash', $request->jumlah);
}

    return response()->json(['message' => 'Sukses'], 200);
}
}