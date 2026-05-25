<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ProductController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

// 1. Halaman utama sebelum login (Welcome Screen)
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// 2. PINTU GERBANG UTAMA (Diferensiasi Role & Outlet secara otomatis)
Route::get('/dashboard', function () {
    $user = Auth::user();

    if ($user->role === 'cashier') {
        if ($user->outlet_id) {
            return redirect()->route('cashier.pos', ['outlet_id' => $user->outlet_id]);
        }
        abort(403, 'Akun kasir Anda belum ditugaskan di outlet mana pun. Hubungi Admin Pusat.');
    }
    
    // Admin masuk ke Dashboard Utama terlebih dahulu
    return redirect()->route('admin.dashboard.index');
})->middleware(['auth', 'verified'])->name('dashboard');


// 3. KELOMPOK RUTE KHUSUS USER YANG SUDAH LOGIN
Route::middleware(['auth', 'verified'])->group(function () {
    
    // AREA KASIR
    Route::middleware(['role:cashier'])->group(function () {
        Route::get('/pos', [PosController::class, 'index'])->name('cashier.pos');
    });

    // AREA ADMIN
    Route::middleware(['role:admin'])->group(function () {
        
        // --- MENU 1: DASHBOARD UTAMA ---
        Route::get('/admin/dashboard', function () { 
            return Inertia::render('Admin/Placeholder', ['title' => 'Dashboard Utama']); 
        })->name('admin.dashboard.index');

        // --- MENU 2: KELOLA STAF & AKUN (Halaman Dashboard Lama Anda) ---
        Route::get('/admin/staff', [UserController::class, 'index'])->name('admin.staff.index');
        Route::post('/admin/cashier', [UserController::class, 'storeCashier'])->name('admin.cashier.store');
        Route::patch('/admin/user/{user}', [UserController::class, 'updateUser'])->name('admin.user.update');
        Route::delete('/admin/user/{user}', [UserController::class, 'destroyUser'])->name('admin.user.destroy');

        // --- MENU 3: MASTER PRODUK ---
        Route::get('/admin/products', [ProductController::class, 'index'])->name('admin.products.index');
        Route::post('/admin/products', [ProductController::class, 'store'])->name('admin.products.store');
        Route::patch('/admin/products/{product}', [ProductController::class, 'update'])->name('admin.products.update');
        Route::delete('/admin/products/{product}', [ProductController::class, 'destroy'])->name('admin.products.destroy');

        // --- MENU 4: KELOLA PROMO ---
        Route::get('/admin/promos', function () { 
            return Inertia::render('Admin/Placeholder', ['title' => 'Kelola Promo']); 
        })->name('admin.promos.index');

        // --- SUB-MENU: LAPORAN PENJUALAN ---
        Route::get('/admin/reports/summary', function () { return Inertia::render('Admin/Placeholder', ['title' => 'Ringkasan Penjualan']); })->name('admin.reports.summary');
        Route::get('/admin/reports/outlet', function () { return Inertia::render('Admin/Placeholder', ['title' => 'Penjualan Outlet']); })->name('admin.reports.outlet');
        Route::get('/admin/reports/payment', function () { return Inertia::render('Admin/Placeholder', ['title' => 'Laporan Jenis Bayar']); })->name('admin.reports.payment');
        Route::get('/admin/reports/void', function () { return Inertia::render('Admin/Placeholder', ['title' => 'Laporan Void']); })->name('admin.reports.void');
        Route::get('/admin/reports/refund', function () { return Inertia::render('Admin/Placeholder', ['title' => 'Laporan Refund']); })->name('admin.reports.refund');

        // --- SUB-MENU: INVENTORY / STOK ---
        Route::get('/admin/inventory/central', function () { return Inertia::render('Admin/Placeholder', ['title' => 'Stok Barang Pusat']); })->name('admin.inventory.central');
        Route::get('/admin/inventory/branch', function () { return Inertia::render('Admin/Placeholder', ['title' => 'Stok Cabang']); })->name('admin.inventory.branch');
        Route::get('/admin/inventory/mutation', function () { return Inertia::render('Admin/Placeholder', ['title' => 'Mutasi Barang']); })->name('admin.inventory.mutation');
    });

    // Rute manajemen profil bersama
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';