<?php

namespace App\Http\Controllers\Admin;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Menampilkan Dashboard beserta data kasir yang sudah ada
     */
    public function index()
    {
        // Ambil semua user dengan role cashier untuk ditampilkan di tabel dashboard
        $cashiers = User::where('role', 'cashier')->orderBy('created_at', 'desc')->get();

        return Inertia::render('Dashboard', [
            'cashiers' => $cashiers
        ]);
    }

    /**
     * Memproses penyimpanan akun kasir baru
     */
    public function storeCashier(Request $request)
    {
    // 1. Tambahkan validasi untuk role
    $request->validate([
        'name'     => 'required|string|max:255|unique:users,name',
        'password' => 'required|string|min:4',
        'role'     => 'required|in:admin,cashier', // Memastikan role valid
    ]);

    // 2. Simpan dengan role dinamis dari inputan
    User::create([
        'name'     => $request->name,
        'email'    => strtolower(str_replace(' ', '', $request->name)) . '@kahita.team',
        'password' => Hash::make($request->password),
        'role'     => $request->role, // Menangkap pilihan role
    ]);

    return redirect()->back()->with('success', 'Akun berhasil didaftarkan!');
    }

    public function updateUser(Request $request, User $user)
{
    $request->validate([
        'name' => 'required|string|max:255|unique:users,name,' . $user->id,
        'role' => 'required|in:admin,cashier',
        'password' => 'nullable|string|min:4', // Nullable artinya password boleh dikosongkan jika tidak ingin diubah
    ]);

    // Update nama dan role
    $user->name = $request->name;
    $user->role = $request->role;
    
    // Generate ulang email tiruan agar sinkron dengan nama baru
    $user->email = strtolower(str_replace(' ', '', $request->name)) . '@kahita.local';

    // Jika password diisi, enkripsi dan update password baru
    if ($request->password) {
        $user->password = Hash::make($request->password);
    }

    $user->save();

    return redirect()->back()->with('success', 'Data akun berhasil diperbarui!');
}

/**
 * Menghapus akun user dari database
 */
public function destroyUser(User $user)
{
    // Mencegah admin menghapus dirinya sendiri saat sedang login
if (Auth::id() === $user->id) {
        return redirect()->back()->with('error', 'Anda tidak bisa menghapus akun Anda sendiri yang sedang digunakan!');
    }

    $user->delete();

    return redirect()->back()->with('success', 'Akun berhasil dihapus secara permanen!');
}
}