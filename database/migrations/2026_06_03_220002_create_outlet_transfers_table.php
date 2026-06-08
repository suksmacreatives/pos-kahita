<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('outlet_transfers', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_transfer')->unique();
            $table->foreignId('outlet_asal_id')->constrained('outlets')->onDelete('cascade');
            $table->foreignId('outlet_tujuan_id')->constrained('outlets')->onDelete('cascade');
            $table->date('tgl_transfer');
            $table->date('tgl_diterima')->nullable();
            $table->string('alasan');
            $table->string('status')->default('menunggu_konfirmasi');
            $table->string('dibuat_oleh')->nullable();
            $table->text('catatan')->nullable();
            $table->integer('total_item')->default(0);
            $table->integer('total_qty')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('outlet_transfers');
    }
};
