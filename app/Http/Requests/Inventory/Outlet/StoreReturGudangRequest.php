<?php

namespace App\Http\Requests\Inventory\Outlet;

use Illuminate\Foundation\Http\FormRequest;

class StoreReturGudangRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'outlet_id' => 'required|exists:outlets,slug',
            'tgl_retur' => 'required|date',
            'alasan' => 'required|string|in:kelebihan stok,cacat,tidak laku,salah kirim',
            'catatan' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_variant_id' => 'required|exists:product_variants,id',
            'items.*.nama' => 'required|string',
            'items.*.ukuran' => 'nullable|string',
            'items.*.warna' => 'nullable|string',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.catatan' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'alasan.required' => 'Alasan retur wajib diisi.',
            'items.required' => 'Minimal satu item harus diretur.',
        ];
    }
}
