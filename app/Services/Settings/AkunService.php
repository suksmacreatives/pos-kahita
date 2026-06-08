<?php

namespace App\Services\Settings;

use App\Models\User;
use App\Models\Outlet;
use Illuminate\Support\Facades\Hash;

class AkunService
{
    public function getAll(array $filters = []): array
    {
        $query = User::with('outlet:id,name');

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                  ->orWhere('email', 'like', "%{$filters['search']}%");
            });
        }

        if (!empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $users = $query->orderBy('created_at', 'desc')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'nama' => $user->name,
                'email' => $user->email,
                'telp' => $user->telp,
                'foto_color' => $user->foto_color ?? $this->generateColor($user->name),
                'role' => $this->normalizeRole($user->role),
                'outlet_id' => $user->outlet_id,
                'outlet_nama' => $user->outlet?->name,
                'status' => $user->status,
                'last_login' => $user->last_login_at ?? $user->created_at,
                'created_at' => $user->created_at,
            ];
        });

        $stats = $this->computeStats($users);

        return [
            'accounts' => $users->values()->toArray(),
            'akun_stats' => $stats,
        ];
    }

    public function find(int $id): array
    {
        $user = User::with('outlet:id,name')->findOrFail($id);

        return [
            'id' => $user->id,
            'nama' => $user->name,
            'email' => $user->email,
            'telp' => $user->telp,
            'foto_color' => $user->foto_color ?? $this->generateColor($user->name),
            'role' => $this->normalizeRole($user->role),
            'outlet_id' => $user->outlet_id,
            'outlet_nama' => $user->outlet?->name,
            'status' => $user->status,
            'last_login' => $user->last_login_at ?? $user->created_at,
            'created_at' => $user->created_at,
        ];
    }

    public function create(array $data): User
    {
        $data['password'] = Hash::make($data['password'] ?? 'password');
        $data['foto_color'] = $data['foto_color'] ?? $this->generateColor($data['name']);

        return User::create($data);
    }

    public function update(int $id, array $data): User
    {
        $user = User::findOrFail($id);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return $user;
    }

    public function toggleStatus(int $id): User
    {
        $user = User::findOrFail($id);
        $user->update(['status' => $user->status === 'aktif' ? 'nonaktif' : 'aktif']);

        return $user;
    }

    public function suspend(int $id): User
    {
        $user = User::findOrFail($id);
        $user->update(['status' => 'nonaktif']);

        return $user;
    }

    public function delete(int $id): void
    {
        User::findOrFail($id)->delete();
    }

    public function resetPassword(int $id): string
    {
        $password = 'password';
        $user = User::findOrFail($id);
        $user->update(['password' => Hash::make($password)]);

        return $password;
    }

    public function getRoles(): array
    {
        return [
            ['id' => 'admin', 'label' => 'Admin', 'color' => 'blue', 'deskripsi' => 'Akses penuh ke semua fitur'],
            ['id' => 'cashier', 'label' => 'Kasir', 'color' => 'amber', 'deskripsi' => 'Transaksi kasir saja'],
        ];
    }

    public function getPermissions(): array
    {
        return [
            'dashboard' => ['view' => true, 'edit' => false],
            'products' => ['view' => true, 'edit' => false],
            'inventory' => ['view' => true, 'edit' => false],
            'transactions' => ['view' => true, 'void' => false, 'refund' => false],
            'reports' => ['view' => false, 'export' => false],
            'settings' => ['view' => false, 'edit' => false],
        ];
    }

    private function computeStats($users): array
    {
        $all = $users->collect();

        return [
            'total' => $all->count(),
            'aktif' => $all->where('status', 'aktif')->count(),
            'kasir' => $all->where('role', 'cashier')->count(),
            'nonaktif_suspended' => $all->where('status', '!=', 'aktif')->count(),
        ];
    }

    private function normalizeRole(?string $role): string
    {
        return $role ?? 'cashier';
    }

    private function generateColor(string $name): string
    {
        $colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1'];
        $index = crc32($name) % count($colors);

        return $colors[abs($index)];
    }
}
