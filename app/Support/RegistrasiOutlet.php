<?php

namespace App\Support;

use App\Models\Outlet;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;

/**
 * Satu-satunya tempat mendaftarkan produk ke `products.outlet_ids` + pivot
 * `outlet_product` karena stok fisik muncul di sebuah outlet.
 *
 * SATU DEFINISI "outlet berstok" untuk seluruh aplikasi — dipakai identik di
 * validasi edit produk (ProductController::assertOutletBerstokTidakDilepas),
 * observer OutletStock, migrasi backfill outlet_ids, pengaman baca
 * Product::scopeTersediaDiOutlet, dan form produk:
 *
 *   outlet berstatus AKTIF yang punya minimal satu varian AKTIF dengan stok != 0.
 *
 * Bukan SUM per outlet: varian +5 dan -5 tidak saling meniadakan — keduanya
 * membawa barang fisik yang harus tetap terkunci dan terlihat.
 *
 * Pendaftaran hanya boleh menambah, tidak pernah menghapus: outlet yang stoknya
 * menyentuh 0 tetap terdaftar supaya produk tidak mendadak hilang dari POS
 * saat laku habis.
 */
final class RegistrasiOutlet
{
    /**
     * Daftarkan outlet ke produk pemilik varian ini bila belum terdaftar.
     * Aman dipanggil dari dalam transaksi pemanggil (mis. saat menerima
     * transfer): kuncinya bertahan sampai transaksi itu commit.
     */
    public static function dariVarian(int $variantId, int $outletId): void
    {
        // Model::find sudah mengikuti SoftDeletingScope: varian ter-arsip
        // tidak didaftarkan (stoknya ikut tersembunyi bersama varian).
        $variant = ProductVariant::find($variantId);
        if (! $variant) {
            return;
        }

        // Relasi belongsTo juga mengabaikan produk yang sudah di-soft-delete.
        $product = $variant->product;
        if (! $product) {
            return;
        }

        // Outlet hilang: loloskan, agar tidak melanggar foreign key pivot.
        // Outlet nonaktif: sengaja tidak didaftarkan — POS & inventory outlet
        // nonaktif tidak dipakai; begitu outlet aktif lagi, pendaftaran terjadi
        // otomatis pada tulisan stok berikutnya atau saat produk disimpan.
        $outlet = Outlet::find($outletId);
        if (! $outlet || $outlet->status !== 'aktif') {
            return;
        }

        $idBaru = (string) $outletId;
        if (in_array($idBaru, array_map('strval', $product->outlet_ids ?? []), true)) {
            return;
        }

        /*
         * Kunci baris produk sebelum membaca ulang `outlet_ids` supaya dua
         * pendaftaran bersamaan tidak saling menimpa (lost update). Urutan
         * kunci: baris outlet_stocks (sudah dipegang pemanggil) → products;
         * urutan yang sama dipakai ProductController::update(), jadi bebas
         * deadlock. Bila belum ada transaksi, DB::transaction membuat satu —
         * kuncinya baru dilepas setelah pendaftaran utuh.
         */
        DB::transaction(function () use ($product, $idBaru, $outletId) {
            $segar = Product::whereKey($product->id)->lockForUpdate()->first();
            if (! $segar) {
                return;
            }

            $ids = array_map('strval', $segar->outlet_ids ?? []);
            if (in_array($idBaru, $ids, true)) {
                return;
            }

            $ids[] = $idBaru;
            $segar->update(['outlet_ids' => $ids]);
            $segar->outlets()->syncWithoutDetaching([$outletId]);
        });
    }
}
