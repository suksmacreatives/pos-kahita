<?php

namespace App\Http\Controllers\POS;

use App\Http\Controllers\Controller;
use App\Models\CashRegisterShift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ShiftController extends Controller
{
    // 1a. Proses Buka Kasir
    public function bukaKasir(Request $request)
    {
        $request->validate([
            'starting_cash' => 'required|numeric|min:0',
        ]);

        $user = Auth::user();
        $outletId = $user->outlet_id ?? 1; 

        $activeShift = CashRegisterShift::where('user_id', $user->id)
            ->where('status', 'open')
            ->first();

        if ($activeShift) {
            return redirect()->back()->with('error', 'Anda masih memiliki sesi shift yang aktif!');
        }

        $shift = CashRegisterShift::create([
            'user_id' => $user->id,
            'outlet_id' => $outletId,
            'opened_at' => Carbon::now(),
            'starting_cash' => $request->starting_cash,
            'system_cash' => 0,
            'status' => 'open'
        ]);

        session(['active_shift_id' => $shift->id]);

        return redirect()->back()->with('success', 'Kasir berhasil dibuka dengan modal awal.');
    }

    // 1b. Proses Tutup Kasir
    public function tutupKasir(Request $request)
    {
        $request->validate([
            'physical_cash' => 'required|numeric|min:0',
        ]);

        $user = Auth::user();
        
        $shift = CashRegisterShift::where('user_id', $user->id)
            ->where('status', 'open')
            ->first();

        if (!$shift) {
            return redirect()->route('login')->with('error', 'Sesi shift tidak ditemukan.');
        }

        $totalSystemCashHarusAda = $shift->starting_cash + $shift->system_cash;
        $discrepancy = $request->physical_cash - $totalSystemCashHarusAda;

        $closedAt = Carbon::now();

        // Update data
        $shift->update([
            'closed_at' => $closedAt,
            'physical_cash' => $request->physical_cash,
            'discrepancy' => $discrepancy,
            'status' => 'closed'
        ]);

        session()->forget('active_shift_id');

        // Menggunakan Carbon::parse untuk memastikan data dalam format objek sebelum di-format
        $rekapShiftData = [
            'kasir' => $user->name,
            'opened_at' => Carbon::parse($shift->opened_at)->format('d-m-Y H:i'),
            'closed_at' => Carbon::parse($closedAt)->format('d-m-Y H:i'),
            'starting_cash' => $shift->starting_cash,
            'system_cash' => $shift->system_cash,
            'physical_cash' => $shift->physical_cash,
            'discrepancy' => $shift->discrepancy,
        ];

        // Logout dan Invalidate Session
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Flash data rekap ke session baru agar terbaca di halaman login
        session()->flash('print_rekap_shift', $rekapShiftData);
        session()->flash('success', 'Shift berhasil ditutup. Printer otomatis mencetak rekap.');

        return redirect()->route('login');
    }

    // 1c. Ambil Riwayat Aktivitas
    public function riwayatShiftHariIni()
    {
        $riwayat = CashRegisterShift::whereDate('created_at', Carbon::today())
            ->with('user:id,name')
            ->orderBy('opened_at', 'desc')
            ->get();

        return response()->json($riwayat);
    }
}