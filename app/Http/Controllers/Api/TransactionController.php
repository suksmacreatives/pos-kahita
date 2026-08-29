<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\OutletStock;
use App\Models\StockMovement;
use App\Models\CashRegisterShift;
use App\Models\Promo;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    /**
     * GET ALL TRANSACTIONS
     */
    public function index()
    {
        $transactions = Transaction::with([
            'items',
            'user',
            'outlet'
        ])
        ->latest()
        ->get();

        return response()->json($transactions);
    }

    /**
     * STORE TRANSACTION
     */
public function store(Request $request)
{
    $existingTransaction = Transaction::where('invoice_number', 'INV-' . now()->format('YmdHis'))->exists();
if ($existingTransaction) {
    throw new \Exception("Transaksi sedang diproses, mohon tunggu.");
}
    DB::beginTransaction();

    try {
        $request->validate([
            'customer_name' => 'nullable|string',
            'payment_method' => 'required|string',
            'subtotal' => 'required|numeric',
            'grand_total' => 'required|numeric',
            'items' => 'required|array',
            'promo_id' => 'nullable|exists:promos,id',
        ]);

        $user = Auth::user();
        if (!$user) throw new \Exception('User tidak terautentikasi');

        $activeShift = CashRegisterShift::where('user_id', $user->id)->where('status', 'open')->first();

        $subtotal = (float) $request->subtotal;
        $outlet = $user->outlet;

        // VALIDASI & HITUNG ULANG PROMO DI SERVER (jangan percaya nilai dari frontend)
        $promo = null;
        $discount = 0;
        if (!empty($request->promo_id)) {
            $promo = Promo::aktif()
                ->berlakuUntukOutlet($user->outlet_id, $outlet?->slug)
                ->find($request->promo_id);

            if (!$promo) {
                throw new \Exception('Promo tidak valid, tidak aktif, atau tidak berlaku untuk outlet ini.');
            }

            if ($subtotal < (float) $promo->min_transaksi) {
                throw new \Exception("Promo {$promo->nama_promo} membutuhkan minimal transaksi Rp " . number_format((float) $promo->min_transaksi, 0, ',', '.') . '.');
            }

            if ($promo->berlaku_untuk !== 'semua') {
                $allowedCategories = array_filter(array_map('trim', explode(',', (string) $promo->berlaku_untuk)));
                $productIds = collect($request->items)->pluck('product_id')->all();
                $match = !empty($allowedCategories)
                    && Product::whereIn('id', $productIds)
                        ->whereIn('category_id', $allowedCategories)
                        ->exists();

                if (!$match) {
                    throw new \Exception("Promo {$promo->nama_promo} tidak berlaku untuk produk di keranjang ini.");
                }
            }

            $discount = $promo->hitungDiskon($subtotal, $request->items);
        }

        $discount = min(max($discount, 0), $subtotal);
        $grandTotal = max(0, $subtotal - $discount);


    $transaction = Transaction::create([
        'invoice_number' => 'INV-' . now()->format('YmdHis'),
        'outlet_id' => $user->outlet_id,
        'user_id' => $user->id,
        'shift_id' => $activeShift?->id,
        'customer_name' => $request->customer_name ?? 'Umum',
        'payment_method' => $request->payment_method,
        'promo_id' => $promo?->id,
        'subtotal' => $subtotal,
        'discount' => $discount,
        'grand_total' => $grandTotal,
        'change_amount' => $request->change_amount ?? 0,
        'status' => 'completed'
    ]);

        foreach ($request->items as $item) {
            // 1. Simpan Item
            TransactionItem::create([
                'transaction_id' => $transaction->id,
                'product_id' => $item['product_id'],
                'product_name_snapshot' => $item['product_name'],
                'variant_color' => $item['variant_color'] ?? null,
                'variant_size' => $item['variant_size'] ?? null,
                'price_at_sale' => $item['price'],
                'quantity' => $item['quantity'],
                'total_price' => $item['price'] * $item['quantity']
            ]);

            // 2. Cari Variant
            // 2. Cari Variant yang lebih kuat (Robust)
$norm = function ($val) {
    $v = strtolower(trim((string) $val));
    if ($v === '' || $v === 'undefined' || $v === 'null' || $v === '-') return '';
    return $v;
};

$reqColor = $norm($item['variant_color'] ?? '');
$reqSize  = $norm($item['variant_size'] ?? '');

$variant = ProductVariant::where('product_id', $item['product_id'])->get()->first(function ($v) use ($reqColor, $reqSize) {

    $dbColor = strtolower(trim((string) $v->color));
    $dbSize = strtolower(trim((string) $v->size));

    // Jika produk hanya dibedakan oleh satu dimensi (mis. hanya ukuran),
    // cukup cocokkan pada dimensi yang tersedia saja.
    if ($dbColor === '' && $dbSize !== '') {
        return $dbSize === $reqSize;
    }

    if ($dbColor !== '' && $dbSize === '') {
        return $dbColor === $reqColor;
    }

    // Kedua dimensi terisi: cocokkan keduanya (warna & ukuran).
    return ($dbColor === $reqColor) && ($dbSize === $reqSize);
});

if (!$variant) {
    throw new \Exception("Varian tidak ditemukan untuk produk: {$item['product_name']}. 
    (Dicek: Warna='{$item['variant_color']}', Ukuran='{$item['variant_size']}')");
}

            if (!$variant) throw new \Exception("Varian tidak ditemukan: {$item['product_name']}");

            // 3. Kelola Stok
            $outletStock = OutletStock::where('outlet_id', $transaction->outlet_id)
                ->where('product_variant_id', $variant->id)
                ->lockForUpdate()
                ->first();

            $stokTersedia = $outletStock ? $outletStock->stock : 0;
            if ($stokTersedia < $item['quantity']) {
                throw new \Exception("Stok tidak mencukupi untuk: {$item['product_name']}");
            }

            // PERBAIKAN: Gunakan '$' di sini
            $outletStock->decrement('stock', $item['quantity']);

            StockMovement::create([
                'product_variant_id' => $variant->id,
                'outlet_id' => $transaction->outlet_id,
                'type' => 'sale',
                'reference_type' => 'transaction',
                'reference_id' => $transaction->id,
                'qty' => abs($item['quantity']),
                'user_id' => $user->id,
            ]);
        }

        DB::commit();

        if ($promo) {
            $promo->increment('terpakai');
        }

        $products = Product::with(['variants', 'category'])
    ->where(function ($q) use ($user) {
        $q->where('outlet_id', $user->outlet_id)
          ->orWhereJsonContains('outlet_ids', (string) $user->outlet_id);
    })
    ->get()
    ->map(function ($p) use ($user) {

        return [
            'id' => $p->id,
            'name' => $p->name,
            'sku' => $p->sku,
            'price' => $p->price,

            'category' => [
                'id'   => $p->category?->id,
                'name' => $p->category?->name,
            ],

            'image' => $p->image
                ? asset('storage/'.$p->image)
                : null,

            'variants' => $p->variants->map(function ($v) use ($user) {

                $stock = OutletStock::where(
                    'product_variant_id',
                    $v->id
                )
                ->where(
                    'outlet_id',
                    $user->outlet_id
                )
                ->value('stock') ?? 0;

                return [
                    'id' => $v->id,
                    'size' => $v->size,
                    'color' => $v->color,
                    'sku' => $v->sku,
                    'stock' => (int)$stock,
                    'price' => $v->price,
                    'cost_price' => $v->cost_price,
                ];
            }),
        ];
    });

return response()->json([
    'success' => true,
    'message' => 'Transaksi berhasil disimpan',
    'data' => $transaction->load('items'),
    'products' => $products,
]);

    } catch (\Exception $e) {
        DB::rollback();
        return response()->json([
            'success' => false,
            'message' => $e->getMessage()
        ], 400);
    }
}

    /**
     * VOID TRANSACTION
     */
    public function void($id)
    {
        DB::beginTransaction();
        try {
            $transaction = Transaction::with('items')->findOrFail($id);
            if ($transaction->status === 'void') {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaksi sudah di-void'
                ], 400);
            }

            // KEMBALIKAN STOCK OUTLET
            $user = Auth::user();
            foreach ($transaction->items as $item) {
    $norm = function ($val) {
        $v = strtolower(trim((string) $val));
        if ($v === '' || $v === 'undefined' || $v === 'null' || $v === '-') return '';
        return $v;
    };

    $trxColor = $norm($item->variant_color ?? '');
    $trxSize  = $norm($item->variant_size ?? '');

    $variant = ProductVariant::where('product_id', $item->product_id)
    ->get()
    ->first(function ($v) use ($trxColor, $trxSize) {

        $dbColor = strtolower(trim((string) $v->color));
        $dbSize  = strtolower(trim((string) $v->size));

        // Jika produk hanya dibedakan oleh satu dimensi (mis. hanya ukuran),
        // cukup cocokkan pada dimensi yang tersedia saja.
        if ($dbColor === '' && $dbSize !== '') {
            return $dbSize === $trxSize;
        }

        if ($dbColor !== '' && $dbSize === '') {
            return $dbColor === $trxColor;
        }

        return ($dbColor === $trxColor) && ($dbSize === $trxSize);
    });

if (!$variant) {
    throw new \Exception(
        "Variant tidak ditemukan saat void. Product ID {$item->product_id}, Warna '{$item->variant_color}', Ukuran '{$item->variant_size}'"
    );
}

    if ($variant) {
        $outletStock = OutletStock::lockForUpdate()
    ->where('outlet_id', $transaction->outlet_id)
    ->where('product_variant_id', $variant->id)
    ->first();

        if ($outletStock) {
            $outletStock->increment('stock', $item->quantity);
        } else {
            OutletStock::create([
                'outlet_id' => $transaction->outlet_id,
                'product_variant_id' => $variant->id,
                'stock' => $item->quantity,
            ]);
        }

        StockMovement::create([
            'product_variant_id' => $variant->id,
            'outlet_id' => $transaction->outlet_id,
            'type' => 'void',
            'reference_type' => 'transaction',
            'reference_id' => $transaction->id,
            'qty' => $item->quantity,
            'user_id' => $user->id,
        ]);
    }
}

            // UPDATE STATUS
            $transaction->update([
    'status'      => 'void',
    'void_by'     => Auth::id(),
    'voided_at'     => now(),
]);

            DB::commit();
            $products = Product::with(['variants', 'category'])
    ->where(function ($q) use ($user) {
        $q->where('outlet_id', $user->outlet_id)
          ->orWhereJsonContains('outlet_ids', (string) $user->outlet_id);
    })
    ->get()
    ->map(function ($p) use ($user) {

        return [
            'id' => $p->id,
            'name' => $p->name,
            'sku' => $p->sku,
            'price' => $p->price,

            'category' => [
                'id' => $p->category?->id,
                'name' => $p->category?->name,
            ],

            'image' => $p->image
                ? asset('storage/'.$p->image)
                : null,

            'variants' => $p->variants->map(function ($v) use ($user) {

                $stock = OutletStock::where('product_variant_id', $v->id)
                    ->where('outlet_id', $user->outlet_id)
                    ->value('stock') ?? 0;

                return [
                    'id' => $v->id,
                    'size' => $v->size,
                    'color' => $v->color,
                    'sku' => $v->sku,
                    'stock' => (int)$stock,
                    'price' => $v->price,
                    'cost_price' => $v->cost_price,
                ];
            }),
        ];
    });
            
            return response()->json([
    'success' => true,
    'message' => 'Transaksi berhasil di-void',
    'products' => $products,
]);

        } catch (\Exception $e) {

            DB::rollback();

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * SHOW DETAIL TRANSACTION
     */
    public function show($id)
    {
        $transaction = Transaction::with([
            'items',
            'user',
            'outlet'
        ])->findOrFail($id);

        return response()->json($transaction);
    }
}