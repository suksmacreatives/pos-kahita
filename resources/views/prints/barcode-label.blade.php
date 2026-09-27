<!DOCTYPE html>
<html lang="id">
@php
    // Skala ukuran barcode cetak (persen dari 44mm × 9mm), bisa dioverride via ?barcode_pct=
    $barcodePct = max(40, min(100, (int) request()->query('barcode_pct', 100)));

    $barcode = app('DNS1D');
    $barcodePrintablePx = 174;
    $barcodeQuiet = 10;

    /*
     * Render barcode sebagai bar DIV murni (bukan SVG) dengan posisi PERSE?
     * terhadap kontainer. Dengan begitu barcode selalu simetris terpusat dan
     * muat persis di dalam label 50mm pada ukuran print (mm) maupun layar (px)
     * tanpa risiko terpotong karena eksentrisitas rendering SVG browser.
     */
    $renderSvgWithMm = function ($code) use ($barcode, $barcodePrintablePx, $barcodeQuiet) {
        $len = strlen((string) $code);
        $maxModules = (int) (11 * $len + 39);
        $w = max(3, (int) floor(($barcodePrintablePx - (2 * $barcodeQuiet)) / $maxModules));

        $barcode->setPadding($barcodeQuiet);
        $svg = $barcode->getBarcodeSVG($code, 'C128', $w, 48, '#111', false, true);

        if (preg_match('/<svg[^>]*width="([\d.]+)"[^>]*height="([\d.]+)"/i', $svg, $m)) {
            $pxW = (float) $m[1];
            $pxH = (float) $m[2];
        } else {
            $pxW = 290;
            $pxH = 68;
        }

        preg_match_all('/<rect\b[^>]*?x="([\d.]+)"[^>]*?y="[\d.]+"[^>]*?width="([\d.]+)"[^>]*?height="[\d.]+"/i', $svg, $rects, PREG_SET_ORDER);

        $bars = '';
        foreach ($rects as $bar) {
            $bx = (float) $bar[1];
            $bw = (float) $bar[2];
            $bars .= '<div style="position:absolute;top:0;left:'.sprintf('%.4f', 100 * $bx / $pxW).'%;width:'.sprintf('%.4f', 100 * $bw / $pxW).'%;height:100%;background:#111;"></div>';
        }

        $html = '<div class="barcode-wrap"><div class="barcode-bar">'.$bars.'</div></div>';

        return [$html, $pxW, $pxH];
    };

    $mmPerPx = 25.4 / 96;
    $sample = isset($labels[0]) ? $renderSvgWithMm((string) $labels[0]['code']) : [[], 0, 0];
    $pxW = $sample[1] ?: 290;
    $pxH = $sample[2] ?: 68;
    $scale = min((44 * ($barcodePct / 100)) / ($pxW * $mmPerPx), (9 * ($barcodePct / 100)) / ($pxH * $mmPerPx));
    $readoutWmm = $pxW * $mmPerPx * $scale;
    $readoutHmm = $pxH * $mmPerPx * $scale;
