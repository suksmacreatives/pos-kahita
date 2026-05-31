<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {

            $table->foreignId('category_id')
                ->nullable()
                ->after('outlet_id')
                ->constrained('product_categories')
                ->onDelete('set null');

            $table->string('image')->nullable()->after('description');

        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {

            $table->dropForeign(['category_id']);

            $table->dropColumn([
                'category_id',
                'image'
            ]);

        });
    }
};