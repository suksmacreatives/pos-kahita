<?php

namespace App\Http\Controllers\Admin\Outlets;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\OutletTarget;
use App\Http\Requests\Outlets\StoreTargetRequest;
use App\Http\Resources\Outlets\TargetResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class OutletTargetController extends Controller
{
    public function index(Request $request)
    {
        $bulan = $request->get('bulan', now()->month);
        $tahun = $request->get('tahun', now()->year);

        $outlets = Outlet::aktif()->with(['targets' => function ($query) use ($bulan, $tahun) {
            $query->where('bulan', $bulan)->where('tahun', $tahun);
        }])->get();

        $targets = $outlets->map(function ($outlet) use ($bulan, $tahun) {
            $target = $outlet->targets->first();
            if (!$target) {
                $target = new OutletTarget([
                    'outlet_id' => $outlet->id,
                    'bulan' => $bulan,
                    'tahun' => $tahun,
                    'target_omset' => 0,
                    'target_transaksi' => 0,
                ]);
                $target->setRelation('outlet', $outlet);
            }
            return $target;
        });

        // Compute leaderboard
        $leaderboard = $this->getLeaderboard($bulan, $tahun);
        $chartData = $this->getChartData(6);

        return Inertia::render('Admin/Outlets/Target', [
            'targets' => TargetResource::collection($targets)->resolve($request),
            'leaderboard' => $leaderboard,
            'chartData' => $chartData,
            'filters' => ['bulan' => $bulan, 'tahun' => $tahun],
            'outlets' => $outlets->map(fn($o) => ['id' => $o->id, 'name' => $o->name, 'nama' => $o->name, 'kode' => $o->kode, 'warna' => $o->warna, 'warna_hex' => $o->warna_hex]),
        ]);
    }

    public function store(StoreTargetRequest $request)
    {
        try {
            DB::transaction(function () use ($request) {
                foreach ($request->targets as $targetData) {
                    OutletTarget::updateOrCreate(
                        [
                            'outlet_id' => $targetData['outlet_id'],
                            'bulan' => $targetData['bulan'],
                            'tahun' => $targetData['tahun'],
                        ],
                        [
                            'target_omset' => $targetData['target_omset'],
                            'target_transaksi' => $targetData['target_transaksi'],
                        ]
                    );
                }
            });
            return back()->with('success', 'Target outlet berhasil disimpan.');
        } catch (\Exception $e) {
            Log::error('Outlet targets store error: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat menyimpan target outlet.');
        }
    }

    private function getLeaderboard($bulan, $tahun)
    {
        $outlets = Outlet::aktif()->with(['targets' => function ($q) use ($bulan, $tahun) {
            $q->where('bulan', $bulan)->where('tahun', $tahun);
        }])->get();

        $ranked = $outlets->map(function ($outlet) {
            $target = $outlet->targets->first();
            $omset = $target ? $target->realisasi_omset : 0;
            return [
                'id' => $outlet->id,
                'name' => $outlet->name,
                'omset' => $omset,
                'target_omset' => $target ? $target->target_omset : 0,
                'growth' => 0,
                'status' => $target ? $target->status_target : 'behind',
                'persen_omset' => $target ? $target->persen_omset : 0,
            ];
        })->sortByDesc('omset')->values()->map(function ($item, $index) {
            $item['rank'] = $index + 1;
            return $item;
        });

        return $ranked;
    }

    private function getChartData($months)
    {
        // Placeholder for chart data based on transactions
        return [];
    }
}
