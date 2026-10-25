<?php

namespace Tests\Feature\Inventory;

use App\Exceptions\InsufficientStockException;
use App\Models\Outlet;
use App\Models\OutletStock;
use App\Models\OutletTransfer;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\Inventory\TransferStokService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Transfer hanya boleh dibuat bila produk sudah dicentang untuk outlet tujuan
 * pada menu Produk (products.outlet_ids).
 *
 * Tanpa validasi ini, barang bisa dikirim ke outlet yang belum mendaftarkan
 * produknya sehingga data transfer terlihat "tidak masuk" di inventory outlet
 * tujuan.
 */
class TransferOutletAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{0: Product, 1: ProductVariant}
     */
    private function produkDiOutlet(Outlet $outlet, int $stok = 10): array
    {
        $produk = Product::factory()->create([
            'outlet_id' => $outlet->id,
            'outlet_ids' => [(string) $outlet->id],
        ]);

        $varian = ProductVariant::factory()->create([
            'product_id' => $produk->id,
            'color' => 'Hitam',
            'size' => 'M',
            'stock' => 0,
        ]);

        OutletStock::create([
            'outlet_id' => $outlet->id,
            'product_variant_id' => $varian->id,
            'stock' => $stok,
        ]);

        return [$produk, $varian];
    }

    private function centangProdukDiOutlet(Product $produk, Outlet $outlet): void
    {
        $ids = array_map('strval', $produk->outlet_ids ?? []);
        $ids[] = (string) $outlet->id;

        $produk->update(['outlet_ids' => array_values(array_unique($ids))]);
        $produk->outlets()->syncWithoutDetaching([$outlet->id]);
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     * @return array<string, mixed>
     */
    private function payload(Outlet $asal, Outlet $tujuan, array $items): array
    {
        return [
            'outlet_asal_id' => $asal->slug,
            'outlet_tujuan_id' => $tujuan->slug,
            'tgl_transfer' => now()->toDateString(),
            'alasan' => 'permintaan',
            'catatan' => null,
            'items' => $items,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function item(Product $produk, ProductVariant $varian, int $qty = 3): array
    {
        return [
            'product_id' => $produk->id,
            'product_variant_id' => $varian->id,
            'nama' => $produk->name,
            'ukuran' => $varian->size,
            'warna' => $varian->color,
            'qty' => $qty,
        ];
    }

    public function test_transfer_ditolak_jika_produk_belum_dicentang_di_outlet_tujuan(): void
    {
        $asal = Outlet::factory()->create();
        $tujuan = Outlet::factory()->create();
        [$produk, $varian] = $this->produkDiOutlet($asal);

        try {
            app(TransferStokService::class)->processTransfer(
                $this->payload($asal, $tujuan, [$this->item($produk, $varian)])
            );
            $this->fail('Transfer seharusnya ditolak karena produk belum tersedia di outlet tujuan.');
        } catch (InsufficientStockException $e) {
            $this->assertStringContainsString('belum tersedia di outlet tujuan', $e->getMessage());
        }

        $this->assertSame(0, OutletTransfer::count(), 'Transfer gagal tidak boleh menyimpan dokumen.');
        $this->assertSame(
            10,
            (int) OutletStock::where('outlet_id', $asal->id)
                ->where('product_variant_id', $varian->id)
                ->value('stock'),
            'Stok outlet asal tidak boleh berkurang saat validasi gagal.'
        );
    }

    public function test_transfer_berhasil_jika_produk_sudah_dicentang_di_outlet_tujuan(): void
    {
        $asal = Outlet::factory()->create();
        $tujuan = Outlet::factory()->create();
        [$produk, $varian] = $this->produkDiOutlet($asal);
        $this->centangProdukDiOutlet($produk, $tujuan);

        $transfer = app(TransferStokService::class)->processTransfer(
            $this->payload($asal, $tujuan, [$this->item($produk, $varian)])
        );

        $this->assertSame($tujuan->id, $transfer->outlet_tujuan_id);
        $this->assertSame(1, OutletTransfer::count());
        $this->assertSame(
            7,
            (int) OutletStock::where('outlet_id', $asal->id)
                ->where('product_variant_id', $varian->id)
                ->value('stock')
        );
    }

    public function test_satu_item_yang_belum_tersedia_membatalkan_seluruh_transfer(): void
    {
        $asal = Outlet::factory()->create();
        $tujuan = Outlet::factory()->create();

        [$produkTersedia, $varianTersedia] = $this->produkDiOutlet($asal);
        $this->centangProdukDiOutlet($produkTersedia, $tujuan);

        [$produkBelumTersedia, $varianBelumTersedia] = $this->produkDiOutlet($asal);

        try {
            app(TransferStokService::class)->processTransfer($this->payload($asal, $tujuan, [
                $this->item($produkTersedia, $varianTersedia),
                $this->item($produkBelumTersedia, $varianBelumTersedia),
            ]));
            $this->fail('Seluruh transfer harus ditolak bila ada satu item yang belum tersedia.');
        } catch (InsufficientStockException $e) {
            $this->assertStringContainsString($produkBelumTersedia->name, $e->getMessage());
        }

        $this->assertSame(0, OutletTransfer::count());
        $this->assertSame(
            10,
            (int) OutletStock::where('outlet_id', $asal->id)
                ->where('product_variant_id', $varianTersedia->id)
                ->value('stock'),
            'Stok item yang valid pun tidak boleh berubah saat transfer dibatalkan.'
        );
    }
}
