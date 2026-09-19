<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>{{ $title ?? 'Label Barcode' }}</title>
    <style>
        @page { size: 50mm {{ $label_size === '50x30' ? '30mm' : '25mm' }}; margin: 0; }
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
        body { font-family: Arial, Helvetica, sans-serif; color: #111; }

        .no-print {
            position: fixed; top: 0; left: 0; right: 0; z-index: 50;
            background: #0f172a; color: #fff; padding: 10px 16px;
            display: flex; align-items: center; justify-content: center;
            gap: 8px; flex-wrap: wrap; font-size: 13px;
        }
        .no-print a, .no-print button {
            padding: 7px 16px; background: #10b981; color: #fff; border: 0;
            border-radius: 8px; cursor: pointer; font-size: 13px; text-decoration: none;
        }
        .no-print .ghost { background: #334155; margin-left: 4px; }
        .no-print .active-size { background: #facc15; color: #0f172a; font-weight: bold; }
        .no-print .hint { font-size: 12px; opacity: .85; }

        .sheets { padding-top: 48px; }
        @media print {
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .no-print { display: none !important; }
            .sheets { padding-top: 0; }
        }

        .label {
            width: 100%;
            {{ $label_size === '50x30' ? 'height: 30mm;' : 'height: 25mm;' }}
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            page-break-inside: avoid;
            page-break-after: always;
            overflow: hidden;
            text-align: center;
            padding: 1mm;
        }
        .label .brand { font-size: 2.0mm; font-weight: bold; color: #059669; text-transform: uppercase; letter-spacing: .3mm; line-height: 1.1; }
        .label .name { font-size: 2.4mm; font-weight: bold; line-height: 1.2; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .label .variant { font-size: 2.1mm; color: #555; font-weight: bold; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .label .img-barcode { width: 46mm; height: 8mm; line-height: 0; }
        .label .img-barcode svg { width: 100%; height: 100%; display: block; margin: 0 auto; }
        .label .code { font-size: 2.2mm; font-weight: bold; letter-spacing: .2mm; max-width: 100%; white-space: nowrap; overflow: hidden; }
        .label .price { font-size: 2.6mm; font-weight: bold; color: #b45309; }
    </style>
</head>
<body onload="setTimeout(function () { window.print(); }, 350);">

    <div class="no-print">
        <span class="hint">Pilih kertas {{ $label_size === '50x30' ? '50 × 30 mm' : '50 × 25 mm' }}, skala 100%, margin Tanpa.</span>
        <span>Ukuran:</span>
        <a href="{{ request()->fullUrlWithQuery(['label_size' => '50x25']) }}" class="{{ $label_size === '50x25' ? 'active-size' : '' }}">50 × 25</a>
        <a href="{{ request()->fullUrlWithQuery(['label_size' => '50x30']) }}" class="{{ $label_size === '50x30' ? 'active-size' : '' }}">50 × 30</a>
        <button onclick="window.print();">Cetak</button>
        <button class="ghost" onclick="window.close();">Tutup</button>
    </div>

    <div class="sheets">
        @php
            $barcode = app('DNS1D');
            $svg = fn ($code) => $barcode->getBarcodeSVG($code, 'C128', 2, 40, '#111', false, true);
        @endphp

        @foreach ($labels as $label)
            @php
                $vColor = trim((string) ($label['variant_color'] ?? ''));
                $vSize = trim((string) ($label['variant_size'] ?? ''));
                $vParts = [];
                if ($vColor !== '') { $vParts[] = 'Warna: '.$vColor; }
                if ($vSize !== '') { $vParts[] = 'Size: '.$vSize; }
            @endphp
            <div class="label">
                <div class="brand">Kahita Busana</div>
                <div class="name">{{ $label['name'] }}</div>
                @if ($vParts)
                    <div class="variant">{{ implode(' · ', $vParts) }}</div>
                @endif
                <div class="img-barcode">{!! $svg($label['code']) !!}</div>
                <div class="code">{{ $label['code'] }}</div>
                @if (!empty($include_price) && $label['price'] !== null)
                    <div class="price">Rp {{ number_format($label['price'], 0, ',', '.') }}</div>
                @endif
            </div>
        @endforeach
    </div>

</body>
</html>