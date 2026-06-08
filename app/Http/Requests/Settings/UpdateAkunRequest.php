<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAkunRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($this->route('akun'))],
            'password' => 'nullable|string|min:6',
            'telp' => 'nullable|string|max:20',
            'role' => 'required|in:admin,cashier',
            'outlet_id' => 'nullable|exists:outlets,id',
            'status' => 'required|in:aktif,nonaktif',
            'foto_color' => 'nullable|string|max:9',
        ];
    }
}
