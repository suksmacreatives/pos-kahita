<?php

namespace App\Observers;

use App\Models\OutletStock;
use App\Support\RegistrasiOutlet;

/**
 * Invarian: outlet berstok (definisi di RegistrasiOutlet) ⇒ produk terdaftar
 * di outlet_ids, supaya selalu tampil di POS dan inventory outlet itu.
 *
 * Berjalan di dalam transaksi pemanggil create/increment/update, jadi
 * pendaftaran atomik dengan tulisan stoknya. Semua jalur penulis stok level
 * model memicu event ini (create, updateOrCreate, $model->increment); tidak
 * ada jalur yang memakai incrementQuietly/saveQuietly. Jalur builder-level
 * (OutletStock::where()->decrement()) tidak memicu event, tapi hanya
 * menurunkan stok — ditutup oleh pengaman baca Product::scopeTersediaDiOutlet
 * dan migrasi backfill.
 */
class OutletStockObserver
{
    public function created(OutletStock $stok): void
    {
        $this->pastikanTerdaftar($stok);
    }

    public function updated(OutletStock $stok): void
    {
        /*
         * Proses besar (opname, void, penerimaan massal) memicu event per
         * baris; hanya baris yang stoknya benar-benar berubah yang perlu
         * diperiksa. wasChanged('stock') valid di sini: incrementOrDecrement
         * memanggil syncChanges() sebelum fireModelEvent('updated').
         */
        if (! $stok->wasChanged('stock')) {
            return;
        }

        $this->pastikanTerdaftar($stok);
    }

    private function pastikanTerdaftar(OutletStock $stok): void
    {
        if ((int) $stok->stock === 0) {
            return;
        }

        RegistrasiOutlet::dariVarian((int) $stok->product_variant_id, (int) $stok->outlet_id);
    }
}
