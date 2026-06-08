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
        Schema::table('outlets', function (Blueprint $table) {
            $table->string('kode')->unique()->nullable()->after('id');
            $table->string('slug')->unique()->nullable()->after('name'); // name was already there
            $table->string('warna')->nullable()->after('name');
            $table->string('warna_hex')->nullable()->after('warna');
            $table->string('kota')->nullable()->after('address');
            $table->string('provinsi')->nullable()->after('kota');
            $table->string('kode_pos')->nullable()->after('provinsi');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('email')->nullable();
            $table->foreignId('manajer_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->enum('tipe', ['flagship', 'cabang', 'kiosk'])->default('cabang');
            $table->integer('luas_m2')->nullable();
            $table->dateTime('dibuka_sejak')->nullable();
            $table->string('foto_color')->nullable();
            $table->string('foto_icon')->nullable();
            $table->json('jam_operasional')->nullable();
            $table->json('konfigurasi')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('outlets', function (Blueprint $table) {
            $table->dropForeign(['manajer_id']);
            $table->dropColumn([
                'kode', 'slug', 'warna', 'warna_hex', 'provinsi', 'kota', 'kode_pos',
                'latitude', 'longitude', 'email', 'manajer_id', 'status', 'tipe',
                'luas_m2', 'dibuka_sejak', 'foto_color', 'foto_icon', 'jam_operasional', 'konfigurasi'
            ]);
        });
    }
};