@endphp
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

        .label {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            page-break-inside: avoid;
            page-break-after: always;
            text-align: center;
            padding: 1mm;
        }
        .label .brand { font-size: 2.0mm; font-weight: bold; color: #059669; text-transform: uppercase; letter-spacing: .3mm; line-height: 1.1; }
        .label .name { font-size: 2.4mm; font-weight: bold; line-height: 1.2; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .label .variant { font-size: 2.1mm; color: #555; font-weight: bold; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .label .img-barcode { width: 100%; line-height: 0; display: block; padding: 2mm 0; }
        .label .barcode-wrap { position: relative; width: {{ sprintf('%g', $readoutWmm) }}mm; height: {{ sprintf('%g', $readoutHmm) }}mm; margin: 0 auto; }
        .label .barcode-bar { position: absolute; inset: 0; }
        @media screen {
            .label .barcode-wrap { width: 288px; height: auto; aspect-ratio: {{ (int) $pxW }} / {{ (int) $pxH }}; }
        }
        .label .code { font-size: 2.2mm; font-weight: bold; letter-spacing: .2mm; max-width: 100%; white-space: nowrap; overflow: hidden; }
        .label .price { font-size: 2.6mm; font-weight: bold; color: #b45309; }
        .label .download-png {
            margin-top: 1mm; padding: 1mm 3mm; background: #2563eb; color: #fff;
            border: 0; border-radius: 2mm; cursor: pointer; font-size: 2.2mm; text-decoration: none;
        }
        @media print {
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .no-print { display: none !important; }
            .sheets { padding-top: 0; }

            .label {
                height: {{ $label_size === '50x30' ? '30mm' : '25mm' }};
                overflow: hidden;
            }
            .label .img-barcode { height: 9.5mm; padding: 0; }
            .label .barcode-wrap { width: {{ sprintf('%g', $readoutWmm) }}mm; height: {{ sprintf('%g', $readoutHmm) }}mm; }
            .label .download-png { display: none; }
        }
    </style>
</head>
<body onload="setTimeout(function () { window.print(); }, 350);">

    <div class="no-print">
        <span class="hint">Pilih kertas {{ $label_size === '50x30' ? '50 × 30 mm' : '50 × 25 mm' }}, skala 100%, margin Tanpa.</span>
        <span class="hint">Barcode cetak ±{{ sprintf('%g', $readoutWmm) }} × {{ sprintf('%g', $readoutHmm) }} mm ({{ $barcodePct }}%) ·</span>
        <a href="{{ request()->fullUrlWithQuery(['barcode_pct' => 100]) }}" class="{{ $barcodePct === 100 ? 'active-size' : '' }}">100%</a>
        <a href="{{ request()->fullUrlWithQuery(['barcode_pct' => 75]) }}" class="{{ $barcodePct === 75 ? 'active-size' : '' }}">75%</a>
        <span class="hint">Tips scan: klik Unduh PNG untuk gambar barcode yang pasti terbaca; untuk screenshot, perbesar halaman (Ctrl +) dulu. PNG hanya untuk uji scan, bukan untuk dicetak.</span>
        <span>Ukuran:</span>
        <a href="{{ request()->fullUrlWithQuery(['label_size' => '50x25']) }}" class="{{ $label_size === '50x25' ? 'active-size' : '' }}">50 × 25</a>
        <a href="{{ request()->fullUrlWithQuery(['label_size' => '50x30']) }}" class="{{ $label_size === '50x30' ? 'active-size' : '' }}">50 × 30</a>
        <button onclick="window.print();">Cetak</button>
        <button class="ghost" onclick="window.close();">Tutup</button>
    </div>

    <div class="sheets">
        @foreach ($labels as $label)
            @php
                $vColor = trim((string) ($label['variant_color'] ?? ''));
                $vSize = trim((string) ($label['variant_size'] ?? ''));
                $vParts = [];
                if ($vColor !== '') { $vParts[] = 'Warna: '.$vColor; }
                if ($vSize !== '') { $vParts[] = 'Size: '.$vSize; }
                $vSku = trim((string) ($label['sku_display'] ?? ''));
                if ($vSku !== '' && $vSku !== (string) $label['code']) { $vParts[] = 'SKU: '.$vSku; }
            @endphp
            <div class="label">
                <div class="brand">Kahita Busana</div>
                <div class="name">{{ $label['name'] }}</div>
                @if ($vParts)
                    <div class="variant">{{ implode(' · ', $vParts) }}</div>
                @endif
                <div class="img-barcode">{!! $renderSvgWithMm((string) $label['code'])[0] !!}</div>
                {{-- Teks humans WAJIB sama dengan kode yang di-encode bars, kalau tidak
                     kasir mengetik angka yang salah dan scan selalu gagal. --}}
                <div class="code">{{ $label['code'] }}</div>
                @if (!empty($include_price) && $label['price'] !== null)
                    <div class="price">Rp {{ number_format($label['price'], 0, ',', '.') }}</div>
                @endif
                @if (!empty($label['variant_id']))
                    <a class="download-png" href="{{ route('admin.products.barcode-png-variant', ['product' => $label['product_id'], 'variant' => $label['variant_id']]) }}" download>Unduh PNG</a>
                @else
                    <a class="download-png" href="{{ route('admin.products.barcode-png', $label['product_id']) }}" download>Unduh PNG</a>
                @endif
            </div>
        @endforeach
    </div>

</body>
</html>