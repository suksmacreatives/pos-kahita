<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Daftarkan outlet yang menyimpan stok fisik ke products.outlet_ids + pivot.
 *
 * Akar masalahnya: bug lama pada form edit produk menghapus baris outlet_stocks
 * saat outlet di-uncheck, dan beberapa jalur menulis stok tanpa menyentuh
 * outlet_ids. Produk bisa berstok di satu outlet tapi tidak terdaftar di sana —
 * tidak muncul di POS dan, dengan validasi edit yang baru, simpan produk lama
 * akan ditolak.
 *
 * SATU DEFINISI yang dipakai (sama dengan validasi edit, observer, scope baca,
 * dan form — lihat App\Support\RegistrasiOutlet):
 *   outlet berstatus aktif dengan minimal satu varian AKTIF dengan stok != 0.
 *
 * Bukan SUM: outlet dengan varian +5 dan -5 tetap ikut terdaftar.
 * Aman dijalankan berulang (idempoten) dan tidak menghapus pendaftaran yang
 * sudah ada.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('outlet_stocks')) {
            return;
        }

        $terdaftar = 0;

        DB::table('products')
            ->whereNull('deleted_at')
            ->select('id', 'outlet_ids')
            ->orderBy('id')
            ->each(function ($produk) use (&$terdaftar) {
                // Outlet berstok menurut satu definisi: baris stok != 0 pada
                // varian aktif, outlet aktif.
                $outletBerstok = DB::table('outlet_stocks')
                    ->join('product_variants', 'product_variants.id', '=', 'outlet_stocks.product_variant_id')
                    ->join('outlets', 'outlets.id', '=', 'outlet_stocks.outlet_id')
                    ->where('product_variants.product_id', $produk->id)
                    ->whereNull('product_variants.deleted_at')
                    ->where('outlets.status', 'aktif')
                    ->where('outlet_stocks.stock', '!=', 0)
                    ->distinct()
                    ->pluck('outlet_stocks.outlet_id');

                if ($outletBerstok->isEmpty()) {
                    return;
                }

                $ids = $produk->outlet_ids === null ? [] : json_decode($produk->outlet_ids, true);

                if (! is_array($ids)) {
                    // Kolom bukan JSON array (mis. ter-encode dua kali): dilewati
                    // seperti backfill sebelumnya, jangan menimpa teka-teki data
                    // lama dengan tebakan baru.
                    return;
                }

                $sudah = array_map('strval', $ids);
                $baru = [];

                foreach ($outletBerstok as $outletId) {
                    if (in_array((string) $outletId, $sudah, true)) {
                        continue;
                    }

                    $ids[] = (string) $outletId;
                    $sudah[] = (string) $outletId;
                    $baru[] = (int) $outletId;
                }

                if ($baru === []) {
                    return;
                }

                DB::table('products')
                    ->where('id', $produk->id)
                    ->update(['outlet_ids' => json_encode(array_values($ids))]);

                foreach ($baru as $outletId) {
                    $sudahPivot = DB::table('outlet_product')
                        ->where('product_id', $produk->id)
                        ->where('outlet_id', $outletId)
                        ->exists();

                    if ($sudahPivot) {
                        continue;
                    }

                    DB::table('outlet_product')->insert([
                        'product_id' => $produk->id,
                        'outlet_id' => $outletId,
                    ]);
                }

                $terdaftar += count($baru);
            });

        if ($terdaftar > 0) {
            logger()->info("Backfill outlet_ids dari outlet_stocks: {$terdaftar} pasangan produk-outlet didaftarkan.");
        }
    }

    public function down(): void
    {
        // Pendaftaran yang ditambahkan migration ini sengaja tidak dihapus —
        // menghapusnya mengembalikan kondisi produk berstok yang hilang dari
        // POS, yaitu akar masalah yang justru ditutup migration ini.
    }
};
