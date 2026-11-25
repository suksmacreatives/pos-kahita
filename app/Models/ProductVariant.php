<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductVariant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_id',
        'color',
        'size',
        'stock',
        'sku',
        'original_sku',
        'archived_at',
        'price',
        'cost_price',
    ];

    protected $casts = [
        'color' => 'string',
    ];

    public function getBarcodeCodeAttribute(): string
    {
        return $this->attributes['barcode_code']
            ?? 'V'.str_pad((string) $this->id, 6, '0', STR_PAD_LEFT);
    }

    /**
     * HPP efektif sebuah varian: `product_variants.cost_price` kalau diisi,
     * lalu jatuh ke `products.cost_price` sebagai harga beli default produk.
     *
     * Varian adalah satuan yang menyimpan stok dan harga jual, jadi nilai stok
     * di seluruh aplikasi harus dihitung dari angka ini supaya tidak ada dua
     * sumber HPP yang berbeda.
     */
    public static function hppEfektif(?int $hppVarian, ?int $hppProduk): int
    {
        return (int) ($hppVarian ?? $hppProduk ?? 0);
    }

    /**
     * Ekspresi SQL HPP efektif untuk query yang sudah join `product_variants`
     * dan `products`.
     */
    public static function exprHppEfektif(string $prefixVarian = 'product_variants', string $prefixProduk = 'products'): string
    {
        return "COALESCE({$prefixVarian}.cost_price, {$prefixProduk}.cost_price, 0)";
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function outletStocks()
    {
        return $this->hasMany(OutletStock::class, 'product_variant_id');
    }
}
