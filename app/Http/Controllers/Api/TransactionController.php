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
            'items' => 'required|array'
        ]);

        $user = Auth::user();
        if (!$user) throw new \Exception('User tidak terautentikasi');

        $activeShift = CashRegisterShift::where('user_id', $user->id)->where('status', 'open')->first();


    $transaction = Transaction::create([
        'invoice_number' => 'INV-' . now()->format('YmdHis'),
        'outlet_id' => $user->outlet_id,
        'user_id' => $user->id,
        'shift_id' => $activeShift?->id,
        'customer_name' => $request->customer_name ?? 'Umum',
        'payment_method' => $request->payment_method,
        'promo_id' => $request->promo_id,
        'subtotal' => $request->subtotal,
        'discount' => $request->discount ?? 0,
        'grand_total' => $request->grand_total,
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
$variant = ProductVariant::where('product_id', $item['product_id'])->get()->first(function ($v) use ($item) {
    // Bersihkan data dari database
    $dbColor = strtolower(trim((string)$v->color));
    $dbSize = strtolower(trim((string)$v->size));

    // Bersihkan data dari Request (handle jika size kosong/null)
    $reqColor = strtolower(trim((string)($item['variant_color'] ?? '')));
    $reqSize = strtolower(trim((string)($item['variant_size'] ?? '')));

    // Perbandingan: Jika size di DB adalah null, kita anggap sama dengan string kosong
    $sizeMatch = ($dbSize === "" && ($reqSize === "" || $reqSize === "null")) 
                 || ($dbSize === $reqSize);

    return ($dbColor === $reqColor) && $sizeMatch;
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

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil disimpan',
            'data' => $transaction->load('items')
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
    $variant = ProductVariant::where('product_id', $item->product_id)->get()->first(function ($v) use ($item) {
        $color = is_array($v->color) ? ($v->color['nama'] ?? '') : $v->color;
        return $color === ($item->variant_color ?? '') && $v->size === ($item->variant_size ?? '');
    });
    
    
    if ($variant) {
        $outletStock = OutletStock::where('outlet_id', $transaction->outlet_id)
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
                'status' => 'void'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil di-void'
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