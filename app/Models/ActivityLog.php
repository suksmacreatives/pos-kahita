<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'aksi',
        'modul',
        'target_id',
        'target_label',
        'detail',
        'ip_address',
        'device',
        'status',
        'error_msg',
    ];

    protected function casts(): array
    {
        return [
            'detail' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
