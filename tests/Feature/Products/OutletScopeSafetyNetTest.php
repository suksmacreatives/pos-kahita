<?php

namespace Tests\Feature\Products;

use App\Models\Outlet;
use App\Models\OutletStock;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Pengaman baca Product::scopeTersediaDiOutlet.
 *
 * Scope menambah cabang ketiga: outlet aktif dengan varian aktif stok != 0
 * tetap membuat produk terlihat walau outlet_ids ketinggalan (data lama /
 * jalur tulis yang lolos observer). Setelah backfill + observer, outlet_ids
 * selalu sinkar dan cabang ini tidak mengubah perilaku normal — tapi tanpa
 * cabang ini produk berstok jadi hantu yang tidak bisa dijual.
 */
class OutletScopeSafetyNetTest extends TestCase
{
    use RefreshDatabase;

    public function test_produk_berstok_tak_terdaftar_tetap_tersedia_di_outlet(): void
    {
        $outlet = Outlet::factory()->create();
        $produk = Product::factory()->create();
        $varian = ProductVariant::factory()->create([
            'product_id' => $produk->id,
            'stock' => 0,
            'color' => 'Merah',
            'size' => 'M',
        ]);

        // Data lama: stok ada tapi outlet_ids tidak pernah terisi.
        OutletStock::withoutEvents(fn () => OutletStock::create([
            'outlet_id' => $outlet->id,
            'product_variant_id' => $varian->id,
            'stock' => 5,
        ]));

        $this->assertTrue(
            Product::tersediaDiOutlet($outlet->id)->whereKey($produk->id)->exists(),
            'Pengaman baca: outlet berstok membuat produk tetap terlihat walau outlet_ids ketinggalan.'
        );
    }

    public function test_stok_nol_tak_terdaftar_tidak_membuat_tersedia(): void
    {
        $outlet = Outlet::factory()->create();
        $produk = Product::factory()->create();
        $varian = ProductVariant::factory()->create([
            'product_id' => $produk->id,
            'stock' => 0,
            'color' => 'Merah',
            'size' => 'M',
        ]);

        OutletStock::withoutEvents(fn () => OutletStock::create([
            'outlet_id' => $outlet->id,
            'product_variant_id' => $varian->id,
            'stock' => 0,
        ]));

        $this->assertFalse(
            Product::tersediaDiOutlet($outlet->id)->whereKey($produk->id)->exists(),
            'Stok 0 tanpa pendaftaran tidak membuat produk tersedia (bukan cabang baca yang memberi stok hantu).'
        );
    }

    public function test_outlet_nonaktif_berstok_tak_terdaftar_tidak_tersedia(): void
    {
        $outlet = Outlet::factory()->nonaktif()->create();
        $produk = Product::factory()->create();
        $varian = ProductVariant::factory()->create([
            'product_id' => $produk->id,
            'stock' => 0,
            'color' => 'Merah',
            'size' => 'M',
        ]);

        OutletStock::withoutEvents(fn () => OutletStock::create([
            'outlet_id' => $outlet->id,
            'product_variant_id' => $varian->id,
            'stock' => 5,
        ]));

        $this->assertFalse(
            Product::tersediaDiOutlet($outlet->id)->whereKey($produk->id)->exists(),
            'Outlet nonaktif tidak termasuk definisi outlet berstok.'
        );
    }

    public function test_varian_arsip_tidak_membuat_tersedia(): void
    {
        $outlet = Outlet::factory()->create();
        $produk = Product::factory()->create();
        $varian = ProductVariant::factory()->create([
            'product_id' => $produk->id,
            'stock' => 0,
            'color' => 'Merah',
            'size' => 'M',
        ]);

        OutletStock::withoutEvents(fn () => OutletStock::create([
            'outlet_id' => $outlet->id,
            'product_variant_id' => $varian->id,
            'stock' => 5,
        ]));
        $varian->delete();

        $this->assertFalse(
            Product::tersediaDiOutlet($outlet->id)->whereKey($produk->id)->exists(),
            'Stok varian ter-arsip tersembunyi — tidak membuat produk tersedia.'
        );
    }

    public function test_pendaftaran_outlet_ids_seperti_biasa_masih_bekerja(): void
    {
        $outlet = Outlet::factory()->create();
        $produk = Product::factory()->tersediaDiOutlet($outlet->id)->create();

        $this->assertTrue(
            Product::tersediaDiOutlet($outlet->id)->whereKey($produk->id)->exists(),
            'Jalur normal (outlet_ids berisi) tidak boleh berubah perilaku oleh cabang pengaman.'
        );

        $outletLain = Outlet::factory()->create();
        $this->assertFalse(
            Product::tersediaDiOutlet($outletLain->id)->whereKey($produk->id)->exists(),
            'Produk tidak boleh muncul di outlet yang tidak dipilih.'
        );
    }
}
