<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('outlet_returns', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_retur')->unique();
            $table->foreignId('outlet_id')->constrained('outlets')->onDelete('cascade');
            $table->date('tgl_retur');
            $table->string('alasan');
            $table->string('status')->default('diajukan');
            $table->text('catatan')->nullable();
            $table->integer('total_item')->default(0);
            $table->integer('total_qty')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('outlet_returns');
    }
};
