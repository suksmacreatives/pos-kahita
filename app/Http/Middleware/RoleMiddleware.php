<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // 1. Jika user belum login sama sekali, paksa ke halaman login
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        // 2. Jika sudah login tapi role-nya TIDAK COCOK dengan yang diminta rute:
        // Berikan respons abort 403 (Forbidden), JANGAN di-redirect ke /dashboard agar tidak loop!
        if (Auth::user()->role !== $role) {
            abort(403, 'Anda tidak memiliki hak akses ke halaman ini.');
        }

        return $next($request);
    }
}