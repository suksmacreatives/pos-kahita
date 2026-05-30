<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hold_transactions', function (Blueprint $table) {

            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');

            $table->foreignId('outlet_id')
                ->constrained('outlets')
                ->onDelete('cascade');

            $table->string('customer_name')->nullable();

            $table->longText('cart_data');

            $table->bigInteger('total');

            $table->timestamps();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hold_transactions');
    }
};