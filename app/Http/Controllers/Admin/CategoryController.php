<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = ProductCategory::with('outlet')
            ->withCount('products')
            ->orderBy('name')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
                'description' => $c->description,
                'outlet_id' => $c->outlet_id,
                'outlet_name' => $c->outlet?->name ?? '',
                'product_count' => $c->products_count,
            ]);

        return Inertia::render('Admin/Categories', [
            'categories' => $categories,
            'outlets' => Outlet::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'outlet_id' => 'nullable|integer|exists:outlets,id',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        ProductCategory::create($validated);

        return redirect()->back()->with('success', 'Kategori berhasil ditambahkan!');
    }

    public function update(Request $request, ProductCategory $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'outlet_id' => 'nullable|integer|exists:outlets,id',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $category->update($validated);

        return redirect()->back()->with('success', 'Kategori berhasil diperbarui!');
    }

    public function destroy(ProductCategory $category)
    {
        $category->delete();

        return redirect()->back()->with('success', 'Kategori berhasil dihapus!');
    }
}
