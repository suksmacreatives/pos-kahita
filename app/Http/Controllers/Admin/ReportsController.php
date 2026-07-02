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

        $outlets = $request->user()->outlet_id
            ? Outlet::aktif()->where('id', $request->user()->outlet_id)->get(['id', 'slug', 'name', 'warna'])
            : Outlet::aktif()->get(['id', 'slug', 'name', 'warna']);

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
        if ($request->user()->outlet_id) {
            $userOutlet = Outlet::find($request->user()->outlet_id);
            $outlet = $userOutlet?->slug ?? $outlet;
        }

        $data = match ($kategori) {
            'penjualan' => app(PenjualanReportService::class, compact('dari', 'sampai', 'outlet'))->all(),
            'produk'    => app(ProdukReportService::class, compact('dari', 'sampai', 'outlet'))->all(),
            'inventori' => app(InventoriReportService::class, compact('dari', 'sampai', 'outlet'))->all(),
            'kasir'     => app(KasirReportService::class, compact('dari', 'sampai', 'outlet'))->all(),
            'keuangan'  => app(KeuanganReportService::class, compact('dari', 'sampai', 'outlet'))->all(),
            default     => [],
        };

        if ($format === 'excel') {
            $excel = new \App\Exports\ReportExport($data, $kategori, $sub, $dari, $sampai);
            $spreadsheet = $excel->build();
            $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
            return response()->streamDownload(function () use ($writer) {
                $writer->save('php://output');
            }, "laporan-{$kategori}-{$dari->format('Ymd')}-{$sampai->format('Ymd')}.xlsx", [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ]);
        }

        $title = match ($kategori) {
            'penjualan' => 'Laporan Penjualan',
            'produk'    => 'Laporan Produk',
            'inventori' => 'Laporan Inventori',
            'kasir'     => 'Laporan Kasir',
            'keuangan'  => 'Laporan Keuangan',
            default     => 'Laporan',
        };

        $prepared = $this->preparePdfData($data, $kategori);

        $landscape = $kategori === 'kasir' || $kategori === 'keuangan';

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.pdf', [
            'data'      => $prepared,
            'kategori'  => $kategori,
            'sub'       => $sub,
            'dari'      => $dari,
            'sampai'    => $sampai,
            'title'     => $title,
            'landscape' => $landscape,
        ]);

        return $pdf->download("laporan-{$kategori}-{$dari->format('Ymd')}-{$sampai->format('Ymd')}.pdf");
    }

    protected function preparePdfData(array $data, string $kategori): array
    {
        return match ($kategori) {
            'penjualan' => [
                'summary' => $data['ringkasan'] ?? [],
                'rows'    => $data['omset_harian'] ?? [],
                'charts'  => [
                    'labels' => collect($data['omset_harian'] ?? [])->pluck('tanggal')->values()->toArray(),
                    'series' => [
                        ['name' => 'Omset',     'data' => collect($data['omset_harian'] ?? [])->pluck('omset')->values()->toArray()],
                        ['name' => 'Transaksi', 'data' => collect($data['omset_harian'] ?? [])->pluck('transaksi')->values()->toArray()],
                    ],
                ],
            ],
            'produk' => [
                'summary' => [
                    'Total Produk Terjual' => collect($data['top_products'] ?? [])->sum('terjual'),
                    'Total Revenue'        => collect($data['top_products'] ?? [])->sum('revenue'),
                    'Rata-rata Harga'      => collect($data['top_products'] ?? [])->avg('avg_harga') ?: 0,
                ],
                'rows'   => collect($data['top_products'] ?? [])
                    ->map(fn ($row) => tap($row, fn (&$r) => (function () use (&$r) {
                        unset($r['id'], $r['foto'], $r['image']);
                    })()))
                    ->values()
                    ->toArray(),
                'charts' => [
                    'labels' => collect($data['per_kategori'] ?? [])->pluck('nama')->values()->toArray(),
                    'series' => [
                        ['name' => 'Revenue', 'data' => collect($data['per_kategori'] ?? [])->pluck('revenue')->values()->toArray()],
                    ],
                ],
            ],
            'inventori' => [
                'summary' => $data['mutasi_summary'] ?? [],
                'rows'    => $data['mutasi_log'] ?? [],
                'charts'  => [
                    'labels' => collect($data['nilai_per_lokasi'] ?? [])->pluck('nama')->values()->toArray(),
                    'series' => [
                        ['name' => 'Nilai Inventori', 'data' => collect($data['nilai_per_lokasi'] ?? [])->pluck('nilai')->values()->toArray()],
                    ],
                ],
            ],
            'kasir' => [
                'summary' => [
                    'Total Kasir'        => count($data['kasir_stats'] ?? []),
                    'Total Transaksi'    => collect($data['kasir_stats'] ?? [])->sum('transaksi'),
                    'Total Omset'        => collect($data['kasir_stats'] ?? [])->sum('omset'),
                    'Rata-rata per Trx'  => ($t = collect($data['kasir_stats'] ?? [])->sum('transaksi')) > 0
                        ? 'Rp ' . number_format(collect($data['kasir_stats'] ?? [])->sum('omset') / $t, 0, ',', '.')
                        : 'Rp 0',
                    'Total Void'         => collect($data['kasir_stats'] ?? [])->sum('void_count'),
                ],
                'rows'   => collect($data['kasir_stats'] ?? [])
                    ->map(fn ($k) => [
                        'Kasir'        => $k['nama'] ?? $k['kasir'] ?? '-',
                        'Outlet'       => $k['outlet'] ?? '-',
                        'Transaksi'    => $k['transaksi'] ?? 0,
                        'Omset'        => $k['omset'] ?? 0,
                        'Rata-rata'    => $k['avg_transaksi'] ?? $k['avg'] ?? 0,
                        'Void'         => $k['void_count'] ?? $k['void'] ?? 0,
                        'Void Rate'    => ($k['void_rate'] ?? $k['rate'] ?? 0) . '%',
                    ])
                    ->values()
                    ->toArray(),
                'charts' => [
                    'labels' => collect($data['kasir_stats'] ?? [])->pluck('nama')->values()->toArray(),
                    'series' => [
                        ['name' => 'Transaksi', 'data' => collect($data['kasir_stats'] ?? [])->pluck('transaksi')->values()->toArray()],
                        ['name' => 'Omset',     'data' => collect($data['kasir_stats'] ?? [])->pluck('omset')->values()->toArray()],
                    ],
                ],
                'extra_sections' => array_filter([
                    !empty($data['shift_stats']['shifts'] ?? []) ? [
                        'title' => 'Detail Shift',
                        'rows'  => collect($data['shift_stats']['shifts'] ?? [])->map(fn ($s) => [
                            'Shift'     => ucfirst($s['shift'] ?? ''),
                            'Hari'      => $s['hari'] ?? '-',
                            'Kasir'     => $s['kasir'] ?? $s['nama'] ?? '-',
                            'Transaksi' => $s['transaksi'] ?? 0,
                            'Omset'     => $s['omset'] ?? $s['total'] ?? 0,
                        ])->toArray(),
                    ] : null,
                ]),
            ],
            'keuangan' => [
                'summary' => [
                    'Penjualan Bruto'  => $data['laba_rugi']['penjualan_bruto'] ?? 0,
                    'Diskon'           => $data['laba_rugi']['diskon'] ?? 0,
                    'Penjualan Bersih' => $data['laba_rugi']['penjualan_bersih'] ?? 0,
                    'Total HPP'        => $data['laba_rugi']['total_hpp'] ?? 0,
                    'Laba Kotor'       => $data['laba_rugi']['laba_kotor'] ?? 0,
                    'Nilai Void'       => $data['laba_rugi']['nilai_void'] ?? 0,
                    'Nilai Refund'     => $data['laba_rugi']['nilai_refund'] ?? 0,
                    'Laba Bersih'      => $data['laba_rugi']['laba_bersih'] ?? 0,
                    'Margin Kotor'     => ($data['laba_rugi']['margin_kotor'] ?? 0) . '%',
                    'Margin Bersih'    => ($data['laba_rugi']['margin_bersih'] ?? 0) . '%',
                ],
                'rows'   => collect($data['margin_per_produk'] ?? [])
                    ->map(fn ($row) => tap($row, fn (&$r) => (function () use (&$r) {
                        unset($r['id'], $r['produk'], $r['hpp'], $r['beli'], $r['jual'], $r['margin_rupiah'], $r['margin']);
                    })()))
                    ->values()
                    ->toArray(),
                'charts' => [
                    'labels' => collect($data['hpp_stats']['per_kategori'] ?? [])->pluck('nama')->values()->toArray(),
                    'series' => [
                        ['name' => 'Margin %', 'data' => collect($data['hpp_stats']['per_kategori'] ?? [])->pluck('margin_persen')->values()->toArray()],
                    ],
                ],
                'extra_sections' => array_filter([
                    !empty($data['diskon_stats'] ?? []) ? [
                        'title' => 'Analisis Diskon',
                        'rows'  => [
                            ['Komponen' => 'Total Diskon', 'Nilai' => $data['diskon_stats']['total_diskon'] ?? 0],
                            ['Komponen' => 'Revenue',      'Nilai' => $data['diskon_stats']['revenue_impact'] ?? $data['diskon_stats']['dampak_revenue'] ?? 0],
                            ['Komponen' => 'Pemakaian',    'Nilai' => $data['diskon_stats']['total_pemakaian'] ?? $data['diskon_stats']['pemakaian'] ?? 0],
                            ['Komponen' => 'Efektivitas',  'Nilai' => ($data['diskon_stats']['efektivitas'] ?? $data['diskon_stats']['effectiveness'] ?? 0) . '%'],
                            ['Komponen' => 'ROI Rata-rata','Nilai' => $data['diskon_stats']['roi_rata'] ?? $data['diskon_stats']['avg_roi'] ?? 0],
                        ],
                    ] : null,
                    !empty($data['promo_performance'] ?? []) ? [
                        'title' => 'Performa Promo',
                        'rows'  => collect($data['promo_performance'] ?? [])->map(fn ($p) => [
                            'Kategori Promo' => $p['nama'] ?? $p['promo'] ?? '-',
                            'Pemakaian'      => $p['pemakaian'] ?? $p['count'] ?? 0,
                            'Nilai Diskon'   => $p['nilai_diskon'] ?? $p['diskon'] ?? 0,
                            'Revenue'        => $p['revenue'] ?? $p['pendapatan'] ?? 0,
                            'ROI'            => $p['roi'] ?? 0,
                        ])->toArray(),
                    ] : null,
                ]),
            ],
            default => [
                'summary' => [],
                'rows'    => [],
                'charts'  => ['labels' => [], 'series' => []],
            ],
        };
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
