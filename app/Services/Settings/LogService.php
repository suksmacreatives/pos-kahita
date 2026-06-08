<?php

namespace App\Services\Settings;

use App\Models\ActivityLog;
use App\Models\User;

class LogService
{
    public function getAll(array $filters = []): array
    {
        $query = ActivityLog::with('user:id,name,role,outlet_id')->orderBy('created_at', 'desc');

        if (!empty($filters['aksi'])) {
            $query->where('aksi', $filters['aksi']);
        }

        if (!empty($filters['modul'])) {
            $query->where('modul', $filters['modul']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['outlet_id'])) {
            $query->whereHas('user', function ($q) use ($filters) {
                $q->where('outlet_id', $filters['outlet_id']);
            });
        }

        if (!empty($filters['dari'])) {
            $query->where('created_at', '>=', $filters['dari']);
        }

        if (!empty($filters['sampai'])) {
            $query->where('created_at', '<=', $filters['sampai'] . ' 23:59:59');
        }

        $limit = min((int) ($filters['limit'] ?? 100), 500);
        $logs = $query->limit($limit)->get()->map(function ($log) {
            return [
                'id' => $log->id,
                'timestamp' => $log->created_at,
                'user_id' => $log->user_id,
                'user_nama' => $log->user?->name,
                'user_role' => $log->user?->role,
                'outlet_id' => $log->user?->outlet_id,
                'outlet_nama' => $log->user?->outlet?->name,
                'aksi' => $log->aksi,
                'modul' => $log->modul,
                'target_id' => $log->target_id,
                'target_label' => $log->target_label,
                'detail' => $log->detail,
                'ip_address' => $log->ip_address,
                'device' => $log->device,
                'status' => $log->status,
                'error_msg' => $log->error_msg,
            ];
        });

        $stats = $this->computeStats($logs, $filters);

        return [
            'logs' => $logs->values()->toArray(),
            'log_stats' => $stats,
        ];
    }

    public function log(
        int $userId,
        string $aksi,
        string $modul,
        ?string $targetId = null,
        ?string $targetLabel = null,
        ?array $detail = null,
        ?string $ipAddress = null,
        ?string $device = null,
        string $status = 'sukses',
        ?string $errorMsg = null
    ): ActivityLog {
        return ActivityLog::create([
            'user_id' => $userId,
            'aksi' => $aksi,
            'modul' => $modul,
            'target_id' => $targetId,
            'target_label' => $targetLabel,
            'detail' => $detail,
            'ip_address' => $ipAddress ?? request()->ip(),
            'device' => $device ?? $this->detectDevice(),
            'status' => $status,
            'error_msg' => $errorMsg,
        ]);
    }

    private function computeStats($logs, array $filters = []): array
    {
        $all = $logs->collect();
        $today = now()->format('Y-m-d');

        $todayLogs = $all->filter(function ($l) use ($today) {
            $ts = is_string($l['timestamp']) ? $l['timestamp'] : $l['timestamp']?->format('Y-m-d');
            return $ts && str_starts_with($ts, $today);
        });

        $userActivity = $todayLogs->groupBy('user_nama')->map->count();
        $topUser = $userActivity->sortDesc()->take(1);

        return [
            'total_hari_ini' => $todayLogs->count(),
            'login_hari_ini' => $todayLogs->where('aksi', 'LOGIN')->count(),
            'gagal_hari_ini' => $todayLogs->where('status', 'gagal')->count(),
            'user_teraktif' => [
                'nama' => $topUser->keys()->first() ?? 'Tidak ada',
                'count' => $topUser->first() ?? 0,
            ],
        ];
    }

    private function detectDevice(): string
    {
        $agent = request()->userAgent();
        if (str_contains($agent, 'Mobile')) return 'mobile';
        if (str_contains($agent, 'Tablet')) return 'tablet';
        return 'desktop';
    }
}
