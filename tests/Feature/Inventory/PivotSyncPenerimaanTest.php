<?php

namespace Tests\Feature\Inventory;

use App\Models\DistributionOrder;
use App\Models\Outlet;
use App\Models\OutletStock;
use App\Models\Product;
use App\Services\Inventory\InventoriOutletService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Konsistensi outlet produk setelah barang diterima.
 *
 * `products.outlet_ids` (JSON) dibaca POS, inventory outlet, dan laporan,
 * sedangkan `outlet_product` (pivot) dibaca halaman admin. Keduanya harus
 * selalu sinkar: begitu outlet_ids bertambah karena penerimaan barang, pivot
 * wajib menyusul, kalau tidak kasir bisa menjual produk yang di daftar admin
 * seolah tidak ada di outlet tersebut.
 *
 * Skenario yang diuji mirroring kasus nyata di produksi: admin mendaftarkan
 * produk ke outlet A, lalu gudang mengirim barang ke outlet B lewat DO. Outlet B
 * menerima, jadi outlet_ids bertambah dengan B, dan pivot harus menyusul.
 */
class PivotSyncPenerimaanTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{0: DistributionOrder, 1: Outlet, 2: Outlet, 3: Product}
     *                                                                       DO, outlet penerima, outlet pendaftar awal, produk
     */
    private function fixtures(): array
    {
        $outletPendaftar = Outlet::factory()->create();
        $outletPenerima = Outlet::factory()->create();

        $produk = Product::factory()->tersediaDiOutlet($outletPendaftar->id)->create([
            'outlet_id' => $outletPendaftar->id,
        ]);
        $varian = $produk->variants()->create([
            'color' => 'Merah',
            'size' => 'M',
            'sku' => 'V-SYNC-001',
        ]);

        // Deklarasi admin: hanya outlet pendaftar.
        $produk->outlets()->sync([$outletPendaftar->id]);

        $do = DistributionOrder::create([
            'nomor_do' => 'DO-SYNC-001',
            'outlet_id' => $outletPenerima->id,
            'total_qty' => 10,
            'status' => 'dikirim',
            'tanggal_kirim' => now(),
        ]);

        $do->items()->create([
            'product_id' => $produk->id,
            'product_variant_id' => $varian->id,
            'nama' => $produk->name,
            'ukuran' => 'M',
            'warna' => 'Merah',
            'qty' => 10,
        ]);

        return [$do->load('items'), $outletPenerima, $outletPendaftar, $produk];
    }

    public function test_outlet_ids_bertambah_setelah_penerimaan_barang(): void
    {
        [$do, $outletPenerima, , $produk] = $this->fixtures();
        $item = $do->items->first();

        app(InventoriOutletService::class)->konfirmasiTerima($do->id, [
            ['id' => $item->id, 'qty_terima' => 10, 'kondisi' => 'baik'],
        ]);

        $produk->refresh();

        $this->assertContains(
            (string) $outletPenerima->id,
            $produk->outlet_ids,
            'outlet_ids harus bertambah setelah barang diterima.'
        );
        $this->assertContains(
            (string) $produk->outlet_id,
            $produk->outlet_ids,
            'Outlet pendaftar tidak boleh hilang dari outlet_ids.'
        );
    }

    public function test_pivot_outlet_product_mengikuti_penerimaan_barang(): void
    {
        [$do, $outletPenerima, $outletPendaftar, $produk] = $this->fixtures();
        $item = $do->items->first();

        $this->assertSame(
            [$outletPendaftar->id],
            $produk->outlets()->pluck('id')->map('intval')->all(),
            'Fixture: pivot awal hanya berisi outlet pendaftar, belum outlet penerima.'
        );

        app(InventoriOutletService::class)->konfirmasiTerima($do->id, [
            ['id' => $item->id, 'qty_terima' => 10, 'kondisi' => 'baik'],
        ]);

        $produk->refresh();

        $this->assertEqualsCanonicalizing(
            [$outletPendaftar->id, $outletPenerima->id],
            $produk->outlets()->pluck('id')->map('intval')->all(),
            'Pivot outlet_product harus ikut sync. Kalau tidak, daftar produk admin tidak sinkar dengan POS.'
        );
    }

    public function test_stok_outlet_terisi_setelah_penerimaan(): void
    {
        [$do, $outletPenerima] = $this->fixtures();
        $item = $do->items->first();

        app(InventoriOutletService::class)->konfirmasiTerima($do->id, [
            ['id' => $item->id, 'qty_terima' => 10, 'kondisi' => 'baik'],
        ]);

        $stok = OutletStock::where('outlet_id', $outletPenerima->id)
            ->where('product_variant_id', $item->product_variant_id)
            ->value('stock');

        $this->assertSame(10, (int) $stok);
    }

    public function test_penerimaan_ulangan_tidak_menggandakan_outlet_maupun_stok(): void
    {
        [$do, $outletPenerima, $outletPendaftar, $produk] = $this->fixtures();
        $item = $do->items->first();

        $service = app(InventoriOutletService::class);

        $service->konfirmasiTerima($do->id, [
            ['id' => $item->id, 'qty_terima' => 10, 'kondisi' => 'baik'],
        ]);

        // Penerimaan ulang dengan angka yang sama tidak boleh menambah outlet
        // kedua kali maupun menaikkan stok dua kali.
        $service->konfirmasiTerima($do->id, [
            ['id' => $item->id, 'qty_terima' => 10, 'kondisi' => 'baik'],
        ]);

        $produk->refresh();

        $this->assertEqualsCanonicalizing(
            [$outletPendaftar->id, $outletPenerima->id],
            $produk->outlet_ids,
            'outlet_ids tidak boleh berisi outlet ganda.'
        );
        $this->assertEqualsCanonicalizing(
            [$outletPendaftar->id, $outletPenerima->id],
            $produk->outlets()->pluck('id')->map('intval')->all(),
            'Pivot tidak boleh berisi baris ganda.'
        );
        $this->assertSame(
            10,
            (int) OutletStock::where('outlet_id', $outletPenerima->id)
                ->where('product_variant_id', $item->product_variant_id)
                ->value('stock'),
            'Stok tidak boleh terhitung dua kali.'
        );
    }

    public function test_produk_yang_tidak_ada_di_do_tidak_ikut_tersentuh(): void
    {
        [$do] = $this->fixtures();
        $produkLain = Product::factory()->create();

        $item = $do->items->first();

        app(InventoriOutletService::class)->konfirmasiTerima($do->id, [
            ['id' => $item->id, 'qty_terima' => 5, 'kondisi' => 'baik'],
        ]);

        $this->assertSame(
            0,
            $produkLain->outlets()->count(),
            'Produk yang tidak ada di DO tidak boleh tersentuh pivot.'
        );
    }
}
