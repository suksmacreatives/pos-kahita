<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            // Penanda varian yang diarsipkan BERSAMA produknya.
            // Dibedakan dari varian yang sudah dihapus lewat form edit, supaya
            // restore() tidak menghidupkan kembali varian yang memang dibuang.
            $table->timestamp('archived_at')->nullable()->after('original_sku');
        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn('archived_at');
        });
    }
};
