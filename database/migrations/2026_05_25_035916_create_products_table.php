<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('products', function (Blueprint $table) {
        $table->id();
        $table->string('name');         // Nama baju/produk (Contoh: Kemeja Kahita Linen)
        $table->string('sku')->unique(); // Kode unik produk (Contoh: KHT-001)
        $table->integer('price');       // Harga jual barang
        $table->integer('cost_price');  // Harga modal/pokok (penting untuk laporan keuntungan nanti)
        $table->text('description')->nullable();
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('products');
}
};
