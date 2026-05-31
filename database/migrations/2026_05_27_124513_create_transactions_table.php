<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique(); 
            $table->foreignId('outlet_id')->constrained('outlets')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            // Dibuat nullable agar jika data shift terhapus, transaksi tidak ikut hilang
            $table->foreignId('shift_id')->nullable()->constrained('cash_register_shifts')->onDelete('set null');
            $table->string('customer_name')->default('Umum');
            $table->bigInteger('subtotal');
            $table->bigInteger('discount')->default(0);
            $table->bigInteger('grand_total');
            $table->string('payment_method'); 
            $table->enum('status', ['completed', 'void'])->default('completed'); 
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};