<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\OutletStock;
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
        $products = Product::with('variants')
            ->where(function ($q) use ($outletId) {
                $q->where('outlet_id', $outletId)
                  ->orWhereJsonContains('outlet_ids', (string) $outletId);
            })->get()
            ->map(function ($p) use ($outletId) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'sku' => $p->sku,
                    'price' => $p->price,
                    'image' => $p->image ? \Illuminate\Support\Facades\Storage::url($p->image) : null,
                    'variants' => $p->variants->map(function ($v) use ($outletId) {
                        $outletStock = OutletStock::where('outlet_id', $outletId)
                            ->where('product_variant_id', $v->id)
                            ->value('stock') ?? 0;
                        return [
                            'id' => $v->id,
                            'size' => $v->size,
                            'color' => $v->color,
                            'sku' => $v->sku,
                            'stok_gudang' => (int) $v->stock,
                            'stok_outlet' => $outletStock,
                            'total_stok' => (int) $v->stock + $outletStock,
                        ];
                    }),
                ];
            });

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