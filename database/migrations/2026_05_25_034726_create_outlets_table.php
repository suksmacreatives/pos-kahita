<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('outlets', function (Blueprint $table) {
        $table->id();
        $table->string('name'); // Contoh: Kahita Busana Pusat, Kahita Cabang Kuta
        $table->string('address')->nullable();
        $table->string('phone')->nullable();
        $table->timestamps();
    });

    // Menambahkan kolom outlet_id ke tabel users agar staf kasir/admin terikat ke cabang tertentu
    Schema::table('users', function (Blueprint $table) {
        $table->foreignId('outlet_id')->nullable()->constrained('outlets')->onDelete('set null');
    });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['outlet_id']);
            $table->dropColumn('outlet_id');
        });
        Schema::dropIfExists('outlets');
    }
};
