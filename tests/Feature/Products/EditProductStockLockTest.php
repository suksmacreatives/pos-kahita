<?php

namespace Tests\Feature\Products;

use App\Models\Outlet;
use App\Models\OutletStock;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Kontrak edit produk (C-strict):
 * - Edit TIDAK PERNAH menulis/menghapus kuantitas stok — payload yang masih
 *   membawa `variants.*.stok` (tab lama, kiriman manual) diabaikan utuh.
 * - Outlet berstok (aktif + ada varian aktif stok != 0, bukan SUM) tidak bisa
 *   dilepas dari `outlet_tersedia`; validasi menolaknya di dalam transaksi.
 * - Outlet baru yang dicentang hanya mendapat baris stok 0; stok lama tidak
 *   disentuh; baris stok outlet tidak pernah dihapus saat outlet dilepas.
 */
class EditProductStockLockTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    /**
     * @return array{0: Outlet, 1: Outlet, 2: Product, 3: ProductVariant}
     */
    private function fixture(): array
    {
        $outletA = Outlet::factory()->create();
        $outletB = Outlet::factory()->create();

        $produk = Product::factory()->tersediaDiOutlet($outletA->id, $outletB->id)->create([
            'outlet_id' => $outletA->id,
            'price' => 100_000,
            'cost_price' => 50_000,
        ]);
        $varian = ProductVariant::factory()->create([
            'product_id' => $produk->id,
            'stock' => 10,
            'color' => 'Merah',
            'size' => 'M',
        ]);
        $produk->outlets()->sync([$outletA->id, $outletB->id]);

        // Outlet B berstok 7 — menurut SATU DEFINISI (aktif + stok != 0).
        OutletStock::create([
            'outlet_id' => $outletB->id,
            'product_variant_id' => $varian->id,
            'stock' => 7,
        ]);

        return [$outletA, $outletB, $produk, $varian];
    }

    private function payload(Product $produk, ProductVariant $varian, array $outletTersedia, array $extraVariant = []): array
    {
        return [
            'nama_produk' => $produk->name,
            'kode_produk' => $produk->sku,
            'harga_jual' => (int) $produk->price,
            'harga_beli' => (int) $produk->cost_price,
            'status' => 'aktif',
            'outlet_tersedia' => $outletTersedia,
            'variants' => array_merge([
                [
                    'id' => $varian->id,
                    'color_name' => $varian->color,
                    'size_label' => $varian->size,
                    'harga_jual' => (int) $varian->price,
                    'harga_beli' => (int) $varian->cost_price,
                    'sku' => $varian->sku,
                ],
            ], $extraVariant),
        ];
    }

    public function test_edit_tidak_menulisa_stok_gudang_maupun_outlet_meski_payload_membawa_stok(): void
    {
        [$outletA, $outletB, $produk, $varian] = $this->fixture();

        $payload = $this->payload($produk, $varian, [(string) $outletA->id, (string) $outletB->id]);
        // Payload basi/tab lama: membawa kuantitas stok yang tidak ada di rule
        // update() — harus diabaikan utuh, bukan menimpa gudang/outlet.
        $payload['variants'][0]['stok'] = 9999;

        $response = $this->actingAs($this->admin())
            ->patch(route('admin.products.update', $produk), $payload);

        $response->assertStatus(302);
        $response->assertSessionDoesntHaveErrors();

        $this->assertSame(10, (int) $varian->fresh()->stock, 'Stok gudang tidak boleh berubah oleh edit.');
        $this->assertSame(7, (int) OutletStock::where('outlet_id', $outletB->id)
            ->where('product_variant_id', $varian->id)
            ->value('stock'), 'Stok outlet tidak boleh berubah oleh edit.');
    }

    public function test_uncheck_outlet_berstok_ditolak_dan_data_tidak_berubah(): void
    {
        [$outletA, $outletB, $produk, $varian] = $this->fixture();

        $payload = $this->payload($produk, $varian, [(string) $outletA->id]);

        $response = $this->actingAs($this->admin())
            ->patch(route('admin.products.update', $produk), $payload);

        $response->assertSessionHasErrors('outlet_tersedia');

        $pesan = session('errors')->first('outlet_tersedia');
        $this->assertStringContainsString($outletB->name, $pesan, 'Nama outlet berstok harus muncul di pesan error.');
        $this->assertStringContainsString('7', $pesan, 'Kuantitas stok outlet harus muncul di pesan error.');

        $produk->refresh();
        $this->assertContains(
            (string) $outletB->id,
            array_map('strval', $produk->outlet_ids ?? []),
            'outlet_ids tidak boleh kehilangan outlet berstok walau payload melepasnya.'
        );
        $this->assertSame(
            [$outletA->id, $outletB->id],
            $produk->outlets()->pluck('id')->map('intval')->all(),
            'Pivot outlet_product tidak boleh berubah saat validasi menolak.'
        );
        $this->assertSame(7, (int) OutletStock::where('outlet_id', $outletB->id)
            ->where('product_variant_id', $varian->id)
            ->value('stock'));
    }

    public function test_stok_yang_saling_meniadakan_tetap_mengunci_outlet(): void
    {
        $outletA = Outlet::factory()->create();
        $outletB = Outlet::factory()->create();

        $produk = Product::factory()->tersediaDiOutlet($outletA->id, $outletB->id)->create([
            'outlet_id' => $outletA->id,
            'price' => 100_000,
            'cost_price' => 50_000,
        ]);
        $v1 = ProductVariant::factory()->create([
            'product_id' => $produk->id,
            'stock' => 10,
            'color' => 'Merah',
            'size' => 'M',
        ]);
        $v2 = ProductVariant::factory()->create([
            'product_id' => $produk->id,
            'stock' => 3,
            'color' => 'Biru',
            'size' => 'L',
        ]);
        $produk->outlets()->sync([$outletA->id, $outletB->id]);

        // +5 dan -5 di outlet yang sama: SUM = 0 tapi keduanya baris stok != 0.
        // Definisi outlet berstok adalah per baris (EXISTS), bukan SUM.
        OutletStock::create(['outlet_id' => $outletB->id, 'product_variant_id' => $v1->id, 'stock' => 5]);
        OutletStock::create(['outlet_id' => $outletB->id, 'product_variant_id' => $v2->id, 'stock' => -5]);

        $payload = $this->payload($produk, $v1, [(string) $outletA->id], [
            [
                'id' => $v2->id,
                'color_name' => $v2->color,
                'size_label' => $v2->size,
                'harga_jual' => (int) $v2->price,
                'harga_beli' => (int) $v2->cost_price,
                'sku' => $v2->sku,
            ],
        ]);

        $response = $this->actingAs($this->admin())
            ->patch(route('admin.products.update', $produk), $payload);

        $response->assertSessionHasErrors('outlet_tersedia');

        $pesan = session('errors')->first('outlet_tersedia');
        $this->assertStringContainsString($outletB->name, $pesan);
        $this->assertStringContainsString('meniadakan', $pesan, 'SUM 0 dengan baris != 0 harus tetap terkunci (bukan lolos diam-diam).');

        $produk->refresh();
        $this->assertContains((string) $outletB->id, array_map('strval', $produk->outlet_ids ?? []));
    }

    public function test_uncheck_outlet_stok_nol_diperbolehkan_dan_baris_tidak_dihapus(): void
    {
        [$outletA, $outletB, $produk, $varian] = $this->fixture();

        OutletStock::where('outlet_id', $outletB->id)
            ->where('product_variant_id', $varian->id)
            ->update(['stock' => 0]);

        $payload = $this->payload($produk, $varian, [(string) $outletA->id]);

        $response = $this->actingAs($this->admin())
            ->patch(route('admin.products.update', $produk), $payload);

        $response->assertStatus(302);
        $response->assertSessionDoesntHaveErrors();

        $produk->refresh();
        $this->assertEqualsCanonicalizing(
            [(string) $outletA->id],
            array_map('strval', $produk->outlet_ids ?? []),
            'Outlet stok 0 boleh dilepas dari outlet_ids.'
        );
        $this->assertSame(
            1,
            OutletStock::where('outlet_id', $outletB->id)
                ->where('product_variant_id', $varian->id)
                ->count(),
            'Baris stok outlet tidak boleh dihapus saat outlet dilepas dari form.'
        );
        $this->assertSame(0, (int) OutletStock::where('outlet_id', $outletB->id)
            ->where('product_variant_id', $varian->id)
            ->value('stock'));
    }

    public function test_outlet_baru_dicentang_dibuat_stok_nol_dan_stok_lama_tidak_disentuh(): void
    {
        [$outletA, $outletB, $produk, $varian] = $this->fixture();
        $outletC = Outlet::factory()->create();

        $payload = $this->payload($produk, $varian, [
            (string) $outletA->id,
            (string) $outletB->id,
            (string) $outletC->id,
        ]);
        $payload['variants'][0]['stok'] = 9999;

        $response = $this->actingAs($this->admin())
            ->patch(route('admin.products.update', $produk), $payload);

        $response->assertStatus(302);
        $response->assertSessionDoesntHaveErrors();

        $this->assertSame(
            0,
            (int) OutletStock::where('outlet_id', $outletC->id)
                ->where('product_variant_id', $varian->id)
                ->value('stock'),
            'Outlet baru yang dicentang mendapat baris stok 0 (stok diisi lewat Inventory).'
        );
        $this->assertSame(
            7,
            (int) OutletStock::where('outlet_id', $outletB->id)
                ->where('product_variant_id', $varian->id)
                ->value('stock'),
            'Stok outlet lama tidak boleh tertimpa oleh payload edit.'
        );
        $this->assertSame(10, (int) $varian->fresh()->stock, 'Stok gudang tidak boleh tertimpa.');

        $produk->refresh();
        $this->assertContains((string) $outletC->id, array_map('strval', $produk->outlet_ids ?? []));
    }

    public function test_varian_soft_delete_tidak_mengunci_outlet_dan_baris_stoknya_tetap_ada(): void
    {
        $outletA = Outlet::factory()->create();
        $outletB = Outlet::factory()->create();

        $produk = Product::factory()->tersediaDiOutlet($outletA->id, $outletB->id)->create([
            'outlet_id' => $outletA->id,
            'price' => 100_000,
            'cost_price' => 50_000,
        ]);
        $v1 = ProductVariant::factory()->create([
            'product_id' => $produk->id,
            'stock' => 0,
            'color' => 'Merah',
            'size' => 'M',
        ]);
        $v2 = ProductVariant::factory()->create([
            'product_id' => $produk->id,
            'stock' => 3,
            'color' => 'Biru',
            'size' => 'L',
        ]);
        $produk->outlets()->sync([$outletA->id, $outletB->id]);

        OutletStock::create(['outlet_id' => $outletB->id, 'product_variant_id' => $v2->id, 'stock' => 4]);

        // Varian v2 sudah di-soft-delete (mis. dibuang lewat edit sebelumnya):
        // stoknya tersembunyi, jadi TIDAK boleh mengunci outlet B.
        $v2->delete();

        $payload = $this->payload($produk, $v1, [(string) $outletA->id]);

        $response = $this->actingAs($this->admin())
            ->patch(route('admin.products.update', $produk), $payload);

        $response->assertStatus(302);
        $response->assertSessionDoesntHaveErrors();

        $produk->refresh();
        $this->assertEqualsCanonicalizing(
            [(string) $outletA->id],
            array_map('strval', $produk->outlet_ids ?? [])
        );
        $this->assertSame(
            4,
            (int) OutletStock::where('outlet_id', $outletB->id)
                ->where('product_variant_id', $v2->id)
                ->value('stock'),
            'Baris stok varian ter-arsip harus tetap utuh (bukan ikut terhapus).'
        );
        $this->assertTrue(
            ProductVariant::withTrashed()->findOrFail($v2->id)->trashed(),
            'Fixture: varian memang soft-delete.'
        );
    }
}
