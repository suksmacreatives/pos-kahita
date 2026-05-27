<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_settings', function (Blueprint $table) {
            $table->id();
            // Menghubungkan ke tabel outlets yang sudah ada
            $table->foreignId('outlet_id')->constrained('outlets')->onDelete('cascade');
            $table->string('store_name');
            $table->string('phone_number')->nullable();
            $table->text('address')->nullable();
            $table->string('logo_path')->nullable(); 
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_settings');
    }
};