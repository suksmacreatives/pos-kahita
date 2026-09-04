<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('distribution_orders', function (Blueprint $table) {
            $table->string('tipe_tujuan')->nullable()->default('outlet')->after('outlet_id');
            $table->foreignId('online_shop_id')->nullable()->after('tipe_tujuan')
                ->constrained('online_shops')->onDelete('set null');
            $table->foreignId('outlet_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('distribution_orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('online_shop_id');
            $table->dropColumn('tipe_tujuan');
            $table->foreignId('outlet_id')->nullable(false)->change();
        });
    }
};
