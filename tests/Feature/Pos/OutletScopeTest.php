<?php

namespace Tests\Feature\Pos;

use App\Models\Outlet;
use App\Models\OutletStock;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Kontrak produk yang tampil di POS kasir.
 *
 * Test ini adalah penjaga utama keputusan "JSON satu sumber kebenaran".
 * Produk hanya dihitung boleh tampil di outlet tertentu kalau sudah benar-benar
 * ada barangnya di sana, maka JSON `outlet_ids` (yang bertambah otomatis saat
 * penerimaan barang) harus dipakai, bukan pivot `outlet_product` (yang hanya
 * berisi deklarasi admin dan bisa tertinggal).
 *
 * Kalau produk dengan stok riil tiba-tiba hilang dari POS, test T-3 gagal.
 */
class OutletScopeTest extends TestCase
{
    use RefreshDatabase;

    private function kasirFor(Outlet $outlet): User
    {
        return User::factory()->create([
            'role' => 'cashier',
            'outlet_id' => $outlet->id,
        ]);
    }

    /**
     * ID produk yang POS buka untuk outlet tertentu, dari payload `products_from_db`.
     */
    private function idProdukDiPos(User $kasir): array
    {
        $props = $this->actingAs($kasir)->get('/pos')->assertOk()->viewData('page')['props'];

        return collect($props['products_from_db'])->pluck('id')->sort()->values()->all();
    }

    private function idProdukDiInventoryPos(User $kasir): array
    {
        $props = $this->actingAs($kasir)->get('/pos')->assertOk()->viewData('page')['props'];

        return collect($props['inventoryProducts'])->pluck('id')->sort()->values()->all();
    }

    public function test_produk_dua_outlet_tampil_di_kedua_outlet(): void
    {
        $outlet1 = Outlet::factory()->create();
        $outlet2 = Outlet::factory()->create();
        $produk = Product::factory()->tersediaDiOutlet($outlet1->id, $outlet2->id)->create();

        $this->assertContains($produk->id, $this->idProdukDiPos($this->kasirFor($outlet1)));
        $this->assertContains($produk->id, $this->idProdukDiPos($this->kasirFor($outlet2)));
    }

    public function test_produk_hanya_satu_outlet_tidak_bocor_ke_outlet_lain(): void
    {
        $outlet1 = Outlet::factory()->create();
        $outlet2 = Outlet::factory()->create();
        $produk = Product::factory()->tersediaDiOutlet($outlet2->id)->create();

        $this->assertNotContains($produk->id, $this->idProdukDiPos($this->kasirFor($outlet1)));
        $this->assertContains($produk->id, $this->idProdukDiPos($this->kasirFor($outlet2)));
    }

    /**
     * Penjaga utama: pivot tertinggal, JSON benar.
     *
     * Produk ini didistribusikan admin hanya ke outlet 2 (isi pivot = outlet 2),
     * lalu kemudian menerima barang di outlet 1 sehingga outlet 1 masuk
     * JSON. Stok riil outlet 1 pun ada. Kasir outlet 1 WAJIB tetap bisa menjualnya.
     */
    public function test_produk_dengan_stok_riil_tetap_tampil_walau_pivot_tertinggal(): void
    {
        $outlet1 = Outlet::factory()->create();
        $outlet2 = Outlet::factory()->create();

        $produk = Product::factory()->tersediaDiOutlet($outlet2->id, $outlet1->id)->create([
            'outlet_id' => $outlet2->id,
        ]);
        $varian = $produk->variants()->create([
            'color' => 'Merah',
            'size' => 'M',
            'sku' => 'V-TEST-001',
        ]);

        // Pivot hanya berisi outlet 2 (deklarasi admin), JSON punya 1 dan 2.
        $produk->outlets()->sync([$outlet2->id]);

        OutletStock::create([
            'outlet_id' => $outlet1->id,
            'product_variant_id' => $varian->id,
            'stock' => 8,
        ]);

        $this->assertSame(
            [$outlet2->id],
            $produk->outlets()->pluck('id')->map('intval')->sort()->values()->all(),
            'Fixture harus benar-benar punya pivot yang tertinggal dari JSON.'
        );

        $this->assertContains(
            $produk->id,
            $this->idProdukDiPos($this->kasirFor($outlet1)),
            'Produk dengan stok riil 8 pcs di outlet 1 tidak boleh hilang dari POS outlet 1.'
        );
    }

    public function test_produk_tanpa_outlet_tidak_tampil_di_outlet_manapun(): void
    {
        $outlet = Outlet::factory()->create();
        $produk = Product::factory()->create(['outlet_ids' => null]);

        $this->assertNotContains($produk->id, $this->idProdukDiPos($this->kasirFor($outlet)));
    }

