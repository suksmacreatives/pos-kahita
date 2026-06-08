<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('aksi'); // LOGIN, LOGOUT, TAMBAH, EDIT, HAPUS, VOID, REFUND, EXPORT, CETAK, TRANSFER_STOK, TERIMA_BARANG, UBAH_PASSWORD
            $table->string('modul'); // Auth, Products, Inventory, Transactions, Reports, Settings, Akun, Promo
            $table->string('target_id')->nullable();
            $table->string('target_label')->nullable();
            $table->json('detail')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('device')->nullable(); // desktop, mobile, tablet
            $table->enum('status', ['sukses', 'gagal'])->default('sukses');
            $table->text('error_msg')->nullable();
            $table->timestamps();

            $table->index('aksi');
            $table->index('modul');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
