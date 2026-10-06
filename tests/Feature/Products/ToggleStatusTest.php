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
 * Endpoint PATCH admin.products.toggle-status (Commit 3).
 *
 * Toggle status harus berdiri sendiri: payload edit lengkap (nama, varian,
 * outlet_tersedia) tidak diperlukan, dan toggle tidak boleh menyentuh
 * kuantitas stok maupun outlet_ids. Perbaikan ini menggantikan handleToggleStatus
 * lama yang PATCH ke update() tanpa `variants` sehingga selalu gagal validasi
 * dan status tidak pernah berubah tanpa refresh halaman.
 */
class ToggleStatusTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_toggle_status_mengubah_aktif_menjadi_nonaktif(): void
    {
        $produk = Product::factory()->create(['status' => 'aktif']);

        $response = $this->actingAs($this->admin())
            ->patch(route('admin.products.toggle-status', $produk));

        $response->assertStatus(302);
        $response->assertSessionHas('success');
        $this->assertSame('nonaktif', $produk->fresh()->status);
    }

    public function test_toggle_status_mengubah_nonaktif_menjadi_aktif(): void
    {
        $produk = Product::factory()->create(['status' => 'nonaktif']);

        $response = $this->actingAs($this->admin())
            ->patch(route('admin.products.toggle-status', $produk));

        $response->assertStatus(302);
        $this->assertSame('aktif', $produk->fresh()->status);
    }

    public function test_toggle_status_tidak_membutuhkan_payload_varian(): void
    {
        // Payload kosong — inilah yang dulu membuat toggle gagal di update()
        // (rule `variants` required). Endpoint khusus harus sukses tanpa itu.
        $produk = Product::factory()->create(['status' => 'aktif']);

        $response = $this->actingAs($this->admin())
            ->patch(route('admin.products.toggle-status', $produk), []);

        $response->assertStatus(302);
        $response->assertSessionDoesntHaveErrors();
        $this->assertSame('nonaktif', $produk->fresh()->status);
    }

    public function test_toggle_status_tidak_menulis_stok_mauupun_outlet_ids(): void
    {
        $outlet = Outlet::factory()->create();
        $produk = Product::factory()->tersediaDiOutlet($outlet->id)->create([
            'outlet_id' => $outlet->id,
            'status' => 'aktif',
        ]);
        $varian = ProductVariant::factory()->create([
            'product_id' => $produk->id,
            'stock' => 10,
            'color' => 'Merah',
            'size' => 'M',
        ]);
        $produk->outlets()->sync([$outlet->id]);
        $baris = OutletStock::create([
            'outlet_id' => $outlet->id,
            'product_variant_id' => $varian->id,
            'stock' => 7,
        ]);

        $this->actingAs($this->admin())
            ->patch(route('admin.products.toggle-status', $produk))
            ->assertStatus(302);

        $this->assertSame('nonaktif', $produk->fresh()->status);
        $this->assertSame(10, (int) $varian->fresh()->stock, 'Toggle tidak boleh menyentuh stok gudang.');
        $this->assertSame(7, (int) $baris->fresh()->stock, 'Toggle tidak boleh menyentuh stok outlet.');
        $this->assertContains(
            (string) $outlet->id,
            array_map('strval', $produk->fresh()->outlet_ids ?? []),
            'Toggle tidak boleh menyentuh outlet_ids.'
        );
    }

    public function test_toggle_status_ditolak_untuk_non_admin(): void
    {
        $produk = Product::factory()->create(['status' => 'aktif']);
        $kasir = User::factory()->create(['role' => 'cashier']);

        $response = $this->actingAs($kasir)
            ->patch(route('admin.products.toggle-status', $produk));

        $response->assertStatus(403);
        $this->assertSame('aktif', $produk->fresh()->status);
    }
}
