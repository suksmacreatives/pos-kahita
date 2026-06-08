<?php

namespace App\Http\Requests\Outlets;

use Illuminate\Foundation\Http\FormRequest;

class StoreOutletRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['admin', 'super-admin']);
    }

    public function rules(): array
    {
        return [
            'kode' => 'required|string|unique:outlets,kode|max:255',
            'name' => 'required|string|max:255', // frontend using nama? Ensure backend uses 'name' based on migration
            'warna' => 'nullable|string|max:255',
            'address' => 'required|string|max:255',
            'kota' => 'required|string|max:255',
            'provinsi' => 'required|string|max:255',
            'kode_pos' => 'required|string|max:255',
            'phone' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'manajer_id' => 'nullable|exists:users,id',
            'tipe' => 'required|in:flagship,cabang,kiosk',
            'luas_m2' => 'nullable|integer|min:0',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ];
    }
}
