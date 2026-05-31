<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashTransaction; // Pastikan model ini di-import
use Illuminate\Http\Request;

class CashTransactionController extends Controller
{
    public function store(Request $request)
{
    $user = auth()->user();
    if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

    // Cari shift yang sedang 'open' milik user yang login
    $activeShift = \App\Models\CashRegisterShift::where('user_id', $user->id)
        ->where('status', 'open')
        ->first();

    if (!$activeShift) {
        return response()->json(['message' => 'Tidak ada shift kasir yang terbuka!'], 400);
    }

    CashTransaction::create([
    'shift_id'         => $activeShift->id,
    'user_id'          => $user->id,

    'name'             => $request->nama,

    'transaction_type' =>
        $request->jenis === 'Uang Masuk'
            ? 'IN'
            : 'OUT',

    'category'         => $request->kategoriDetail,

    'amount'           => $request->jumlah,

    'description'      => $request->deskripsi,
]);

    return response()->json(['message' => 'Sukses'], 200);
}
}