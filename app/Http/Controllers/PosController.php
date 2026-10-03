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

        if ($activeShift) {
            $activeShift->total_pemasukan = \App\Models\CashTransaction::where('shift_id', $activeShift->id)
                ->where('transaction_type', 'IN')
                ->sum('amount');

            $activeShift->pengeluaran_umum = \App\Models\CashTransaction::where('shift_id', $activeShift->id)
                ->where('transaction_type', 'OUT')
                ->sum('amount');
        }

        // Ambil absensi hari ini
        $attendances = Attendance::with('user')
            ->whereDate('date', today())
            ->latest()
            ->get();

        // Pastikan outlet id tersedia
        $outletId = $user->outlet_id;
        $outlet = Outlet::find($outletId);

        // Ambil produk
        $products = $this->scopeOutlet(
            Product::with(['variants', 'category']),
            $outletId
        )
            ->get()
            ->map(fn ($p) => $this->posProductPayload($p, $outletId));
        $promos = Promo::aktif()->berlakuUntukOutlet($outletId, $outlet?->slug)->get();

        $penerimaanList = $this->inventoriOutlet->getPenerimaanList($outletId);

        $inventoryProducts = $this->scopeOutlet(
            Product::with([
                'category',
                'variants'
            ]),
            $outletId
        )
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

                        $outletList = Outlet::all()->map(fn ($o) => [
                'id' => $o->id,
                'slug' => $o->slug,
                'nama' => $o->name,
                'warna' => 'emerald',
                'hexColor' => '#10B981',
            ]);

            $onlineShopList = \App\Models\OnlineShop::all()->map(fn ($s) => [
                'id' => $s->id,
                'nama' => $s->nama,
            ]);

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

            'outlets' => $outletList,
            'onlineShops' => $onlineShopList,
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

    /**
     * Fallback pencarian barcode di server.
     *
     * Dipakai POS ketika pencocokan in-memory gagal, supaya barcode produk
     * baru (atau produk di luar list awal halaman) tetap ketemu tanpa perlu
     * refresh. Outlet kasir dipakai sebagai scope agar hasilnya konsisten
     * dengan list produk yang tampil di POS.
     */
    public function scanLookup(Request $request)
    {
        $code = $this->normalizeScanCode((string) $request->query('q', ''));

        if ($code === '') {
            return response()->json(['found' => false, 'message' => 'Kode kosong.'], 422);
        }

        $outletId = $request->user()->outlet_id;

        // Tanpa outlet, scope produk kosong dan semua barcode akan reported
        // "tidak ditemukan". Lebih baik kasih error yang jelas.
        if (blank($outletId)) {
            return response()->json([
                'found' => false,
                'message' => 'Akun kasir belum ditugaskan ke outlet mana pun.',
            ], 403);
        }

        $hit = $this->resolveScanCode($code, $outletId);

        if (! $hit) {
            return response()->json(['found' => false], 404);
        }

        [$product, $variant] = $hit;

        return response()->json([
            'found' => true,
            ...$this->scanResultData($product, $variant, $outletId),
        ]);
    }

    protected function normalizeScanCode(string $raw): string
    {
        return strtoupper(trim((string) preg_replace('/[^A-Za-z0-9 .\-\/]/', '', $raw)));
    }

    /**
     * Batasi query produk ke outlet tertentu.
     *
     * PASTIKAN scope ini identik dengan filter di index(), karena seluruh
     * label barcode dicetak tanpa filter outlet. Tanpa scope yang sama,
     * barcode yang sah bisa jadi "tidak ditemukan" di kasir.
     */
    protected function scopeOutlet($query, $outletId)
    {
        return $query->where(function ($q) use ($outletId) {
            $q->where('outlet_id', $outletId)
                ->orWhereJsonContains('outlet_ids', (string) $outletId);
        });
    }

    /**
     * Bentuk payload produk untuk POS. Dipakai oleh index() sekaligus
     * scanLookup() supaya frontend hanya perlu menangani satu bentuk data.
     */
    protected function posProductPayload(Product $product, $outletId): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'sku' => $product->sku,
            'barcode_code' => $product->barcode_code,
            'price' => $product->price,
            'category_id' => $product->category_id,
            'category' => [
                'id' => $product->category?->id,
                'name' => $product->category?->name,
            ],
            'image' => $product->image
                ? Storage::url($product->image)
                : null,
            'variants' => $product->variants->map(function ($v) use ($outletId) {
                $stockOutlet = OutletStock::where('outlet_id', $outletId)
                    ->where('product_variant_id', $v->id)
                    ->value('stock') ?? 0;

                return [
                    'id' => $v->id,
                    'size' => $v->size,
                    'color' => $v->color,
                    'sku' => $v->sku,
                    'barcode_code' => $v->barcode_code,

                    'stock' => $stockOutlet,

                    'stok_gudang' => (int) $v->stock,
                    'stok_outlet' => (int) $stockOutlet,

                    'price' => $v->price,
                    'cost_price' => $v->cost_price,
                ];
            })->values(),
        ];
    }

    protected function resolveScanCode(string $code, $outletId): ?array
    {
        $variant = $this->scannableVariants($outletId)
            ->where('barcode_code', $code)
            ->with('product')
            ->first();
        if ($variant) {
            return [$variant->product, $variant];
        }

        $product = $this->scopeOutlet(
            Product::where('barcode_code', $code),
            $outletId
        )->first();
        if ($product) {
            return [$product, null];
        }

        // barcode_code di DB masih kosong semua, jadi kode sintetis P###### /
        // V###### dari accessor model harus dicoba lewat ID.
        if (preg_match('/^V(\d{6,})$/', $code, $m)) {
            $variant = $this->scannableVariants($outletId)
                ->with('product')
                ->find((int) $m[1]);
            if ($variant) {
                return [$variant->product, $variant];
            }
        }

        if (preg_match('/^P(\d{6,})$/', $code, $m)) {
            $product = $this->scopeOutlet(
                Product::whereKey((int) $m[1]),
                $outletId
            )->first();
            if ($product) {
                return [$product, null];
            }
        }

        $variant = $this->scannableVariants($outletId)
            ->where('sku', $code)
            ->with('product')
            ->first();
        if ($variant) {
            return [$variant->product, $variant];
        }

        $product = $this->scopeOutlet(
            Product::where('sku', $code),
            $outletId
        )->first();
        if ($product) {
            return [$product, null];
        }

        return null;
    }

    /**
     * Varian hanya boleh discan bila produk induknya tersedia di outlet kasir.
     */
    protected function scannableVariants($outletId)
    {
        return ProductVariant::whereHas(
            'product',
            fn ($q) => $this->scopeOutlet($q, $outletId)
        );
    }

    protected function scanResultData(Product $product, ?ProductVariant $variant, $outletId): array
    {
        $parent = $variant ? $variant->product : $product;

        return [
            'type' => $variant ? 'variant' : 'product',
            'product_id' => $product->id,
            'variant_id' => $variant?->id,
            'name' => $product->name,
            'sku' => $variant?->sku ?: $product->sku,
            'variant_color' => $variant?->color,
            'variant_size' => $variant?->size,
            'price' => (int) ($variant?->price ?? $product->price ?? 0),
            'barcode_code' => $variant?->barcode_code ?? $product->barcode_code,
            'product' => $this->posProductPayload(
                $parent->loadMissing(['variants', 'category']),
                $outletId
            ),
        ];
    }
}