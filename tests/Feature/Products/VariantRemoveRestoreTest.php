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
 * Varian yang dibuang lewat form edit tidak menghapus baris stok outlet, dan
 * restore produk mengembalikan pendaftaran outlet berstok dari baris yang
 * tersisa itu.
 */
class VariantRemoveRestoreTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_hapus_varian_via_edit_tidak_menghapus_baris_stok_outlet(): void
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

        OutletStock::create(['outlet_id' => $outletB->id, 'product_variant_id' => $v1->id, 'stock' => 2]);
        OutletStock::create(['outlet_id' => $outletB->id, 'product_variant_id' => $v2->id, 'stock' => 7]);

        // Edit: v2 dibuang dari payload. B tetap dipilih karena v1 berstok 2.
        $payload = [
            'nama_produk' => $produk->name,
            'kode_produk' => $produk->sku,
            'harga_jual' => (int) $produk->price,
            'harga_beli' => (int) $produk->cost_price,
            'status' => 'aktif',
            'outlet_tersedia' => [(string) $outletA->id, (string) $outletB->id],
            'variants' => [
                [
                    'id' => $v1->id,
                    'color_name' => $v1->color,
                    'size_label' => $v1->size,
                    'harga_jual' => (int) $v1->price,
                    'harga_beli' => (int) $v1->cost_price,
                    'sku' => $v1->sku,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin())
            ->patch(route('admin.products.update', $produk), $payload);

        $response->assertStatus(302);
        $response->assertSessionDoesntHaveErrors();

        $this->assertTrue(
            ProductVariant::withTrashed()->findOrFail($v2->id)->trashed(),
            'Varian yang tidak dikirim harus soft-delete.'
        );
        $this->assertSame(
            1,
            OutletStock::where('product_variant_id', $v2->id)->count(),
            'Baris stok outlet varian yang dihapus tidak boleh ikut terhapus — stok fisik harus kembali utuh saat varian dipulihkan.'
        );
        $this->assertSame(
            7,
            (int) OutletStock::where('product_variant_id', $v2->id)->value('stock'),
            'Kuantitas baris stok harus persis seperti sebelum varian dihapus.'
        );
    }

    public function test_restore_produk_mendaftarkan_ulang_outlet_berstok(): void
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

        OutletStock::create(['outlet_id' => $outletB->id, 'product_variant_id' => $varian->id, 'stock' => 6]);
        OutletStock::create(['outlet_id' => $outletA->id, 'product_variant_id' => $varian->id, 'stock' => 0]);

        // Arsipkan produk: varian ikut archived_at + soft-delete, stok tetap.
        $response = $this->actingAs($this->admin())
            ->delete(route('admin.products.destroy', $produk));
        $response->assertStatus(302);

        // Simulasi data lama yang rusak: outlet_ids dikosongkan saat produk arsip.
        $produk->refresh();
        $produk->outlet_ids = null;
        $produk->save();

        $response = $this->actingAs($this->admin())
            ->post(route('admin.products.restore', $produk->id));
        $response->assertStatus(302);

        $produk->refresh();
        $this->assertFalse(ProductVariant::withTrashed()->findOrFail($varian->id)->trashed(), 'Varian ter-arsip harus hidup lagi.');
        $this->assertContains(
            (string) $outletB->id,
            array_map('strval', $produk->outlet_ids ?? []),
            'Outlet berstok harus kembali terdaftar dari baris stok yang tersisa.'
        );
        $this->assertSame(
            [$outletA->id, $outletB->id],
            $produk->outlets()->pluck('id')->map('intval')->all(),
            'Pivot outlet_product harus ikut lengkap setelah restore.'
        );
    }
}
