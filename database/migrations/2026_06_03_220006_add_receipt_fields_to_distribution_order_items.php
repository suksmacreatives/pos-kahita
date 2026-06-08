<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('distribution_order_items', function (Blueprint $table) {
            $table->integer('qty_terima')->default(0)->after('qty');
            $table->string('kondisi')->default('baik')->after('qty_terima');
            $table->text('catatan')->nullable()->after('kondisi');
        });
    }

    public function down(): void
    {
        Schema::table('distribution_order_items', function (Blueprint $table) {
            $table->dropColumn(['qty_terima', 'kondisi', 'catatan']);
        });
    }
};
