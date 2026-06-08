<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Attendance;
use Inertia\Inertia;

class PosController extends Controller
{
    // Di PosController.php
public function index()
{
    $user = Auth::user();
    
    // Gunakan 'latest()' untuk memastikan jika ada bug duplikat status 'open', 
    // sistem mengambil yang paling baru dibuat.
    $activeShift = \App\Models\CashRegisterShift::where('user_id', $user->id)
        ->where('status', 'open')
        ->latest()
        ->first();
        
        $attendances = Attendance::with('user')
            ->whereDate('date', today())
            ->latest()
            ->get();

    return Inertia::render('Pos/Index', [
        // ... (data lainnya)
        'is_shift_open_db' => $activeShift ? true : false,
        'active_shift_details' => $activeShift,

        'attendances' => $attendances
    ]);
}
}