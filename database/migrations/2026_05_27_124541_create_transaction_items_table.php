<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaction_items', function (Blueprint $table) {
            $table->id();
            // Relasi ke induk tabel transaksi
            $table->foreignId('transaction_id')->constrained('transactions')->onDelete('cascade');
            // Relasi ke tabel produk asli Anda
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->string('product_name_snapshot'); 
            $table->string('variant_color')->nullable();
            $table->string('variant_size')->nullable();
            $table->bigInteger('price_at_sale'); 
            $table->integer('quantity');
            $table->bigInteger('total_price');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_items');
    }
};