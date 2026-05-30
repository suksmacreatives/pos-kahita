<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {

            $table->bigInteger('cash_received')
                ->default(0)
                ->after('payment_method');

            $table->bigInteger('change_amount')
                ->default(0)
                ->after('cash_received');

            $table->timestamp('voided_at')
                ->nullable()
                ->after('status');

            $table->foreignId('void_by')
                ->nullable()
                ->after('voided_at')
                ->constrained('users')
                ->onDelete('set null');

            $table->text('void_reason')
                ->nullable()
                ->after('void_by');

        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {

            $table->dropForeign(['void_by']);

            $table->dropColumn([
                'cash_received',
                'change_amount',
                'voided_at',
                'void_by',
                'void_reason'
            ]);

        });
    }
};