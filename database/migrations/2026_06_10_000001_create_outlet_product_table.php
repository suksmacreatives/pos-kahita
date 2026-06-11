<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('outlet_product', function (Blueprint $table) {
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('outlet_id')->constrained()->onDelete('cascade');
            $table->primary(['product_id', 'outlet_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('outlet_product');
    }
};
