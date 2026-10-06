<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'outlet_id',
        'category_id',
        'name',
        'sku',
        'original_sku',
        'price',
        'cost_price',
        'description',
        'image',
        'sub_kategori',
        'status',
        'outlet_ids',
    ];

    protected $casts = [
        'outlet_ids' => 'array',
    ];

    public function getBarcodeCodeAttribute(): string
    {
        return $this->attributes['barcode_code']
            ?? 'P'.str_pad((string) $this->id, 6, '0', STR_PAD_LEFT);
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function outlets()
    {
        return $this->belongsToMany(Outlet::class, 'outlet_product');
    }

    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * Batasi produk ke satu outlet.
     *
     * Satu-satunya definisi "produk ini tersedia di outlet X" untuk seluruh
     * aplikasi. Sebelumnya pola ini disalin ke banyak tempat dan tidak
     * konsisten: sebagian hanya mengecek `outlet_ids`, sebagian menambah
     * `outlet_id`, dan beberapa salah menulis OR tanpa closure sehingga filter
     * lain (mis. kategori) bocor ke cabang yang tidak dikehendai.
     *
     * `outlet_ids` adalah sumber utama karena bertambah otomatis saat barang
     * diterima outlet ( InventoriOutletService::konfirmasiTerima). `outlet_id`
     * tetap dipertahankan sebagai fallback untuk produk lama yang JSON-nya null.
     *
     * Cabang ketiga adalah PENGAMAN BACA atas SATU DEFINISI outlet berstok
     * (lihat App\Support\RegistrasiOutlet): outlet aktif dengan minimal satu
     * varian aktif stok != 0. Tanpa cabang ini, data lama yang belum termigrasi
     * atau jalur penulis yang lolos dari observer membuat produk berstok hilang
     * dari POS — stok hantu yang tidak bisa dijual. Cabang ini hanya menyala
     * saat outlet_ids tertinggal; setelah sinkron ia tidak mengubah perilaku.
     *
     * Nilainya dibandingkan sebagai string karena `outlet_ids` disimpan sebagai
     * JSON array of string dan MySQL membandingkan JSON secara ketat tipe.
     *
     * @param  int|string|null  $outletId
     */
    public function scopeTersediaDiOutlet($query, $outletId)
    {
        if (blank($outletId)) {
            return $query;
        }

        return $query->where(function ($q) use ($outletId) {
            $q->where('products.outlet_id', $outletId)
                ->orWhereJsonContains('products.outlet_ids', (string) $outletId)
                ->orWhereHas('variants.outletStocks', function ($stok) use ($outletId) {
                    $stok->where('outlet_id', $outletId)
                        ->where('stock', '!=', 0)
                        ->whereHas('outlet', fn ($outlet) => $outlet->where('status', 'aktif'));
                });
        });
    }
}
