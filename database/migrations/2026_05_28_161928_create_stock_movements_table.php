<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {

            $table->id();

            $table->foreignId('product_variant_id')
                ->constrained('product_variants')
                ->onDelete('cascade');

            $table->enum('type', [
                'sale',
                'restock',
                'adjustment',
                'void',
                'return'
            ]);

            $table->integer('qty');

            $table->text('note')->nullable();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');

            $table->timestamps();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};