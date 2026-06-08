<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('transactions', 'discount')) {
                $table->bigInteger('discount')->default(0)->after('subtotal');
            }
            if (!Schema::hasColumn('transactions', 'tax')) {
                $table->bigInteger('tax')->default(0)->after('discount');
            }
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            if (Schema::hasColumn('transactions', 'tax')) {
                $table->dropColumn('tax');
            }
            if (Schema::hasColumn('transactions', 'discount')) {
                $table->dropColumn('discount');
            }
        });
    }
};
