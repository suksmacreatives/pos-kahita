<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\CashRegisterShift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PosController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $outletId = $user->outlet_id ?? 1;

        // Ambil data produk asli dari database Anda untuk di-grid di POS
        $products = Product::where('outlet_id', $outletId)->get();

        // Cek apakah kasir ini punya shift yang masih 'open'
        $activeShift = CashRegisterShift::where('user_id', $user->id)
            ->where('status', 'open')
            ->first();

        // Kirim data langsung ke Pages/Pos/Index (atau folder penempatan view Anda)
        return Inertia::render('Pos/Index', [
            'products_from_db' => $products,
            'is_shift_open_db' => $activeShift ? true : false,
            'active_shift_details' => $activeShift
        ]);
    }
}