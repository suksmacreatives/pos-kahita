<?php

namespace Tests\Feature\Inventory;

use App\Models\Outlet;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Normalisasi products.outlet_ids menjadi JSON array of STRING.
 *
 * Migration ini menjaga agar `whereJsonContains('outlet_ids', (string) $id)`
 * tetap cocok. Data di produksi saat ini sudah berbentuk string, jadi migration
 * ini berfungsi sebagai insurance terhadap jalur tulis lain di masa depan.
 */
class NormalizeOutletIdsTest extends TestCase
{
    use RefreshDatabase;

    private function jalankanNormalisasi(): void
    {
        $file = database_path('migrations/2026_10_03_000002_normalize_outlet_ids_to_strings.php');
        $migrasi = require $file;

        $migrasi->up();
    }

    /**
     * Nilai mentah kolom. MySQL menormalisasi format JSON saat menyimpan
     * (mis. ["1", "2"] dengan spasi), jadi string mentah tidak cocok dipakai
     * untuk perbandingan.
     */
    private function outletIdsMentah(int $productId): ?string
    {
        return DB::table('products')->where('id', $productId)->value('outlet_ids');
    }

    /**
     * Nilai kolom setelah di-decode, jadi perbandingan tidak sensitif
     * terhadap format JSON.
     */
    private function outletIdsTerbaca(int $productId): mixed
    {
        return json_decode($this->outletIdsMentah($productId), true);
    }

    public function test_angka_dinormalisasi_ke_string(): void
    {
        $outlet = Outlet::factory()->create();

        $produk = Product::factory()->create([
            'outlet_ids' => [$outlet->id],
        ]);

        $this->assertSame(
            [$outlet->id],
            $this->outletIdsTerbaca($produk->id),
            'Fixture harus benar-benar menyimpan angka.'
        );

        $this->jalankanNormalisasi();

        $this->assertSame([(string) $outlet->id], $this->outletIdsTerbaca($produk->id));
    }

    public function test_campuran_angka_dan_string_semua_jadi_string(): void
    {
        $outletA = Outlet::factory()->create();
        $outletB = Outlet::factory()->create();

        $produk = Product::factory()->create([
            'outlet_ids' => [$outletA->id, (string) $outletB->id],
        ]);

        $this->jalankanNormalisasi();

        $this->assertSame(
            [(string) $outletA->id, (string) $outletB->id],
            $this->outletIdsTerbaca($produk->id)
        );
    }

    public function test_nilai_kosong_dan_duplikat_dibuang(): void
    {
        $outlet = Outlet::factory()->create();
        $produk = Product::factory()->create([
            'outlet_ids' => [$outlet->id, $outlet->id, '', null],
        ]);

        $this->jalankanNormalisasi();

        $this->assertSame([(string) $outlet->id], $this->outletIdsTerbaca($produk->id));
    }

    public function test_data_yang_sudah_benar_tidak_diubah(): void
    {
        $outlet = Outlet::factory()->create();
        $produk = Product::factory()->tersediaDiOutlet($outlet->id)->create();

        $sebelum = $this->outletIdsMentah($produk->id);

        $this->jalankanNormalisasi();

        $this->assertSame($sebelum, $this->outletIdsMentah($produk->id));
    }

    public function test_kolom_bukan_json_array_tidak_dirusak(): void
    {
        $produk = Product::factory()->create([
            'outlet_ids' => json_encode([1]),
        ]);

        // Cast 'array' akan encode ulang, jadi bypass lewat query builder
        // agar kolom berisi JSON string (bukan array) seperti kasus rusak.
        DB::table('products')->where('id', $produk->id)->update([
            'outlet_ids' => '"bukan-array"',
        ]);

        $this->jalankanNormalisasi();

        $this->assertSame(
            '"bukan-array"',
            $this->outletIdsMentah($produk->id),
            'Nilai yang bukan JSON array harus dibiarkan, bukan ditimpa.'
        );
    }

    public function test_null_tidak_disentuh(): void
    {
        $produk = Product::factory()->create(['outlet_ids' => null]);

        $this->jalankanNormalisasi();

        $this->assertNull($this->outletIdsMentah($produk->id));
    }

    public function test_produk_yang_sudah_diterima_terlihat_di_pos_setelah_normalisasi(): void
    {
        $outlet = Outlet::factory()->create();
        $kasir = User::factory()->create([
            'role' => 'cashier',
            'outlet_id' => $outlet->id,
        ]);

        $produk = Product::factory()->create([
            'outlet_ids' => [$outlet->id],
        ]);

        $this->jalankanNormalisasi();
        $produk->refresh();

        $props = $this->actingAs($kasir)->get('/pos')->assertOk()->viewData('page')['props'];
        $terlihat = collect($props['products_from_db'])->pluck('id')->all();

        $this->assertContains(
            $produk->id,
            $terlihat,
            'Setelah normalisasi, produk dengan outlet_ids angka harus muncul di POS.'
        );
    }
}
