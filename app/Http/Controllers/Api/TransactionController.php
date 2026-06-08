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
        DB::beginTransaction();

        try {

            $request->validate([
                'customer_name' => 'nullable|string',
                'payment_method' => 'required|string',
                'subtotal' => 'required|numeric',
                'grand_total' => 'required|numeric',
                'paid_amount' => 'nullable|numeric',
                'change_amount' => 'nullable|numeric',
                'items' => 'required|array'
            ]);

            // USER LOGIN
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User tidak terautentikasi'
                ], 401);
            }

            // SHIFT AKTIF
            $activeShift = CashRegisterShift::where('user_id', $user->id)
                ->where('status', 'open')
                ->first();

            // GENERATE INVOICE
            $invoice = 'INV-' . now()->format('YmdHis');

            // CREATE TRANSACTION
            $transaction = Transaction::create([

                'invoice_number' => $invoice,

                // FIX ERROR 1
                'outlet_id' => $user->outlet_id,

                // FIX ERROR 2
                'user_id' => $user->id,

                // OPTIONAL SHIFT
                'shift_id' => $activeShift?->id,

                'customer_name' => $request->customer_name ?? 'Umum',

                'subtotal' => $request->subtotal,

                'discount' => 0,

                'tax' => 0,

                'grand_total' => $request->grand_total,

                'paid_amount' => $request->paid_amount ?? 0,

                'change_amount' => $request->change_amount ?? 0,

                'payment_method' => $request->payment_method,

                'status' => 'completed'
            ]);

            // INSERT ITEMS
            foreach ($request->items as $item) {

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

    // KURANGI STOCK OUTLET
    $variant = ProductVariant::where('product_id', $item['product_id'])->get()->first(function ($v) use ($item) {
        $color = is_array($v->color) ? ($v->color['nama'] ?? '') : $v->color;
        return $color === ($item['variant_color'] ?? '') && $v->size === ($item['variant_size'] ?? '');
    });

    if ($variant) {
        $outletStock = OutletStock::where('outlet_id', $transaction->outlet_id)
            ->where('product_variant_id', $variant->id)
            ->first();

        if ($outletStock) {
            $outletStock->decrement('stock', $item['quantity']);
        } else {
            OutletStock::create([
                'outlet_id' => $transaction->outlet_id,
                'product_variant_id' => $variant->id,
                'stock' => -$item['quantity'],
            ]);
        }

        StockMovement::create([
            'product_variant_id' => $variant->id,
            'outlet_id' => $transaction->outlet_id,
            'type' => 'sale',
            'reference_type' => 'transaction',
            'reference_id' => $transaction->id,
            'qty' => -$item['quantity'],
            'user_id' => $user->id,
        ]);
    }
}

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil disimpan',
                'transaction' => $transaction->load('items')
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