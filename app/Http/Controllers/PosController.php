<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class PosController extends Controller
{
    public function index()
    {
        // Sementara kita pakai data tiruan (dummy data) langsung di sini
        $products = [
            ['id' => 1, 'name' => 'Kebaya Brokat Sofi Putih', 'category' => 'Kebaya', 'size' => 'M', 'price' => 250000, 'stock' => 12],
            ['id' => 2, 'name' => 'Kebaya Semi Prancis Hitam', 'category' => 'Kebaya', 'size' => 'L', 'price' => 450000, 'stock' => 5],
            ['id' => 3, 'name' => 'Kamen Songket Bali Mutiara', 'category' => 'Kamen', 'size' => 'All Size', 'price' => 350000, 'stock' => 8],
            ['id' => 4, 'name' => 'Kamen Lembaran Tenun Ikat', 'category' => 'Kamen', 'size' => 'All Size', 'price' => 180000, 'stock' => 15],
            ['id' => 5, 'name' => 'Selendang Sifon Ceruti Kuning', 'category' => 'Aksesoris', 'size' => 'Standard', 'price' => 450000, 'stock' => 20],
        ];

        return Inertia::render('Pos/Index', [
            'products' => $products
        ]);
    }
}