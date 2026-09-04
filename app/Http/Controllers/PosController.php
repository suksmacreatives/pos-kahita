<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\OutletStock;
use App\Models\CashRegisterShift;
use App\Models\CashTransaction;
use App\Models\Transaction;
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

        /*
        |--------------------------------------------------------------------------
        | 1. AMBIL TRANSAKSI KAS
        |--------------------------------------------------------------------------
        */
        $cashTransactions = CashTransaction::where(
            'shift_id',
            $activeShift->id
        )
            ->orderBy('created_at', 'asc')
            ->get();

        $cashIn = (float) $cashTransactions
            ->where('transaction_type', 'IN')
            ->sum('amount');

        $cashOut = (float) $cashTransactions
            ->where('transaction_type', 'OUT')
            ->sum('amount');


        /*
        |--------------------------------------------------------------------------
        | 2. AMBIL TRANSAKSI PENJUALAN SHIFT INI
        |--------------------------------------------------------------------------
        */
        $transactions = Transaction::with('items')
            ->where('shift_id', $activeShift->id)
            ->where('status', 'completed')
            ->get();


        /*
        |--------------------------------------------------------------------------
        | 3. RINGKAS PENJUALAN BERDASARKAN METODE PEMBAYARAN
        |--------------------------------------------------------------------------
        */
        $penjualanTunai = 0;
        $penjualanQris = 0;
        $penjualanDebit = 0;
        $penjualanTransfer = 0;

        foreach ($transactions as $transaction) {

            $paymentMethod = strtoupper(
                trim($transaction->payment_method ?? 'TUNAI')
            );

            $grandTotal = (float) $transaction->grand_total;

            switch ($paymentMethod) {

                case 'TUNAI':
                case 'CASH':
                    $penjualanTunai += $grandTotal;
                    break;

                case 'QRIS':
                    $penjualanQris += $grandTotal;
                    break;

                case 'DEBIT':
                    $penjualanDebit += $grandTotal;
                    break;

                case 'TRANSFER':
                    $penjualanTransfer += $grandTotal;
                    break;
            }
        }


        /*
        |--------------------------------------------------------------------------
        | 4. TOTAL PENJUALAN
        |--------------------------------------------------------------------------
        */
        $totalPenjualan =
            $penjualanTunai
            + $penjualanQris
            + $penjualanDebit
            + $penjualanTransfer;


        /*
        |--------------------------------------------------------------------------
        | 5. MODAL AWAL
        |--------------------------------------------------------------------------
        */
        $modalAwal = (float) $activeShift->initial_cash;


        /*
        |--------------------------------------------------------------------------
        | 6. CASH AKTUAL SISTEM
        |
        | HANYA:
        | Modal Awal
        | + Penjualan Tunai
        | + Uang Masuk
        | - Uang Keluar
        |
        | QRIS / DEBIT / TRANSFER TIDAK MASUK CASH
        |--------------------------------------------------------------------------
        */
        $cashAktualSistem =
            $modalAwal
            + $penjualanTunai
            + $cashIn
            - $cashOut;


        /*
        |--------------------------------------------------------------------------
        | 7. CASH FISIK
        |--------------------------------------------------------------------------
        */
        $cashFisik = (float) $request->input('physical_cash', 0);


        /*
        |--------------------------------------------------------------------------
        | 8. SELISIH
        |--------------------------------------------------------------------------
        */
        $selisih = $cashFisik - $cashAktualSistem;

        $selisihJenis = null;

        if ($selisih < 0) {
            $selisihJenis = 'KURANG';
        } elseif ($selisih > 0) {
            $selisihJenis = 'LEBIH';
        }


        /*
        |--------------------------------------------------------------------------
        | 9. TOTAL ITEM
        |--------------------------------------------------------------------------
        */
        $totalItem = 0;

        foreach ($transactions as $transaction) {
            foreach ($transaction->items as $item) {
                $totalItem += (int) $item->quantity;
            }
        }


        /*
        |--------------------------------------------------------------------------
        | 10. PRODUK TERJUAL
        |--------------------------------------------------------------------------
        */
        $produkTerjual = [];

        foreach ($transactions as $transaction) {

            foreach ($transaction->items as $item) {

                $namaProduk =
                    $item->product_name_snapshot
                    ?? $item->product_name
                    ?? 'Produk';

                if (!isset($produkTerjual[$namaProduk])) {

                    $produkTerjual[$namaProduk] = [
                        'nama' => $namaProduk,
                        'qty' => 0,
                    ];
                }

                $produkTerjual[$namaProduk]['qty'] += (int) $item->quantity;
            }
        }

        $produkTerjual = array_values($produkTerjual);


        /*
        |--------------------------------------------------------------------------
        | 11. PAYMENT SUMMARY
        |--------------------------------------------------------------------------
        */
        $paymentSummary = [
            [
                'payment_method' => 'TUNAI',
                'total' => $penjualanTunai,
                'transaction_count' => $transactions->filter(function ($transaction) {
                    return in_array(
                        strtoupper(trim($transaction->payment_method ?? 'TUNAI')),
                        ['TUNAI', 'CASH']
                    );
                })->count(),
            ],
            [
                'payment_method' => 'QRIS',
                'total' => $penjualanQris,
                'transaction_count' => $transactions->filter(function ($transaction) {
                    return strtoupper(
                        trim($transaction->payment_method ?? '')
                    ) === 'QRIS';
                })->count(),
            ],
            [
                'payment_method' => 'DEBIT',
                'total' => $penjualanDebit,
                'transaction_count' => $transactions->filter(function ($transaction) {
                    return strtoupper(
                        trim($transaction->payment_method ?? '')
                    ) === 'DEBIT';
                })->count(),
            ],
            [
                'payment_method' => 'TRANSFER',
                'total' => $penjualanTransfer,
                'transaction_count' => $transactions->filter(function ($transaction) {
                    return strtoupper(
                        trim($transaction->payment_method ?? '')
                    ) === 'TRANSFER';
                })->count(),
            ],
        ];


        /*
        |--------------------------------------------------------------------------
        | 12. TUTUP SHIFT
        |--------------------------------------------------------------------------
        */
        $activeShift->update([
            'status' => 'closed',
            'physical_cash' => $cashFisik,
            'closed_at' => now(),
        ]);


        /*
        |--------------------------------------------------------------------------
        | 13. DATA UNTUK PRINT SHIFT REPORT
        |--------------------------------------------------------------------------
        |
        | Nama field dibuat konsisten dengan PrintShiftReport.jsx
        |--------------------------------------------------------------------------
        */
        $shiftReport = [

            // Identitas
            'kasir' => $user->name,

            'outlet' => Outlet::find($user->outlet_id)?->name ?? '-',

            'opened_at' => $activeShift->opened_at
                ? $activeShift->opened_at->format('d-m-Y H:i')
                : '-',

            'closed_at' => now()->format('d-m-Y H:i'),


            // Modal
            'starting_cash' => $modalAwal,
            'modal_awal' => $modalAwal,


            // Penjualan
            'tunai' => $penjualanTunai,
            'penjualan_tunai' => $penjualanTunai,

            'qris' => $penjualanQris,

            'debit' => $penjualanDebit,

            'transfer' => $penjualanTransfer,

            'total_penjualan' => $totalPenjualan,

            'payment_summary' => $paymentSummary,


            // Transaksi kas
            'cash_transactions' => $cashTransactions
                ->map(function ($item) {

                    return [
                        'id' => $item->id,

                        'nama' => $item->name,

                        'jenis' => $item->transaction_type === 'IN'
                            ? 'Uang Masuk'
                            : 'Uang Keluar',

                        'kategori' => $item->category,

                        'jumlah' => (float) $item->amount,

                        'deskripsi' => $item->description,

                        'created_at' => $item->created_at
                            ? $item->created_at->format('d-m-Y H:i')
                            : null,
                    ];
                })
                ->values()
                ->toArray(),


            // Total transaksi kas
            'pemasukan' => $cashIn,
            'cash_in' => $cashIn,

            'pengeluaran' => $cashOut,
            'cash_out' => $cashOut,


            // Cash
            'cash_aktual_sistem' => $cashAktualSistem,

            'physical_cash' => $cashFisik,
            'cash_fisik' => $cashFisik,


            // Selisih
            'selisih' => abs($selisih),

            'selisih_jenis' => $selisihJenis,


            // Statistik
            'total_transaksi' => $transactions->count(),

            'total_item' => $totalItem,

            'produk_terjual' => $produkTerjual,
        ];


        return response()->json([
            'success' => true,
            'shift_report' => $shiftReport
        ]);
    }
    
}