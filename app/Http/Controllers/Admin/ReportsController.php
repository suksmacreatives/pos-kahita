<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReportsFilterRequest;
use App\Services\Reports\PenjualanReportService;
use App\Services\Reports\ProdukReportService;
use App\Services\Reports\InventoriReportService;
use App\Services\Reports\KasirReportService;
use App\Services\Reports\KeuanganReportService;
use App\Models\Outlet;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportsController extends Controller
{
    public function index(ReportsFilterRequest $request)
    {
        $kategori = $request->input('kategori', 'penjualan');
        $sub      = $request->input('sub');
        $dari     = Carbon::parse($request->input('dari', now()->startOfMonth()->format('Y-m-d')));
        $sampai   = Carbon::parse($request->input('sampai', now()->format('Y-m-d')));
        $outlet   = $request->input('outlet', 'all');
        $compare  = $request->input('bandingkan', 'prev_period');

        $dariLalu   = null;
        $sampaiLalu = null;

        if ($compare === 'prev_period') {
            $diff       = $sampai->diffInDays($dari) + 1;
            $sampaiLalu = $dari->copy()->subDay();
            $dariLalu   = $dari->copy()->subDays($diff);
        } elseif ($compare === 'last_month') {
            $sampaiLalu = $dari->copy()->subDay()->endOfMonth();
            $dariLalu   = $sampaiLalu->copy()->startOfMonth();
        } elseif ($compare === 'last_year') {
            $sampaiLalu = $dari->copy()->subDay()->endOfYear();
            $dariLalu   = $sampaiLalu->copy()->startOfYear();
        }

        $data = match ($kategori) {
            'penjualan' => app(PenjualanReportService::class, [
                'dari'       => $dari,
                'sampai'     => $sampai,
                'outlet'     => $outlet,
                'dariLalu'   => $dariLalu,
                'sampaiLalu' => $sampaiLalu,
            ])->all(),

            'produk' => app(ProdukReportService::class, [
                'dari'       => $dari,
                'sampai'     => $sampai,
                'outlet'     => $outlet,
                'dariLalu'   => $dariLalu,
                'sampaiLalu' => $sampaiLalu,
            ])->all(),

            'inventori' => app(InventoriReportService::class, [
                'dari'       => $dari,
                'sampai'     => $sampai,
                'outlet'     => $outlet,
                'dariLalu'   => $dariLalu,
                'sampaiLalu' => $sampaiLalu,
            ])->all(),

            'kasir' => app(KasirReportService::class, [
                'dari'       => $dari,
                'sampai'     => $sampai,
                'outlet'     => $outlet,
                'dariLalu'   => $dariLalu,
                'sampaiLalu' => $sampaiLalu,
            ])->all(),

            'keuangan' => app(KeuanganReportService::class, [
                'dari'       => $dari,
                'sampai'     => $sampai,
                'outlet'     => $outlet,
                'dariLalu'   => $dariLalu,
                'sampaiLalu' => $sampaiLalu,
            ])->all(),

            default => [],
        };

        $outlets = Outlet::aktif()->get(['id', 'slug', 'name', 'warna']);

        return Inertia::render('Admin/Reports', [
            'data'         => $data,
            'kategori'     => $kategori,
            'sub'          => $sub,
            'filters'      => [
                'dari'          => $dari->format('Y-m-d'),
                'sampai'        => $sampai->format('Y-m-d'),
                'outlet'        => $outlet,
                'bandingkan'    => $compare,
                'periode_label' => $this->getPeriodeLabel($dari, $sampai),
            ],
            'outlet_list'  => $outlets,
            'page_title'   => 'Laporan - Kahita Busana',
        ]);
    }

    public function export(ReportsFilterRequest $request)
    {
        $format = $request->input('format', 'pdf');
        $kategori = $request->input('kategori', 'penjualan');
        $sub      = $request->input('sub');

        $dari   = Carbon::parse($request->input('dari', now()->startOfMonth()->format('Y-m-d')));
        $sampai = Carbon::parse($request->input('sampai', now()->format('Y-m-d')));
        $outlet = $request->input('outlet', 'all');

        $data = match ($kategori) {
            'penjualan' => app(PenjualanReportService::class, compact('dari', 'sampai', 'outlet'))->all(),
            'produk'    => app(ProdukReportService::class, compact('dari', 'sampai', 'outlet'))->all(),
            'inventori' => app(InventoriReportService::class, compact('dari', 'sampai', 'outlet'))->all(),
            'kasir'     => app(KasirReportService::class, compact('dari', 'sampai', 'outlet'))->all(),
            'keuangan'  => app(KeuanganReportService::class, compact('dari', 'sampai', 'outlet'))->all(),
            default     => [],
        };

        if ($format === 'excel') {
            return \Maatwebsite\Excel\Facades\Excel::download(
                new \App\Exports\ReportExport($data, $kategori, $sub, $dari, $sampai),
                "laporan-{$kategori}-{$dari->format('Ymd')}-{$sampai->format('Ymd')}.xlsx"
            );
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.pdf', [
            'data'     => $data,
            'kategori' => $kategori,
            'sub'      => $sub,
            'dari'     => $dari,
            'sampai'   => $sampai,
        ]);

        return $pdf->download("laporan-{$kategori}-{$dari->format('Ymd')}-{$sampai->format('Ymd')}.pdf");
    }

    protected function getPeriodeLabel(Carbon $dari, Carbon $sampai): string
    {
        if ($dari->isSameDay($sampai)) {
            if ($dari->isToday()) return 'Hari ini';
            if ($dari->isYesterday()) return 'Kemarin';
            return $dari->format('d M Y');
        }

        if ($dari->isSameMonth($sampai) && $dari->isStartOfMonth() && $sampai->isToday()) {
            return 'Bulan ini';
        }

        if ($dari->copy()->startOfMonth()->isSameDay($dari) && $sampai->copy()->endOfMonth()->isSameDay($sampai)) {
            return $dari->format('F Y');
        }

        $diff = $sampai->diffInDays($dari);
        if ($diff <= 7) return '7 hari terakhir';
        if ($diff <= 30) return '30 hari terakhir';

        return 'Custom';
    }
}
