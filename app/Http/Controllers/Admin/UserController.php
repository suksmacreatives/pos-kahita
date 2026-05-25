<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Outlet;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Menampilkan Dashboard beserta seluruh data staf & outlet
     */
    public function index()
    {
        $outlets = Outlet::all();
        $users = User::with('outlet')->orderBy('created_at', 'desc')->get();

        return Inertia::render('Dashboard', [
            'users' => $users, 
            'outlets' => $outlets,
        ]);
    }

    /**
     * Memproses penyimpanan akun baru (Admin/Kasir)
     */
    public function storeCashier(Request $request)
    {
        $request->validate([
            'name'      => 'required|string|max:255|unique:users,name',
            'password'  => 'required|string|min:4',
            'role'      => 'required|in:admin,cashier',
            // Jika role kasir, outlet_id WAJIB diisi. Jika admin, BOLEH dikosongkan (HQ)
            'outlet_id' => $request->role === 'cashier' ? 'required|exists:outlets,id' : 'nullable|exists:outlets,id',
        ]);

        User::create([
            'name'      => $request->name,
            'email'     => strtolower(str_replace(' ', '', $request->name)) . '@kahita.team',
            'password'  => Hash::make($request->password),
            'role'      => $request->role,
            'outlet_id' => $request->role === 'cashier' ? $request->outlet_id : null,
        ]);

        return redirect()->back()->with('success', 'Akun berhasil didaftarkan!');
    }

    /**
     * Memperbarui data akun staf
     */
    public function updateUser(Request $request, User $user)
    {
        $request->validate([
            'name'      => 'required|string|max:255|unique:users,name,' . $user->id,
            'role'      => 'required|in:admin,cashier',
            'password'  => 'nullable|string|min:4',
            'outlet_id' => $request->role === 'cashier' ? 'required|exists:outlets,id' : 'nullable|exists:outlets,id',
        ]);

        $user->name = $request->name;
        $user->role = $request->role;
        $user->outlet_id = $request->role === 'cashier' ? $request->outlet_id : null;
        $user->email = strtolower(str_replace(' ', '', $request->name)) . '@kahita.team';

        if ($request->password) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return redirect()->back()->with('success', 'Data akun berhasil diperbarui!');
    }

    /**
     * Menghapus akun dari sistem
     */
    public function destroyUser(User $user)
    {
        if (Auth::id() === $user->id) {
            return redirect()->back()->with('error', 'Anda tidak bisa menghapus akun Anda sendiri!');
        }

        $user->delete();
        return redirect()->back()->with('success', 'Akun berhasil dihapus secara permanen!');
    }
}