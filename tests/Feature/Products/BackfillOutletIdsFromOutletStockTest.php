<?php

namespace Tests\Feature\Products;

use App\Models\Outlet;
use App\Models\OutletStock;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Migrasi backfill outlet_ids dari outlet_stocks.
 *
 * Menutup data lama yang berstok tapi tidak terdaftar (akar bug: form edit
 * lama menghapus baris outlet_stocks / jalur tulis yang lolos dari observer).
 * SATU DEFINISI outlet berstok dipakai identik: outlet aktif + ada varian
 * aktif dengan stok != 0 (per baris, bukan SUM).
 *
 * Memanggil kelas migrasinya langsung karena migration sudah dijalankan
 * RefreshDatabase sebelum data uji ada.
 */
class BackfillOutletIdsFromOutletStockTest extends TestCase
{
    use RefreshDatabase;

    private function jalankanBackfill(): void
    {
        $file = database_path('migrations/2026_10_06_000001_backfill_outlet_ids_from_outlet_stock.php');
        $migrasi = require $file;

        $migrasi->up();
    }

    /**
     * Baris stok untuk data "lama": sengaja dibuat tanpa event observer,
     * seperti kondisi produksi sebelum perbaikan ini.
     */
    private function barisStokTanpaObserver(int $outletId, int $variantId, int $stock): void
    {
        OutletStock::withoutEvents(fn () => OutletStock::create([
            'outlet_id' => $outletId,
            'product_variant_id' => $variantId,
            'stock' => $stock,
        ]));
    }

    public function test_stok_outlet_yang_belum_terdaftar_diisi_oleh_backfill(): void
    {
        $outlet = Outlet::factory()->create();
        $produk = Product::factory()->create(['outlet_ids' => null]);
        $varian = ProductVariant::factory()->create(['product_id' => $produk->id, 'stock' => 10]);

        $this->barisStokTanpaObserver($outlet->id, $varian->id, 5);

        $this->jalankanBackfill();

        $produk->refresh();
        $this->assertContains(
            (string) $outlet->id,
            array_map('strval', $produk->outlet_ids ?? []),
            'Backfill harus mendaftarkan outlet yang menyimpan stok fisik.'
        );
        $this->assertTrue(
            DB::table('outlet_product')
                ->where('product_id', $produk->id)
                ->where('outlet_id', $outlet->id)
                ->exists(),
            'Pivot outlet_product harus ikut terisi.'
        );
    }

    public function test_backfill_idempoten_tidak_menggandakan_pendaftaran(): void
    {
        $outlet = Outlet::factory()->create();
        $produk = Product::factory()->create(['outlet_ids' => null]);
        $varian = ProductVariant::factory()->create(['product_id' => $produk->id, 'stock' => 10]);

        $this->barisStokTanpaObserver($outlet->id, $varian->id, 5);

        $this->jalankanBackfill();
        $this->jalankanBackfill();

        $this->assertSame(
            1,
            collect($produk->fresh()->outlet_ids ?? [])->filter(fn ($id) => (string) $id === (string) $outlet->id)->count(),
            'Migration harus aman dijalankan berulang kali tanpa menggandakan pendaftaran.'
        );
        $this->assertSame(
            1,
            DB::table('outlet_product')
                ->where('product_id', $produk->id)
                ->where('outlet_id', $outlet->id)
                ->count(),
            'Pivot tidak boleh berisi baris ganda.'
        );
    }

    public function test_outlet_nonaktif_tidak_didaftarkan(): void
    {
        $outlet = Outlet::factory()->nonaktif()->create();
        $produk = Product::factory()->create(['outlet_ids' => null]);
        $varian = ProductVariant::factory()->create(['product_id' => $produk->id, 'stock' => 10]);

        $this->barisStokTanpaObserver($outlet->id, $varian->id, 5);

        $this->jalankanBackfill();

        $this->assertEmpty(
            $produk->fresh()->outlet_ids ?? [],
            'Outlet nonaktif tidak termasuk definisi outlet berstok.'
        );
        $this->assertSame(
            0,
            DB::table('outlet_product')->where('product_id', $produk->id)->count()
        );
    }

    public function test_stok_nol_tidak_mendaftarkan(): void
    {
        $outlet = Outlet::factory()->create();
        $produk = Product::factory()->create(['outlet_ids' => null]);
        $varian = ProductVariant::factory()->create(['product_id' => $produk->id, 'stock' => 10]);

        $this->barisStokTanpaObserver($outlet->id, $varian->id, 0);

        $this->jalankanBackfill();

        $this->assertEmpty($produk->fresh()->outlet_ids ?? []);
    }

    public function test_varian_soft_delete_tidak_didaftarkan(): void
    {
        $outlet = Outlet::factory()->create();
        $produk = Product::factory()->create(['outlet_ids' => null]);
        $varian = ProductVariant::factory()->create(['product_id' => $produk->id, 'stock' => 10]);

        $this->barisStokTanpaObserver($outlet->id, $varian->id, 5);
        $varian->delete();

        $this->jalankanBackfill();

        $this->assertEmpty(
            $produk->fresh()->outlet_ids ?? [],
            'Stok varian ter-arsip tersembunyi — tidak boleh mendaftarkan outlet.'
        );
    }

    public function test_stok_negatif_tetap_didaftarkan(): void
    {
        $outlet = Outlet::factory()->create();
        $produk = Product::factory()->create(['outlet_ids' => null]);
        $varian = ProductVariant::factory()->create(['product_id' => $produk->id, 'stock' => 10]);

        // Definisi per baris (EXISTS stok != 0), bukan SUM/min: stok negatif
        // membawa barang fisik yang harus tetap terdaftar dan terkunci.
        $this->barisStokTanpaObserver($outlet->id, $varian->id, -3);

        $this->jalankanBackfill();

        $this->assertContains(
            (string) $outlet->id,
            array_map('strval', $produk->fresh()->outlet_ids ?? [])
        );
    }

    public function test_outlet_ids_rusak_dilewati_tanpa_error(): void
    {
        $outlet = Outlet::factory()->create();
        // Sengaja lewat cast, bukan json_encode: nilai(string) akan
        // di-encode dua kali oleh cast 'array' sehingga kolom berisi JSON
        // string, bukan JSON array.
        $produk = Product::factory()->create([
            'outlet_ids' => json_encode([(string) $outlet->id]),
        ]);
        $varian = ProductVariant::factory()->create(['product_id' => $produk->id, 'stock' => 10]);

        $this->barisStokTanpaObserver($outlet->id, $varian->id, 5);

        $this->assertIsString(
            DB::table('products')->where('id', $produk->id)->value('outlet_ids'),
            'Fixture harus benar-benar menghasilkan kolom yang bukan JSON array.'
        );

        $this->jalankanBackfill();

        $this->assertSame(
            0,
            DB::table('outlet_product')->where('product_id', $produk->id)->count(),
            'Kolom yang bukan JSON array tidak boleh diparse jadi outlet.'
        );
    }
}
