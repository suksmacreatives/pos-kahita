<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_transactions', function (Blueprint $table) {
            $table->id();
            // Menghubungkan transaksi ke shift yang sedang aktif
            $table->foreignId('shift_id')->constrained('cash_register_shifts')->onDelete('cascade');
            // Menghubungkan transaksi ke user yang login
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            $table->enum('transaction_type', ['IN', 'OUT']); // IN untuk modal/pemasukan, OUT untuk pengeluaran
            $table->string('category'); 
            $table->decimal('amount', 15, 2);
            $table->text('description')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_transactions');
    }
};