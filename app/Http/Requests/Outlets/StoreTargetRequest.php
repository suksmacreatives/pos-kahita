<?php

namespace App\Http\Requests\Outlets;

use Illuminate\Foundation\Http\FormRequest;

class StoreTargetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['admin', 'super-admin']);
    }

    public function rules(): array
    {
        return [
            'targets' => 'required|array',
            'targets.*.outlet_id' => 'required|exists:outlets,id',
            'targets.*.bulan' => 'required|integer|between:1,12',
            'targets.*.tahun' => 'required|integer|min:2020',
            'targets.*.target_omset' => 'required|numeric|min:0',
            'targets.*.target_transaksi' => 'required|integer|min:0',
        ];
    }
}
