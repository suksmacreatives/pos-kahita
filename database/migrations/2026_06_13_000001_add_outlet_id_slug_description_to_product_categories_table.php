<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_categories', function (Blueprint $table) {
            $table->foreignId('outlet_id')
                ->nullable()
                ->after('id')
                ->constrained('outlets')
                ->onDelete('cascade');

            $table->string('slug')
                ->nullable()
                ->after('name')
                ->unique();

            $table->text('description')
                ->nullable()
                ->after('slug');
        });
    }

    public function down(): void
    {
        Schema::table('product_categories', function (Blueprint $table) {
            $table->dropForeign(['outlet_id']);
            $table->dropColumn(['outlet_id', 'slug', 'description']);
        });
    }
};
