<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title ?? 'Laporan Dashboard' }}</title>
    <style>
        @page {
            margin: 20mm 15mm 25mm;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 8pt;
            color: #1e293b;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }

        .header {
            position: fixed;
            top: -15mm;
            left: 0;
            right: 0;
            height: 12mm;
            border-bottom: 2px solid #10b981;
            padding: 0 0 3mm;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .header-left {
            display: flex;
            align-items: center;
            gap: 4mm;
        }
        .header-left img {
            height: 8mm;
            max-width: 30mm;
        }
        .header-left .title-text {
            font-size: 10pt;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.3px;
        }
        .header-right {
            font-size: 6.5pt;
            color: #64748b;
            text-align: right;
        }

        .footer {
            position: fixed;
            bottom: -20mm;
            left: 0;
            right: 0;
            height: 15mm;
            border-top: 1px solid #e2e8f0;
            padding-top: 2mm;
            font-size: 6.5pt;
            color: #94a3b8;
            text-align: center;
        }
        .footer .page-number {
            position: absolute;
            right: 0;
            bottom: 2mm;
        }

        .page-title {
            font-size: 13pt;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 2mm;
            letter-spacing: -0.5px;
        }
        .page-subtitle {
            font-size: 7pt;
            color: #64748b;
            margin: 0 0 4mm;
        }
        .section-title {
            font-size: 10pt;
            font-weight: 700;
            color: #0f172a;
            margin: 4mm 0 2.5mm;
            padding-bottom: 1.5mm;
            border-bottom: 1.5px solid #e2e8f0;
        }
        .section-title .badge {
            font-size: 6.5pt;
            font-weight: 600;
            color: #10b981;
            background: #ecfdf5;
            padding: 0.5mm 2mm;
            border-radius: 1mm;
            margin-left: 2mm;
        }

        .kpi-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 2.5mm;
            margin-bottom: 4mm;
        }
        .kpi-card {
            flex: 1 1 30%;
            min-width: 55mm;
            border: 1px solid #e2e8f0;
            border-radius: 2mm;
            padding: 2.5mm 3mm;
            background: #f8fafc;
        }
        .kpi-card .label {
            font-size: 6pt;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 1mm;
        }
        .kpi-card .value {
            font-size: 14pt;
            font-weight: 800;
            color: #0f172a;
        }
        .kpi-card .value.sub {
            font-size: 10pt;
        }

        .growth-row {
            display: flex;
            align-items: center;
            gap: 2mm;
            margin: 3mm 0;
        }
        .growth-item {
            flex: 1;
            text-align: center;
            padding: 2mm;
            border-radius: 1.5mm;
            border: 1px solid #e2e8f0;
            background: #fff;
        }
        .growth-item .label {
            font-size: 6pt;
            font-weight: 600;
            color: #64748b;
        }
        .growth-item .value {
            font-size: 11pt;
            font-weight: 800;
        }
        .growth-item .value.positive {
            color: #059669;
        }
        .growth-item .value.negative {
            color: #dc2626;
        }
        .growth-item .value.neutral {
            color: #64748b;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 3mm;
            font-size: 7pt;
        }
        th {
            background: #10b981;
            color: #fff;
            font-weight: 700;
            padding: 2mm 2.5mm;
            text-align: left;
            font-size: 6.5pt;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        th.right {
            text-align: right;
        }
        th.center {
            text-align: center;
        }
        td {
            padding: 1.5mm 2.5mm;
            border-bottom: 1px solid #f1f5f9;
        }
        td.right {
            text-align: right;
            font-family: 'DejaVu Sans Mono', monospace;
        }
        td.center {
            text-align: center;
        }
        tr:nth-child(even) td {
            background: #f8fafc;
        }
        tr.highlight-kritis td {
            background: #fef2f2;
            color: #991b1b;
        }
        tr.highlight-warning td {
            background: #fffbeb;
            color: #92400e;
        }

        .rank-badge {
            display: inline-block;
            width: 5mm;
            height: 5mm;
            line-height: 5mm;
            text-align: center;
            border-radius: 50%;
            font-size: 6pt;
            font-weight: 700;
            color: #fff;
        }
        .rank-1 { background: #f59e0b; }
        .rank-2 { background: #94a3b8; }
        .rank-3 { background: #b45309; }
        .rank-n { background: #e2e8f0; color: #64748b; }

        .status-badge {
            display: inline-block;
            padding: 0.5mm 2mm;
            border-radius: 0.8mm;
            font-size: 6pt;
            font-weight: 700;
        }
        .status-badge.aktif { background: #dcfce7; color: #166534; }
        .status-badge.nonaktif { background: #fef2f2; color: #991b1b; }
        .status-badge.kritis { background: #fef2f2; color: #dc2626; }
        .status-badge.warning { background: #fef3c7; color: #b45309; }
        .status-badge.aman { background: #dcfce7; color: #059669; }

        .two-col {
            display: flex;
            gap: 3mm;
        }
        .two-col > div {
            flex: 1;
        }

        .summary-box {
            background: #f0fdf4;
            border: 1px solid #86efac;
            border-radius: 1.5mm;
            padding: 2mm 3mm;
            margin-bottom: 3mm;
        }
        .summary-box .label {
            font-size: 6pt;
            color: #166534;
            font-weight: 600;
        }
        .summary-box .value {
            font-size: 16pt;
            font-weight: 800;
            color: #059669;
        }

        .recommendation {
            background: #f8fafc;
            border-left: 3px solid #10b981;
            padding: 1.5mm 2.5mm;
            margin-bottom: 1.5mm;
            font-size: 7pt;
        }
        .recommendation .prod-name {
            font-weight: 700;
        }

        .page-break {
            page-break-before: always;
        }

        .divider {
            border: none;
            border-top: 1px solid #e2e8f0;
            margin: 3mm 0;
        }
    </style>
</head>
<body>

@php
    $inv = $data['inventorySummary'] ?? [];
    $dist = $data['distribution'] ?? [];
    $ret = $data['return'] ?? [];
    $lowStock = $data['lowStock'] ?? [];
    $fastSlow = $data['fastSlowMoving'] ?? [];
    $restockRec = $data['restockRec'] ?? [];
    $invValue = $data['inventoryValue'] ?? [];
    $stats = $data['stats'] ?? [];
    $outletPerf = $data['outletPerformance'] ?? [];
    $topProducts = $data['topProducts'] ?? [];
@endphp

{{-- =========== PAGE 1: EXECUTIVE SUMMARY =========== --}}
<div class="header">
    <div class="header-left">
        <img src="{{ $logo }}" alt="Logo" style="height:8mm;max-width:30mm;">
        <div>
            <div class="title-text">Kahita Busana</div>
        </div>
    </div>
    <div class="header-right">
        Dicetak: {{ now()->isoFormat('D MMMM YYYY HH:mm') }}<br>
        Halaman <span class="pageNumber"></span>
    </div>
</div>

<div class="footer">
    Laporan Dashboard — POS Kahita Busana
    <span class="page-number">Hal. <span class="pageNumber"></span></span>
</div>

<div style="margin-top: 2mm;">
    <div class="page-title">Executive Summary Dashboard</div>
    <div class="page-subtitle">
        Periode: {{ \Carbon\Carbon::parse($dari)->isoFormat('D MMMM YYYY') }} – {{ \Carbon\Carbon::parse($sampai)->isoFormat('D MMMM YYYY') }}
        &nbsp;|&nbsp; Outlet: {{ $outletLabel }}
    </div>

    {{-- KPI Cards --}}
    <div class="section-title">Ringkasan KPI Utama</div>
    <div class="kpi-grid">
        <div class="kpi-card">
            <div class="label">Total Produk</div>
            <div class="value sub">{{ number_format($inv['total_produk'] ?? 0, 0, ',', '.') }}</div>
        </div>
        <div class="kpi-card">
            <div class="label">Total Kategori</div>
            <div class="value sub">{{ number_format($inv['total_kategori'] ?? 0, 0, ',', '.') }}</div>
        </div>
        <div class="kpi-card">
            <div class="label">Total Stok Gudang</div>
            <div class="value sub">{{ number_format($inv['total_stok_gudang'] ?? 0, 0, ',', '.') }} pcs</div>
        </div>
        <div class="kpi-card">
            <div class="label">Nilai Inventaris</div>
            <div class="value sub">Rp {{ number_format($inv['total_nilai_inventaris'] ?? 0, 0, ',', '.') }}</div>
        </div>
        <div class="kpi-card">
            <div class="label">Total Distribusi (Bulan Ini)</div>
            <div class="value sub">{{ number_format($dist['total_distribusi'] ?? 0, 0, ',', '.') }} pcs</div>
        </div>
        <div class="kpi-card">
            <div class="label">Total Retur (Bulan Ini)</div>
            <div class="value sub">{{ number_format($ret['total_retur'] ?? 0, 0, ',', '.') }} pcs</div>
        </div>
    </div>

    {{-- Growth Indicators --}}
    <div class="section-title">Growth Indicator <span class="badge">vs Periode Sebelumnya</span></div>
    <div class="growth-row">
        @php
            $distGrowth = $dist['growth'] ?? 0;
            $retGrowth = $ret['growth'] ?? 0;
            $stockGrowth = $stats['growthSales'] ?? 0;
        @endphp
        <div class="growth-item">
            <div class="label">Distribusi</div>
            <div class="value {{ $distGrowth > 0 ? 'positive' : ($distGrowth < 0 ? 'negative' : 'neutral') }}">
                {{ $distGrowth > 0 ? '+' : '' }}{{ number_format($distGrowth, 1) }}%
            </div>
        </div>
        <div class="growth-item">
            <div class="label">Retur</div>
            <div class="value {{ $retGrowth <= 0 ? 'positive' : 'negative' }}">
                {{ $retGrowth > 0 ? '+' : '' }}{{ number_format($retGrowth, 1) }}%
                @if($retGrowth <= 0) <span style="font-size:6pt;display:block;color:#059669;">(baik)</span> @endif
            </div>
        </div>
        <div class="growth-item">
            <div class="label">Pendapatan</div>
            <div class="value {{ $stockGrowth > 0 ? 'positive' : ($stockGrowth < 0 ? 'negative' : 'neutral') }}">
                {{ $stockGrowth > 0 ? '+' : '' }}{{ number_format($stockGrowth, 1) }}%
            </div>
        </div>
        <div class="growth-item">
            <div class="label">Produk Low Stock</div>
            <div class="value {{ ($inv['jumlah_produk_low_stock'] ?? 0) < 5 ? 'positive' : 'negative' }}">
                {{ number_format($inv['jumlah_produk_low_stock'] ?? 0, 0, ',', '.') }} produk
            </div>
        </div>
    </div>
</div>

{{-- Top 10 Distribusi + Retur --}}
<div class="page-break"></div>
<div class="page-title">Distribusi &amp; Retur Produk</div>
<div class="page-subtitle">Ranking 10 besar produk terdistribusi dan retur periode {{ \Carbon\Carbon::parse($dari)->isoFormat('D MMMM YYYY') }} – {{ \Carbon\Carbon::parse($sampai)->isoFormat('D MMMM YYYY') }}</div>

<div class="two-col">
    <div>
        <div class="section-title">Top 10 Produk Terdistribusi</div>
        @if (!empty($dist['top_10']))
        <table>
            <thead>
                <tr>
                    <th class="center" style="width:8mm;">Rank</th>
                    <th>Nama Produk</th>
                    <th class="right">Total Qty</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($dist['top_10'] as $i => $p)
                <tr>
                    <td class="center">
                        <span class="rank-badge {{ $i < 3 ? 'rank-' . ($i+1) : 'rank-n' }}">{{ $i + 1 }}</span>
                    </td>
                    <td style="font-weight:600;">{{ $p['nama_produk'] }}</td>
                    <td class="right">{{ number_format($p['total_qty'], 0, ',', '.') }} pcs</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @else
        <p style="color:#94a3b8;font-size:7pt;">Belum ada data distribusi pada periode ini.</p>
        @endif
    </div>
    <div>
        <div class="section-title">Top 10 Produk Retur</div>
        @if (!empty($ret['top_10']))
        <table>
            <thead>
                <tr>
                    <th class="center" style="width:8mm;">Rank</th>
                    <th>Nama Produk</th>
                    <th class="right">Total Qty</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($ret['top_10'] as $i => $p)
                <tr>
                    <td class="center">
                        <span class="rank-badge {{ $i < 3 ? 'rank-' . ($i+1) : 'rank-n' }}">{{ $i + 1 }}</span>
                    </td>
                    <td style="font-weight:600;">{{ $p['nama_produk'] }}</td>
                    <td class="right">{{ number_format($p['total_qty'], 0, ',', '.') }} pcs</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @else
        <p style="color:#94a3b8;font-size:7pt;">Belum ada data retur pada periode ini.</p>
        @endif
    </div>
</div>

<div class="summary-box" style="margin-top:2mm;">
    <div class="label">Rasio Retur</div>
    <div class="value">
        {{ number_format($ret['persentase_retur'] ?? 0, 2) }}%
        <span style="font-size:9pt;">dari total distribusi</span>
    </div>
</div>

{{-- Low Stock --}}
<div class="section-title page-break" style="padding-top:4mm;">Produk Low Stock <span class="badge">Perlu Reorder Segera</span></div>
<div class="page-subtitle">Produk dengan stok gudang di bawah threshold ({{ $inv['jumlah_produk_low_stock'] ?? 0 }} produk)</div>

@if (!empty($lowStock))
<table>
    <thead>
        <tr>
            <th>Nama Produk</th>
            <th>Kategori</th>
            <th class="right">Stok Saat Ini</th>
            <th class="right">Minimum Stok</th>
            <th class="center">Status</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($lowStock as $ls)
        <tr class="{{ $ls['status'] === 'kritis' ? 'highlight-kritis' : ($ls['status'] === 'warning' ? 'highlight-warning' : '') }}">
            <td style="font-weight:600;">{{ $ls['nama_produk'] }}</td>
            <td>{{ $ls['kategori'] }}</td>
            <td class="right">{{ number_format($ls['stok_saat_ini'], 0, ',', '.') }}</td>
            <td class="right">{{ number_format($ls['minimum_stock'], 0, ',', '.') }}</td>
            <td class="center">
                <span class="status-badge {{ $ls['status'] }}">
                    {{ strtoupper($ls['status']) }}
                </span>
            </td>
        </tr>
        @endforeach
    </tbody>
</table>
@else
<p style="color:#94a3b8;font-size:7pt;">Tidak ada produk dengan stok rendah.</p>
@endif

{{-- Distribusi per Outlet --}}
<div class="section-title">Distribusi per Outlet <span class="badge">Ranking Penerimaan Barang</span></div>
@if (!empty($dist['per_outlet']))
<table>
    <thead>
        <tr>
            <th class="center" style="width:8mm;">Rank</th>
            <th>Outlet</th>
            <th class="right">Total Qty Diterima</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($dist['per_outlet'] as $i => $o)
        <tr>
            <td class="center">
                <span class="rank-badge {{ $i < 3 ? 'rank-' . ($i+1) : 'rank-n' }}">{{ $i + 1 }}</span>
            </td>
            <td style="font-weight:600;">{{ $o['outlet'] }}</td>
            <td class="right">{{ number_format($o['total_qty'], 0, ',', '.') }} pcs</td>
        </tr>
        @endforeach
    </tbody>
</table>
@else
<p style="color:#94a3b8;font-size:7pt;">Belum ada data distribusi per outlet.</p>
@endif

{{-- Fast Moving, Slow Moving, Dead Stock --}}
<div class="page-break"></div>
<div class="page-title">Analisis Pergerakan Produk</div>
<div class="page-subtitle">Fast moving, slow moving, dan dead stock analysis</div>

<div class="two-col">
    <div>
        <div class="section-title">Fast Moving <span class="badge">Top 10</span></div>
        @if (!empty($fastSlow['fast_moving']))
        <table>
            <thead>
                <tr>
                    <th class="center" style="width:8mm;">#</th>
                    <th>Nama Produk</th>
                    <th>Kategori</th>
                    <th class="right">Qty Terjual</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($fastSlow['fast_moving'] as $i => $fm)
                <tr>
                    <td class="center">{{ $i + 1 }}</td>
                    <td style="font-weight:600;">{{ $fm['nama_produk'] }}</td>
                    <td>{{ $fm['kategori'] }}</td>
                    <td class="right">{{ number_format($fm['qty'], 0, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @else
        <p style="color:#94a3b8;font-size:7pt;">Belum ada data.</p>
        @endif
    </div>
    <div>
        <div class="section-title">Slow Moving</div>
        @if (!empty($fastSlow['slow_moving']))
        <table>
            <thead>
                <tr>
                    <th class="center" style="width:8mm;">#</th>
                    <th>Nama Produk</th>
                    <th>Kategori</th>
                    <th class="right">Qty Terjual</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($fastSlow['slow_moving'] as $i => $sm)
                <tr>
                    <td class="center">{{ $i + 1 }}</td>
                    <td>{{ $sm['nama_produk'] }}</td>
                    <td>{{ $sm['kategori'] }}</td>
                    <td class="right">{{ number_format($sm['qty'], 0, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @else
        <p style="color:#94a3b8;font-size:7pt;">Tidak ada produk slow moving.</p>
        @endif
    </div>
</div>

<div class="section-title">Dead Stock Analysis <span class="badge">Tanpa pergerakan {{ $deadStockDays ?? 90 }} hari</span></div>
@if (!empty($fastSlow['dead_stock']))
<table>
    <thead>
        <tr>
            <th class="center" style="width:8mm;">#</th>
            <th>Nama Produk</th>
            <th>Kategori</th>
            <th class="right">Stok Tersimpan</th>
            <th class="right">Nilai Stok (Rp)</th>
            <th class="center">Hari Tanpa Pergerakan</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($fastSlow['dead_stock'] as $i => $ds)
        @php
            $nilai = 0;
            $varian = \App\Models\ProductVariant::whereHas('product', fn($q) => $q->where('name', $ds['nama_produk']))->first();
            if ($varian) $nilai = $varian->stock * ($varian->cost_price ?? 0);
        @endphp
        <tr class="highlight-warning">
            <td class="center">{{ $i + 1 }}</td>
            <td>{{ $ds['nama_produk'] }}</td>
            <td>{{ $ds['kategori'] }}</td>
            <td class="right">{{ number_format($ds['stok'], 0, ',', '.') }} pcs</td>
            <td class="right">Rp {{ number_format($nilai, 0, ',', '.') }}</td>
            <td class="center">≥ {{ $ds['hari_tanpa_pergerakan'] }} hari</td>
        </tr>
        @endforeach
    </tbody>
</table>
@else
<p style="color:#94a3b8;font-size:7pt;">Tidak ada produk dead stock.</p>
@endif

{{-- Restock Recommendation --}}
<div class="page-break"></div>
<div class="page-title">Rekomendasi Pengadaan &amp; Nilai Inventaris</div>

<div class="section-title">Rekomendasi Restock <span class="badge">Berdasarkan rata-rata distribusi</span></div>
@if (!empty($restockRec))
<table>
    <thead>
        <tr>
            <th>Nama Produk</th>
            <th>Kategori</th>
            <th class="right">Stok Saat Ini</th>
            <th class="right">Min. Stok</th>
            <th class="right">Rata Distribusi / Bulan</th>
            <th class="right">Estimasi Hari Tersisa</th>
            <th class="right">Rekomendasi Qty</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($restockRec as $rr)
        @php
            $urgent = $rr['estimated_days_remaining'] <= 7;
        @endphp
        <tr class="{{ $urgent ? 'highlight-kritis' : '' }}">
            <td style="font-weight:600;">{{ $rr['nama_produk'] }}</td>
            <td>{{ $rr['kategori'] }}</td>
            <td class="right">{{ number_format($rr['stok_saat_ini'], 0, ',', '.') }}</td>
            <td class="right">{{ number_format($rr['minimum_stock'], 0, ',', '.') }}</td>
            <td class="right">{{ number_format($rr['rata_distribusi_bulanan'], 0, ',', '.') }}</td>
            <td class="right">{{ $rr['estimated_days_remaining'] }} hari</td>
            <td class="right" style="font-weight:700;color:#059669;">
                {{ number_format($rr['rekomendasi_qty'], 0, ',', '.') }} pcs
            </td>
        </tr>
        @endforeach
    </tbody>
</table>
@else
<p style="color:#94a3b8;font-size:7pt;">Tidak ada rekomendasi restock saat ini.</p>
@endif

{{-- Inventory Value --}}
<div class="section-title">Analisis Nilai Inventaris</div>
<div class="kpi-grid">
    <div class="kpi-card">
        <div class="label">Total Nilai Inventaris</div>
        <div class="value sub">Rp {{ number_format($invValue['total'] ?? 0, 0, ',', '.') }}</div>
    </div>
    <div class="kpi-card">
        <div class="label">Nilai Gudang</div>
        <div class="value sub">Rp {{ number_format($invValue['total_gudang'] ?? 0, 0, ',', '.') }}</div>
    </div>
    <div class="kpi-card">
        <div class="label">Nilai Outlet</div>
        <div class="value sub">Rp {{ number_format($invValue['total_outlet'] ?? 0, 0, ',', '.') }}</div>
    </div>
</div>

@if (!empty($invValue['per_kategori']))
<table>
    <thead>
        <tr>
            <th>Kategori</th>
            <th class="right">Total Produk</th>
            <th class="right">Total Stok</th>
            <th class="right">Total Nilai (Rp)</th>
            <th class="right">% Nilai</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($invValue['per_kategori'] as $iv)
        @php $pct = $invValue['total'] > 0 ? round(($iv['total_nilai'] / $invValue['total']) * 100, 1) : 0; @endphp
        <tr>
            <td style="font-weight:600;">{{ $iv['kategori'] }}</td>
            <td class="right">{{ number_format($iv['total_produk'], 0, ',', '.') }}</td>
            <td class="right">{{ number_format($iv['total_stok'], 0, ',', '.') }}</td>
            <td class="right">Rp {{ number_format($iv['total_nilai'], 0, ',', '.') }}</td>
            <td class="right">{{ number_format($pct, 1) }}%</td>
        </tr>
        @endforeach
    </tbody>
</table>
@endif

@if (!empty($invValue['per_produk']))
<div class="section-title">Rincian Nilai Inventaris per Produk <span class="badge">Top 10</span></div>
<table>
    <thead>
        <tr>
            <th class="center" style="width:8mm;">#</th>
            <th>Nama Produk</th>
            <th>Kategori</th>
            <th class="right">Stok</th>
            <th class="right">Nilai (Rp)</th>
        </tr>
    </thead>
    <tbody>
        @foreach (array_slice($invValue['per_produk'], 0, 10) as $i => $pv)
        <tr>
            <td class="center">{{ $i + 1 }}</td>
            <td style="font-weight:600;">{{ $pv['nama_produk'] }}</td>
            <td>{{ $pv['kategori'] }}</td>
            <td class="right">{{ number_format($pv['stok'], 0, ',', '.') }}</td>
            <td class="right">Rp {{ number_format($pv['nilai'], 0, ',', '.') }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
@endif

</body>
</html>
