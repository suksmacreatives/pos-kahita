<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\CashTransactionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

/*
|--------------------------------------------------------------------------
| TRANSACTIONS
|--------------------------------------------------------------------------
*/

Route::get('/transactions', [TransactionController::class, 'index']);

Route::post('/transactions', [TransactionController::class, 'store']);

Route::get('/transactions/{id}', [TransactionController::class, 'show']);

Route::post('/transactions/{id}/void', [TransactionController::class, 'void']);
// Jika Anda ingin menggunakan session yang sama dengan web
Route::middleware(['web', 'auth'])->post('/cash-transactions', [CashTransactionController::class, 'store']);