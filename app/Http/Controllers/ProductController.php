<?php

namespace App\Http\Controllers;

use App\Exports\ProductExport;
use App\Models\Outlet;
use App\Models\OutletStock;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductVariant;
use App\Models\TransactionItem;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Throwable;

class ProductController extends Controller
{
    private const PRODUCT_CODE_PREFIX = 'KHT-';

    /** Lebar nomor pada kode produk baru: KHT-00001 (5 digit). */
    private const PRODUCT_CODE_PAD = 5;

    /**
     * Kode produk berikutnya, dipakai form admin supaya kode yang tampil
     * sama dengan yang akan disimpan server.
     */
    public function nextCode()
    {
        return response()->json([
            'kode_produk' => $this->generateProductSku(),
        ]);
    }

    public function export(Request $request)
    {
        $format = $request->input('format', 'pdf');
        $kategori = $request->input('kategori', 'Semua Kategori');
        $status = $request->input('status', 'all');
        $search = $request->input('search', '');
        $outlet = $request->input('outlet', 'all');

        $products = Product::with(['category', 'variants.outletStocks', 'outlet', 'outlets']);

        if ($kategori !== 'Semua Kategori') {
            $products->whereHas('category', fn ($q) => $q->where('name', $kategori));
        }

        $products = $products->orderBy('created_at', 'desc')->get();

        $salesData = TransactionItem::selectRaw('product_id, SUM(quantity) as total_terjual')
            ->groupBy('product_id')
            ->pluck('total_terjual', 'product_id');

        $mapped = $products->map(function ($p) use ($salesData) {
            $variants = $p->variants->map(fn ($v) => [
                'color_name' => $v->color,
                'size_label' => in_array($v->size, ['', null], true) ? null : $v->size,
                'stok' => (int) $v->stock,
                'harga_jual' => (int) ($v->price ?? $p->price),
                'harga_beli' => (int) ($v->cost_price ?? $p->cost_price),
                'sku' => $v->sku,
                'barcode_code' => $v->barcode_code,
                'stok_outlet' => $v->outletStocks->groupBy('outlet_id')->map(fn ($stocks) => $stocks->sum('stock'))->toArray(),
            ]);

            $stok_gudang = $p->variants->sum('stock');
            $stok_per_outlet = $p->variants
                ->flatMap(fn ($v) => $v->outletStocks)
                ->groupBy('outlet_id')
                ->map(fn ($stocks) => $stocks->sum('stock'))
                ->toArray();

            $terjual = (int) ($salesData[$p->id] ?? 0);

            return [
                'id' => $p->id,
                'kode_produk' => $p->sku,
                'barcode_code' => $p->barcode_code,
                'nama_produk' => $p->name,
                'kategori' => $p->category?->name ?? '',
                'status' => $p->status ?? 'aktif',
                'harga_beli' => (int) $p->cost_price,
                'harga_jual' => (int) $p->price,
                'stok_gudang' => $stok_gudang,
                'stok_per_outlet' => $stok_per_outlet,
                'varian' => $variants->toArray(),
                'terjual' => $terjual,
            ];
        });

        if ($search) {
            $mapped = $mapped->filter(fn ($p) => str_contains(strtolower($p['nama_produk']), strtolower($search)) ||
                str_contains(strtolower($p['kode_produk']), strtolower($search))
            )->values();
        }

        if ($status === 'aktif') {
            $mapped = $mapped->filter(fn ($p) => $p['status'] === 'aktif')->values();
        } elseif ($status === 'nonaktif') {
            $mapped = $mapped->filter(fn ($p) => $p['status'] === 'nonaktif')->values();
        } elseif ($status === 'habis') {
            $mapped = $mapped->filter(fn ($p) => array_sum($p['stok_per_outlet']) + $p['stok_gudang'] === 0)->values();
        }

        $collection = $mapped;
        $totalProduk = $collection->count();
        $totalVarian = $collection->sum(fn ($p) => count($p['varian']) ?: 1);

        $outletNames = Outlet::aktif()->pluck('name', 'id')->toArray();
        $outletIds = array_keys($outletNames);

        if ($format === 'excel') {
            $excel = new ProductExport($collection->toArray());
            $spreadsheet = $excel->build();
            $writer = new Xlsx($spreadsheet);

            return response()->streamDownload(function () use ($writer) {
                $writer->save('php://output');
            }, 'produk-'.now()->format('YmdHis').'.xlsx', [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ]);
        }

        $pdf = Pdf::loadView('exports.product-pdf', [
            'title' => 'Katalog Produk - Kahita Busana',
            'products' => $collection,
            'totalProduk' => $totalProduk,
            'totalVarian' => $totalVarian,
            'outletNames' => $outletNames,
            'outletIds' => $outletIds,
        ]);

        return $pdf->download('produk-'.now()->format('YmdHis').'.pdf');
    }

