<?php

namespace App\Services\Reports;

use App\Models\Transaction;
use App\Models\User;
use App\Models\Outlet;
use App\Models\Shift;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class KasirReportService
{
    protected Carbon $dari;
    protected Carbon $sampai;
    protected Carbon $dariLalu;
    protected Carbon $sampaiLalu;
    protected string $outlet;

    public function __construct(Carbon $dari, Carbon $sampai, string $outlet = 'all', ?Carbon $dariLalu = null, ?Carbon $sampaiLalu = null)
    {
        $this->dari       = $dari;
        $this->sampai     = $sampai;
        $this->outlet     = $outlet;
        $this->dariLalu   = $dariLalu ?? $dari->copy()->subDays($sampai->diffInDays($dari) + 1);
        $this->sampaiLalu = $sampaiLalu ?? $dari->copy()->subDay();
    }

    public function all(): array
    {
        return Cache::remember(
            "report_kasir_{$this->dari->format('Ymd')}_{$this->sampai->format('Ymd')}_{$this->outlet}",
            300,
            fn () => [
                'kasir_stats' => $this->getPerformaKasir(),
                'shift_stats' => $this->getLaporanShift(),
                'void_stats'  => $this->getVoidRateKasir(),
            ]
        );
    }

    public function getPerformaKasir(): array
    {
        $kasirs = User::whereIn('role', ['cashier', 'admin'])
            ->where('status', 'aktif')
            ->with('outlet:id,name')
            ->get();

        $transaksiSub = Transaction::where('status', 'completed')
            ->whereBetween('created_at', [$this->dari, $this->sampai->endOfDay()])
            ->groupBy('user_id')
            ->selectRaw('
                user_id,
                COUNT(*) as transaksi,
                COALESCE(SUM(grand_total), 0) as omset,
                COALESCE(AVG(grand_total), 0) as avg
            ');

        $voidSub = Transaction::where('status', 'void')
            ->whereBetween('created_at', [$this->dari, $this->sampai->endOfDay()])
            ->groupBy('user_id')
            ->selectRaw('user_id, COUNT(*) as void_count');

        $stats = DB::table('users')
            ->leftJoinSub($transaksiSub, 't', 'users.id', '=', 't.user_id')
            ->leftJoinSub($voidSub, 'v', 'users.id', '=', 'v.user_id')
            ->whereIn('users.role', ['cashier', 'admin'])
            ->where('users.status', 'aktif')
            ->selectRaw('
                users.id,
                users.name as nama,
                users.name as kasir,
                COALESCE(t.transaksi, 0) as transaksi,
                COALESCE(t.omset, 0) as omset,
                COALESCE(t.avg, 0) as avg,
                COALESCE(v.void_count, 0) as void_count
            ')
            ->get();

        return $kasirs->map(function ($kasir) use ($stats) {
            $s = $stats->firstWhere('id', $kasir->id);
            $transaksi  = (int) ($s->transaksi ?? 0);
            $omset      = (int) ($s->omset ?? 0);
            $avg        = $transaksi > 0 ? round($omset / $transaksi) : 0;
            $voidCount  = (int) ($s->void_count ?? 0);
            $voidRate   = $transaksi > 0 ? round(($voidCount / $transaksi) * 100, 1) : 0;

            return [
                'id'            => $kasir->id,
                'nama'          => $kasir->name,
                'kasir'         => $kasir->name,
                'outlet'        => $kasir->outlet?->name ?? '-',
                'transaksi'     => $transaksi,
                'trx'           => $transaksi,
                'count'         => $transaksi,
                'omset'         => $omset,
                'total'         => $omset,
                'avg_transaksi' => $avg,
                'avg'           => $avg,
                'void_count'    => $voidCount,
                'void'          => $voidCount,
                'void_rate'     => $voidRate,
                'rate'          => $voidRate,
                'trend'         => 'neutral',
            ];
        })
        ->sortByDesc('omset')
        ->values()
        ->toArray();
    }

    public function getLaporanShift(): array
    {
        $shifts = Shift::whereBetween('opened_at', [$this->dari, $this->sampai->endOfDay()])
            ->where('status', 'closed')
            ->with(['user:id,name', 'outlet:id,name'])
            ->get()
            ->groupBy(fn ($s) => $s->shift ?? 'pagi');

        $days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
        $shiftLabels = ['pagi', 'siang', 'malam'];

        $matrix = [];
        foreach ($shiftLabels as $shift) {
            $row = ['shift' => $shift, 'label' => $shift, 'data' => [], 'values' => []];
            foreach ($days as $day) {
                $total = $shifts->get($shift, collect())
                    ->filter(fn ($s) => $s->hari === $day || $s->created_at->isoFormat('dddd') === $day)
                    ->sum(fn ($s) => Transaction::where('shift_id', $s->id)
                        ->where('status', 'completed')
                        ->sum('grand_total'));

                $row['data'][] = (int) $total;
                $row['values'][] = (int) $total;
            }
            $matrix[] = $row;
        }

        $detailShift = [];
        foreach ($shifts as $shiftKey => $items) {
            foreach ($items as $s) {
                $omset = Transaction::where('shift_id', $s->id)
                    ->where('status', 'completed')
                    ->sum('grand_total');

                $transaksi = Transaction::where('shift_id', $s->id)
                    ->where('status', 'completed')
                    ->count();

                $detailShift[] = [
                    'shift'     => $shiftKey,
                    'hari'      => $s->hari ?? $s->created_at->isoFormat('dddd'),
                    'kasir'     => $s->user?->name ?? '-',
                    'nama'      => $s->user?->name ?? '-',
                    'transaksi' => $transaksi,
                    'omset'     => (int) $omset,
                    'total'     => (int) $omset,
                ];
            }
        }

        $bestShift = collect($matrix)->map(function ($row) {
            return [
                'shift' => $row['shift'],
                'total' => array_sum($row['data']),
            ];
        })->sortByDesc('total')->first();

        return [
            'heatmap'               => $matrix,
            'matrix'                => $matrix,
            'shifts'                => $detailShift,
            'detail'                => $detailShift,
            'shift_terproduktif'    => $bestShift ? "Shift " . ucfirst($bestShift['shift']) : '',
            'shift_paling_produktif' => $bestShift ? "Shift " . ucfirst($bestShift['shift']) : '',
        ];
    }

    public function getVoidRateKasir(): array
    {
        $kasirStats = $this->getPerformaKasir();

        return array_map(function ($k) {
            $trend = 'neutral';
            if ($k['void_rate'] > 5) $trend = 'up';
            elseif ($k['void_rate'] < 1) $trend = 'down';

            $k['trend'] = $trend;
            $k['total_trx'] = $k['transaksi'];
            $k['trx'] = $k['transaksi'];
            return $k;
        }, $kasirStats);
    }
}
