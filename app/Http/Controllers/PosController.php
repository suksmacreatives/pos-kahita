<?php

namespace App\Http\Controllers;

use App\Models\Product;
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
    ) {
    }

    public function index()
    {
        $user = Auth::user();
        $outletId = $user->outlet_id;

        // 1. Ambil shift aktif
        $activeShift = CashRegisterShift::where('user_id', $user->id)
            ->where('status', 'open')
            ->latest()
            ->first();

        // 2. Ambil absensi hari ini
        $attendances = Attendance::with('user')
            ->whereDate('date', today())
            ->latest()
            ->get();

        $outlet = Outlet::find($outletId);

        // 3. SOLUSI N+1 QUERY: Ambil semua stok outlet sekaligus dan simpan dalam key-value array
        $stocks = OutletStock::where('outlet_id', $outletId)
            ->pluck('stock', 'product_variant_id') // Menghasilkan: [variant_id => stock_quantity]
            ->toArray();

        // 4. Ambil produk dengan eager loading
        $products = Product::with(['variants', 'category'])
            ->where(function ($q) use ($outletId) {
                $q->where('outlet_id', $outletId)
                    ->orWhereJsonContains('outlet_ids', (string) $outletId);
            })
            ->get()
            ->map(function ($p) use ($stocks) {
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

        // 5. SOLUSI PROMO EXPIRED: Pastikan promo yang sudah melewati tanggal kadaluarsa tidak ikut ditarik
        $promos = Promo::aktif()
            ->where('berlaku_sampai', '>=', now())
            ->get();

        $penerimaanList = $this->inventoriOutlet->getPenerimaanList($outletId);

        $inventoryProducts = Product::with([
                'category',
                'variants'
            ])
            ->where(function ($q) use ($outletId) {
                $q->where('outlet_id', $outletId)
                ->orWhereJsonContains('outlet_ids', (string) $outletId);
            })
            ->get()
            ->map(function ($product) use ($outletId) {

                $totalStock = 0;

                $variants = $product->variants->map(function ($variant) use ($outletId, &$totalStock) {

                    $outletStock = OutletStock::where(
                        'product_variant_id',
                        $variant->id
                    )
                    ->where('outlet_id', $outletId)
                    ->value('stock') ?? 0;

                    $totalStock += $outletStock;

                    return [
                        'id' => $variant->id,
                        'sku' => $variant->sku,
                        'size' => $variant->size,
                        'color' => $variant->color,
                        'stock' => $outletStock,
                        'price' => $variant->price,
                    ];
                });

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,

                    'category' => $product->category?->name,

                    'image' => $product->image
                        ? Storage::url($product->image)
                        : null,

                    'price' => $product->price,

                    'stock_total' => $totalStock,

                    'variant_count' => $variants->count(),

                    'variants' => $variants,
                ];
            });
        return Inertia::render('Pos/Index', [
            'is_shift_open_db' => (bool) $activeShift,
            'active_shift_details' => $activeShift,
            'products_from_db' => $products,
            'inventoryProducts' => $inventoryProducts,
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

        // Proteksi kecurangan silang data antar outlet
        abort_if($distributionOrder->outlet_id !== $user->outlet_id, 403, 'Anda tidak memiliki akses ke dokumen DO ini.');

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