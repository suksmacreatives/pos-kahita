<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\OutletStock;
use App\Models\CashRegisterShift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\Attendance;
use App\Models\Outlet;
use App\Models\Promo;
use Inertia\Inertia;

class PosController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Ambil shift aktif
        $activeShift = CashRegisterShift::where('user_id', $user->id)
            ->where('status', 'open')
            ->latest()
            ->first();

        // Ambil absensi hari ini
        $attendances = Attendance::with('user')
            ->whereDate('date', today())
            ->latest()
            ->get();

        // Pastikan outlet id tersedia
        $outletId = $user->outlet_id;
        $outlet = Outlet::find($outletId);

        // Ambil produk
        $products = Product::with(['variants', 'category'])
            ->where(function ($q) use ($outletId) {
                $q->where('outlet_id', $outletId)
                    ->orWhereJsonContains('outlet_ids', (string) $outletId);
            })
            ->get()
            ->map(function ($p) use ($outletId) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'sku' => $p->sku,
                    'price' => $p->price,
                    'category_id' => $p->category_id,
                    'category' => [
                        'id' => $p->category?->id,
                        'name' => $p->category?->name,
                    ],
                    'image' => $p->image
                        ? Storage::url($p->image)
                        : null,
                    'variants' => $p->variants->map(function ($v) use ($outletId) {
                    // Mencoba mencari stok di tabel outlet_stocks
                    $outletStock = OutletStock::where('outlet_id', $outletId)
                        ->where('product_variant_id', $v->id)
                        ->value('stock');

                    // Jika di outlet_stocks tidak ada (null), kita ambil dari v->stock (gudang)
                    $finalOutletStock = $outletStock !== null
                    ? (int) $outletStock
                    : (int) $v->stock;
                    
                        return [
                            'id' => $v->id,
                            'size' => $v->size,
                            'color' => $v->color,
                            'sku' => $v->sku,
                            'stock' => $finalOutletStock,
                            'stok_gudang' => (int) $v->stock,
                            'stok_outlet' => $finalOutletStock,
                            'total_stok' => (int) $v->stock + $finalOutletStock,
                        ];
                    }),
                ];
            });
            $promos = Promo::where('status', 'aktif')->get();
            
        return Inertia::render('Pos/Index', [
            'is_shift_open_db' => $activeShift ? true : false,
            'active_shift_details' => $activeShift,
            'products_from_db' => $products,
            'promos' => $promos,
            'attendances' => $attendances,
            'outlet_name' => $outlet?->name,
        ]);
    }
}