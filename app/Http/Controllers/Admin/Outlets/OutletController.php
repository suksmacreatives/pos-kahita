<?php

namespace App\Http\Controllers\Admin\Outlets;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\StockMovement;
use App\Http\Resources\Outlets\OutletResource;
use App\Http\Resources\Outlets\OutletDetailResource;
use App\Http\Resources\Outlets\KasirResource;
use App\Http\Resources\Outlets\TargetResource;
use App\Http\Requests\Outlets\StoreOutletRequest;
use App\Http\Requests\Outlets\UpdateOutletRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OutletController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            abort_if($request->user()?->outlet_id, 403);
            return $next($request);
        });
    }

    public function index(Request $request)
    {
        $outlets = Outlet::with(['manajer', 'targets' => function ($query) {
            $query->where('bulan', now()->month)->where('tahun', now()->year);
        }])->withCount(['users as kasirs_count' => function ($query) {
            $query->where('role', 'cashier')->where('status', 'aktif');
        }])->filter($request->all())->get();

        $totalOutlet = Outlet::aktif()->count();
        $totalOmset = $outlets->sum(fn($o) => $o->stats['omset_bulan_ini']);
        $trxHariIni = $outlets->sum(fn($o) => $o->stats['transaksi_hari_ini'] ?? 0);
        $stokMenipis = $outlets->sum(fn($o) => $o->stats['stok_menipis']);

        return Inertia::render('Admin/Outlets/Index', [
            'outlets' => OutletResource::collection($outlets)->resolve($request),
            'stats' => [
                'totalAktif' => $totalOutlet,
                'totalOmset' => $totalOmset,
                'transaksiHariIni' => $trxHariIni,
                'stokMenipis' => $stokMenipis,
            ],
            'filters' => $request->only(['search', 'status', 'tipe']),
        ]);
    }

    public function show(Request $request, $slug)
    {
        $outlet = Outlet::where('slug', $slug)->orWhere('id', $slug)->firstOrFail();
        $outlet->load([
            'kasirs' => function($q){ $q->with('shifts'); }, 
            'shifts', 
            'targets' => function ($query) {
                $query->where('bulan', now()->month)->where('tahun', now()->year);
            }
        ]);

        return Inertia::render('Admin/Outlets/Detail', [
            'outlet' => (new OutletDetailResource($outlet))->resolve($request),
            'stats' => $outlet->stats,
            'kasirs' => KasirResource::collection($outlet->kasirs)->resolve($request),
            'shifts' => $outlet->shifts,
            'target' => $outlet->targetBulanIni ? new TargetResource($outlet->targetBulanIni) : null,
            'stok' => $this->getStokRingkasan($outlet),
            'tab' => $request->get('tab', 'profil'),
        ]);
    }

    public function store(StoreOutletRequest $request)
    {
        try {
            DB::transaction(function () use ($request) {
                $data = $request->validated();
                $data['slug'] = \Str::slug($data['kode'] . '-' . $data['name']);
                Outlet::create($data);
            });
            return back()->with('success', 'Outlet berhasil ditambahkan.');
        } catch (\Exception $e) {
            Log::error('Outlet store error: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat menambahkan outlet.');
        }
    }

    public function update(UpdateOutletRequest $request, $slug)
    {
        $outlet = Outlet::where('slug', $slug)->orWhere('id', $slug)->firstOrFail();
        try {
            DB::transaction(function () use ($request, $outlet) {
                $data = $request->validated();
                $data['slug'] = \Str::slug($data['kode'] . '-' . $data['name']);
                $outlet->update($data);
            });
            return back()->with('success', 'Outlet berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error('Outlet update error: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat memperbarui outlet.');
        }
    }

    public function destroy($slug)
    {
        $outlet = Outlet::where('slug', $slug)->orWhere('id', $slug)->firstOrFail();
        try {
            // Soft delete or status change depending on requirements.
            // Since migration doesn't use softdeletes, we'll delete it.
            $outlet->delete();
            return redirect()->route('admin.outlets.index')->with('success', 'Outlet berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Outlet destroy error: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat menghapus outlet.');
        }
    }

    public function toggleStatus($slug)
    {
        $outlet = Outlet::where('slug', $slug)->orWhere('id', $slug)->firstOrFail();
        try {
            $outlet->update([
                'status' => $outlet->status === 'aktif' ? 'nonaktif' : 'aktif'
            ]);
            return back()->with('success', 'Status outlet berhasil diubah.');
        } catch (\Exception $e) {
            Log::error('Outlet toggle status error: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat mengubah status outlet.');
        }
    }

    private function getStokRingkasan(Outlet $outlet): array
    {
        // Dummy data or basic query to StockMovements via Products
        // For now returning basic structure as requested
        return [
            'total_sku' => $outlet->products()->count(),
            'total_stok' => 0, // Placeholder
            'stok_menipis' => 0,
            'stok_habis' => 0,
            'produk_menipis' => []
        ];
    }
}
