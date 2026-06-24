<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title ?? 'Katalog Produk' }}</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 8pt; color: #333; }
        .header { text-align: center; margin-bottom: 12px; border-bottom: 2px solid #333; padding-bottom: 6px; }
        .header h1 { font-size: 13pt; margin: 0 0 3px; }
        .header p { margin: 1px 0; font-size: 7pt; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        th, td { border: 1px solid #ddd; padding: 2px 4px; text-align: left; font-size: 7pt; }
        th { background: #10b981; color: #fff; font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .kategori-title { font-size: 10pt; font-weight: bold; margin: 12px 0 4px; padding: 3px 6px; background: #f5f5f5; }
        .badge-aktif { color: #155724; }
        .badge-nonaktif { color: #721c24; }
        .footer { text-align: center; font-size: 6pt; color: #999; margin-top: 12px; border-top: 1px solid #ddd; padding-top: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $title ?? 'Katalog Produk' }}</h1>
        <p>Total: {{ $totalProduk }} produk | {{ $totalVarian }} varian | Dicetak: {{ now()->isoFormat('D MMMM YYYY HH:mm') }}</p>
    </div>

    @php
        $grouped = $products->groupBy(fn($p) => $p['kategori'] ?? 'Tanpa Kategori');
    @endphp

    @foreach ($grouped as $kategori => $items)
    <div class="kategori-title">{{ $kategori }} ({{ $items->count() }} produk)</div>
    <table>
        <thead>
            <tr>
                <th>Kode</th>
                <th>Nama Produk</th>
                <th>Warna</th>
                <th>Ukuran</th>
                <th>SKU Varian</th>
                <th class="text-right">Harga Beli</th>
                <th class="text-right">Harga Jual</th>
                <th class="text-right">Stok Gudang</th>
                @foreach ($outletNames as $oname)
                <th class="text-right">{{ str_replace(' ', '', $oname) }}</th>
                @endforeach
                <th class="text-right">Total Stok</th>
                <th class="text-right">Terjual</th>
                <th class="text-center">Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($items as $p)
                @php $variants = $p['varian'] ?? []; @endphp
                @if (empty($variants))
                <tr>
                    <td>{{ $p['kode_produk'] ?? '-' }}</td>
                    <td>{{ $p['nama_produk'] ?? '-' }}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td class="text-right">Rp {{ number_format($p['harga_beli'] ?? 0, 0, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($p['harga_jual'] ?? 0, 0, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($p['stok_gudang'] ?? 0, 0, ',', '.') }}</td>
                    @foreach ($outletIds as $oid)
                    <td class="text-right">{{ number_format(($p['stok_per_outlet'][$oid] ?? 0), 0, ',', '.') }}</td>
                    @endforeach
                    @php
                        $total = ($p['stok_gudang'] ?? 0) + array_sum($p['stok_per_outlet'] ?? []);
                    @endphp
                    <td class="text-right">{{ number_format($total, 0, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($p['terjual'] ?? 0, 0, ',', '.') }}</td>
                    <td class="text-center {{ $p['status'] === 'aktif' ? 'badge-aktif' : 'badge-nonaktif' }}">{{ $p['status'] ?? 'aktif' }}</td>
                </tr>
                @else
                    @foreach ($variants as $v)
                    @php
                        $stokOutlet = $v['stok_outlet'] ?? [];
                    @endphp
                    <tr>
                        <td>{{ $p['kode_produk'] ?? '-' }}</td>
                        <td>{{ $p['nama_produk'] ?? '-' }}</td>
                        <td>{{ $v['color_name'] ?? '-' }}</td>
                        <td>{{ $v['size_label'] ?? '-' }}</td>
                        <td>{{ $v['sku'] ?? '-' }}</td>
                        <td class="text-right">Rp {{ number_format($v['harga_beli'] ?? $p['harga_beli'] ?? 0, 0, ',', '.') }}</td>
                        <td class="text-right">Rp {{ number_format($v['harga_jual'] ?? $p['harga_jual'] ?? 0, 0, ',', '.') }}</td>
                        <td class="text-right">{{ number_format($v['stok'] ?? 0, 0, ',', '.') }}</td>
                        @foreach ($outletIds as $oid)
                        <td class="text-right">{{ number_format((int) ($stokOutlet[$oid] ?? 0), 0, ',', '.') }}</td>
                        @endforeach
                        @php
                            $total = ($v['stok'] ?? 0) + array_sum($stokOutlet);
                        @endphp
                        <td class="text-right">{{ number_format($total, 0, ',', '.') }}</td>
                        <td class="text-right">{{ number_format($p['terjual'] ?? 0, 0, ',', '.') }}</td>
                        <td class="text-center {{ $p['status'] === 'aktif' ? 'badge-aktif' : 'badge-nonaktif' }}">{{ $p['status'] ?? 'aktif' }}</td>
                    </tr>
                    @endforeach
                @endif
            @endforeach
        </tbody>
    </table>
    @endforeach

    <div class="footer">
        Katalog digenerate otomatis dari sistem POS Kahita Busana
    </div>
</body>
</html>
