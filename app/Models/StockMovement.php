<?php

namespace App\Models;

use App\Notifications\LowStockNotification;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    protected $fillable = [
        'product_variant_id',
        'outlet_id',
        'type',
        'reference_type',
        'reference_id',
        'qty',
        'note',
        'user_id',
    ];

    protected static function booted()
    {
        static::created(function (self $movement) {
            if (in_array($movement->type, ['sale', 'adjustment_minus', 'rusak'])) {
                $movement->checkLowStock();
            }
        });
    }

    public function checkLowStock(): void
    {
        $variant = $this->productVariant;
        if (!$variant) return;

        $product = $variant->product;
        if (!$product || $product->status !== 'aktif') return;

        if ($variant->stock > 0 && $variant->stock <= 5) {
            $this->sendLowStockNotification('danger', $product->name, $variant->stock, $variant->size ?? '');
        } elseif ($variant->stock > 5 && $variant->stock < 10) {
            $this->sendLowStockNotification('warning', $product->name, $variant->stock, $variant->size ?? '');
        }
    }

    protected function sendLowStockNotification(string $severity, string $productName, int $stock, string $variantLabel): void
    {
        $outletName = '';
        if ($this->outlet_id) {
            $outlet = Outlet::find($this->outlet_id);
            $outletName = $outlet ? " di {$outlet->name}" : '';
        }

        $detail = $variantLabel ? " ({$variantLabel})" : '';

        $users = User::whereIn('role', ['admin', 'owner'])->where('status', 'aktif')->get();

        foreach ($users as $user) {
            $user->notify(new LowStockNotification([
                'title'    => 'Stok Menipis',
                'message'  => "{$productName}{$detail} tersisa {$stock} pcs{$outletName}",
                'link'     => '/admin/gudang',
                'icon'     => 'package',
                'severity' => $severity,
            ]));
        }
    }

    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
