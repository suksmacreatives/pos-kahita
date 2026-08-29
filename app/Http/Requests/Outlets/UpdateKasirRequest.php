<?php

namespace App\Http\Requests\Outlets;

use Illuminate\Foundation\Http\FormRequest;

class UpdateKasirRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['admin', 'super-admin']);
    }

    public function rules(): array
    {
        $kasir = $this->route('kasir'); // assuming route parameter is 'kasir'
        $kasirId = $kasir ? $kasir->id : null;

        return [
            'nama' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $kasirId,
            'password' => 'nullable|string|min:6|confirmed',
            'outlet_id' => 'required|exists:outlets,id',
            'shift_default' => 'required|in:pagi,siang,malam,libur',
        ];
    }
}
