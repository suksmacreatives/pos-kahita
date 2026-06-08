<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 10pt; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h1 { font-size: 16pt; margin: 0 0 5px; }
        .header p { margin: 2px 0; font-size: 9pt; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th, td { border: 1px solid #ddd; padding: 4px 6px; text-align: left; font-size: 9pt; }
        th { background: #f5f5f5; font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .footer { text-align: center; font-size: 8pt; color: #999; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 8px; }
        .badge { display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: 8pt; }
        .badge-success { background: #d4edda; color: #155724; }
        .badge-danger { background: #f8d7da; color: #721c24; }
        .badge-warning { background: #fff3cd; color: #856404; }
        .summary { margin-bottom: 15px; }
        .summary table th, .summary table td { border: none; padding: 2px 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $title }}</h1>
        <p>Periode: {{ \Carbon\Carbon::parse($dari)->isoFormat('D MMMM YYYY') }} – {{ \Carbon\Carbon::parse($sampai)->isoFormat('D MMMM YYYY') }}</p>
        <p>Dicetak: {{ now()->isoFormat('D MMMM YYYY HH:mm') }}</p>
    </div>

    @if (!empty($data['summary'] ?? null))
    <div class="summary">
        <h3 style="margin:0 0 6px;font-size:11pt;">Ringkasan</h3>
        <table>
            @foreach ((array) $data['summary'] as $key => $val)
            <tr>
                <th>{{ ucwords(str_replace('_', ' ', $key)) }}</th>
                <td>{{ is_numeric($val) ? 'Rp ' . number_format((float) $val, 0, ',', '.') : $val }}</td>
            </tr>
            @endforeach
        </table>
    </div>
    @endif

    @if (!empty($data['rows'] ?? null))
    <h3 style="margin:8px 0 6px;font-size:11pt;">Detail</h3>
    @php $rows = (array) $data['rows']; @endphp
    <table>
        <thead>
            <tr>
                @foreach (array_keys((array) reset($rows) ?: ['-' => '']) as $col)
                <th>{{ ucwords(str_replace('_', ' ', $col)) }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach ($rows as $row)
            <tr>
                @foreach ((array) $row as $cell)
                <td>{{ is_numeric($cell) && !is_string($cell) && $cell != (int) $cell ? 'Rp ' . number_format((float) $cell, 0, ',', '.') : $cell }}</td>
                @endforeach
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    @if (!empty($data['charts'] ?? null) && !empty($data['charts']['labels']) && !empty($data['charts']['series']))
    <div class="summary" style="page-break-before:always;">
        <h3 style="margin:0 0 6px;font-size:11pt;">Grafik</h3>
        <table>
            <thead>
                <tr>
                    <th>Label</th>
                    @foreach ($data['charts']['series'] as $serie)
                    <th class="text-right">{{ $serie['name'] ?? 'Seri' }}</th>
                    @endforeach
                </tr>
            </thead>
            <tbody>
                @foreach ($data['charts']['labels'] as $i => $label)
                <tr>
                    <td>{{ $label }}</td>
                    @foreach ($data['charts']['series'] as $serie)
                    @php $val = $serie['data'][$i] ?? 0; @endphp
                    <td class="text-right">{{ is_numeric($val) ? number_format((float) $val, 0, ',', '.') : $val }}</td>
                    @endforeach
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <div class="footer">
        Laporan ini digenerate secara otomatis dari sistem POS Kahita Busana
    </div>
</body>
</html>
