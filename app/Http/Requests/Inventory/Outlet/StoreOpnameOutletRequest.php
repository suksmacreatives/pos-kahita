<?php

namespace App\Http\Requests\Inventory\Outlet;

use Illuminate\Foundation\Http\FormRequest;

class StoreOpnameOutletRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'outlet_id' => 'required|exists:outlets,slug',
            'petugas' => 'required|string|max:100',
            'scope' => 'nullable|string',
            'items' => 'sometimes|array|min:1',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.product_variant_id' => 'required_with:items|exists:product_variants,id',
            'items.*.nama' => 'required_with:items|string',
            'items.*.ukuran' => 'nullable|string',
            'items.*.warna' => 'nullable|string',
            'items.*.stok_sistem' => 'required_with:items|integer|min:0',
            'items.*.stok_fisik' => 'required_with:items|integer|min:0',
            'items.*.keterangan' => 'nullable|string|max:500',
        ];
    }
}
