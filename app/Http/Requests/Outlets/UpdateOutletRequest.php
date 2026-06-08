<?php

namespace App\Http\Requests\Outlets;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOutletRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['admin', 'super-admin']);
    }

    public function rules(): array
    {
        $outlet = $this->route('outlet');
        $outletId = is_numeric($outlet) ? $outlet : null;

        return [
            'kode' => 'required|string|max:255|unique:outlets,kode,' . $outletId,
            'name' => 'required|string|max:255', 
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
            'status' => 'nullable|in:aktif,nonaktif',
            'konfigurasi' => 'nullable|array',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ];
    }
}
