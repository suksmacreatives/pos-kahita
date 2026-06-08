<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('outlet_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('outlet_id')->constrained('outlets')->onDelete('cascade');
            $table->foreignId('product_variant_id')->constrained('product_variants')->onDelete('cascade');
            $table->integer('stock')->default(0);
            $table->timestamps();

            $table->unique(['outlet_id', 'product_variant_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('outlet_stocks');
    }
};
