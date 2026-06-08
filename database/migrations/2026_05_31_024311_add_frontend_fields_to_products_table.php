<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('sub_kategori')->nullable()->after('description');
            $table->string('status')->default('aktif')->after('sub_kategori');
            $table->json('outlet_ids')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['sub_kategori', 'status', 'outlet_ids']);
        });
    }
};
