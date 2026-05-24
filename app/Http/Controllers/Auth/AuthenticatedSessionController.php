<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;

class AuthenticatedSessionController extends Controller
{
    /**
     * Tampilkan halaman login tunggal
     */
    public function create(): Response
    {
        // Ambil data kasir untuk disuplai ke dropdown
        $cashiers = User::where('role', 'cashier')->select('id', 'name')->get();

        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'cashiers' => $cashiers,
        ]);
    }

    /**
     * Proses Autentikasi Form
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'selected_user' => 'required|string',
            'password' => 'required|string',
        ]);

        // JALUR 1: PROSES LOGIN SEBAGAI ADMIN
        if ($request->selected_user === 'admin') {
            $request->validate([
                'email' => 'required|string|email',
            ]);

            // Coba login menggunakan email dan password admin
            if (!Auth::attempt($request->only('email', 'password'))) {
                throw ValidationException::withMessages([
                    'email' => 'Email atau Password Admin salah.',
                ]);
            }

            $request->session()->regenerate();
            return redirect()->intended(route('dashboard'));
        }

        // JALUR 2: PROSES LOGIN SEBAGAI KASIR (ID USER BERUPA ANGKA)
        $user = User::find($request->selected_user);

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => 'Password yang dimasukkan salah untuk akun kasir ini.',
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    /**
     * Keluar dari Sistem
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}