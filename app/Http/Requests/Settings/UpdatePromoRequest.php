<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePromoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_promo' => 'required|string|max:255',
            'kode_promo' => ['nullable', 'string', 'max:20', Rule::unique('promos', 'kode_promo')->ignore($this->route('promo'))],
            'deskripsi' => 'nullable|string',
            'tipe' => 'required|in:persentase,nominal,bundle',
            'nilai_diskon' => 'nullable|numeric|min:0',
            'min_transaksi' => 'nullable|numeric|min:0',
            'max_diskon' => 'nullable|numeric|min:0',
            'berlaku_dari' => 'required|date',
            'berlaku_sampai' => 'required|date|after_or_equal:berlaku_dari',
            'berlaku_di' => 'nullable|string',
            'berlaku_untuk' => 'nullable|string',
            'kuota' => 'nullable|integer|min:0',
            'status' => 'required|in:aktif,nonaktif,habis,kadaluarsa',
        ];
    }
}
