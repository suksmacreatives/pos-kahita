<?php

namespace Tests\Feature\Inventory;

use App\Models\Outlet;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Backfill pivot outlet_product dari products.outlet_ids.
 *
 * Migration ini menutup selisih yang sudah terlanjur ada di produksi, di mana
 * outlet_ids bertambah saat penerimaan barang tapi pivot tidak pernah ikut.
 * Test memanggil kelas migrasinya langsung karena migration sudah dijalankan
 * RefreshDatabase sebelum data uji ada.
 */
class BackfillOutletProductTest extends TestCase
{
    use RefreshDatabase;

    private function jalankanBackfill(): void
    {
        $file = database_path('migrations/2026_10_03_000001_backfill_outlet_product_pivot.php');
        $migrasi = require $file;

        $migrasi->up();
    }

    public function test_pivot_yg_ketinggalan_ikut_terisi(): void
    {
        $outlet1 = Outlet::factory()->create();
        $outlet2 = Outlet::factory()->create();

        // Kasus produksi: pivot tertinggal satu outlet di belakang JSON.
        $produk = Product::factory()->tersediaDiOutlet($outlet1->id, $outlet2->id)->create();
        $produk->outlets()->sync([$outlet1->id]);

        $this->jalankanBackfill();

        $this->assertEqualsCanonicalizing(
            [$outlet1->id, $outlet2->id],
            $produk->outlets()->pluck('id')->map('intval')->all(),
        );
    }

    public function test_backfill_idemoten_tidak_menggandakan_baris(): void
    {
        $outlet = Outlet::factory()->create();
        $produk = Product::factory()->tersediaDiOutlet($outlet->id)->create();
        $produk->outlets()->sync([$outlet->id]);

        $this->jalankanBackfill();
        $this->jalankanBackfill();

        $this->assertSame(
            1,
            DB::table('outlet_product')
                ->where('product_id', $produk->id)
                ->where('outlet_id', $outlet->id)
                ->count(),
            'Migration harus aman dijalankan berulang kali.'
        );
    }

    public function test_outlet_yang_sudah_tidak_ada_dilewati(): void
    {
        $outlet = Outlet::factory()->create();

        // outlet_ids sengaja berisi id outlet yang sudah dihapus.
        $produk = Product::factory()->create([
            'outlet_ids' => [(string) $outlet->id, '999999'],
        ]);

        $this->jalankanBackfill();

        $this->assertSame(
            [$outlet->id],
            $produk->outlets()->pluck('id')->map('intval')->all(),
            'Outlet yang sudah tidak ada tidak boleh masuk pivot (akan melanggar foreign key).'
        );
    }

    public function test_produk_tanpa_outlet_ids_tidak_diubah(): void
    {
        $produk = Product::factory()->create(['outlet_ids' => null]);

        $this->jalankanBackfill();

        $this->assertSame(0, $produk->outlets()->count());
    }

    public function test_nilai_bukan_angka_dilewati(): void
    {
        $outlet = Outlet::factory()->create();
        $produk = Product::factory()->create([
            'outlet_ids' => [(string) $outlet->id, 'bukan-angka'],
        ]);

        $this->jalankanBackfill();

        $this->assertSame(
            [$outlet->id],
            $produk->outlets()->pluck('id')->map('intval')->all(),
        );
    }

    /**
     * outlet_ids yang isinya bukan array JSON (mis. ter-encode dua kali, atau
     * kolom tergantikan string biasa) harus dilewati, bukan membuat error.
     */
    public function test_outlet_ids_yang_bukan_array_dilewati_tanpa_error(): void
    {
        $outlet = Outlet::factory()->create();

        // Sengaja lewat cast, bukan json_encode: nilai(string) akan
        // di-encode dua kali oleh cast 'array' sehingga kolom berisi JSON
        // string, bukan JSON array.
        $produk = Product::factory()->create([
            'outlet_ids' => json_encode([(string) $outlet->id]),
        ]);

        $this->assertIsString(
            DB::table('products')->where('id', $produk->id)->value('outlet_ids'),
            'Fixture harus benar-benar menghasilkan kolom yang bukan JSON array.'
        );

        $this->jalankanBackfill();

        $this->assertSame(
            0,
            $produk->outlets()->count(),
            'Kolom yang bukan JSON array tidak boleh diparse jadi outlet.'
        );
    }
}
