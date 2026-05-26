<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product; // Sesuaikan dengan model produk Anda
use Illuminate\Http\Request;
use Inertia\Inertia;

class POSController extends Controller
{
    public function index()
    {
        // Ambil data produk aktif dari database
        $products = Product::select('id', 'name', 'price', 'code')->get();

        // Render ke folder Pages/Pos/Index.jsx
        return Inertia::render('Pos/Index', [
            'products' => $products
        ]);
    }
}