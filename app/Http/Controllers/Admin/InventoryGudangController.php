<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DistributionOrder;
use App\Models\DistributionOrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\StockMovement;
use App\Models\StockOpname;
use App\Models\StockOpnameItem;
use App\Models\Supplier;
use App\Models\SupplierReturn;
use App\Models\SupplierReturnItem;
use App\Models\Outlet;
use App\Models\OutletReturn;
use App\Services\Inventory\ReturGudangService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InventoryGudangController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            abort_if($request->user()?->outlet_id, 403);
            return $next($request);
        });
    }

    public function index()
    {
        $products = Product::with(['variants', 'category'])->orderBy('created_at', 'desc')->get();

        $warehouseProducts = $products->map(function ($p) {
            $totalStok = $p->variants->sum('stock');
            $stokMinimum = 10;

            return [
                'id' => $p->id,
                'kode_produk' => $p->sku,
                'nama_produk' => $p->name,
                'kategori' => $p->category?->name ?? '',
                'harga_beli' => (int) $p->cost_price,
                'warna_hex' => $this->getFirstVariantColor($p->variants),
                'varian' => $p->variants->map(fn ($v) => [
                    'ukuran' => $v->size,
                    'warna' => $v->color ?? '',
                    'warna_hex' => $this->mapNamaWarnaKeHex($v->color ?? ''),
                    'stok' => (int) $v->stock,
                    'sku' => $v->sku,
                ])->toArray(),
                'total_stok' => $totalStok,
                'stok_minimum' => $stokMinimum,
                'status' => $this->getStokStatus($totalStok, $stokMinimum),
            ];
        });

        $totalStokAll = $warehouseProducts->sum('total_stok');
        $nilaiStok = $warehouseProducts->sum(fn ($p) => $p['total_stok'] * $p['harga_beli']);
        $menipis = $warehouseProducts->where('status', 'menipis')->count();
        $habis = $warehouseProducts->where('status', 'habis')->count();

        $gudangStats = [
            'total_sku' => $warehouseProducts->count(),
            'total_stok' => $totalStokAll,
            'nilai_stok' => $nilaiStok,
            'menipis' => $menipis,
            'habis' => $habis,
        ];

        $mutasiLog = StockMovement::with('productVariant.product')
            ->latest()
            ->take(50)
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'tipe' => $this->mapMutasiTipe($m->type),
                'qty' => (int) $m->qty,
                'keterangan' => $m->note ?? $m->type,
                'timestamp' => $m->created_at?->toIso8601String(),
                'produk_id' => $m->productVariant?->product_id,
                'nama_produk' => $m->productVariant?->product?->name,
            ]);

        $mutasiChart = $this->buildMutasiChartData();

        $penerimaanBarang = PurchaseOrder::with(['supplier', 'items.product'])
            ->latest()
            ->get()
            ->map(fn ($po) => [
                'id' => $po->id,
                'nomor_po' => $po->nomor_po,
                'supplier_id' => $po->supplier_id,
                'supplier_nama' => $po->supplier?->nama ?? '',
                'tanggal_po' => $po->tanggal_po?->format('Y-m-d'),
                'tanggal_estimasi' => $po->tanggal_estimasi?->format('Y-m-d'),
                'tanggal_terima' => $po->tanggal_terima?->format('Y-m-d'),
                'total_qty' => $po->total_qty,
                'total_nilai' => (int) $po->total_nilai,
                'status' => $po->status,
                'items' => $po->items->map(fn ($item) => [
                    'produk_id' => $item->product_id,
                    'nama' => $item->nama,
                    'ukuran' => $item->ukuran,
                    'warna' => $item->warna,
                    'qty_pesan' => $item->qty_pesan,
                    'qty_terima' => $item->qty_terima,
                    'harga_beli' => (int) $item->harga_beli,
                ])->toArray(),
            ]);

        $distribusiOutlet = DistributionOrder::with(['outlet', 'items.product'])
            ->latest()
            ->get()
            ->map(fn ($do) => [
                'id' => $do->id,
                'nomor_do' => $do->nomor_do,
                'outlet_id' => $do->outlet_id,
                'outlet_tujuan' => $do->outlet?->name ?? '',
                'outlet_warna' => $this->getOutletWarna($do->outlet_id),
                'outlet_hexColor' => $this->getOutletHexColor($do->outlet_id),
                'tanggal_kirim' => $do->tanggal_kirim?->format('Y-m-d'),
                'tanggal_terima' => $do->tanggal_terima?->format('Y-m-d'),
                'total_qty' => $do->total_qty,
                'status' => $do->status,
                'items' => $do->items->map(fn ($item) => [
                    'produk_id' => $item->product_id,
                    'nama' => $item->nama,
                    'ukuran' => $item->ukuran,
                    'warna' => $item->warna,
                    'qty' => $item->qty,
                ])->toArray(),
            ]);

        $returSupplier = SupplierReturn::with(['supplier', 'items.product'])
            ->latest()
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'nomor_retur' => $r->nomor_retur,
                'supplier_id' => $r->supplier_id,
                'supplier_nama' => $r->supplier?->nama ?? '',
                'tanggal' => $r->tanggal?->format('Y-m-d'),
                'alasan' => $r->alasan,
                'total_item' => $r->total_item,
                'total_qty' => $r->total_qty,
                'status' => $r->status,
                'catatan' => $r->catatan,
                'created_at' => $r->created_at?->toIso8601String(),
                'items' => $r->items->map(fn ($item) => [
                    'produk_id' => $item->product_id,
                    'nama' => $item->nama,
                    'ukuran' => $item->ukuran,
                    'warna' => $item->warna,
                    'qty' => $item->qty,
                ])->toArray(),
            ]);

        $returOutlet = OutletReturn::with(['outlet', 'items'])
            ->latest()
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'nomor_retur' => $r->nomor_retur,
                'outlet_id' => $r->outlet?->slug ?? $r->outlet_id,
                'outlet_nama' => $r->outlet?->name ?? '',
                'tgl_retur' => $r->tgl_retur?->format('Y-m-d'),
                'alasan' => $r->alasan,
                'catatan' => $r->catatan ?? '',
                'items' => $r->items->map(fn ($item) => [
                    'produk_id' => $item->product_id,
                    'nama' => $item->nama,
                    'ukuran' => $item->ukuran ?? '',
                    'warna' => $item->warna ?? '#000000',
                    'qty' => (int) $item->qty,
                    'catatan' => $item->catatan ?? '',
                ])->toArray(),
                'total_item' => $r->items->count(),
                'total_qty' => (int) $r->total_qty,
                'status' => $r->status,
            ]);

        $stockOpname = StockOpname::with('items')
            ->latest()
            ->get()
            ->map(fn ($o) => [
                'id' => $o->id,
                'nomor_opname' => $o->nomor_opname,
                'tanggal_mulai' => $o->tanggal_mulai?->format('Y-m-d'),
                'tanggal_selesai' => $o->tanggal_selesai?->format('Y-m-d'),
                'total_item' => $o->total_item,
                'total_selisih_plus' => $o->total_selisih_plus,
                'total_selisih_minus' => $o->total_selisih_minus,
                'petugas' => $o->petugas,
                'scope' => $o->scope,
                'status' => $o->status,
                'items' => $o->items->map(fn ($item) => [
                    'nama' => $item->nama,
                    'ukuran' => $item->ukuran,
                    'warna' => $item->warna,
                    'stok_sistem' => $item->stok_sistem,
                    'stok_fisik' => $item->stok_fisik,
                    'selisih' => $item->selisih,
                    'keterangan' => $item->keterangan,
                ])->toArray(),
            ]);

        $outletList = Outlet::all()->map(fn ($o) => [
            'id' => $o->id,
            'nama' => $o->name,
            'warna' => $this->getOutletWarna($o->id),
            'hexColor' => $this->getOutletHexColor($o->id),
        ]);

        $supplierList = Supplier::all()->map(fn ($s) => [
            'id' => $s->id,
            'nama' => $s->nama,
            'kota' => $s->kota,
        ]);

        return Inertia::render('Admin/Inventory/Gudang', [
            'warehouseProducts' => $warehouseProducts,
            'gudangStats' => $gudangStats,
            'mutasiLog' => $mutasiLog,
            'mutasiChart' => $mutasiChart,
            'penerimaanBarang' => $penerimaanBarang,
            'distribusiOutlet' => $distribusiOutlet,
            'returSupplier' => $returSupplier,
            'returOutlet' => $returOutlet,
            'stockOpname' => $stockOpname,
            'outlets' => $outletList,
            'suppliers' => $supplierList,
        ]);
    }

    public function storePenerimaan(Request $request)
    {
        $validated = $request->validate([
            'supplier_nama' => 'required|string',
            'tanggal_po' => 'required|date',
            'tanggal_estimasi' => 'nullable|date',
            'items' => 'required|array|min:1',
            'items.*.produk_id' => 'required|exists:products,id',
            'items.*.nama' => 'required|string',
            'items.*.ukuran' => 'nullable|string',
            'items.*.warna' => 'nullable|string',
            'items.*.qty_pesan' => 'required|integer|min:1',
            'items.*.harga_beli' => 'required|numeric|min:0',
            'status' => 'required|in:draft,menunggu',
        ]);

        DB::beginTransaction();
        try {
            $supplier = Supplier::firstOrCreate(
                ['nama' => $validated['supplier_nama']],
                ['kota' => '-', 'telpon' => '-', 'email' => null, 'kontak' => null]
            );

            $totalQty = collect($validated['items'])->sum('qty_pesan');
            $totalNilai = collect($validated['items'])->sum(fn ($i) => $i['qty_pesan'] * $i['harga_beli']);
            $nomorPo = 'PO-' . now()->format('Ymd') . '-' . str_pad(PurchaseOrder::max('id') + 1, 3, '0', STR_PAD_LEFT);

            $po = PurchaseOrder::create([
                'nomor_po' => $nomorPo,
                'supplier_id' => $supplier->id,
                'tanggal_po' => $validated['tanggal_po'],
                'tanggal_estimasi' => $validated['tanggal_estimasi'] ?? null,
                'total_qty' => $totalQty,
                'total_nilai' => $totalNilai,
                'status' => $validated['status'],
            ]);

            foreach ($validated['items'] as $i => $item) {
                $variant = $this->findVariant($item['produk_id'], $item['ukuran'], $item['warna'] ?? null);

                PurchaseOrderItem::create([
                    'purchase_order_id' => $po->id,
                    'product_id' => $item['produk_id'],
                    'product_variant_id' => $variant?->id,
                    'nama' => $item['nama'],
                    'ukuran' => $item['ukuran'],
                    'warna' => $item['warna'] ?? null,
                    'qty_pesan' => $item['qty_pesan'],
                    'qty_terima' => 0,
                    'harga_beli' => $item['harga_beli'],
                ]);
            }

            $pertama = $validated['items'][0];
            $variantPertama = $this->findVariant($pertama['produk_id'], $pertama['ukuran'], $pertama['warna'] ?? null);

            StockMovement::create([
                'product_variant_id' => $variantPertama?->id,
                'type' => 'penerimaan',
                'qty' => $totalQty,
                'note' => 'Penerimaan dari: ' . ($validated['supplier_nama'] ?? ''),
                'user_id' => Auth::id(),
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Penerimaan barang berhasil disimpan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal: ' . $e->getMessage());
        }
    }

    public function tandaiTerimaPenerimaan(PurchaseOrder $purchaseOrder)
    {
        DB::beginTransaction();
        try {
            $purchaseOrder->update([
                'tanggal_terima' => now()->format('Y-m-d'),
                'status' => 'lengkap',
            ]);

            foreach ($purchaseOrder->items as $item) {
                $item->update(['qty_terima' => $item->qty_pesan]);

                if ($item->productVariant) {
                    $item->productVariant->increment('stock', $item->qty_pesan);
                }
            }

            StockMovement::create([
                'product_variant_id' => null,
                'type' => 'penerimaan',
                'qty' => $purchaseOrder->total_qty,
                'note' => 'Penerimaan PO: ' . $purchaseOrder->nomor_po,
                'user_id' => Auth::id(),
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Barang berhasil diterima');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal: ' . $e->getMessage());
        }
    }

    public function prosesPenerimaan(PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->status !== 'draft') {
            return redirect()->back()->with('error', 'Hanya PO dengan status draft yang bisa diproses');
        }

        $purchaseOrder->update(['status' => 'menunggu']);
        return redirect()->back()->with('success', 'PO berhasil diproses, menunggu penerimaan');
    }

    public function storeDistribusi(Request $request)
    {
        $validated = $request->validate([
            'outlet_id' => 'required|exists:outlets,id',
            'outlet_tujuan' => 'required|string',
            'tanggal_kirim' => 'nullable|date',
            'items' => 'required|array|min:1',
            'items.*.produk_id' => 'required|exists:products,id',
            'items.*.nama' => 'required|string',
            'items.*.ukuran' => 'nullable|string',
            'items.*.warna' => 'nullable|string',
            'items.*.qty' => 'required|integer|min:1',
            'status' => 'required|in:draft,dikirim',
        ]);

        DB::beginTransaction();
        try {
            $totalQty = collect($validated['items'])->sum('qty');
            $nomorDo = 'DO-' . now()->format('Ymd') . '-' . str_pad(DistributionOrder::max('id') + 1, 3, '0', STR_PAD_LEFT);

            $do = DistributionOrder::create([
                'nomor_do' => $nomorDo,
                'outlet_id' => $validated['outlet_id'],
                'tanggal_kirim' => $validated['tanggal_kirim'] ?? ($validated['status'] === 'dikirim' ? now()->format('Y-m-d') : null),
                'total_qty' => $totalQty,
                'status' => $validated['status'],
            ]);

            foreach ($validated['items'] as $item) {
                $variant = $this->findVariant($item['produk_id'], $item['ukuran'], $item['warna'] ?? null);

                if ($variant && $validated['status'] === 'dikirim') {
                    if ($variant->stock < $item['qty']) {
                        DB::rollBack();
                        $label = $item['ukuran'];
                        if (!empty($item['warna'])) $label = $item['warna'] . ' / ' . $label;
                        return redirect()->back()->with('error',
                            'Stok ' . $item['nama'] . ' (' . $label . ') tidak mencukupi! Tersedia: ' . $variant->stock);
                    }
                    $variant->decrement('stock', $item['qty']);
                }

                DistributionOrderItem::create([
                    'distribution_order_id' => $do->id,
                    'product_id' => $item['produk_id'],
                    'product_variant_id' => $variant?->id,
                    'nama' => $item['nama'],
                    'ukuran' => $item['ukuran'],
                    'warna' => $item['warna'] ?? null,
                    'qty' => $item['qty'],
                ]);
            }

            if ($validated['status'] === 'dikirim') {
                StockMovement::create([
                    'product_variant_id' => null,
                    'type' => 'distribusi',
                    'qty' => -$totalQty,
                    'note' => 'Distribusi ke: ' . ($validated['outlet_tujuan'] ?? ''),
                    'user_id' => Auth::id(),
                ]);
            }

            DB::commit();
            return redirect()->back()->with('success', 'Distribusi berhasil disimpan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal: ' . $e->getMessage());
        }
    }

    public function prosesDistribusi(DistributionOrder $distributionOrder)
    {
        DB::beginTransaction();
        try {
            $distributionOrder->update([
                'tanggal_kirim' => now()->format('Y-m-d'),
                'status' => 'dikirim',
            ]);

            foreach ($distributionOrder->items as $item) {
                if ($item->productVariant) {
                    if ($item->productVariant->stock < $item->qty) {
                        DB::rollBack();
                        $label = $item->ukuran;
                        if (!empty($item->warna)) $label = $item->warna . ' / ' . $label;
                        return redirect()->back()->with('error',
                            'Stok ' . $item->nama . ' (' . $label . ') tidak mencukupi!');
                    }
                    $item->productVariant->decrement('stock', $item->qty);
                }
            }

            StockMovement::create([
                'product_variant_id' => null,
                'type' => 'distribusi',
                'qty' => -$distributionOrder->total_qty,
                'note' => 'Distribusi DO: ' . $distributionOrder->nomor_do,
                'user_id' => Auth::id(),
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Distribusi berhasil diproses');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal: ' . $e->getMessage());
        }
    }

    public function konfirmasiDistribusi(DistributionOrder $distributionOrder)
    {
        $distributionOrder->update([
            'tanggal_terima' => now()->format('Y-m-d'),
            'status' => 'diterima',
        ]);

        return redirect()->back()->with('success', 'Distribusi dikonfirmasi diterima');
    }

    public function storeRetur(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'supplier_nama' => 'required|string',
            'alasan' => 'required|string',
            'tanggal' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.produk_id' => 'required|exists:products,id',
            'items.*.nama' => 'required|string',
            'items.*.ukuran' => 'nullable|string',
            'items.*.warna' => 'nullable|string',
            'items.*.qty' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $totalQty = collect($validated['items'])->sum('qty');
            $totalItem = count($validated['items']);
            $nomorRetur = 'RS-' . now()->format('Ymd') . '-' . str_pad(SupplierReturn::max('id') + 1, 3, '0', STR_PAD_LEFT);

            $retur = SupplierReturn::create([
                'nomor_retur' => $nomorRetur,
                'supplier_id' => $validated['supplier_id'],
                'tanggal' => $validated['tanggal'],
                'alasan' => $validated['alasan'],
                'total_item' => $totalItem,
                'total_qty' => $totalQty,
                'status' => 'selesai',
                'catatan' => $request->catatan ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $variant = $this->findVariant($item['produk_id'], $item['ukuran'], $item['warna'] ?? null);

                $returItem = SupplierReturnItem::create([
                    'supplier_return_id' => $retur->id,
                    'product_id' => $item['produk_id'],
                    'product_variant_id' => $variant?->id,
                    'nama' => $item['nama'],
                    'ukuran' => $item['ukuran'],
                    'warna' => $item['warna'] ?? null,
                    'qty' => $item['qty'],
                ]);

                if ($variant) {
                    $variant->decrement('stock', $item['qty']);

                    StockMovement::create([
                        'product_variant_id' => $variant->id,
                        'type' => 'retur_supplier',
                        'reference_type' => 'supplier_return',
                        'reference_id' => $retur->id,
                        'qty' => -(int) $item['qty'],
                        'note' => "Retur ke supplier: {$validated['supplier_nama']} - {$item['nama']}",
                        'user_id' => Auth::id(),
                    ]);
                }
            }

            DB::commit();
            return redirect()->back()->with('success', 'Retur supplier berhasil disimpan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal: ' . $e->getMessage());
        }
    }

    public function terimaReturOutlet(OutletReturn $outletReturn)
    {
        DB::beginTransaction();
        try {
            if ($outletReturn->status !== 'diajukan') {
                return redirect()->back()->with('error', 'Hanya retur dengan status diajukan yang bisa diterima');
            }

            foreach ($outletReturn->items as $item) {
                if ($item->productVariant) {
                    $item->productVariant->increment('stock', $item->qty);
                }

                StockMovement::create([
                    'product_variant_id' => $item->product_variant_id,
                    'outlet_id' => $outletReturn->outlet_id,
                    'type' => 'retur_gudang',
                    'reference_type' => 'outlet_return',
                    'reference_id' => $outletReturn->id,
                    'qty' => (int) $item->qty,
                    'note' => "Terima retur dari outlet: {$item->nama} ({$outletReturn->nomor_retur})",
                    'user_id' => Auth::id(),
                ]);
            }

            $outletReturn->update(['status' => 'diterima_gudang']);

            DB::commit();
            return redirect()->back()->with('success', 'Retur dari outlet berhasil diterima, stok gudang bertambah');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menerima retur: ' . $e->getMessage());
        }
    }

    public function cancelPurchaseOrder(PurchaseOrder $purchaseOrder)
    {
        if (!in_array($purchaseOrder->status, ['draft', 'menunggu'])) {
            return redirect()->back()->with('error', 'Hanya PO dengan status draft/menunggu yang bisa dibatalkan');
        }

        $purchaseOrder->update(['status' => 'dibatalkan']);
        return redirect()->back()->with('success', 'Purchase Order berhasil dibatalkan');
    }

    public function cancelDistributionOrder(DistributionOrder $distributionOrder)
    {
        if (!in_array($distributionOrder->status, ['draft'])) {
            return redirect()->back()->with('error', 'Hanya DO dengan status draft yang bisa dibatalkan');
        }

        $distributionOrder->update(['status' => 'dibatalkan']);
        return redirect()->back()->with('success', 'Distribution Order berhasil dibatalkan');
    }

    public function cancelReturSupplier(SupplierReturn $supplierReturn)
    {
        if (!in_array($supplierReturn->status, ['selesai'])) {
            return redirect()->back()->with('error', 'Hanya retur supplier dengan status selesai yang bisa dibatalkan');
        }

        DB::beginTransaction();
        try {
            foreach ($supplierReturn->items as $item) {
                if ($item->productVariant) {
                    $item->productVariant->increment('stock', $item->qty);

                    StockMovement::create([
                        'product_variant_id' => $item->product_variant_id,
                        'type' => 'retur_supplier',
                        'reference_type' => 'supplier_return',
                        'reference_id' => $supplierReturn->id,
                        'qty' => (int) $item->qty,
                        'note' => "Pembatalan retur supplier: {$item->nama}",
                        'user_id' => Auth::id(),
                    ]);
                }
            }

            $supplierReturn->update(['status' => 'dibatalkan']);
            DB::commit();
            return redirect()->back()->with('success', 'Retur supplier dibatalkan, stok gudang dikembalikan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal membatalkan retur: ' . $e->getMessage());
        }
    }

    public function cancelReturOutlet(int $id, ReturGudangService $returService)
    {
        try {
            $returService->cancelRetur($id);
            return redirect()->back()->with('success', 'Retur outlet berhasil dibatalkan');
        } catch (\App\Exceptions\InsufficientStockException $e) {
            return redirect()->back()->withErrors(['stok' => $e->getMessage()]);
        } catch (\Exception $e) {
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

        DB::beginTransaction();
        try {
            $totalItem = count($validated['items']);
            $totalSelisihPlus = collect($validated['items'])->where('selisih', '>', 0)->sum('selisih');
            $totalSelisihMinus = abs(collect($validated['items'])->where('selisih', '<', 0)->sum('selisih'));
            $nomorOpname = 'OPG-' . now()->format('Ymd') . '-' . str_pad(StockOpname::max('id') + 1, 3, '0', STR_PAD_LEFT);

            $opname = StockOpname::create([
                'nomor_opname' => $nomorOpname,
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
                    'ukuran' => $item['ukuran'],
                    'warna' => $item['warna'] ?? null,
                    'stok_sistem' => $item['qty_sistem'],
                    'stok_fisik' => $item['qty_aktual'],
                    'selisih' => $item['selisih'],
                    'keterangan' => $item['keterangan'] ?? null,
                ]);

                if ($variant && $item['selisih'] != 0) {
                    $variant->increment('stock', $item['selisih']);
                }
            }

            StockMovement::create([
                'product_variant_id' => null,
                'type' => 'opname',
                'qty' => $totalSelisihPlus - $totalSelisihMinus,
                'note' => 'Stock opname: ' . $nomorOpname,
                'user_id' => Auth::id(),
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Stock opname berhasil disimpan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal: ' . $e->getMessage());
        }
    }

    public function tambahStok(Request $request)
    {
        $validated = $request->validate([
            'produk_id' => 'required|exists:products,id',
            'nama' => 'required|string',
            'ukuran' => 'nullable|string',
            'warna' => 'nullable|string',
            'qty' => 'required|integer|min:1',
            'catatan' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $variant = $this->findVariant($validated['produk_id'], $validated['ukuran'] ?? '', $validated['warna'] ?? null);

            if (!$variant) {
                return redirect()->back()->with('error', 'Varian produk tidak ditemukan');
            }

            $variant->increment('stock', $validated['qty']);

            StockMovement::create([
                'product_variant_id' => $variant->id,
                'type' => 'tambah_stok',
                'qty' => $validated['qty'],
                'note' => $validated['catatan'] ?? 'Tambah stok: ' . $validated['nama'],
                'user_id' => Auth::id(),
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Stok berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal: ' . $e->getMessage());
        }
    }

    public function getMutasi()
    {
        return response()->json($this->buildMutasiChartData());
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

    private function mapNamaWarnaKeHex($nama)
    {
        $map = [
            'merah' => '#ef4444', 'biru' => '#3b82f6', 'hijau' => '#10b981',
            'hitam' => '#1f2937', 'putih' => '#f9fafb', 'abu' => '#6b7280',
            'kuning' => '#eab308', 'ungu' => '#8b5cf6', 'pink' => '#ec4899',
            'coklat' => '#78350f', 'navy' => '#1e3a8a', 'emas' => '#d4af37',
            'krem' => '#f5f5dc', 'cream' => '#f5f5dc', 'milo' => '#827064',
            'olive' => '#556b2f', 'lavender' => '#e6e6fa', 'maroon' => '#800000',
            'sage' => '#9c9f84', 'tosca' => '#14b8a6', 'orange' => '#f97316',
        ];
        return $map[strtolower(trim($nama))] ?? '#6b7280';
    }

    private function getStokStatus($total, $min)
    {
        if ($total <= 0) return 'habis';
        if ($total < $min) return 'menipis';
        return 'normal';
    }

    private function getFirstVariantColor($variants)
    {
        $first = $variants->first();
        if (!$first) return '#000000';
        return is_array($first->color) ? ($first->color['hex'] ?? '#000000') : $this->mapNamaWarnaKeHex($first->color ?? '');
    }

    private function mapMutasiTipe($type)
    {
        return match ($type) {
            'sale', 'distribusi', 'void', 'retur_supplier' => 'KELUAR',
            'restock', 'return', 'penerimaan', 'tambah_stok', 'retur_gudang' => 'MASUK',
            'adjustment', 'opname' => 'KOREKSI',
            default => 'KOREKSI',
        };
    }

    private function buildMutasiChartData()
    {
        $movements = StockMovement::selectRaw("DATE(created_at) as date, type, SUM(qty) as total_qty")
            ->whereDate('created_at', '>=', now()->subDays(30))
            ->groupBy('date', 'type')
            ->get();

        $dates = collect();
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $dayData = ['date' => $date, 'MASUK' => 0, 'KELUAR' => 0];

            $dayMovements = $movements->where('date', $date);
            foreach ($dayMovements as $m) {
                $tipe = $this->mapMutasiTipe($m->type);
                if (in_array($tipe, ['MASUK', 'KELUAR'])) {
                    $dayData[$tipe] += abs((int) $m->total_qty);
                }
            }

            $dates->push($dayData);
        }

        return $dates;
    }

    private function getOutletWarna($outletId)
    {
        return [1 => 'emerald', 2 => 'blue', 3 => 'purple', 4 => 'amber'][$outletId] ?? 'emerald';
    }

    private function getOutletHexColor($outletId)
    {
        return [1 => '#10B981', 2 => '#3B82F6', 3 => '#8B5CF6', 4 => '#F59E0B'][$outletId] ?? '#10B981';
    }
}
