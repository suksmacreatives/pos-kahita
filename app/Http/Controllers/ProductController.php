<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductVariant;
use App\Models\OutletStock;
use App\Models\Outlet;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel as MaatExcel;
use App\Exports\ProductExport;

class ProductController extends Controller
{
    public function export(Request $request)
    {
        $format = $request->input('format', 'pdf');
        $kategori = $request->input('kategori', 'Semua Kategori');
        $status = $request->input('status', 'all');
        $search = $request->input('search', '');
        $outlet = $request->input('outlet', 'all');

        $products = Product::with(['category', 'variants.outletStocks', 'outlet', 'outlets']);

        if ($kategori !== 'Semua Kategori') {
            $products->whereHas('category', fn($q) => $q->where('name', $kategori));
        }

        $products = $products->orderBy('created_at', 'desc')->get();

        $salesData = \App\Models\TransactionItem::selectRaw('product_id, SUM(quantity) as total_terjual')
            ->groupBy('product_id')
            ->pluck('total_terjual', 'product_id');

        $mapped = $products->map(function ($p) use ($salesData, $status, $search, $outlet) {
            $variants = $p->variants->map(fn ($v) => [
                'color_name' => $v->color,
                'size_label' => in_array($v->size, ['', null], true) ? null : $v->size,
                'stok' => (int) $v->stock,
                'harga_jual' => (int) ($v->price ?? $p->price),
                'harga_beli' => (int) ($v->cost_price ?? $p->cost_price),
                'sku' => $v->sku,
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
            $mapped = $mapped->filter(fn($p) =>
                str_contains(strtolower($p['nama_produk']), strtolower($search)) ||
                str_contains(strtolower($p['kode_produk']), strtolower($search))
            )->values();
        }

        if ($status === 'aktif') {
            $mapped = $mapped->filter(fn($p) => $p['status'] === 'aktif')->values();
        } elseif ($status === 'nonaktif') {
            $mapped = $mapped->filter(fn($p) => $p['status'] === 'nonaktif')->values();
        } elseif ($status === 'habis') {
            $mapped = $mapped->filter(fn($p) => array_sum($p['stok_per_outlet']) + $p['stok_gudang'] === 0)->values();
        }

        $collection = $mapped;
        $totalProduk = $collection->count();
        $totalVarian = $collection->sum(fn($p) => count($p['varian']) ?: 1);

        $outletNames = Outlet::aktif()->pluck('name', 'id')->toArray();
        $outletIds = array_keys($outletNames);

        if ($format === 'excel') {
            return MaatExcel::download(
                new ProductExport($collection->toArray()),
                'produk-' . now()->format('YmdHis') . '.xlsx'
            );
        }

        $pdf = Pdf::loadView('exports.product-pdf', [
            'title'       => 'Katalog Produk - Kahita Busana',
            'products'    => $collection,
            'totalProduk' => $totalProduk,
            'totalVarian' => $totalVarian,
            'outletNames' => $outletNames,
            'outletIds'   => $outletIds,
        ]);

        return $pdf->download('produk-' . now()->format('YmdHis') . '.pdf');
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_produk' => 'required|string|max:255',
            'kode_produk' => 'required|string|unique:products,sku',
            'harga_jual' => 'required|numeric|min:0',
            'harga_beli' => 'required|numeric|min:0',
            'deskripsi' => 'nullable|string',
            'category_id' => 'nullable|integer|exists:product_categories,id',
            'sub_kategori' => 'nullable|string',
            'status' => 'nullable|string|in:aktif,nonaktif',
            'variants' => 'nullable|array',
            'variants.*.color_name' => 'nullable|string',
            'variants.*.size_label' => 'nullable|string',
            'variants.*.stok' => 'nullable|integer|min:0',
            'variants.*.harga_jual' => 'nullable|integer|min:0',
            'variants.*.harga_beli' => 'nullable|integer|min:0',
            'variants.*.sku' => [
                'nullable', 'string',
                Rule::unique('product_variants', 'sku'),
            ],
            'outlet_tersedia' => 'nullable',
            'distribusi_ke_gudang' => 'nullable|in:0,1,true,false',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $outletTersedia = $this->parseOutletTersedia($validated['outlet_tersedia'] ?? []);
        $distribusiKeGudang = filter_var($validated['distribusi_ke_gudang'] ?? true, FILTER_VALIDATE_BOOLEAN);

        $product = Product::create([
            'name' => $validated['nama_produk'],
            'sku' => $validated['kode_produk'],
            'price' => $validated['harga_jual'],
            'cost_price' => $validated['harga_beli'],
            'description' => $validated['deskripsi'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
            'sub_kategori' => $validated['sub_kategori'] ?? null,
            'status' => $validated['status'] ?? 'aktif',
            'outlet_id' => !empty($outletTersedia) ? (int) $outletTersedia[0] : null,
            'outlet_ids' => !empty($outletTersedia) ? $outletTersedia : null,
            'image' => $imagePath,
        ]);

        $product->outlets()->sync($outletTersedia);

        $usedSkus = [];
        if (!empty($validated['variants'])) {
            foreach ($validated['variants'] as $v) {
                $sku = $v['sku'] ?? $validated['kode_produk'] . '-ALL';

                if (in_array($sku, $usedSkus)) {
                    $sku = $sku . '-' . uniqid();
                }
                $usedSkus[] = $sku;

                $stokGudang = $distribusiKeGudang ? ($v['stok'] ?? 0) : 0;

                try {
                    $variant = $product->variants()->create([
                        'color' => $v['color_name'] ?? null,
                        'size' => $v['size_label'] ?? null,
                        'stock' => $stokGudang,
                        'price' => $v['harga_jual'] ?? $validated['harga_jual'],
                        'cost_price' => $v['harga_beli'] ?? $validated['harga_beli'],
                        'sku' => $sku,
                    ]);
                } catch (\Illuminate\Database\QueryException $e) {
                    if ($e->getCode() == 23000) {
                        $sku = $sku . '-' . uniqid();
                        $variant = $product->variants()->create([
                            'color' => $v['color_name'] ?? null,
                            'size' => $v['size_label'] ?? null,
                            'stock' => $stokGudang,
                            'price' => $v['harga_jual'] ?? $validated['harga_jual'],
                            'cost_price' => $v['harga_beli'] ?? $validated['harga_beli'],
                            'sku' => $sku,
                        ]);
                    } else {
                        throw $e;
                    }
                }

                foreach ($outletTersedia as $outletId) {
                    OutletStock::create([
                        'outlet_id' => $outletId,
                        'product_variant_id' => $variant->id,
                        'stock' => $v['stok'] ?? 0,
                    ]);
                }
            }
        }

        return redirect()->back()->with('success', 'Produk berhasil ditambahkan!');
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'nama_produk' => 'required|string|max:255',
            'kode_produk' => 'required|string|unique:products,sku,' . $product->id,
            'harga_jual' => 'required|numeric|min:0',
            'harga_beli' => 'required|numeric|min:0',
            'deskripsi' => 'nullable|string',
            'category_id' => 'nullable|integer|exists:product_categories,id',
            'sub_kategori' => 'nullable|string',
            'status' => 'nullable|string|in:aktif,nonaktif',
            'variants' => 'nullable|array',
            'variants.*.color_name' => 'nullable|string',
            'variants.*.size_label' => 'nullable|string',
            'variants.*.stok' => 'nullable|integer|min:0',
            'variants.*.harga_jual' => 'nullable|integer|min:0',
            'variants.*.harga_beli' => 'nullable|integer|min:0',
            'variants.*.sku' => [
                'nullable', 'string',
                Rule::unique('product_variants', 'sku')
                    ->ignore($product->id, 'product_id'),
            ],
            'outlet_tersedia' => 'nullable',
            'distribusi_ke_gudang' => 'nullable|in:0,1,true,false',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $outletTersedia = $this->parseOutletTersedia($validated['outlet_tersedia'] ?? []);
        $distribusiKeGudang = filter_var($validated['distribusi_ke_gudang'] ?? true, FILTER_VALIDATE_BOOLEAN);

        $updateData = [
            'name' => $validated['nama_produk'],
            'sku' => $validated['kode_produk'],
            'price' => $validated['harga_jual'],
            'cost_price' => $validated['harga_beli'],
            'description' => $validated['deskripsi'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
            'sub_kategori' => $validated['sub_kategori'] ?? null,
            'status' => $validated['status'] ?? 'aktif',
            'outlet_id' => !empty($outletTersedia) ? (int) $outletTersedia[0] : null,
            'outlet_ids' => !empty($outletTersedia) ? $outletTersedia : null,
        ];

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $updateData['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($updateData);
        $product->outlets()->sync($outletTersedia);

        if ($request->has('variants') && !empty($validated['variants'])) {
            // Hapus data stok lama secara eksplisit (outlet dulu baru variant)
            $product->variants->each(fn ($v) => $v->outletStocks()->delete());
            $product->variants()->delete();

            $usedSkus = [];
            foreach ($validated['variants'] as $v) {
                $sku = $v['sku'] ?? $validated['kode_produk'] . '-ALL';

                if (in_array($sku, $usedSkus)) {
                    $sku = $sku . '-' . uniqid();
                }
                $usedSkus[] = $sku;

                $stokGudang = $distribusiKeGudang ? ($v['stok'] ?? 0) : 0;

                try {
                    $variant = $product->variants()->create([
                        'color' => $v['color_name'] ?? null,
                        'size' => $v['size_label'] ?? null,
                        'stock' => $stokGudang,
                        'price' => $v['harga_jual'] ?? $validated['harga_jual'],
                        'cost_price' => $v['harga_beli'] ?? $validated['harga_beli'],
                        'sku' => $sku,
                    ]);
                } catch (\Illuminate\Database\QueryException $e) {
                    if ($e->getCode() == 23000) {
                        $sku = $sku . '-' . uniqid();
                        $variant = $product->variants()->create([
                            'color' => $v['color_name'] ?? null,
                            'size' => $v['size_label'] ?? null,
                            'stock' => $stokGudang,
                            'price' => $v['harga_jual'] ?? $validated['harga_jual'],
                            'cost_price' => $v['harga_beli'] ?? $validated['harga_beli'],
                            'sku' => $sku,
                        ]);
                    } else {
                        throw $e;
                    }
                }

                foreach ($outletTersedia as $outletId) {
                    OutletStock::create([
                        'outlet_id' => $outletId,
                        'product_variant_id' => $variant->id,
                        'stock' => $v['stok'] ?? 0,
                    ]);
                }
            }
        }

        return redirect()->back()->with('success', 'Produk berhasil diperbarui!');
    }

    public function destroy(Product $product)
    {
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }
        $product->delete();
        return redirect()->back()->with('success', 'Produk berhasil dihapus!');
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
