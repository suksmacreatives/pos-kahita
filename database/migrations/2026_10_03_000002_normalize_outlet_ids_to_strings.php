<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Normalisasi products.outlet_ids menjadi JSON array of STRING.
 *
 * Seluruh pembacaan kolom ini memakai
 * `whereJsonContains('outlet_ids', (string) $id)`. MySQL membandingkan JSON
 * secara ketat tipe, sehingga `JSON_CONTAINS('[1]', '"1"')` bernilai 0 dan
 * produk yang tersimpan sebagai angka akan hilang dari POS, inventory outlet,
 * dan laporan tanpa error apa pun.
 *
 * Jalur tulis sudah dinormalisasi di ProductController, tapi data lama atau
 * jalur tulis lain (import, seeding, API) masih bisa menyimpan angka. Migration
 * ini menutup celah itu.
 */
return new class extends Migration
{
    public function up(): void
    {
        $diperbaiki = 0;
        $dilewati = 0;

        DB::table('products')
            ->select('id', 'outlet_ids')
            ->whereNotNull('outlet_ids')
            ->orderBy('id')
            ->each(function ($produk) use (&$diperbaiki, &$dilewati) {
                $ids = json_decode($produk->outlet_ids, true);

                // Jangan menebak-nebak kalau kolomnya bukan JSON array.
                // Nilainya dibiarkan apa adanya agar tidak merusak data.
                if (! is_array($ids)) {
                    $dilewati++;

                    return;
                }

                $string = [];
                foreach ($ids as $id) {
                    if (is_scalar($id) && (string) $id !== '') {
                        $string[] = (string) $id;
                    }
                }

                $string = array_values(array_unique($string));
                $encoded = json_encode($string);

                if ($encoded === $produk->outlet_ids) {
                    return;
                }

                DB::table('products')
                    ->where('id', $produk->id)
                    ->update(['outlet_ids' => $encoded]);

                $diperbaiki++;
            });

        if ($diperbaiki > 0 || $dilewati > 0) {
            logger()->info("Normalisasi outlet_ids: {$diperbaiki} produk diperbaiki, {$dilewati} dilewati (bukan JSON array).");
        }
    }

    public function down(): void
    {
        // Normalisasi ini satu arah. Mengembalikan angka akan mengembalikan
        // bug produk hilang dari POS.
    }
};
