<?php

namespace App\Http\Requests\Inventory\Outlet;

use Illuminate\Foundation\Http\FormRequest;

class SubmitOpnameOutletRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_variant_id' => 'required|exists:product_variants,id',
            'items.*.nama' => 'required|string',
            'items.*.ukuran' => 'nullable|string',
            'items.*.warna' => 'nullable|string',
            'items.*.stok_sistem' => 'required|integer|min:0',
            'items.*.stok_fisik' => 'required|integer|min:0',
            'items.*.keterangan' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Data item opname wajib diisi.',
            'items.*.stok_fisik.required' => 'Stok fisik setiap item wajib diisi.',
        ];
    }
}
