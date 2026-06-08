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

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'variants.outletStocks', 'outlet'])
            ->orderBy('created_at', 'desc')
            ->get();

        $salesData = TransactionItem::selectRaw('product_id, SUM(quantity) as total_terjual')
            ->groupBy('product_id')
            ->pluck('total_terjual', 'product_id');

        $mapped = $products->map(function ($p) use ($salesData) {
            $variants = $p->variants->map(fn ($v) => [
                'ukuran' => $v->size,
                'warna' => is_string($v->color) ? json_decode($v->color, true) : ($v->color ?? ['nama' => '', 'hex' => '#000000']),
                'stok' => (int) $v->stock,
                'sku' => $v->sku,
                'stok_outlet' => $v->outletStocks->groupBy('outlet_id')->map(fn ($stocks) => $stocks->sum('stock')),
            ]);

            $stok_gudang = $p->variants->sum('stock');
            $stok_outlet = $p->variants->sum(fn ($v) => $v->outletStocks->sum('stock'));
            $total_stok = $stok_gudang + $stok_outlet;

            $terjual = (int) ($salesData[$p->id] ?? 0);

            return [
                'id' => $p->id,
                'kode_produk' => $p->sku,
                'nama_produk' => $p->name,
                'kategori' => $p->category?->name ?? '',
                'sub_kategori' => $p->sub_kategori ?? '',
                'deskripsi' => $p->description ?? '',
                'harga_beli' => (int) $p->cost_price,
                'harga_jual' => (int) $p->price,
                'status' => $p->status ?? 'aktif',
                'outlet_tersedia' => $p->outlet_ids ?? [],
                'varian' => $variants->toArray(),
                'total_stok' => $total_stok,
                'stok_gudang' => $stok_gudang,
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
            'kategori' => 'nullable|string',
            'sub_kategori' => 'nullable|string',
            'status' => 'nullable|string',
            'outlet_tersedia' => 'nullable|array',
            'outlet_tersedia.*' => 'string',
            'varian' => 'nullable|array',
            'varian.*.ukuran' => 'required|string',
            'varian.*.warna' => 'required|array',
            'varian.*.warna.nama' => 'required|string',
            'varian.*.warna.hex' => 'required|string',
            'varian.*.stok' => 'required|integer|min:0',
            'varian.*.sku' => 'required|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $categoryId = null;
        if (!empty($validated['kategori'])) {
            $category = ProductCategory::firstOrCreate(
                ['name' => $validated['kategori']],
                ['name' => $validated['kategori']]
            );
            $categoryId = $category->id;
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $outletTersedia = $validated['outlet_tersedia'] ?? [];

        $product = Product::create([
            'name' => $validated['nama_produk'],
            'sku' => $validated['kode_produk'],
            'price' => $validated['harga_jual'],
            'cost_price' => $validated['harga_beli'],
            'description' => $validated['deskripsi'] ?? null,
            'category_id' => $categoryId,
            'sub_kategori' => $validated['sub_kategori'] ?? null,
            'status' => $validated['status'] ?? 'aktif',
            'outlet_id' => !empty($outletTersedia) ? (int) $outletTersedia[0] : null,
            'outlet_ids' => $outletTersedia,
            'image' => $imagePath,
        ]);

        if (!empty($validated['varian'])) {
            foreach ($validated['varian'] as $v) {
                $variant = $product->variants()->create([
                    'size' => $v['ukuran'],
                    'color' => $v['warna'],
                    'stock' => $v['stok'],
                    'sku' => $v['sku'],
                ]);

                foreach ($outletTersedia as $outletId) {
                    OutletStock::firstOrCreate(
                        ['outlet_id' => $outletId, 'product_variant_id' => $variant->id],
                        ['stock' => 0]
                    );
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
            'kategori' => 'nullable|string',
            'sub_kategori' => 'nullable|string',
            'status' => 'nullable|string',
            'outlet_tersedia' => 'nullable|array',
            'outlet_tersedia.*' => 'string',
            'varian' => 'nullable|array',
            'varian.*.ukuran' => 'required|string',
            'varian.*.warna' => 'required|array',
            'varian.*.warna.nama' => 'required|string',
            'varian.*.warna.hex' => 'required|string',
            'varian.*.stok' => 'required|integer|min:0',
            'varian.*.sku' => 'required|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $categoryId = null;
        if (!empty($validated['kategori'])) {
            $category = ProductCategory::firstOrCreate(
                ['name' => $validated['kategori']],
                ['name' => $validated['kategori']]
            );
            $categoryId = $category->id;
        }

        $outletTersedia = $validated['outlet_tersedia'] ?? [];

        $updateData = [
            'name' => $validated['nama_produk'],
            'sku' => $validated['kode_produk'],
            'price' => $validated['harga_jual'],
            'cost_price' => $validated['harga_beli'],
            'description' => $validated['deskripsi'] ?? null,
            'category_id' => $categoryId,
            'sub_kategori' => $validated['sub_kategori'] ?? null,
            'status' => $validated['status'] ?? 'aktif',
            'outlet_id' => !empty($outletTersedia) ? (int) $outletTersedia[0] : null,
            'outlet_ids' => $outletTersedia,
        ];

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $updateData['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($updateData);

        if (!empty($validated['varian'])) {
            $product->variants()->delete();
            foreach ($validated['varian'] as $v) {
                $variant = $product->variants()->create([
                    'size' => $v['ukuran'],
                    'color' => $v['warna'],
                    'stock' => $v['stok'],
                    'sku' => $v['sku'],
                ]);

                foreach ($outletTersedia as $outletId) {
                    OutletStock::firstOrCreate(
                        ['outlet_id' => $outletId, 'product_variant_id' => $variant->id],
                        ['stock' => 0]
                    );
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
}
