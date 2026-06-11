<?php

namespace App\Http\Controllers\Admin\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\Outlet\KonfirmasiTerimaRequest;
use App\Http\Requests\Inventory\Outlet\StoreOpnameOutletRequest;
use App\Http\Requests\Inventory\Outlet\StoreReturGudangRequest;
use App\Http\Requests\Inventory\Outlet\StoreTransferRequest;
use App\Http\Requests\Inventory\Outlet\SubmitOpnameOutletRequest;
use App\Models\DistributionOrder;
use App\Models\Outlet;
use App\Models\StockOpname;
use App\Services\Inventory\InventoriOutletService;
use App\Services\Inventory\OpnameOutletService;
use App\Services\Inventory\ReturGudangService;
use App\Services\Inventory\TransferStokService;
use Illuminate\Http\Request;
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
            $opnameList = $outletId ? $this->opnameService->getOpnameList($outletId) : [];
            $perbandinganStok = $this->inventoriOutlet->getPerbandinganStok(7);
            $outlets = $this->inventoriOutlet->getOutletList();

            return Inertia::render('Admin/Inventory/Outlet', [
                'outletStok' => fn () => $outletStok,
                'outletStatsAll' => fn () => $outletStatsAll,
                'penerimaanList' => fn () => $penerimaanList,
                'transferList' => fn () => $transferList,
                'returList' => fn () => $returList,
                'opnameList' => fn () => $opnameList,
                'perbandinganStok' => fn () => $perbandinganStok,
                'outlets' => fn () => $outlets,
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
            $this->transferService->processTransfer($request->validated());
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
            $this->returService->processRetur($request->validated());
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

    public function startOpname(StoreOpnameOutletRequest $request)
    {
        try {
            $opname = $this->opnameService->createOpnameSession(
                $request->input('outlet_id'),
                $request->input('petugas'),
                $request->input('scope', 'all')
            );

            $snapshot = $this->opnameService->startOpname([
                'outlet_id' => $request->input('outlet_id'),
                'petugas' => $request->input('petugas'),
                'scope' => $request->input('scope', 'all'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Sesi opname berhasil dimulai.',
                'data' => [
                    'opname_id' => $opname->id,
                    'opname' => [
                        'id' => $opname->id,
                        'nomor_opname' => $opname->nomor_opname,
                        'outlet_id' => $opname->outlet?->slug ?? $opname->outlet_id,
                        'tgl_mulai' => $opname->tanggal_mulai?->format('Y-m-d'),
                        'tgl_selesai' => null,
                        'status' => 'berlangsung',
                        'items' => $snapshot['items'],
                        'total_item' => $snapshot['total_item'],
                        'total_selisih_plus' => 0,
                        'total_selisih_minus' => 0,
                        'dilakukan_oleh' => $request->input('petugas'),
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Start opname error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal memulai opname: ' . $e->getMessage(),
            ], 500);
        }
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
}
