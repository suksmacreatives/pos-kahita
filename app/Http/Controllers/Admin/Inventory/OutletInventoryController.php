<?php

namespace App\Http\Controllers\Admin\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\Outlet\KonfirmasiTerimaRequest;
use App\Http\Requests\Inventory\Outlet\StoreReturGudangRequest;
use App\Http\Requests\Inventory\Outlet\StoreTransferRequest;
use App\Http\Requests\Inventory\Outlet\SubmitOpnameOutletRequest;
use App\Models\DistributionOrder;
use App\Models\DistributionOrderItem;
use App\Models\OnlineShop;
use App\Models\Outlet;
use App\Models\OutletStock;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use App\Models\StockOpname;
use App\Models\StockOpnameItem;
use App\Services\Inventory\InventoriOutletService;
use App\Services\Inventory\OpnameOutletService;
use App\Services\Inventory\ReturGudangService;
use App\Services\Inventory\TransferStokService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class OutletInventoryController extends Controller
{
    public function __construct(
        protected InventoriOutletService $inventoriOutlet,
        protected TransferStokService $transferService,
        protected ReturGudangService $returService,
        protected OpnameOutletService $opnameService,
    ) {}

    public function index(Request $request)
    {
        $outletSlug = $request->input('outlet', 'all');
        $outletId = null;

        if ($outletSlug !== 'all') {
            $outlet = Outlet::where('slug', $outletSlug)->first();
            $outletId = $outlet?->id;
        }

        $filters = $request->only(['tab', 'search', 'kategori', 'status', 'sort']);

        try {
            $outletStok = $this->inventoriOutlet->getStokPerOutlet($outletId);
            $outletStatsAll = $this->inventoriOutlet->getStatsPerOutlet($outletId);
            $penerimaanList = $this->inventoriOutlet->getPenerimaanList($outletId);
            $transferList = $this->transferService->getTransferList($outletId);
            $returList = $this->returService->getReturList($outletId);
            $opnameList = $this->opnameService->getOpnameList($outletId);
            $perbandinganStok = $this->inventoriOutlet->getPerbandinganStok(7);
            $outlets = $this->inventoriOutlet->getOutletList();

            $mutasiQuery = StockMovement::with('productVariant.product')
                ->latest()
                ->take(50);

            if ($outletId) {
                $mutasiQuery->where('outlet_id', $outletId);
            }

            $mutasiLog = $mutasiQuery->get()->map(fn ($m) => [
                'id' => $m->id,
                'tipe' => $this->mapMutasiTipe($m->type),
                'qty' => (int) $m->qty,
                'keterangan' => $m->note ?? $m->type,
                'timestamp' => $m->created_at?->toIso8601String(),
                'produk_id' => $m->productVariant?->product_id,
                'nama_produk' => $m->productVariant?->product?->name,
            ]);

            return Inertia::render('Admin/Inventory/Outlet', [
                'outletStok' => fn () => $outletStok,
                'outletStatsAll' => fn () => $outletStatsAll,
                'penerimaanList' => fn () => $penerimaanList,
                'transferList' => fn () => $transferList,
                'returList' => fn () => $returList,
                'opnameList' => fn () => $opnameList,
                'perbandinganStok' => fn () => $perbandinganStok,
                'outlets' => fn () => $outlets,
                'mutasiLog' => fn () => $mutasiLog,
                'filters' => $filters,
            ]);
        } catch (\Exception $e) {
            Log::error('Inventory Outlet index error: ' . $e->getMessage());
            return Inertia::render('Admin/Inventory/Outlet', [
                'outletStok' => [],
                'outletStatsAll' => [],
                'penerimaanList' => [],
                'transferList' => [],
                'returList' => [],
                'opnameList' => [],
                'perbandinganStok' => [],
                'outlets' => [],
                'filters' => $filters,
                'error' => 'Terjadi kesalahan saat memuat data inventory outlet.',
            ]);
        }
    }

    public function konfirmasiTerima(KonfirmasiTerimaRequest $request, DistributionOrder $distributionOrder)
    {
        $user = $request->user();
        abort_if($user->outlet_id && $distributionOrder->outlet_id !== $user->outlet_id, 403);

        try {
            $this->inventoriOutlet->konfirmasiTerima(
                $distributionOrder->id,
                $request->input('items'),
                $request->input('penerima')
            );

            return redirect()->back()->with('success', 'Penerimaan barang berhasil dikonfirmasi.');
        } catch (\App\Exceptions\InsufficientStockException $e) {
            return redirect()->back()->withErrors(['stok' => $e->getMessage()]);
        } catch (\Exception $e) {
            Log::error('Konfirmasi terima error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal mengkonfirmasi penerimaan: ' . $e->getMessage());
        }
    }

    public function storeTransfer(StoreTransferRequest $request)
    {
        try {
            $data = $request->validated();
            $asal = Outlet::where('slug', $data['outlet_asal_id'])->first();
            $tujuan = Outlet::where('slug', $data['outlet_tujuan_id'])->first();
            if (!$asal || !$tujuan) {
                return redirect()->back()->with('error', 'Outlet asal atau tujuan tidak ditemukan.');
            }
            $data['outlet_asal_id'] = $asal->id;
            $data['outlet_tujuan_id'] = $tujuan->id;
            $this->transferService->processTransfer($data);
            return redirect()->back()->with('success', 'Transfer antar outlet berhasil dibuat.');
        } catch (\App\Exceptions\InsufficientStockException $e) {
            return redirect()->back()->withErrors(['stok' => $e->getMessage()]);
        } catch (\Exception $e) {
            Log::error('Store transfer error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal membuat transfer: ' . $e->getMessage());
        }
    }

    public function konfirmasiTerimaTransfer(Request $request, int $id)
    {
        $user = $request->user();

        try {
            if ($user->outlet_id) {
                $transfer = \App\Models\OutletTransfer::findOrFail($id);
                abort_if($transfer->outlet_tujuan_id !== $user->outlet_id, 403);
            }

            $this->transferService->confirmReceive($id);
            return redirect()->back()->with('success', 'Transfer berhasil dikonfirmasi diterima.');
        } catch (\App\Exceptions\InsufficientStockException $e) {
            return redirect()->back()->withErrors(['stok' => $e->getMessage()]);
        } catch (\Exception $e) {
            Log::error('Konfirmasi terima transfer error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal konfirmasi transfer: ' . $e->getMessage());
        }
    }

    public function cancelTransfer(Request $request, int $id)
    {
        $user = $request->user();

        try {
            if ($user->outlet_id) {
                $transfer = \App\Models\OutletTransfer::findOrFail($id);
                abort_if($transfer->outlet_asal_id !== $user->outlet_id, 403);
            }

            $this->transferService->cancelTransfer($id);
            return redirect()->back()->with('success', 'Transfer berhasil dibatalkan.');
        } catch (\App\Exceptions\InsufficientStockException $e) {
            return redirect()->back()->withErrors(['stok' => $e->getMessage()]);
        } catch (\Exception $e) {
            Log::error('Cancel transfer error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal membatalkan transfer: ' . $e->getMessage());
        }
    }

    public function storeReturGudang(StoreReturGudangRequest $request)
    {
        try {
            $data = $request->validated();
            $outlet = Outlet::where('slug', $data['outlet_id'])->first();
            if (!$outlet) {
                return redirect()->back()->with('error', 'Outlet tidak ditemukan.');
            }
            $data['outlet_id'] = $outlet->id;
            $this->returService->processRetur($data);
            return redirect()->back()->with('success', 'Retur ke gudang berhasil diajukan.');
        } catch (\App\Exceptions\InsufficientStockException $e) {
            return redirect()->back()->withErrors(['stok' => $e->getMessage()]);
        } catch (\Exception $e) {
            Log::error('Store retur error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal membuat retur: ' . $e->getMessage());
        }
    }

    public function cancelRetur(Request $request, int $id)
    {
        $user = $request->user();

        try {
            if ($user->outlet_id) {
                $retur = \App\Models\OutletReturn::findOrFail($id);
                abort_if($retur->outlet_id !== $user->outlet_id, 403);
            }

            $this->returService->cancelRetur($id);
            return redirect()->back()->with('success', 'Retur berhasil dibatalkan.');
        } catch (\App\Exceptions\InsufficientStockException $e) {
            return redirect()->back()->withErrors(['stok' => $e->getMessage()]);
        } catch (\Exception $e) {
            Log::error('Cancel retur error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal membatalkan retur: ' . $e->getMessage());
        }
    }

    public function storeOpname(Request $request)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.produk_id' => 'required|exists:products,id',
            'items.*.nama' => 'required|string',
            'items.*.ukuran' => 'nullable|string',
            'items.*.warna' => 'nullable|string',
            'items.*.qty_sistem' => 'required|integer|min:0',
            'items.*.qty_aktual' => 'required|integer|min:0',
            'items.*.selisih' => 'required|integer',
        ]);

        try {
            $outletId = $request->input('outlet_id');
            $outlet = Outlet::where('slug', $outletId)->first();
            if (!$outlet) {
                return redirect()->back()->with('error', 'Outlet tidak ditemukan.');
            }

            $totalItem = count($validated['items']);
            $totalSelisihPlus = collect($validated['items'])->where('selisih', '>', 0)->sum('selisih');
            $totalSelisihMinus = abs(collect($validated['items'])->where('selisih', '<', 0)->sum('selisih'));

            DB::beginTransaction();

            $lastId = StockOpname::where('outlet_id', $outlet->id)->count();
            $nomorOpname = 'OPO-' . now()->format('Ymd') . '-' . str_pad($lastId + 1, 3, '0', STR_PAD_LEFT);

            $opname = StockOpname::create([
                'nomor_opname' => $nomorOpname,
                'outlet_id' => $outlet->id,
                'tanggal_mulai' => $validated['tanggal'],
                'tanggal_selesai' => $validated['tanggal'],
                'total_item' => $totalItem,
                'total_selisih_plus' => $totalSelisihPlus,
                'total_selisih_minus' => $totalSelisihMinus,
                'petugas' => Auth::user()->name,
                'status' => 'selesai',
            ]);

            foreach ($validated['items'] as $item) {
                $variant = $this->findVariant($item['produk_id'], $item['ukuran'], $item['warna'] ?? null);

                StockOpnameItem::create([
                    'stock_opname_id' => $opname->id,
                    'product_id' => $item['produk_id'],
                    'product_variant_id' => $variant?->id,
                    'nama' => $item['nama'],
                    'ukuran' => $item['ukuran'] ?? null,
                    'warna' => $item['warna'] ?? null,
                    'stok_sistem' => $item['qty_sistem'],
                    'stok_fisik' => $item['qty_aktual'],
                    'selisih' => $item['selisih'],
                    'keterangan' => $item['keterangan'] ?? null,
                ]);

                if ($variant && $item['selisih'] != 0) {
                    $stokNow = OutletStock::where('outlet_id', $outlet->id)
                        ->where('product_variant_id', $variant->id)
                        ->first()?->stock ?? 0;

                    OutletStock::updateOrCreate(
                        [
                            'outlet_id' => $outlet->id,
                            'product_variant_id' => $variant->id,
                        ],
                        [
                            'stock' => max(0, $stokNow + $item['selisih']),
                        ]
                    );

                    StockMovement::create([
                        'product_variant_id' => $variant->id,
                        'outlet_id' => $outlet->id,
                        'type' => 'koreksi_opname',
                        'reference_type' => 'stock_opname',
                        'reference_id' => $opname->id,
                        'qty' => $item['selisih'],
                        'note' => "Koreksi opname: {$item['nama']} (sistem: {$item['qty_sistem']}, fisik: {$item['qty_aktual']})",
                        'user_id' => Auth::id(),
                    ]);
                }
            }

            DB::commit();
            return redirect()->back()->with('success', 'Stock opname berhasil disimpan.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Store opname error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal menyimpan opname: ' . $e->getMessage());
        }
    }

    public function storeTransferKasir(StoreTransferRequest $request)
    {
        $user = $request->user();
        $asal = $user->outlet_id ? Outlet::find($user->outlet_id) : null;
        if (!$asal) {
            return back()->withErrors(['error' => 'Outlet kasir tidak ditemukan']);
        }

        $data = $request->validated();
        $tujuan = Outlet::where('slug', $data['outlet_tujuan_id'])->first();
        if (!$tujuan) {
            return back()->withErrors(['error' => 'Outlet tujuan tidak ditemukan.']);
        }

        $data['outlet_asal_id'] = $asal->slug;
        $data['outlet_tujuan_id'] = $tujuan->slug;

        try {
            $this->transferService->processTransfer($data);
            return back()->with('success', 'Transfer antar outlet berhasil dibuat.');
        } catch (\App\Exceptions\InsufficientStockException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        } catch (\Exception $e) {
            Log::error('Store transfer kasir error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal membuat transfer: ' . $e->getMessage()]);
        }
    }

    public function konfirmasiTerimaTransferKasir(Request $request, int $id)
    {
        $user = $request->user();

        try {
            if ($user->outlet_id) {
                $transfer = \App\Models\OutletTransfer::findOrFail($id);
                abort_if($transfer->outlet_tujuan_id !== $user->outlet_id, 403);
            }

            $this->transferService->confirmReceive($id);
            return back()->with('success', 'Transfer berhasil dikonfirmasi diterima.');
        } catch (\App\Exceptions\InsufficientStockException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        } catch (\Exception $e) {
            Log::error('Konfirmasi terima transfer kasir error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal konfirmasi transfer: ' . $e->getMessage()]);
        }
    }

    public function storeDistribusiOnlineKasir(Request $request)
    {
        $validated = $request->validate([
            'online_shop_id' => 'required|exists:online_shops,id',
            'tanggal_kirim' => 'nullable|date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_variant_id' => 'required|exists:product_variants,id',
            'items.*.nama' => 'required|string',
            'items.*.ukuran' => 'nullable|string',
            'items.*.warna' => 'nullable|string',
            'items.*.qty' => 'required|integer|min:1',
        ]);

        $user = $request->user();
        $asal = $user->outlet_id ? Outlet::find($user->outlet_id) : null;
        if (!$asal) {
            return back()->withErrors(['error' => 'Outlet kasir tidak ditemukan']);
        }

        $onlineShop = OnlineShop::find($validated['online_shop_id']);
        if (!$onlineShop) {
            return back()->withErrors(['error' => 'Online shop tidak ditemukan']);
        }

        DB::beginTransaction();
        try {
            $totalQty = 0;
            foreach ($validated['items'] as $item) {
                $stokTersedia = (int) (OutletStock::where('outlet_id', $asal->id)
                    ->where('product_variant_id', $item['product_variant_id'])
                    ->value('stock') ?? 0);

                if ($stokTersedia < $item['qty']) {
                    DB::rollBack();
                    return back()->withErrors(['error' =>
                        'Stok ' . $item['nama'] . ' tidak mencukupi! Tersedia: ' . $stokTersedia]);
                }
                $totalQty += $item['qty'];
            }

            $nomorDo = 'DO-' . now()->format('Ymd') . '-' . str_pad(DistributionOrder::max('id') + 1, 3, '0', STR_PAD_LEFT);

            $do = DistributionOrder::create([
                'nomor_do' => $nomorDo,
                'outlet_id' => null,
                'tipe_tujuan' => 'online',
                'online_shop_id' => $onlineShop->id,
                'tanggal_kirim' => $validated['tanggal_kirim'] ?? now()->format('Y-m-d'),
                'total_qty' => $totalQty,
                'status' => 'dikirim',
            ]);

            foreach ($validated['items'] as $item) {
                OutletStock::where('outlet_id', $asal->id)
                    ->where('product_variant_id', $item['product_variant_id'])
                    ->decrement('stock', $item['qty']);

                DistributionOrderItem::create([
                    'distribution_order_id' => $do->id,
                    'product_id' => $item['product_id'],
                    'product_variant_id' => $item['product_variant_id'],
                    'nama' => $item['nama'],
                    'ukuran' => $item['ukuran'] ?? null,
                    'warna' => $item['warna'] ?? null,
                    'qty' => $item['qty'],
                ]);

                StockMovement::create([
                    'product_variant_id' => $item['product_variant_id'],
                    'outlet_id' => $asal->id,
                    'type' => 'distribusi',
                    'reference_type' => 'distribution_order',
                    'reference_id' => $do->id,
                    'qty' => -$item['qty'],
                    'note' => 'Distribusi outlet ' . $asal->name . ' → online shop ' . $onlineShop->nama . ' - ' . $item['nama'],
                    'user_id' => Auth::id(),
                ]);
            }

            DB::commit();
            return back()->with('success', 'Distribusi online shop berhasil dicatat.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Store distribusi online kasir error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal: ' . $e->getMessage()]);
        }
    }

    private function findVariant($productId, $ukuran, $warna)
    {
        $query = ProductVariant::where('product_id', $productId);

        if (!empty($warna)) {
            $query->where('color', $warna);
        }

        if (empty($ukuran)) {
            $query->whereNull('size');
        } else {
            $query->where('size', $ukuran);
        }

        return $query->first();
    }

    public function submitOpname(SubmitOpnameOutletRequest $request, int $id)
    {
        $user = $request->user();

        try {
            if ($user->outlet_id) {
                $opname = \App\Models\StockOpname::findOrFail($id);
                abort_if($opname->outlet_id !== $user->outlet_id, 403);
            }

            $this->opnameService->finishOpname($id, $request->input('items'));
            return redirect()->back()->with('success', 'Stock opname berhasil diselesaikan.');
        } catch (\App\Exceptions\InsufficientStockException $e) {
            return redirect()->back()->withErrors(['stok' => $e->getMessage()]);
        } catch (\Exception $e) {
            Log::error('Submit opname error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal menyelesaikan opname: ' . $e->getMessage());
        }
    }

    private function mapMutasiTipe($type)
    {
        return match ($type) {
            'sale', 'transfer_keluar', 'retur_gudang' => 'KELUAR',
            'penerimaan', 'transfer_masuk', 'return', 'void' => 'MASUK',
            'koreksi_opname', 'adjustment' => 'KOREKSI',
            default => 'KOREKSI',
        };
    }
}
