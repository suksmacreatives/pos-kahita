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
            'mulai' => 'sometimes|boolean',
        ];
    }
}
