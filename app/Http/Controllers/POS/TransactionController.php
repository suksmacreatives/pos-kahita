<?php

namespace App\Http\Controllers\POS;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\CashRegisterShift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TransactionController extends Controller
{
    public function simpanTransaksi(Request $request)
    {
        // Validasi input dari keranjang belanja React
        $request->validate([
            'customer_name' => 'nullable|string',
            'subtotal' => 'required|numeric',
            'discount' => 'nullable|numeric',
            'grand_total' => 'required|numeric',
            'promo_id' => 'nullable|exists:promos,id',
            'payment_method' => 'required|string', // Tunai, QRIS, Debit, Kredit
            'cart_items' => 'required|array|min:1',
            'cart_items.*.product_id' => 'required|exists:products,id',
            'cart_items.*.name' => 'required|string',
            'cart_items.*.price' => 'required|numeric',
            'cart_items.*.quantity' => 'required|integer|min:1',
            'cart_items.*.variant_color' => 'nullable|string',
            'cart_items.*.variant_size' => 'nullable|string',
        ]);

        $user = Auth::user();
        $outletId = $user->outlet_id ?? 1;

        // Pastikan shift kasir dalam posisi terbuka
        $activeShift = CashRegisterShift::where('user_id', $user->id)
            ->where('status', 'open')
            ->first();

        if (!$activeShift) {
            return redirect()->back()->with('error', 'Transaksi gagal! Anda belum membuka sesi shift kasir.');
        }

        // Gunakan Database Transaction agar jika salah satu item error, semua penyimpanan dibatalkan (aman)
        DB::beginTransaction();

        try {
            // Generate Invoice Number Otomatis (Contoh: INV-20260528-0001)
            $todayCode = 'INV-' . Carbon::now()->format('Ymd');
            $lastTransaction = Transaction::where('invoice_number', 'LIKE', $todayCode . '%')
                ->orderBy('id', 'desc')
                ->first();

            if ($lastTransaction) {
                $lastNumber = intval(substr($lastTransaction->invoice_number, -4));
                $nextNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
            } else {
                $nextNumber = '0001';
            }
            $invoiceNumber = $todayCode . '-' . $nextNumber;

            // 1. Simpan ke Tabel Induk 'transactions'
            $transaction = Transaction::create([
                'invoice_number' => $invoiceNumber,
                'outlet_id' => $outletId,
                'user_id' => $user->id,
                'shift_id' => $activeShift->id,
                'customer_name' => $request->customer_name ?? 'Umum',
                'subtotal' => $request->subtotal,
                'discount' => $request->discount ?? 0,
                'grand_total' => $request->grand_total,
                'payment_method' => $request->payment_method,
                'promo_id' => $request->promo_id,
                'status' => 'completed',
            ]);

            // 2. Simpan Item Keranjang ke Tabel Anak 'transaction_items'
            foreach ($request->cart_items as $item) {
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['product_id'],
                    'product_name_snapshot' => $item['product_name'], // Kunci nama produk saat ini
                    'variant_color' => $item['variant_color'] ?? null,
                    'variant_size' => $item['variant_size'] ?? null,
                    'price_at_sale' => $item['price'], // Kunci harga saat ini
                    'quantity' => $item['quantity'],
                    'total_price' => $item['price'] * $item['quantity'],
                ]);
            }

            // 3. UPDATE KAS KASIR: Jika bayar pakai TUNAI, tabungan cash di sistem otomatis bertambah
            if (strtolower($request->payment_method) === 'tunai') {
                $activeShift->increment('system_cash', $request->grand_total);
            }

            DB::commit();

            // Kembalikan response sukses bersama data transaksi lengkap untuk langsung di-print struk belanja di React
            return redirect()->back()->with([
                'success' => 'Pembayaran Berhasil!',
                'print_nota_belanja' => Transaction::with('transaction_items')->find($transaction->id)
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()->with('error', 'Terjadi kesalahan sistem: ' . $e->getMessage());
        }
    }
}