<?php

namespace Tests\Feature\Products;

use App\Models\Outlet;
use App\Models\OutletStock;
use App\Models\OutletTransfer;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\Inventory\TransferStokService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Invarian observer OutletStock: stok fisik muncul di outlet ⇒ produk
 * terdaftar di `products.outlet_ids` + pivot `outlet_product`.
 *
 * Pendaftaran hanya menambah, tidak pernah menghapus (stok menyentuh 0 tetap
 * terdaftar). Outlet nonaktif / varian ter-arsip tidak didaftarkan.
 */
class OutletStockRegistrationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Produk tanpa outlet_ids (outlet_ids null) + varian aktif stok gudang 0.
     *
     * @return array{0: Product, 1: ProductVariant}
     */
    private function produkDenganVarian(): array
    {
        $produk = Product::factory()->create();
        $varian = ProductVariant::factory()->create([
            'product_id' => $produk->id,
            'stock' => 0,
            'color' => 'Hitam',
            'size' => 'M',
        ]);

        return [$produk, $varian];
    }

    public function test_create_stok_di_outlet_tak_terdaftar_mendaftarkan_produk(): void
    {
        [$produk, $varian] = $this->produkDenganVarian();
        $outlet = Outlet::factory()->create();

        OutletStock::create([
            'outlet_id' => $outlet->id,
            'product_variant_id' => $varian->id,
            'stock' => 5,
        ]);

        $produk->refresh();

        $this->assertContains(
            (string) $outlet->id,
            array_map('strval', $produk->outlet_ids ?? []),
            'outlet_ids harus bertambah begitu stok fisik muncul di outlet.'
        );
        $this->assertTrue(
            $produk->outlets()->where('outlets.id', $outlet->id)->exists(),
            'Pivot outlet_product harus ikut terisi.'
        );
    }

    public function test_increment_dari_nol_memicu_event_dan_mendaftarkan(): void
    {
        [$produk, $varian] = $this->produkDenganVarian();
        $outlet = Outlet::factory()->create();

        $baris = OutletStock::create([
            'outlet_id' => $outlet->id,
            'product_variant_id' => $varian->id,
            'stock' => 0,
        ]);

        // Fixture: stok 0 tidak mendaftarkan apa pun.
        $this->assertNotContains(
            (string) $outlet->id,
            array_map('strval', $produk->fresh()->outlet_ids ?? [])
        );

        // Persis jalur TransferStokService::confirmReceive / penerimaan DO:
        // increment memicu event `updated` dengan wasChanged('stock').
        $baris->increment('stock', 4);

        $this->assertContains(
            (string) $outlet->id,
            array_map('strval', $produk->fresh()->outlet_ids ?? []),
            'Increment dari 0 harus memicu pendaftaran — membuktikan event benar-benar fire.'
        );
        $this->assertSame(4, (int) $baris->fresh()->stock);
    }

    public function test_transfer_masuk_mendaftarkan_outlet_tujuan(): void
    {
        [$produk, $varian] = $this->produkDenganVarian();

        $outletAsal = Outlet::factory()->create();
        $outletTujuan = Outlet::factory()->create();

        // Produk hanya terdaftar di outlet asal.
        $produk->outlet_id = $outletAsal->id;
        $produk->outlet_ids = [(string) $outletAsal->id];
        $produk->save();
        $produk->outlets()->sync([$outletAsal->id]);

        // Baris stok tujuan sudah ada dengan 0 — jalur increment.
        OutletStock::create([
            'outlet_id' => $outletTujuan->id,
            'product_variant_id' => $varian->id,
            'stock' => 0,
        ]);

        $transfer = OutletTransfer::create([
            'nomor_transfer' => 'TRF-REG-001',
            'outlet_asal_id' => $outletAsal->id,
            'outlet_tujuan_id' => $outletTujuan->id,
            'tgl_transfer' => now()->toDateString(),
            'alasan' => 'Restock rutin',
            'status' => 'menunggu_konfirmasi',
            'total_qty' => 10,
        ]);
        $transfer->items()->create([
            'product_id' => $produk->id,
            'product_variant_id' => $varian->id,
            'nama' => $produk->name,
            'ukuran' => 'M',
            'warna' => 'Hitam',
            'qty' => 10,
        ]);

        app(TransferStokService::class)->confirmReceive($transfer->id);

        $this->assertSame(
            10,
            (int) OutletStock::where('outlet_id', $outletTujuan->id)
                ->where('product_variant_id', $varian->id)
                ->value('stock'),
            'Fixture: transfer benar-benar menambah stok di outlet tujuan.'
        );
        $this->assertContains(
            (string) $outletTujuan->id,
            array_map('strval', $produk->fresh()->outlet_ids ?? []),
            'Transfer masuk harus mendaftarkan outlet tujuan — ini jalur yang paling sering membuat produk "hilang" dari POS.'
        );
    }

    public function test_create_stok_nol_tidak_mendaftarkan(): void
    {
        [$produk, $varian] = $this->produkDenganVarian();
        $outlet = Outlet::factory()->create();

        OutletStock::create([
            'outlet_id' => $outlet->id,
            'product_variant_id' => $varian->id,
            'stock' => 0,
        ]);

        $this->assertEmpty(
            $produk->fresh()->outlet_ids ?? [],
            'Baris stok 0 tidak boleh mendaftarkan outlet.'
        );
    }

    public function test_decrement_ke_nol_tidak_menghapus_pendaftaran(): void
    {
        [$produk, $varian] = $this->produkDenganVarian();
        $outlet = Outlet::factory()->create();

        $produk->outlet_ids = [(string) $outlet->id];
        $produk->save();

        $baris = OutletStock::create([
            'outlet_id' => $outlet->id,
            'product_variant_id' => $varian->id,
            'stock' => 1,
        ]);
        $baris->decrement('stock', 1);

        $this->assertSame(0, (int) $baris->fresh()->stock);
        $this->assertContains(
            (string) $outlet->id,
            array_map('strval', $produk->fresh()->outlet_ids ?? []),
            'Pendaftaran bersifat append-only: stok 0 tidak menghapus outlet dari outlet_ids.'
        );
    }

    public function test_outlet_nonaktif_tidak_didaftarkan(): void
    {
        [$produk, $varian] = $this->produkDenganVarian();
        $outlet = Outlet::factory()->nonaktif()->create();

        OutletStock::create([
            'outlet_id' => $outlet->id,
            'product_variant_id' => $varian->id,
            'stock' => 5,
        ]);

        $this->assertEmpty(
            $produk->fresh()->outlet_ids ?? [],
            'Outlet nonaktif tidak boleh didaftarkan (POS & inventory outlet nonaktif tidak dipakai).'
        );
        $this->assertSame(0, $produk->outlets()->count());
    }
}
