<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
\Illuminate\Support\Facades\Schema::table('outlets', function($table){
    $cols = ['kode', 'slug', 'warna', 'warna_hex', 'kota', 'provinsi', 'kode_pos', 'latitude', 'longitude', 'email', 'manajer_id', 'status', 'tipe', 'luas_m2', 'dibuka_sejak', 'foto_color', 'foto_icon', 'jam_operasional', 'konfigurasi'];
    foreach ($cols as $col) {
        if (\Illuminate\Support\Facades\Schema::hasColumn('outlets', $col)) {
            if ($col === 'manajer_id') {
                try { $table->dropForeign(['manajer_id']); } catch (\Exception $e) {}
            }
            $table->dropColumn($col);
        }
    }
});
