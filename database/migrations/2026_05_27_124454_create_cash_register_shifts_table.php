<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_register_shifts', function (Blueprint $table) {
            $table->id();
            // Menghubungkan ke user (kasir) dan outlet
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('outlet_id')->constrained('outlets')->onDelete('cascade');
            $table->dateTime('opened_at');
            $table->dateTime('closed_at')->nullable();
            $table->bigInteger('starting_cash');     
            $table->bigInteger('system_cash')->default(0); 
            $table->bigInteger('physical_cash')->nullable(); 
            $table->bigInteger('discrepancy')->default(0);   
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_register_shifts');
    }
};