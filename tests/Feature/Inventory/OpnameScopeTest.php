<?php

namespace Tests\Feature\Inventory;

use App\Models\Outlet;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Services\Inventory\OpnameOutletService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Scope kategori saat memulai stock opname outlet.
 *
 * products.outlet_ids disimpan sebagai JSON, sedangkan products.outlet_id
 * menyimpan satu outlet utama. Keduanya digabung dengan OR, jadi OR itu wajib
 * dibungkus closure. Kalau tidak, `whereHas('category')` hanya menempel ke satu
 * cabang dan opname per kategori ikut memuat produk kategori lain.
 */
class OpnameScopeTest extends TestCase
{
    use RefreshDatabase;

    private function produkDenganKategori(Outlet $outlet, ProductCategory $kategori, string $warna): Product
    {
        $produk = Product::factory()->tersediaDiOutlet($outlet->id)->create([
            'category_id' => $kategori->id,
        ]);

        $produk->variants()->create([
            'color' => $warna,
            'size' => 'M',
            'sku' => 'V-OPNAME-'.strtoupper($warna),
        ]);

        return $produk;
    }

    public function test_opname_per_kategori_tidak_menyerap_produk_kategori_lain(): void
    {
        $outlet = Outlet::factory()->create();
        $kemeja = ProductCategory::factory()->create(['name' => 'Kemeja']);
        $rok = ProductCategory::factory()->create(['name' => 'Rok']);

        $produkKemeja = $this->produkDenganKategori($outlet, $kemeja, 'MERAH');
        $produkRok = $this->produkDenganKategori($outlet, $rok, 'BIRU');

        $hasil = app(OpnameOutletService::class)->startOpname([
            'outlet_id' => $outlet->id,
            'petugas' => 'Kasir Test',
            'scope' => 'Kemeja',
        ]);

        $idProduk = collect($hasil['items'])->pluck('product_id')->unique()->sort()->values()->all();

        $this->assertSame(
            [$produkKemeja->id],
            $idProduk,
            'Opname scope Kemeja tidak boleh mengandung produk Rok. Filter kategori bocor lewat cabang OR yang tidak dikelompokkan.'
        );
        $this->assertNotContains($produkRok->id, $idProduk);
    }

    public function test_opname_per_kategori_tetap_menutup_produk_yang_hanya_punya_outlet_id(): void
    {
        // Produk ini hanya tercatat lewat products.outlet_id (outlet utama),
        // tanpa id di outlet_ids. Tetap harus masuk opname.
        $outlet = Outlet::factory()->create();
        $kemeja = ProductCategory::factory()->create(['name' => 'Kemeja']);

        $produk = Product::factory()->create([
            'outlet_id' => $outlet->id,
            'outlet_ids' => null,
            'category_id' => $kemeja->id,
        ]);
        $produk->variants()->create([
            'color' => 'HIJAU',
            'size' => 'L',
            'sku' => 'V-OPNAME-HIJAU',
        ]);

        $hasil = app(OpnameOutletService::class)->startOpname([
            'outlet_id' => $outlet->id,
            'petugas' => 'Kasir Test',
            'scope' => 'Kemeja',
        ]);

        $this->assertContains(
            $produk->id,
            collect($hasil['items'])->pluck('product_id')->all(),
            'Produk yang tercatat lewat outlet_id saja tetap harus ikut opname.'
        );
    }

    public function test_opname_scope_semua_kategori_tetap_mengambil_semua_produk_outlet(): void
    {
        $outlet = Outlet::factory()->create();
        $outletLain = Outlet::factory()->create();
        $kemeja = ProductCategory::factory()->create(['name' => 'Kemeja']);

        $produkKemeja = $this->produkDenganKategori($outlet, $kemeja, 'MERAH');
        $produkLain = $this->produkDenganKategori($outletLain, $kemeja, 'KUNING');

        $hasil = app(OpnameOutletService::class)->startOpname([
            'outlet_id' => $outlet->id,
            'petugas' => 'Kasir Test',
            'scope' => 'all',
        ]);

        $idProduk = collect($hasil['items'])->pluck('product_id')->unique()->all();

        $this->assertContains($produkKemeja->id, $idProduk);
        $this->assertNotContains($produkLain->id, $idProduk, 'Produk outlet lain tidak boleh ikut teropname.');
    }
}
