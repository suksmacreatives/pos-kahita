<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Mengubah 9 foreign key dari ON DELETE CASCADE menjadi RESTRICT.
 *
 * CASCADE sebelumnya berarti menghapus produk/varian ikut menghapus riwayat
 * penjualan, mutasi stok, dan dokumen gudang. Itu merusak laporan tanpa error:
 * `transactions.grand_total` tetap ada sementara `transaction_items` hilang.
 *
 * Catatan: `outlet_product.product_id` dan `product_variants.product_id`
 * sengaja dibiarkan CASCADE karena keduanya data turunan, bukan riwayat.
 */
return new class extends Migration
{
    /** @var array<int, array{0: string, 1: string}> */
    protected const FKS = [
        ['transaction_items', 'product_id'],
        ['stock_movements', 'product_variant_id'],
        ['outlet_stocks', 'product_variant_id'],
        ['purchase_order_items', 'product_id'],
        ['distribution_order_items', 'product_id'],
        ['supplier_return_items', 'product_id'],
        ['stock_opname_items', 'product_id'],
        ['outlet_transfer_items', 'product_id'],
        ['outlet_return_items', 'product_id'],
    ];

    public function up(): void
    {
        foreach (self::FKS as [$table, $column]) {
            $this->replace($table, $column, 'restrict');
        }
    }

    public function down(): void
    {
        foreach (self::FKS as [$table, $column]) {
            $this->replace($table, $column, 'cascade');
        }
    }

    protected function replace(string $table, string $column, string $onDelete): void
    {
        Schema::table($table, function (Blueprint $t) use ($column) {
            $t->dropForeign([$column]);
        });

        Schema::table($table, function (Blueprint $t) use ($column, $onDelete) {
            $t->foreign($column)->references('id')
                ->on($this->targetTable($column))
                ->onDelete($onDelete);
        });
    }

    protected function targetTable(string $column): string
    {
        return str_ends_with($column, 'product_variant_id')
            ? 'product_variants'
            : 'products';
    }
};
