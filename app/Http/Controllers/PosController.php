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
use App\Models\DistributionOrder;
use App\Models\Outlet;
use App\Models\Promo;
use App\Services\Inventory\InventoriOutletService;
use App\Http\Requests\Inventory\Outlet\KonfirmasiTerimaRequest;
use Inertia\Inertia;

class PosController extends Controller
{
    public function __construct(
        protected InventoriOutletService $inventoriOutlet
    ) {}

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
                    $outletStock = OutletStock::where('outlet_id', $outletId)
                        ->where('product_variant_id', $v->id)
                        ->value('stock');

                    $finalOutletStock = $outletStock !== null
                    ? (int) $outletStock
                    : 0;
                    
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
            $promos = Promo::aktif()->get();
            
        $penerimaanList = $this->inventoriOutlet->getPenerimaanList($outletId);

        return Inertia::render('Pos/Index', [
            'is_shift_open_db' => $activeShift ? true : false,
            'active_shift_details' => $activeShift,
            'products_from_db' => $products,
            'promos' => $promos,
            'attendances' => $attendances,
            'outlet_name' => $outlet?->name,
            'penerimaanList' => $penerimaanList,
            'outletSlug' => $outlet?->slug,
        ]);
    }

    public function konfirmasiPenerimaan(KonfirmasiTerimaRequest $request, DistributionOrder $distributionOrder)
    {
        $user = $request->user();
        abort_if($distributionOrder->outlet_id !== $user->outlet_id, 403);

        try {
            $this->inventoriOutlet->konfirmasiTerima(
                $distributionOrder->id,
                $request->input('items'),
                $request->input('penerima') ?? $user->name
            );

            return redirect()->back()->with('success', 'Penerimaan barang berhasil dikonfirmasi.');
        } catch (\App\Exceptions\InsufficientStockException $e) {
            return redirect()->back()->withErrors(['stok' => $e->getMessage()]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('POS konfirmasi terima error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal mengkonfirmasi penerimaan: ' . $e->getMessage());
        }
    }
}