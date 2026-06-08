<?php

namespace App\Http\Controllers\Admin\Outlets;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Outlet;
use App\Http\Resources\Outlets\KasirResource;
use App\Http\Requests\Outlets\StoreKasirRequest;
use App\Http\Requests\Outlets\UpdateKasirRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class OutletKasirController extends Controller
{
    public function index(Request $request)
    {
        $query = User::kasir()->with(['outlet', 'shifts', 'attendances']);

        if ($request->filled('outlet')) {
            $query->where('outlet_id', $request->outlet);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $kasirs = $query->get();
        $outlets = Outlet::aktif()->select('id', 'name', 'kode', 'warna', 'warna_hex')->get()->map(fn($o) => ['id' => $o->id, 'nama' => $o->name, 'name' => $o->name, 'kode' => $o->kode, 'warna' => $o->warna, 'warna_hex' => $o->warna_hex]);

        $totalKasir = User::kasir()->count();
        $kasirOnline = User::kasir()->whereHas('attendances', function($q){
            $q->whereDate('date', today())->where('clock_in', '!=', null);
        })->count();

        // Calculate stats for top performer and void
        $topPerformer = null;
        $highestVoid = null;
        
        if ($kasirs->count() > 0) {
            $topPerformer = $kasirs->sortByDesc(fn($k) => $k->kasir_stats['total_omset_bulan'])->first();
            $highestVoid = $kasirs->sortByDesc(fn($k) => $k->kasir_stats['void_rate'])->first();
        }

        return Inertia::render('Admin/Outlets/Kasir', [
            'kasirs' => KasirResource::collection($kasirs)->resolve($request),
            'outlets' => $outlets,
            'stats' => [
                'total' => $totalKasir,
                'online' => $kasirOnline,
                'topPerformer' => $topPerformer ? $topPerformer->name : '-',
                'highestVoid' => $highestVoid ? $highestVoid->name : '-',
            ],
            'filters' => $request->only(['search', 'outlet', 'status']),
        ]);
    }

    public function store(StoreKasirRequest $request)
    {
        try {
            DB::transaction(function () use ($request) {
                $data = $request->validated();
                $data['password'] = Hash::make($data['password']);
                $data['role'] = 'cashier';
                $data['status'] = 'aktif';

                $user = User::create([
                    'name' => $data['nama'],
                    'email' => $data['email'],
                    'password' => $data['password'],
                    'role' => $data['role'],
                    'outlet_id' => $data['outlet_id'],
                    'shift_default' => $data['shift_default'],
                    'status' => $data['status'],
                ]);
            });
            return back()->with('success', 'Kasir berhasil ditambahkan.');
        } catch (\Exception $e) {
            Log::error('Kasir store error: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat menambahkan kasir.');
        }
    }

    public function update(UpdateKasirRequest $request, $id)
    {
        $kasir = User::kasir()->findOrFail($id);
        
        try {
            DB::transaction(function () use ($request, $kasir) {
                $data = $request->validated();
                $updateData = [
                    'name' => $data['nama'],
                    'email' => $data['email'],
                    'outlet_id' => $data['outlet_id'],
                    'shift_default' => $data['shift_default'],
                ];
                
                if (!empty($data['password'])) {
                    $updateData['password'] = Hash::make($data['password']);
                }
                
                $kasir->update($updateData);
            });
            return back()->with('success', 'Data kasir berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error('Kasir update error: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat memperbarui kasir.');
        }
    }

    public function destroy($id)
    {
        $kasir = User::kasir()->findOrFail($id);
        try {
            $kasir->delete();
            return back()->with('success', 'Kasir berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Kasir destroy error: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat menghapus kasir.');
        }
    }

    public function toggleStatus($id)
    {
        $kasir = User::kasir()->findOrFail($id);
        try {
            $kasir->update([
                'status' => $kasir->status === 'aktif' ? 'nonaktif' : 'aktif'
            ]);
            return back()->with('success', 'Status kasir berhasil diubah.');
        } catch (\Exception $e) {
            Log::error('Kasir toggle status error: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat mengubah status kasir.');
        }
    }

    public function resetPassword($id)
    {
        $kasir = User::kasir()->findOrFail($id);
        try {
            $newPassword = Str::random(8);
            $kasir->update(['password' => Hash::make($newPassword)]);
            return back()->with('success', "Password berhasil di-reset. Password baru: {$newPassword}");
        } catch (\Exception $e) {
            Log::error('Kasir reset password error: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat me-reset password.');
        }
    }
}
