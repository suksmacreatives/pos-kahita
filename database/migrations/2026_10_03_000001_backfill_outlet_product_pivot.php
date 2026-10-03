<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Samakan pivot outlet_product dengan products.outlet_ids.
 *
 * outlet_ids bertambah otomatis setiap kali barang diterima outlet
 * (InventoriOutletService::konfirmasiTerima), sedangkan pivot hanya
 * di-sync saat admin menyimpan form produk. Akibatnya pivot tertinggal dan
 * daftar produk di halaman admin tidak cocok dengan yang terlihat kasir.
 *
 * Migration ini menutup selisih yang sudah terlanjur terjadi. Aman untuk
 * production karena hanya menambahkan baris pivot yang memang sudah
 * dinyatakan ada di outlet_ids.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('outlet_product')) {
            return;
        }

        $barisTersinkron = 0;

        DB::table('products')
            ->select('id', 'outlet_ids')
            ->whereNotNull('outlet_ids')
            ->orderBy('id')
            ->each(function ($produk) use (&$barisTersinkron) {
                $outletIds = json_decode($produk->outlet_ids, true);

                if (! is_array($outletIds)) {
                    return;
                }

                foreach ($outletIds as $outletId) {
                    // Buang nilai non-numerik dan outlet yang sudah tidak ada.
                    if (! is_numeric($outletId)) {
                        continue;
                    }

                    $outletId = (int) $outletId;

                    $sudahAda = DB::table('outlet_product')
                        ->where('product_id', $produk->id)
                        ->where('outlet_id', $outletId)
                        ->exists();

                    if ($sudahAda) {
                        continue;
                    }

                    $punyaOutlet = DB::table('outlets')
                        ->where('id', $outletId)
                        ->exists();

                    if (! $punyaOutlet) {
                        continue;
                    }

                    DB::table('outlet_product')->insert([
                        'product_id' => $produk->id,
                        'outlet_id' => $outletId,
                    ]);

                    $barisTersinkron++;
                }
            });

        if ($barisTersinkron > 0) {
            logger()->info("Backfill outlet_product: {$barisTersinkron} baris pivot ditambahkan dari products.outlet_ids.");
        }
    }

    public function down(): void
    {
        // Baris pivot yang ditambahkan migration ini sengaja tidak dihapus.
        // Menghapusnya akan mengembalikan kondisi tidak sinkron yang justru
        // jadi akar bug ini. Untuk undo manual, hapus baris outlet_product
        // yang tidak ada di products.outlet_ids.
    }
};
