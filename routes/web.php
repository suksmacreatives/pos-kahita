<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\Admin\UserController;
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

// 2. PINTU GERBANG UTAMA (Diferensiasi Role saat mengakses /dashboard)
Route::get('/dashboard', function () {
    // Jika user yang login adalah kasir, lempar ke halaman POS kasir
    if (Auth::user()->role === 'cashier') {
        return redirect()->route('cashier.pos');
    }
    
    // Jika user yang login adalah admin, lempar ke halaman Dashboard Utama Admin
    return redirect()->route('admin.dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


// 3. KELOMPOK RUTE KHUSUS USER YANG SUDAH LOGIN
Route::middleware(['auth', 'verified'])->group(function () {
    
    // AREA KASIR (Hanya bisa diakses oleh user dengan role: cashier)
    Route::middleware(['role:cashier'])->group(function () {
        Route::get('/pos', [PosController::class, 'index'])->name('cashier.pos');
    });

    // AREA ADMIN (Hanya bisa diakses oleh user dengan role: admin)
    Route::middleware(['role:admin'])->group(function () {
        // Halaman dashboard utama admin yang memuat form & tabel user terdaftar
        Route::get('/admin/dashboard', [UserController::class, 'index'])->name('admin.dashboard');
        
        // Aksi memproses form data untuk membuat akun baru
        Route::post('/admin/cashier', [UserController::class, 'storeCashier'])->name('admin.cashier.store');
        
        // Aksi memproses edit dan hapus user
        Route::patch('/admin/user/{user}', [UserController::class, 'updateUser'])->name('admin.user.update');
        Route::delete('/admin/user/{user}', [UserController::class, 'destroyUser'])->name('admin.user.destroy');
    });

    // Rute manajemen profil bersama
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';