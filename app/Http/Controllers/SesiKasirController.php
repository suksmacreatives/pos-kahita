<?php

namespace App\Http\Controllers;

use App\Models\SesiKasir;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SesiKasirController extends Controller
{
    /**
     * 1. MEMBUKA SHIFT (Input Modal Awal)
     */
    public function bukaSesi(Request $request)
    {
        $request->validate([
            'modal_awal' => 'required|numeric|min:0',
            'outlet_id'  => 'required'
        ]);

        // Pastikan kasir tidak punya sesi yang masih 'open'
        $sesiAktif = SesiKasir::where('user_id', Auth::id())
            ->where('status', 'open')
            ->first();

        if ($sesiAktif) {
            return response()->json(['message' => 'Kamu masih memiliki sesi yang aktif!'], 400);
        }

        $sesi = SesiKasir::create([
            'user_id'    => Auth::id(),
            'outlet_id'  => $request->outlet_id,
            'modal_awal' => $request->modal_awal,
            'status'     => 'open',
            'waktu_buka' => now(),
        ]);

        return redirect()->route('pos.index') // Redirect langsung ke rute POS Anda
        ->with('message', 'Sesi kasir berhasil dibuka.');
    }

    /**
     * 2. TUTUP KASIR (Input Uang Fisik -> Ambil Data Ringkasan -> Logout -> Redirect)
     */
    public function tutupKasir(Request $request, $id)
    {
        $request->validate([
            'uang_fisik_akhir' => 'required|numeric|min:0'
        ]);

        $sesi = SesiKasir::with(['user', 'transactions'])->findOrFail($id);

        if ($sesi->status === 'closed') {
            return response()->json(['message' => 'Sesi ini sudah ditutup sebelumnya.'], 400);
        }

        // Hitung total nominal penjualan sistem selama shift ini berlangsung
        $totalPenjualanSistem = $sesi->transactions()->sum('total_price'); // Sesuaikan kolom total harga kamu

        // Kunci dan simpan data sesi kasir
        $sesi->update([
            'uang_fisik_akhir' => $request->uang_fisik_akhir,
            'status'           => 'closed',
            'waktu_tutup'      => now()
        ]);

        // Siapkan struktur data Z-Report untuk di-print otomatis oleh frontend
        $dataZReport = [
            'nama_kasir'      => $sesi->user->name,
            'waktu_buka'      => $sesi->waktu_buka->format('d-m-Y H:i'),
            'waktu_tutup'     => $sesi->waktu_tutup->format('d-m-Y H:i'),
            'modal_awal'      => $sesi->modal_awal,
            'penjualan_sistem'=> $totalPenjualanSistem,
            'uang_fisik'      => $request->uang_fisik_akhir,
            'selisih'         => $request->uang_fisik_akhir - ($sesi->modal_awal + $totalPenjualanSistem)
        ];

        // PROSES LOGOUT OTOMATIS demi keamanan
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Kirim data struk ke frontend. Frontend yang akan memicu printer bekerja, lalu melempar ke halaman /login
        return response()->json([
            'status'     => 'success',
            'message'    => 'Kasir berhasil ditutup, mencetak struk, dan otomatis logout.',
            'z_report'   => $dataZReport,
            'redirect_to'=> route('login')
        ]);
    }

    /**
     * 3. QUERY TABEL BAWAH (Riwayat Shift Hari Ini)
     */
    public function riwayatShiftHariIni()
    {
        $riwayat = SesiKasir::whereDate('created_at', today())
            ->with('user')
            ->orderBy('waktu_buka', 'desc')
            ->get();

        return response()->json($riwayat);
    }
}