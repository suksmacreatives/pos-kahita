<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->string('color')->nullable()->change();
        });

        DB::table('product_variants')
            ->whereNotNull('color')
            ->orderBy('id')
            ->chunk(100, function ($variants) {
                foreach ($variants as $v) {
                    $decoded = json_decode($v->color, true);
                    $plain = null;
                    if (is_array($decoded)) {
                        $plain = $decoded['nama'] ?? null;
                    } elseif (is_string($decoded)) {
                        $plain = $decoded;
                    }
                    if ($plain !== null && $plain !== $v->color) {
                        DB::table('product_variants')
                            ->where('id', $v->id)
                            ->update(['color' => $plain]);
                    }
                }
            });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->json('color')->nullable()->change();
        });
    }
};