    public function barcodeLabel(Request $request)
    {
        $validated = $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'integer|exists:products,id',
            'qty' => 'nullable|integer|min:1|max:100',
            'mode' => 'nullable|in:per_produk,per_varian',
            'include_price' => 'nullable|in:0,1,true,false',
            'label_size' => 'nullable|in:50x25,50x30',
        ]);

        $qty = (int) ($validated['qty'] ?? 1);
        $mode = $validated['mode'] ?? 'per_produk';
        $includePrice = filter_var($validated['include_price'] ?? true, FILTER_VALIDATE_BOOLEAN);
        $labelSize = $validated['label_size'] ?? '50x25';

        // withTrashed: label produk terarsip masih boleh dicetak ulang.
        $products = Product::withTrashed()->with(['variants' => fn ($q) => $q->withTrashed()])
            ->whereIn('id', $validated['product_ids'])
            ->get();

        $labels = [];

        foreach ($products as $product) {
            $kode = $product->sku;

            if ($mode === 'per_varian' && $product->variants->isNotEmpty()) {
                foreach ($product->variants as $variant) {
                    for ($i = 0; $i < $qty; $i++) {
                        $labels[] = [
                            'name' => $product->name,
                            'variant_color' => $variant->color,
                            'variant_size' => $variant->size,
                            'price' => $includePrice ? (int) ($variant->price ?? $product->price) : null,
                            'code' => $variant->barcode_code,
                            'sku_display' => $variant->sku ?: $kode,
                            'product_id' => $product->id,
                            'variant_id' => $variant->id,
                        ];
                    }
                }

                continue;
            }

            for ($i = 0; $i < $qty; $i++) {
                $labels[] = [
                    'name' => $product->name,
                    'variant_color' => '',
                    'variant_size' => '',
                    'price' => $includePrice ? (int) $product->price : null,
                    'code' => $product->barcode_code,
                    'sku_display' => $kode,
                    'product_id' => $product->id,
                    'variant_id' => null,
                ];
            }
        }

        return response()->view('prints.barcode-label', [
            'title' => 'Label Barcode - Kahita Busana',
            'labels' => collect($labels),
            'include_price' => $includePrice,
            'label_size' => $labelSize,
        ]);
    }

    public function barcodeImage(Product $product)
    {
        $barcode = app('DNS1D');

        $png = base64_decode($barcode->getBarcodePNG($product->barcode_code, 'C128', 4, 80));

        return response($png, 200)
            ->header('Content-Type', 'image/png')
            ->header('Content-Disposition', 'inline; filename="barcode-'.$product->barcode_code.'.png"')
            ->header('Cache-Control', 'no-cache');
    }

    public function barcodeVariantImage(Product $product, ProductVariant $variant)
    {
        $barcode = app('DNS1D');

        $png = base64_decode($barcode->getBarcodePNG($variant->barcode_code, 'C128', 4, 80));

        return response($png, 200)
            ->header('Content-Type', 'image/png')
            ->header('Content-Disposition', 'inline; filename="barcode-'.$variant->barcode_code.'.png"')
            ->header('Cache-Control', 'no-cache');
    }

    public function create()
    {
        return Inertia::render('Admin/Products', [
            'products' => [],
            'outlets' => Outlet::all(),
            'categories' => ProductCategory::all(),
        ]);
    }

    public function index()
    {
        $products = Product::with(['category', 'variants.outletStocks', 'outlet', 'outlets'])
            ->orderBy('created_at', 'desc')
            ->get();

        $salesData = TransactionItem::selectRaw('product_id, SUM(quantity) as total_terjual')
            ->groupBy('product_id')
            ->pluck('total_terjual', 'product_id');

        $mapped = $products->map(function ($p) use ($salesData) {
            $variants = $p->variants->map(fn ($v) => [
                'variant_db_id' => $v->id,
                'color_name' => $v->color,
                'size_label' => in_array($v->size, ['', null], true) ? null : $v->size,
                'stok' => (int) $v->stock,
                'harga_jual' => (int) ($v->price ?? $p->price),
                'harga_beli' => (int) ($v->cost_price ?? $p->cost_price),
                'sku' => $v->sku,
                'stok_outlet' => $v->outletStocks->groupBy('outlet_id')->map(fn ($stocks) => $stocks->sum('stock')),
            ]);

            $stok_gudang = $p->variants->sum('stock');
            $stok_outlet = $p->variants->sum(fn ($v) => $v->outletStocks->sum('stock'));
            $total_stok = $stok_gudang + $stok_outlet;

            $stokPerOutlet = $p->variants
                ->flatMap(fn ($v) => $v->outletStocks)
                ->groupBy('outlet_id')
                ->map(fn ($stocks) => $stocks->sum('stock'));

            $terjual = (int) ($salesData[$p->id] ?? 0);

            return [
                'id' => $p->id,
                'kode_produk' => $p->sku,
                'nama_produk' => $p->name,
                'category_id' => $p->category_id ?? null,
                'kategori' => $p->category?->name ?? '',
                'sub_kategori' => $p->sub_kategori ?? '',
                'deskripsi' => $p->description ?? '',
                'harga_beli' => (int) $p->cost_price,
                'harga_jual' => (int) $p->price,
                'status' => $p->status ?? 'aktif',
                'outlet_tersedia' => $p->outlets ? $p->outlets->pluck('id')->toArray() : ($p->outlet_ids ?? []),
                'varian' => $variants->toArray(),
                'total_stok' => $total_stok,
                'stok_gudang' => $stok_gudang,
                'stok_per_outlet' => $stokPerOutlet,
                'image' => $p->image ? Storage::url($p->image) : null,
                'terjual' => $terjual,
                'omset' => $terjual * (int) $p->price,
                'created_at' => $p->created_at?->toIso8601String(),
                'updated_at' => $p->updated_at?->toIso8601String(),
            ];
        });

        return Inertia::render('Admin/Products', [
            'products' => $mapped,
            'outlets' => Outlet::all(),
            'categories' => ProductCategory::all(),
        ]);
    }

    /**
     * Bersihkan input sebelum divalidasi.
     *
     * Kode produk dan SKU sering di-paste atau hasil ketik scanner yang
     * menyisipkan spasi/enter di akhir. Kalau tidak dibersihkan dulu, regex
     * akan menolak meski isinya valid. Memangkas di sini membuat pengguna
     * tidak perlu memperbaiki input manual.
     */
    private function bersihkanInputProduk(Request $request): Request
    {
        $bersih = function ($nilai) {
            if (! is_string($nilai)) {
                return $nilai;
            }

            return trim(preg_replace('/\s+/', ' ', $nilai));
        };

        $data = $request->all();
        foreach (['nama_produk', 'kode_produk', 'sub_kategori', 'deskripsi'] as $field) {
            if (array_key_exists($field, $data)) {
                $data[$field] = $bersih($data[$field]);
            }
        }
        if (($data['kode_produk'] ?? null) === '') {
            $data['kode_produk'] = null;
        }

        if (isset($data['variants']) && is_array($data['variants'])) {
            foreach ($data['variants'] as $i => $varian) {
                if (! is_array($varian)) {
                    continue;
                }
                foreach (['sku', 'color_name', 'size_label'] as $field) {
                    if (array_key_exists($field, $varian)) {
                        $data['variants'][$i][$field] = $bersih($varian[$field]);
                    }
                }
                if (($data['variants'][$i]['sku'] ?? null) === '') {
                    $data['variants'][$i]['sku'] = null;
                }
            }
        }

        $request->merge($data);

        return $request;
    }

    public function store(Request $request)
    {
        $request = $this->bersihkanInputProduk($request);

        $validated = $request->validate([
            'nama_produk' => 'required|string|max:255',
            // Boleh dikosongkan: sistem yang membuat kode produknya (lihat
            // generateProductSku()). Barcode tidak dibentuk dari SKU, jadi
            // panjang kode tidak lagi dibatasi demi "keterbacaan barcode".
            'kode_produk' => 'nullable|string|max:255|regex:/^[A-Za-z0-9][A-Za-z0-9.\-\/ ]*$/',
            'harga_jual' => 'required|numeric|min:0',
            'harga_beli' => 'required|numeric|min:0',
            'deskripsi' => 'nullable|string',
            'category_id' => 'nullable|integer|exists:product_categories,id',
            'sub_kategori' => 'nullable|string',
            'status' => 'nullable|string|in:aktif,nonaktif',
            'variants' => 'required|array|min:1',
            'variants.*.color_name' => 'nullable|string',
            'variants.*.size_label' => 'nullable|string',
            'variants.*.stok' => 'nullable|integer|min:0',
            'variants.*.harga_jual' => 'nullable|integer|min:0',
            'variants.*.harga_beli' => 'nullable|integer|min:0',
            'variants.*.sku' => [
                'nullable', 'string', 'max:255',
                'regex:/^[A-Za-z0-9][A-Za-z0-9.\-\/ ]*$/',
            ],
            'outlet_tersedia' => 'nullable',
            'distribusi_ke_gudang' => 'nullable|in:0,1,true,false',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ], [
            'variants.required' => 'Produk harus memiliki minimal 1 varian',
            'variants.min' => 'Produk harus memiliki minimal 1 varian',
            'variants.array' => 'Data varian tidak valid',
            'kode_produk.max' => 'Kode produk maksimal 255 karakter (sesuai kolom database)',
            'kode_produk.regex' => 'Kode produk hanya boleh huruf, angka, titik, strip, garis miring, atau spasi',
            'variants.*.sku.required' => 'SKU varian wajib diisi',
            'variants.*.sku.max' => 'SKU varian maksimal 255 karakter (sesuai kolom database)',
            'variants.*.sku.regex' => 'SKU varian hanya boleh huruf, angka, titik, strip, garis miring, atau spasi',
            'variants.*.sku.unique' => 'SKU varian sudah dipakai',
        ]);

        $this->assertHasDimensionVariant($validated);

        $outletTersedia = $this->parseOutletTersedia($validated['outlet_tersedia'] ?? []);
        $distribusiKeGudang = filter_var($validated['distribusi_ke_gudang'] ?? true, FILTER_VALIDATE_BOOLEAN);

        // Kode produk: pakai yang diinput, atau buat otomatis, ataurians suffix
        // kalau sudah dipakai. Admin tidak perlu mengoreksi manual.
        [$kodeProduk, $catatanKode] = $this->resolveProductSku($validated['kode_produk'] ?? null);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }

        try {
            $product = DB::transaction(function () use ($validated, $kodeProduk, $outletTersedia, $distribusiKeGudang, $imagePath) {
                $product = Product::create([
                    'name' => $validated['nama_produk'],
                    'sku' => $kodeProduk,
                    'price' => $validated['harga_jual'],
                    'cost_price' => $validated['harga_beli'],
                    'description' => $validated['deskripsi'] ?? null,
                    'category_id' => $validated['category_id'] ?? null,
                    'sub_kategori' => $validated['sub_kategori'] ?? null,
                    'status' => $validated['status'] ?? 'aktif',
                    'outlet_id' => ! empty($outletTersedia) ? (int) $outletTersedia[0] : null,
                    'outlet_ids' => ! empty($outletTersedia) ? $outletTersedia : null,
                    'image' => $imagePath,
                ]);

                $product->outlets()->sync($outletTersedia);

                $this->createVariants($product, $validated, $outletTersedia, $distribusiKeGudang);

                return $product;
            });
        } catch (Throwable $e) {
            if ($imagePath) {
                Storage::disk('public')->delete($imagePath);
            }

            throw $e;
        }

        return redirect()->back()->with('success', 'Produk berhasil ditambahkan!'.$catatanKode);
    }

    public function update(Request $request, Product $product)
    {
        $request = $this->bersihkanInputProduk($request);
        $validated = $request->validate([
            'nama_produk' => 'required|string|max:255',
            'kode_produk' => 'nullable|string|max:255|regex:/^[A-Za-z0-9][A-Za-z0-9.\-\/ ]*$/',
            'harga_jual' => 'required|numeric|min:0',
            'harga_beli' => 'required|numeric|min:0',
            'deskripsi' => 'nullable|string',
            'category_id' => 'nullable|integer|exists:product_categories,id',
            'sub_kategori' => 'nullable|string',
            'status' => 'nullable|string|in:aktif,nonaktif',
            'variants' => 'required|array|min:1',
            'variants.*.id' => [
                'nullable', 'integer',
                Rule::exists('product_variants', 'id')
                    ->where(fn ($q) => $q->where('product_id', $product->id)),
            ],
            'variants.*.color_name' => 'nullable|string',
            'variants.*.size_label' => 'nullable|string',
            'variants.*.stok' => 'nullable|integer|min:0',
            'variants.*.harga_jual' => 'nullable|integer|min:0',
            'variants.*.harga_beli' => 'nullable|integer|min:0',
            'variants.*.sku' => [
                'nullable', 'string', 'max:255',
                'regex:/^[A-Za-z0-9][A-Za-z0-9.\-\/ ]*$/',
            ],
            'outlet_tersedia' => 'nullable',
            'distribusi_ke_gudang' => 'nullable|in:0,1,true,false',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ], [
            'variants.required' => 'Produk harus memiliki minimal 1 varian',
            'variants.min' => 'Produk harus memiliki minimal 1 varian',
            'variants.array' => 'Data varian tidak valid',
            'variants.*.id.exists' => 'Varian yang dikirim tidak lagi ada di produk ini, silakan muat ulang halaman',
            'kode_produk.max' => 'Kode produk maksimal 255 karakter (sesuai kolom database)',
            'kode_produk.regex' => 'Kode produk hanya boleh huruf, angka, titik, strip, garis miring, atau spasi',
            'variants.*.sku.required' => 'SKU varian wajib diisi',
            'variants.*.sku.max' => 'SKU varian maksimal 255 karakter (sesuai kolom database)',
            'variants.*.sku.regex' => 'SKU varian hanya boleh huruf, angka, titik, strip, garis miring, atau spasi',
            'variants.*.sku.unique' => 'SKU varian sudah dipakai',
        ]);

        $this->assertHasDimensionVariant($validated);

        $outletTersedia = $this->parseOutletTersedia($validated['outlet_tersedia'] ?? []);
        $distribusiKeGudang = filter_var($validated['distribusi_ke_gudang'] ?? true, FILTER_VALIDATE_BOOLEAN);

        // Sama seperti store(): kode kosong/double diresolve otomatis.
        [$kodeProduk, $catatanKode] = $this->resolveProductSkuFor($validated['kode_produk'] ?? null, $product->id);

        $updateData = [
            'name' => $validated['nama_produk'],
            'sku' => $kodeProduk,
            'price' => $validated['harga_jual'],
            'cost_price' => $validated['harga_beli'],
            'description' => $validated['deskripsi'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
            'sub_kategori' => $validated['sub_kategori'] ?? null,
            'status' => $validated['status'] ?? 'aktif',
            'outlet_id' => ! empty($outletTersedia) ? (int) $outletTersedia[0] : null,
            'outlet_ids' => ! empty($outletTersedia) ? $outletTersedia : null,
        ];

        $newImage = null;
        if ($request->hasFile('image')) {
            $newImage = $request->file('image')->store('products', 'public');
        }

        $hasVariants = $request->has('variants') && ! empty($validated['variants']);

        try {
            DB::transaction(function () use ($product, $updateData, $newImage, $hasVariants, $validated, $outletTersedia, $distribusiKeGudang) {
                if ($newImage) {
                    if ($product->image) {
                        Storage::disk('public')->delete($product->image);
                    }
                    $updateData['image'] = $newImage;
                }

                $product->update($updateData);
                $product->outlets()->sync($outletTersedia);

                if ($hasVariants) {
                    $this->reconcileVariants($product, $validated, $outletTersedia, $distribusiKeGudang);
                }
            });
        } catch (Throwable $e) {
            // Transaksi gagal: buang file baru supaya tidak jadi sampah di storage.
            if (! empty($newImage)) {
                Storage::disk('public')->delete($newImage);
            }

            throw $e;
        }

        return redirect()->back()->with('success', 'Produk berhasil diperbarui!'.$catatanKode);
    }

    public function destroy(Product $product)
    {
        DB::transaction(function () use ($product) {
            $this->archiveSku($product);

            // Tandai varian ini diarsipkan bersama produknya, supaya restore()
            // tidak ikut menghidupkan varian lama yang sudah dibuang lewat form edit.
            foreach ($product->variants as $variant) {
                $this->archiveSku($variant);
                $variant->update(['archived_at' => now()]);
                $variant->delete();
            }

            // Gambar & pivot outlet SENGAJA tidak dihapus: arsip harus bisa
            // dibalik tanpa kehilangan data. Keduanya ikut hilang saat produk
            // benar-benar di-force delete (CASCADE / cleanup).
            $product->delete();
        });

        return redirect()->back()->with('success', 'Produk berhasil diarsipkan. Riwayat penjualan dan stok tetap tersimpan.');
    }

    public function restore(int $id)
    {
        $product = Product::withTrashed()->findOrFail($id);

        $archivedVariants = $product->variants()
            ->onlyTrashed()
            ->whereNotNull('archived_at')
            ->get();

        DB::transaction(function () use ($product, $archivedVariants) {
            try {
                $this->restoreSku($product);
                $product->restore();

                foreach ($archivedVariants as $variant) {
                    $this->restoreSku($variant);
                    $variant->update(['archived_at' => null]);
                    $variant->restore();
                }
            } catch (QueryException $e) {
                if ($e->getCode() == 23000) {
                    throw ValidationException::withMessages([
                        'sku' => 'SKU asli produk/varian sudah dipakai produk lain. Ubah SKU tersebut dulu, baru pulihkan.',
                    ]);
                }
                throw $e;
            }
        });

        return redirect()->back()->with('success', 'Produk berhasil dipulihkan.');
    }

    private function restoreSku(Model $model): void
    {
        if (! $model->original_sku) {
            return;
        }

        $model->update([
            'sku' => $model->original_sku,
            'original_sku' => null,
        ]);
    }

    /**
     * SKU diarsipkan diberi suffix supaya slot UNIQUE asli bebas dipakai ulang.
     * SKU asli disimpan di `original_sku` agar restore() bisa mengembalikannya.
     */
    private function archiveSku(Model $model): void
    {
        if ($model->original_sku) {
            return;
        }

        $suffix = '-ARC'.strtoupper(substr(md5($model->getKey().'|'.$model->sku.'|'.uniqid()), 0, 6));

        $model->update([
            'original_sku' => $model->sku,
            'sku' => $model->sku.$suffix,
        ]);
    }

    /**
     * Sinkronkan varian produk dengan payload form.
     *
     * Varian yang masih ada di-update in place supaya id, barcode, dan seluruh
     * riwayat stok/varian tidak ikut berubah. Varian yang dibuang diarsipkan
     * (SKU-nya diberi suffix) sebelum di-soft delete, karena index UNIQUE tetap
     * menghitung baris soft delete — tanpa itu, SKU lama tidak bisa dipakai ulang.
     */
    private function reconcileVariants(Product $product, array $validated, array $outletTersedia, bool $distribusiKeGudang): void
    {
        $existingVariants = $product->variants()->get()->keyBy('id');
        $submittedIds = collect($validated['variants'])
            ->pluck('id')
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->all();

        $removed = $existingVariants->except($submittedIds);
        foreach ($removed as $variant) {
            $this->archiveSku($variant);
            $variant->outletStocks()->delete();
            $variant->delete();
        }

        $dipakai = [];
        foreach ($validated['variants'] as $v) {
            $variant = isset($v['id']) ? $existingVariants->get($v['id']) : null;

            // SKU milik varian itu sendiri tidak dihitung sebagai bentrok,
            // jadi admin boleh menyimpan tanpa mengubah SKU.
            $sku = $this->resolveVariantSku($v['sku'] ?? null, $product->sku, $v, $dipakai, $variant?->id);
            $dipakai[$sku] = true;

            $attributes = [
                'color' => $v['color_name'] ?? null,
                'size' => $v['size_label'] ?? null,
                'price' => $v['harga_jual'] ?? $validated['harga_jual'],
                'cost_price' => $v['harga_beli'] ?? $validated['harga_beli'],
                'sku' => $sku,
            ];

            if ($variant) {
                $variant->update($attributes);
            } else {
                $stokGudang = $distribusiKeGudang ? ($v['stok'] ?? 0) : 0;

                $variant = $product->variants()->create($attributes + ['stock' => $stokGudang]);
            }

            $this->reconcileOutletStock($variant, $outletTersedia, $v['stok'] ?? 0);
        }
    }

    /**
     * Kode produk dibuat berurutan (KHT-00001, KHT-00002, ...) supaya pendek,
     * mudah dibaca, dan aman dipakai pada label barcode.
     *
     * Penomoranstarted dari 1 dan tidak mewarisi kode lama yang tidak berurutan
     * (mis. KHT-39936216), serta tidak pernah memakai ulang nomor yang sudah
     * pernah dipakai produk lain.
     */
    private function generateProductSku(): string
    {
        $suffixPola = str_repeat('_', self::PRODUCT_CODE_PAD);
        $terbesar = Product::withTrashed()
            ->where('sku', 'like', self::PRODUCT_CODE_PREFIX.$suffixPola)
            ->pluck('sku')
            ->map(fn ($sku) => substr((string) $sku, strlen(self::PRODUCT_CODE_PREFIX)))
            ->filter(fn ($suffix) => ctype_digit($suffix))
            ->map(fn ($suffix) => (int) $suffix)
            ->max() ?? 0;

        $nomor = $terbesar + 1;

        for ($i = 0; $i < 1000; $i++) {
            $kandidat = self::PRODUCT_CODE_PREFIX.str_pad((string) ($nomor + $i), self::PRODUCT_CODE_PAD, '0', STR_PAD_LEFT);

            if (! $this->productSkuTaken($kandidat)) {
                return $kandidat;
            }
        }

        // Very unlikely: fallback acak agar tetap unik.
        return self::PRODUCT_CODE_PREFIX.str_pad((string) random_int(0, 99999), self::PRODUCT_CODE_PAD, '0', STR_PAD_LEFT).'-'.strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));
    }

    /**
     * Tentukan kode produk final dari input admin.
     *
     * @return array{0: string, 1: string} [kode, catatan untuk flash message]
     */
    private function resolveProductSku(?string $input): array
    {
        return $this->resolveProductSkuFor($input, null);
    }

    /**
     * @return array{0: string, 1: string} [kode, catatan untuk flash message]
     */
    private function resolveProductSkuFor(?string $input, ?int $ignoreProductId): array
    {
        $kode = $this->normalizeSku($input);

        if ($kode === null) {
            $kodeBaru = $this->generateProductSku();

            return [$kodeBaru, ' Kode produk dibuat otomatis: '.$kodeBaru];
        }

        if ($this->productSkuTaken($kode, $ignoreProductId)) {
            $kodeBaru = $this->suffixSkuUntilFree($kode, fn ($k) => $this->productSkuTaken($k, $ignoreProductId));
            $catatan = ' Kode produk "'.$kode.'" sudah dipakai, sistem memakai "'.$kodeBaru.'".';

            return [$kodeBaru, $catatan];
        }

        return [$kode, ''];
    }

    private function productSkuTaken(string $sku, ?int $ignoreProductId = null): bool
    {
        return Product::withTrashed()
            ->where('sku', $sku)
            ->when($ignoreProductId, fn ($q) => $q->where('id', '!=', $ignoreProductId))
            ->exists();
    }

    private function variantSkuTaken(string $sku, ?int $ignoreVariantId = null): bool
    {
        return ProductVariant::withTrashed()
            ->where('sku', $sku)
            ->when($ignoreVariantId, fn ($q) => $q->where('id', '!=', $ignoreVariantId))
            ->exists();
    }

    /**
     * Tambahkan suffix -2, -3, ... sampai slug-nya bebas dipakai.
     * Angka yang sudah ada di akhir SKU dipertahankan sebagai basis, jadi
     * "KHT-3887" -> "KHT-3887-2" (bukan "KHT-3888").
     */
    private function suffixSkuUntilFree(string $sku, callable $isTaken): string
    {
        for ($i = 2; $i < 1000; $i++) {
            $kandidat = $sku.'-'.$i;

            if (! $isTaken($kandidat)) {
                return $kandidat;
            }
        }

        return $sku.'-'.strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
    }

    private function normalizeSku(?string $value): ?string
    {
        $value = trim((string) $value);
        $value = (string) preg_replace('/\s+/', ' ', $value);

        return $value === '' ? null : $value;
    }

    private function createVariants(Product $product, array $validated, array $outletTersedia, bool $distribusiKeGudang): void
    {
        $dipakai = [];

        foreach ($validated['variants'] ?? [] as $v) {
            $sku = $this->resolveVariantSku($v['sku'] ?? null, $product->sku, $v, $dipakai);
            $dipakai[$sku] = true;

            $variant = $product->variants()->create([
                'color' => $v['color_name'] ?? null,
                'size' => $v['size_label'] ?? null,
                'stock' => $distribusiKeGudang ? ($v['stok'] ?? 0) : 0,
                'price' => $v['harga_jual'] ?? $validated['harga_jual'],
                'cost_price' => $v['harga_beli'] ?? $validated['harga_beli'],
                'sku' => $sku,
            ]);

            $this->reconcileOutletStock($variant, $outletTersedia, $v['stok'] ?? 0);
        }
    }

    /**
     * SKU varian: pakai input admin, atau turunkan dari kode produk + warna/ukuran.
     * Duplikat (di DB atau di request yang sama) otomatis diberi suffix.
     *
     * @param  array<int|string, bool>  $dipakai  SKU yang sudah dipakai varian lain di request ini
     * @param  int|null  $ignoreVariantId  varian yang sedang di-update, agar SKU-nya sendiri
     *                                     tidak dianggap bentrok dan tidak jadi ber-suffix
     */
    private function resolveVariantSku(?string $input, string $kodeProduk, array $v, array $dipakai, ?int $ignoreVariantId = null): string
    {
        $sku = $this->normalizeSku($input);

        if ($sku === null) {
            $warna = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', (string) ($v['color_name'] ?? '')) ?: '', 0, 3));
            $ukuran = trim((string) ($v['size_label'] ?? ''));
            $bagian = array_filter([$kodeProduk, $warna ?: null, $ukuran ?: null], fn ($b) => $b !== '');
            $sku = $bagian ? implode('-', $bagian) : $kodeProduk;
        }

        $bentrok = function (string $kandidat) use ($dipakai, $ignoreVariantId) {
            return isset($dipakai[$kandidat]) || $this->variantSkuTaken($kandidat, $ignoreVariantId);
        };

        if ($bentrok($sku)) {
            $sku = $this->suffixSkuUntilFree($sku, $bentrok);
        }

        return $sku;
    }

    private function reconcileOutletStock(ProductVariant $variant, array $outletIds, int $stock): void
    {
        $outletIds = array_map('intval', $outletIds);

        OutletStock::where('product_variant_id', $variant->id)
            ->whereNotIn('outlet_id', $outletIds ?: [0])
            ->delete();

        foreach ($outletIds as $outletId) {
            OutletStock::updateOrCreate(
                ['product_variant_id' => $variant->id, 'outlet_id' => $outletId],
                ['stock' => $stock]
            );
        }
    }

    private function assertHasDimensionVariant(array $validated): void
    {
        $hasDimension = collect($validated['variants'] ?? [])
            ->contains(fn ($v) => ! empty(trim((string) ($v['color_name'] ?? ''))) ||
                ! empty(trim((string) ($v['size_label'] ?? '')))
            );

        if (! $hasDimension) {
            throw ValidationException::withMessages([
                'variants' => 'Produk harus memiliki minimal 1 varian (warna atau ukuran)',
            ]);
        }
    }

    private function parseOutletTersedia(mixed $value): array
    {
        if (is_array($value)) {
            return $value;
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);

            return is_array($decoded) ? $decoded : [];
        }

        return [];
    }
}