    public function test_produk_ditcold_off_stok_nol_tetap_ditampilkan(): void
    {
        $outlet = Outlet::factory()->create();
        $produk = Product::factory()->tersediaDiOutlet($outlet->id)->create();

        $this->assertContains($produk->id, $this->idProdukDiPos($this->kasirFor($outlet)));
    }

    public function test_inventory_pos_memakai_scope_outlet_yang_sama(): void
    {
        $outlet1 = Outlet::factory()->create();
        $outlet2 = Outlet::factory()->create();
        $produk = Product::factory()->tersediaDiOutlet($outlet2->id)->create();

        $this->assertNotContains($produk->id, $this->idProdukDiInventoryPos($this->kasirFor($outlet1)));
        $this->assertContains($produk->id, $this->idProdukDiInventoryPos($this->kasirFor($outlet2)));
    }

    public function test_scan_barcode_produk_di_outlet_lain_ditolak(): void
    {
        $outlet1 = Outlet::factory()->create();
        $outlet2 = Outlet::factory()->create();
        $produk = Product::factory()->tersediaDiOutlet($outlet2->id)->create();

        $response = $this->actingAs($this->kasirFor($outlet1))
            ->getJson('/pos/scan-lookup?q='.$produk->barcode_code);

        $response->assertNotFound();
    }

    public function test_scan_barcode_produk_di_outlet_yang_sama_ditemukan(): void
    {
        $outlet = Outlet::factory()->create();
        $produk = Product::factory()->tersediaDiOutlet($outlet->id)->create();

        $response = $this->actingAs($this->kasirFor($outlet))
            ->getJson('/pos/scan-lookup?q='.$produk->barcode_code);

        $response->assertOk()
            ->assertJsonPath('found', true)
            ->assertJsonPath('product_id', $produk->id);
    }

    /**
     * Kenapa normalisasi string itu wajib: MySQL membandingkan JSON secara ketat tipe.
     *
     * `JSON_CONTAINS('[1]', '"1"')` = 0, jadi produk yang tersimpan sebagai angka
     * TIDAK akan muncul di POS walaupun fisiknya ada di outlet tersebut. Test ini
     * mengunci perilaku MySQL itu sebagai dokumentasi, sekaligus alasan normalisasi
     * di jalur tulis (lihat test di bawah) tidak boleh dilewati.
     */
    public function test_outlet_ids_bertipe_angka_tidak_termasuk_di_pos(): void
    {
        $outlet = Outlet::factory()->create();

        $produkAngka = Product::factory()->create([
            'outlet_ids' => json_encode([$outlet->id]),
        ]);
        $produkString = Product::factory()->tersediaDiOutlet($outlet->id)->create();

        $terlihat = $this->idProdukDiPos($this->kasirFor($outlet));

        $this->assertContains(
            $produkString->id,
            $terlihat,
            'Bentuk string WAJIB terlihat di POS.'
        );
        $this->assertNotContains(
            $produkAngka->id,
            $terlihat,
            'Bentuk angka tidak terlihat di POS. Kalau ini berubah, normalisasi string bisa dilepas.'
        );
    }

    /**
     * Penjaga bug tipe JSON.
     *
     * kolom `outlet_ids` disimpan sebagai JSON array of STRING, jadi hanya
     * `whereJsonContains('outlet_ids', '1')` yang cocok di MySQL. Kalau ada
     * jalur tulis yang menyimpan angka, produk diam-diam hilang dari POS.
     *
     * Test ini memanggil form admin dengan angka dan memastikan hasilnya
     * dinormalisasi jadi string.
     */
    public function test_admin_yang_mengirim_outlet_berupa_angka_tetap_terimpan_sebagai_string(): void
    {
        $outlet = Outlet::factory()->create();
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post('/admin/products', [
            'nama_produk' => 'Kemeja Linen Tes',
            'kode_produk' => 'KHT-TEST-ANGKA',
            'harga_jual' => 150000,
            'harga_beli' => 90000,
            'distribusi_ke_gudang' => 1,
            'outlet_tersedia' => json_encode([$outlet->id]),
            'variants' => [
                ['color_name' => 'Merah', 'size_label' => 'M', 'stok' => 5],
            ],
        ]);

        $response->assertRedirect();

        $produk = Product::where('sku', 'KHT-TEST-ANGKA')->firstOrFail();

        $this->assertSame(
            [(string) $outlet->id],
            $produk->outlet_ids,
            'outlet_ids harus ternormalisasi ke string agar whereJsonContains("(string) id") tetap cocok.'
        );
        $this->assertContains($produk->id, $this->idProdukDiPos($this->kasirFor($outlet)));
    }
}
