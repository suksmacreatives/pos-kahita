<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('printer_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('outlet_id')->constrained('outlets')->onDelete('cascade');
            $table->string('printer_name');        
            $table->enum('connection_type', ['usb', 'bluetooth', 'network']); 
            $table->string('printer_address');     
            $table->integer('paper_width_mm')->default(58); 
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('printer_settings');
    }
};