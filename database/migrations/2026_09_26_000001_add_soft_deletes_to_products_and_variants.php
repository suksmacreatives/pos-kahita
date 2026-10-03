<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->softDeletes();
            // Disimpan saat diarsipkan supaya restore() bisa mengembalikan SKU asli.
            $table->string('original_sku')->nullable()->after('sku');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->softDeletes();
            $table->string('original_sku')->nullable()->after('sku');
        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn('original_sku');
            $table->dropSoftDeletes();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('original_sku');
            $table->dropSoftDeletes();
        });
    }
};
