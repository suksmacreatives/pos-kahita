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
    ) {
    }

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
                            ->first();

                        $stockOutlet = $outletStock?->stock ?? 0;

                        return [
                            'id' => $v->id,
                            'size' => $v->size,
                            'color' => $v->color,
                            'sku' => $v->sku,

                            'stock' => $stockOutlet,

                            'stok_gudang' => (int) $v->stock,
                            'stok_outlet' => (int) $stockOutlet,

                            'price' => $v->price,
                            'cost_price' => $v->cost_price,
                        ];
                    }),
                ];
            });
        $promos = Promo::aktif()->berlakuUntukOutlet($outletId, $outlet?->slug)->get();

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
            'is_shift_open_db' => $activeShift ? true : false,
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

    public function tutupKasir(Request $request)
    {
        $user = $request->user();

        // 1. Cari shift aktif milik user yang sedang login
        $activeShift = CashRegisterShift::where('user_id', $user->id)
            ->where('status', 'open')
            ->latest()
            ->first();

        if (!$activeShift) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada shift yang aktif.'
            ], 400);
        }

        // 2. Lakukan proses tutup kasir (ubah status jadi closed, simpan uang fisik, hitung selisih, dll)
        $activeShift->update([
            'status' => 'closed',
            'physical_cash' => $request->input('physical_cash'),
            'closed_at' => now(),
        ]);

        // 3. Siapkan data laporan shift untuk dikembalikan ke frontend agar bisa dicetak via Cleanter
        $shiftReport = [
            'kasir' => $user->name,
            'outlet' => Outlet::find($user->outlet_id)?->name ?? '-',
            'waktu_tutup' => now()->format('d-m-Y H:i:s'),
            'modal_awal' => $activeShift->initial_cash,
            'uang_fisik' => $request->input('physical_cash'),
            // Tambahkan data ringkasan transaksi lainnya sesuai kebutuhan struktur Cleanter Anda
        ];

        // 4. Kembalikan response JSON (TANPA cURL server-side sama sekali)
        return response()->json([
            'success' => true,
            'shift_report' => $shiftReport
        ]);
    }
    
}