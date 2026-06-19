<?php

namespace App\Console\Commands;

use App\Models\Promo;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class PromoExpireCheck extends Command
{
    protected $signature = 'promo:expire-check';

    protected $description = 'Periksa dan nonaktifkan promo yang masa berlakunya sudah habis';

    public function handle(): int
    {
        $expired = Promo::sudahExpired()->get();

        if ($expired->isEmpty()) {
            $this->info('Tidak ada promo yang expired.');
            return 0;
        }

        $count = $expired->count();

        foreach ($expired as $promo) {
            $promo->update(['status' => 'nonaktif']);

            Log::info("Promo expired dinonaktifkan: {$promo->kode_promo} (berlaku sampai: {$promo->berlaku_sampai})");
        }

        $this->info("{$count} promo berhasil dinonaktifkan.");

        return 0;
    }
}
