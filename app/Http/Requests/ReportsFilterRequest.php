<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReportsFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kategori' => 'nullable|in:penjualan,produk,inventori,kasir,keuangan',
            'sub'      => 'nullable|string',
            'dari'     => 'nullable|date',
            'sampai'   => 'nullable|date|after_or_equal:dari',
            'outlet'   => 'nullable|string',
            'bandingkan' => 'nullable|in:prev_period,last_month,last_year,none',
            'format'   => 'nullable|in:pdf,excel',
            'top_n'    => 'nullable|integer|in:10,20,50',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'kategori'   => $this->input('kategori', 'penjualan'),
            'sub'        => $this->input('sub', $this->defaultSub($this->input('kategori', 'penjualan'))),
            'dari'       => $this->input('dari', now()->startOfMonth()->format('Y-m-d')),
            'sampai'     => $this->input('sampai', now()->format('Y-m-d')),
            'outlet'     => $this->input('outlet', 'all'),
            'bandingkan' => $this->input('bandingkan', 'prev_period'),
        ]);
    }

    private function defaultSub(string $kategori): string
    {
        return match ($kategori) {
            'penjualan' => 'ringkasan-omset',
            'produk'    => 'produk-terlaris',
            'inventori' => 'mutasi-stok',
            'kasir'     => 'performa-kasir',
            'keuangan'  => 'laba-rugi',
            default     => 'ringkasan-omset',
        };
    }
}
