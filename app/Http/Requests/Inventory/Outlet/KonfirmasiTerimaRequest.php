<?php

namespace App\Http\Requests\Inventory\Outlet;

use Illuminate\Foundation\Http\FormRequest;

class KonfirmasiTerimaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:distribution_order_items,id',
            'items.*.qty_terima' => 'required|integer|min:0',
            'items.*.kondisi' => 'required|in:baik,rusak',
            'items.*.catatan' => 'nullable|string|max:500',
            'penerima' => 'nullable|string|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Item penerimaan harus diisi.',
            'items.*.qty_terima.required' => 'Qty terima setiap item wajib diisi.',
            'items.*.qty_terima.integer' => 'Qty terima harus angka.',
            'items.*.kondisi.in' => 'Kondisi barang harus baik atau rusak.',
        ];
    }
}
