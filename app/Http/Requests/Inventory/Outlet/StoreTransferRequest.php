<?php

namespace App\Http\Requests\Inventory\Outlet;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'outlet_tujuan_id' => 'required|exists:outlets,slug|different:outlet_asal_id',
            'outlet_asal_id' => 'required|exists:outlets,slug',
            'tgl_transfer' => 'required|date',
            'alasan' => 'required|string|in:permintaan,kelebihan stok,larurat',
            'catatan' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_variant_id' => 'required|exists:product_variants,id',
            'items.*.nama' => 'required|string',
            'items.*.ukuran' => 'nullable|string',
            'items.*.warna' => 'nullable|string',
            'items.*.qty' => 'required|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'outlet_tujuan_id.different' => 'Outlet tujuan harus berbeda dari outlet asal.',
            'items.required' => 'Minimal satu item harus ditransfer.',
            'items.*.qty.min' => 'Qty transfer minimal 1.',
        ];
    }
}
