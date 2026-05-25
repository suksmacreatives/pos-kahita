<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Outlet extends Model
{
    use HasFactory;

    // Menentukan kolom apa saja yang boleh diisi data
    protected $fillable = ['name', 'address', 'phone'];

    /**
     * Relasi ke tabel Users (Satu outlet bisa memiliki banyak staf/user)
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }
}