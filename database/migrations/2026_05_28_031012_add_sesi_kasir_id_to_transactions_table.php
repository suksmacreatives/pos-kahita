<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Menambahkan kolom foreign key setelah kolom ID tabel transaksi
            $table->foreignId('sesi_kasir_id')->nullable()->after('id')->constrained('sesi_kasirs')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['sesi_kasir_id']);
            $table->dropColumn('sesi_kasir_id');
        });
    }
};