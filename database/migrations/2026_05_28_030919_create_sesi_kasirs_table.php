<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sesi_kasirs', function (Blueprint $table) {
            $table->id();
            // Menghubungkan sesi ke user (kasir) yang sedang login
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            // Menghubungkan sesi ke outlet aktif
            $table->foreignId('outlet_id')->constrained('outlets')->onDelete('cascade');
            
            $table->bigInteger('modal_awal')->default(0);
            $table->bigInteger('uang_fisik_akhir')->nullable(); // Diisi saat tutup kasir
            $table->enum('status', ['open', 'closed'])->default('open');
            
            $table->timestamp('waktu_buka');
            $table->timestamp('waktu_tutup')->nullable(); // Diisi saat tutup kasir
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sesi_kasirs');
    }
};