<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\POS\DashboardPosController;
use App\Http\Controllers\ProductController;
// Menambahkan import Controller Baru yang kita buat
use App\Http\Controllers\POS\ShiftController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\CashTransactionController;
use App\Http\Controllers\AbsensiController;
use App\Http\Controllers\Admin\InventoryGudangController;
use App\Http\Controllers\Admin\Inventory\OutletInventoryController;
use App\Http\Controllers\Admin\SettingsController;
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
    
    // AREA KASIR (Mengarah ke Halaman POS Baru Anda di Pages/Pos/Index.jsx)
    Route::middleware(['role:cashier'])->group(function () {
        Route::get('/pos', [PosController::class, 'index'])->name('cashier.pos');
        Route::get('/pos/sidebar-data', [DashboardPosController::class, 'dapatkanDataSidebar'])->name('pos.sidebar-data');
        
        // --- TAMBAHAN ROUTE POS BARU (KASKASIR & TRANSAKSI) ---
        // Logika Buka & Tutup Sesi Laci Kasir
        Route::post('/pos/buka-kasir', [ShiftController::class, 'bukaKasir'])->name('pos.buka-kasir');
        Route::post('/pos/tutup-kasir', [ShiftController::class, 'tutupKasir'])->name('pos.tutup-kasir');
        
        // SISIPAN AMAN: Rute untuk menampilkan data shift kasir hari ini di tabel bawah
        Route::get('/pos/riwayat-shift', [ShiftController::class, 'riwayatShiftHariIni'])->name('pos.riwayat-shift');
        
        // Logika Simpan Pembayaran Belanja POS
    Route::post('/pos/transaksi', [TransactionController::class, 'store'])->name('pos.transaksi');    });
    Route::post('/cash-transactions', [CashTransactionController::class, 'store'])
    ->name('cash-transactions.store');
    Route::post('/absensi', [AbsensiController::class, 'store'])->name('absensi.store');
    Route::post('/absensi/pulang/{attendance}', [AbsensiController::class, 'clockOut'])
    ->name('absensi.pulang');

    // AREA ADMIN
    Route::middleware(['role:admin'])->group(function () {
        
        // --- MENU 1: DASHBOARD UTAMA ---
        Route::get('/admin/dashboard', function () { 
            return Inertia::render('Admin/Dashboard'); 
        })->name('admin.dashboard.index');

        // --- MENU 2: KELOLA STAF & AKUN ---
        Route::get('/admin/staff', [UserController::class, 'index'])->name('admin.staff.index');
        Route::post('/admin/cashier', [UserController::class, 'storeCashier'])->name('admin.cashier.store');
        Route::patch('/admin/user/{user}', [UserController::class, 'updateUser'])->name('admin.user.update');
        Route::delete('/admin/user/{user}', [UserController::class, 'destroyUser'])->name('admin.user.destroy');

        // --- MENU 3: MASTER PRODUK ---
        Route::get('/admin/products', [ProductController::class, 'index'])->name('admin.products.index');
        Route::get('/admin/products/create', [ProductController::class, 'create'])->name('admin.products.create');
        Route::post('/admin/products', [ProductController::class, 'store'])->name('admin.products.store');
        Route::patch('/admin/products/{product}', [ProductController::class, 'update'])->name('admin.products.update');
        Route::delete('/admin/products/{product}', [ProductController::class, 'destroy'])->name('admin.products.destroy');

        // --- MENU 4: KELOLA PROMO ---
        Route::get('/admin/promos', function () { 
            return Inertia::render('Admin/Placeholder', ['title' => 'Kelola Promo']); 
        })->name('admin.promos.index');

        // --- MENU: LAPORAN (REPORTS) ---
        Route::prefix('/admin/reports')->name('admin.reports.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\ReportsController::class, 'index'])->name('index');
            Route::post('/export', [\App\Http\Controllers\Admin\ReportsController::class, 'export'])->name('export');
        });

        // --- MENU: OUTLETS ---
        Route::prefix('/admin/outlets')->name('admin.outlets.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\Outlets\OutletController::class, 'index'])->name('index');
            Route::post('/', [\App\Http\Controllers\Admin\Outlets\OutletController::class, 'store'])->name('store');
            
            Route::get('/kasir', [\App\Http\Controllers\Admin\Outlets\OutletKasirController::class, 'index'])->name('kasir');
            Route::post('/kasir', [\App\Http\Controllers\Admin\Outlets\OutletKasirController::class, 'store'])->name('kasir.store');
            Route::put('/kasir/{kasir}', [\App\Http\Controllers\Admin\Outlets\OutletKasirController::class, 'update'])->name('kasir.update');
            Route::delete('/kasir/{kasir}', [\App\Http\Controllers\Admin\Outlets\OutletKasirController::class, 'destroy'])->name('kasir.destroy');
            Route::patch('/kasir/{kasir}/toggle', [\App\Http\Controllers\Admin\Outlets\OutletKasirController::class, 'toggleStatus'])->name('kasir.toggle');
            Route::post('/kasir/{kasir}/reset-password', [\App\Http\Controllers\Admin\Outlets\OutletKasirController::class, 'resetPassword'])->name('kasir.reset-password');
            Route::post('/kasir/{kasir}/shifts', [\App\Http\Controllers\Admin\Outlets\OutletShiftController::class, 'bulkUpdate'])->name('shifts.update');

            Route::get('/target', [\App\Http\Controllers\Admin\Outlets\OutletTargetController::class, 'index'])->name('target');
            Route::post('/target', [\App\Http\Controllers\Admin\Outlets\OutletTargetController::class, 'store'])->name('target.store');

            Route::get('/{outlet}', [\App\Http\Controllers\Admin\Outlets\OutletController::class, 'show'])->name('detail');
            Route::put('/{outlet}', [\App\Http\Controllers\Admin\Outlets\OutletController::class, 'update'])->name('update');
            Route::delete('/{outlet}', [\App\Http\Controllers\Admin\Outlets\OutletController::class, 'destroy'])->name('destroy');
            Route::patch('/{outlet}/toggle', [\App\Http\Controllers\Admin\Outlets\OutletController::class, 'toggleStatus'])->name('toggle');
        });
        // --- SUB-MENU: INVENTORY / STOK ---
        Route::get('/admin/inventory/gudang', [InventoryGudangController::class, 'index'])->name('admin.inventory.gudang');
        Route::post('/admin/inventory/gudang/penerimaan', [InventoryGudangController::class, 'storePenerimaan'])->name('admin.inventory.gudang.penerimaan');
        Route::patch('/admin/inventory/gudang/penerimaan/{purchaseOrder}/proses', [InventoryGudangController::class, 'prosesPenerimaan'])->name('admin.inventory.gudang.penerimaan.proses');
        Route::patch('/admin/inventory/gudang/penerimaan/{purchaseOrder}/terima', [InventoryGudangController::class, 'tandaiTerimaPenerimaan'])->name('admin.inventory.gudang.penerimaan.terima');
        Route::post('/admin/inventory/gudang/distribusi', [InventoryGudangController::class, 'storeDistribusi'])->name('admin.inventory.gudang.distribusi');
        Route::patch('/admin/inventory/gudang/distribusi/{distributionOrder}/proses', [InventoryGudangController::class, 'prosesDistribusi'])->name('admin.inventory.gudang.distribusi.proses');
        Route::patch('/admin/inventory/gudang/distribusi/{distributionOrder}/konfirmasi', [InventoryGudangController::class, 'konfirmasiDistribusi'])->name('admin.inventory.gudang.distribusi.konfirmasi');
        Route::post('/admin/inventory/gudang/retur', [InventoryGudangController::class, 'storeRetur'])->name('admin.inventory.gudang.retur');
        Route::post('/admin/inventory/gudang/opname', [InventoryGudangController::class, 'storeOpname'])->name('admin.inventory.gudang.opname');
        Route::post('/admin/inventory/gudang/tambah-stok', [InventoryGudangController::class, 'tambahStok'])->name('admin.inventory.gudang.tambah-stok');
        Route::get('/admin/inventory/gudang/mutasi', [InventoryGudangController::class, 'getMutasi'])->name('admin.inventory.gudang.mutasi');
        Route::patch('/admin/inventory/gudang/retur-outlet/{outletReturn}/terima', [InventoryGudangController::class, 'terimaReturOutlet'])->name('admin.inventory.gudang.retur-outlet.terima');
        Route::patch('/admin/inventory/gudang/retur-outlet/{id}/batal', [InventoryGudangController::class, 'cancelReturOutlet'])->name('admin.inventory.gudang.retur-outlet.batal');
        Route::patch('/admin/inventory/gudang/penerimaan/{purchaseOrder}/batal', [InventoryGudangController::class, 'cancelPurchaseOrder'])->name('admin.inventory.gudang.penerimaan.batal');
        Route::patch('/admin/inventory/gudang/distribusi/{distributionOrder}/batal', [InventoryGudangController::class, 'cancelDistributionOrder'])->name('admin.inventory.gudang.distribusi.batal');
        Route::patch('/admin/inventory/gudang/retur/{supplierReturn}/batal', [InventoryGudangController::class, 'cancelReturSupplier'])->name('admin.inventory.gudang.retur.batal');

        Route::get('/admin/inventory/central', function () { return Inertia::render('Admin/Placeholder', ['title' => 'Stok Barang Pusat']); })->name('admin.inventory.central');
        Route::get('/admin/inventory/branch', function () { return Inertia::render('Admin/Placeholder', ['title' => 'Stok Cabang']); })->name('admin.inventory.branch');
        Route::get('/admin/inventory/mutation', function () { return Inertia::render('Admin/Placeholder', ['title' => 'Mutasi Barang']); })->name('admin.inventory.mutation');
        Route::get('/admin/inventory/outlet', [OutletInventoryController::class, 'index'])->name('admin.inventory.outlet');
        Route::post('/admin/inventory/outlet/penerimaan/{distributionOrder}/konfirmasi', [OutletInventoryController::class, 'konfirmasiTerima'])->name('admin.inventory.outlet.penerimaan.konfirmasi');
        Route::post('/admin/inventory/outlet/transfer', [OutletInventoryController::class, 'storeTransfer'])->name('admin.inventory.outlet.transfer');
        Route::patch('/admin/inventory/outlet/transfer/{id}/terima', [OutletInventoryController::class, 'konfirmasiTerimaTransfer'])->name('admin.inventory.outlet.transfer.terima');
        Route::delete('/admin/inventory/outlet/transfer/{id}', [OutletInventoryController::class, 'cancelTransfer'])->name('admin.inventory.outlet.transfer.cancel');
        Route::post('/admin/inventory/outlet/retur', [OutletInventoryController::class, 'storeReturGudang'])->name('admin.inventory.outlet.retur');
        Route::delete('/admin/inventory/outlet/retur/{id}', [OutletInventoryController::class, 'cancelRetur'])->name('admin.inventory.outlet.retur.cancel');
        Route::post('/admin/inventory/outlet/opname', [OutletInventoryController::class, 'startOpname'])->name('admin.inventory.outlet.opname.start');
        Route::post('/admin/inventory/outlet/opname/{id}/selesai', [OutletInventoryController::class, 'submitOpname'])->name('admin.inventory.outlet.opname.selesai');
        
        // --- SUB-MENU: SETTINGS ---
        Route::prefix('/admin/settings')->name('admin.settings.')->group(function () {
            Route::get('/', [SettingsController::class, 'index'])->name('index');

            // Akun
            Route::post('/akun', [SettingsController::class, 'storeAkun'])->name('akun.store');
            Route::patch('/akun/{akun}', [SettingsController::class, 'updateAkun'])->name('akun.update');
            Route::patch('/akun/{akun}/toggle-status', [SettingsController::class, 'toggleStatusAkun'])->name('akun.toggle-status');
            Route::patch('/akun/{akun}/suspend', [SettingsController::class, 'suspendAkun'])->name('akun.suspend');
            Route::delete('/akun/{akun}', [SettingsController::class, 'destroyAkun'])->name('akun.destroy');
            Route::post('/akun/{akun}/reset-password', [SettingsController::class, 'resetPasswordAkun'])->name('akun.reset-password');

            // Promo
            Route::post('/promo', [SettingsController::class, 'storePromo'])->name('promo.store');
            Route::patch('/promo/{promo}', [SettingsController::class, 'updatePromo'])->name('promo.update');
            Route::patch('/promo/{promo}/toggle-status', [SettingsController::class, 'toggleStatusPromo'])->name('promo.toggle-status');
            Route::post('/promo/{promo}/duplicate', [SettingsController::class, 'duplicatePromo'])->name('promo.duplicate');
            Route::delete('/promo/{promo}', [SettingsController::class, 'destroyPromo'])->name('promo.destroy');
            Route::get('/promo/generate-kode', [SettingsController::class, 'generateKodePromo'])->name('promo.generate-kode');

            // Log
            Route::get('/log/export', [SettingsController::class, 'exportLog'])->name('log.export');
        });
    });

    

    // Rute manajemen profil bersama
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});



require __DIR__.'/auth.php';