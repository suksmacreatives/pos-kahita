<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promos', function (Blueprint $table) {
            $table->id();
            $table->string('kode_promo')->unique();
            $table->string('nama_promo');
            $table->text('deskripsi')->nullable();
            $table->enum('tipe', ['persentase', 'nominal', 'beli_x_gratis_y', 'bundle']);
            $table->decimal('nilai_diskon', 15, 2)->nullable();
            $table->decimal('min_transaksi', 15, 2)->default(0);
            $table->decimal('max_diskon', 15, 2)->nullable();
            $table->dateTime('berlaku_dari');
            $table->dateTime('berlaku_sampai');
            $table->string('berlaku_di')->default('semua'); // semua or array of outlet slugs
            $table->string('berlaku_untuk')->default('semua'); // semua or array of category slugs
            $table->integer('kuota')->nullable(); // null = unlimited
            $table->integer('terpakai')->default(0);
            $table->enum('status', ['aktif', 'nonaktif', 'habis', 'kadaluarsa'])->default('aktif');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('status');
            $table->index('kode_promo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promos');
    }
};
