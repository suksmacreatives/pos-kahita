<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\StoreAkunRequest;
use App\Http\Requests\Settings\UpdateAkunRequest;
use App\Http\Requests\Settings\StorePromoRequest;
use App\Http\Requests\Settings\UpdatePromoRequest;
use App\Models\Outlet;
use App\Services\Settings\AkunService;
use App\Services\Settings\PromoService;
use App\Services\Settings\LogService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function __construct(
        protected AkunService $akunService,
        protected PromoService $promoService,
        protected LogService $logService,
    ) {}

    public function index(Request $request)
    {
        $tab = $request->get('tab', 'kelola_akun');

        $data = [
            'tab' => $tab,
            'outlet_list' => $request->user()->outlet_id
                ? Outlet::aktif()->where('id', $request->user()->outlet_id)->get(['id', 'name', 'slug'])
                : Outlet::aktif()->get(['id', 'name', 'slug']),
            'roles' => $this->akunService->getRoles(),
            'permissions' => $this->akunService->getPermissions(),
        ];

        if ($tab === 'kelola_akun') {
            $params = $request->only(['search', 'role', 'status']);
            if ($request->user()->outlet_id) {
                $params['outlet_id'] = $request->user()->outlet_id;
            }
            $result = $this->akunService->getAll($params);
            $data['accounts'] = $result['accounts'];
            $data['akun_stats'] = $result['akun_stats'];
        }

        if ($tab === 'promo') {
            $result = $this->promoService->getAll($request->only(['search', 'status', 'tipe']));
            $data['promos'] = $result['promos'];
            $data['promo_stats'] = $result['promo_stats'];
        }

        if ($tab === 'log_aktivitas') {
            $result = $this->logService->getAll($request->only(['aksi', 'modul', 'status', 'user_id', 'outlet_id', 'dari', 'sampai', 'limit']));
            $data['logs'] = $result['logs'];
            $data['log_stats'] = $result['log_stats'];
        }

        return Inertia::render('Admin/Settings', $data);
    }

    // --- AKUN ---

    public function storeAkun(StoreAkunRequest $request)
    {
        $data = $request->validated();
        if ($request->user()->outlet_id) {
            $data['outlet_id'] = $request->user()->outlet_id;
        }

        $user = $this->akunService->create($data);

        $this->logService->log(
            userId: $request->user()->id,
            aksi: 'TAMBAH',
            modul: 'Akun',
            targetId: (string) $user->id,
            targetLabel: $user->name,
        );

        return back()->with('success', 'Akun berhasil ditambahkan');
    }

    public function updateAkun(int $id, UpdateAkunRequest $request)
    {
        $user = $this->akunService->update($id, $request->validated());

        if ($request->user()->outlet_id) {
            abort_if($user->outlet_id !== $request->user()->outlet_id, 403);
        }

        $this->logService->log(
            userId: $request->user()->id,
            aksi: 'EDIT',
            modul: 'Akun',
            targetId: (string) $user->id,
            targetLabel: $user->name,
            detail: ['sebelum' => [], 'sesudah' => $request->validated()],
        );

        return back()->with('success', 'Perubahan akun disimpan');
    }

    public function toggleStatusAkun(int $id, Request $request)
    {
        $user = \App\Models\User::findOrFail($id);
        if ($request->user()->outlet_id) {
            abort_if($user->outlet_id !== $request->user()->outlet_id, 403);
        }

        $user = $this->akunService->toggleStatus($id);

        $this->logService->log(
            userId: $request->user()->id,
            aksi: 'EDIT',
            modul: 'Akun',
            targetId: (string) $user->id,
            targetLabel: $user->name,
            detail: ['status_baru' => $user->status],
        );

        return back()->with('success', "Status akun {$user->name} diubah");
    }

    public function suspendAkun(int $id, Request $request)
    {
        $user = \App\Models\User::findOrFail($id);
        if ($request->user()->outlet_id) {
            abort_if($user->outlet_id !== $request->user()->outlet_id, 403);
        }

        $user = $this->akunService->suspend($id);

        $this->logService->log(
            userId: $request->user()->id,
            aksi: 'EDIT',
            modul: 'Akun',
            targetId: (string) $user->id,
            targetLabel: $user->name,
            detail: ['status_baru' => 'nonaktif'],
        );

        return back()->with('success', 'Akun berhasil disuspend');
    }

    public function destroyAkun(int $id, Request $request)
    {
        $user = \App\Models\User::find($id);
        if (!$user) {
            return back()->with('error', 'Akun tidak ditemukan');
        }
        if ($request->user()->outlet_id) {
            abort_if($user->outlet_id !== $request->user()->outlet_id, 403);
        }

        $name = $user->name;
        $this->akunService->delete($id);

        if ($name) {
            $this->logService->log(
                userId: $request->user()->id,
                aksi: 'HAPUS',
                modul: 'Akun',
                targetLabel: $name,
            );
        }

        return back()->with('success', 'Akun berhasil dihapus');
    }

    public function resetPasswordAkun(int $id, Request $request)
    {
        $user = \App\Models\User::findOrFail($id);
        if ($request->user()->outlet_id) {
            abort_if($user->outlet_id !== $request->user()->outlet_id, 403);
        }

        $password = $this->akunService->resetPassword($id);
        $user = \App\Models\User::find($id);

        $this->logService->log(
            userId: $request->user()->id,
            aksi: 'UBAH_PASSWORD',
            modul: 'Akun',
            targetId: (string) $id,
            targetLabel: $user?->name,
        );

        return back()->with('success', "Password untuk {$user?->name} berhasil direset");
    }

    // --- PROMO ---

    public function storePromo(StorePromoRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = $request->user()->id;
        $promo = $this->promoService->create($data);

        $this->logService->log(
            userId: $request->user()->id,
            aksi: 'TAMBAH',
            modul: 'Promo',
            targetId: (string) $promo->id,
            targetLabel: $promo->nama_promo,
        );

        return back()->with('success', 'Promo berhasil dibuat');
    }

    public function updatePromo(int $id, UpdatePromoRequest $request)
    {
        $promo = $this->promoService->update($id, $request->validated());

        $this->logService->log(
            userId: $request->user()->id,
            aksi: 'EDIT',
            modul: 'Promo',
            targetId: (string) $promo->id,
            targetLabel: $promo->nama_promo,
        );

        return back()->with('success', 'Perubahan promo disimpan');
    }

    public function toggleStatusPromo(int $id, Request $request)
    {
        $promo = $this->promoService->toggleStatus($id);

        $this->logService->log(
            userId: $request->user()->id,
            aksi: 'EDIT',
            modul: 'Promo',
            targetId: (string) $promo->id,
            targetLabel: $promo->nama_promo,
        );

        return back()->with('success', "Status promo {$promo->kode_promo} diubah");
    }

    public function duplicatePromo(int $id, Request $request)
    {
        $promo = $this->promoService->duplicate($id);
        $promo->update(['created_by' => $request->user()->id]);

        $this->logService->log(
            userId: $request->user()->id,
            aksi: 'TAMBAH',
            modul: 'Promo',
            targetId: (string) $promo->id,
            targetLabel: $promo->nama_promo,
        );

        return back()->with('success', 'Duplikat promo berhasil');
    }

    public function destroyPromo(int $id, Request $request)
    {
        $promo = \App\Models\Promo::find($id);
        $name = $promo?->nama_promo;
        $this->promoService->delete($id);

        if ($name) {
            $this->logService->log(
                userId: $request->user()->id,
                aksi: 'HAPUS',
                modul: 'Promo',
                targetId: (string) $id,
                targetLabel: $name,
            );
        }

        return back()->with('success', 'Promo berhasil dihapus');
    }

    public function generateKodePromo()
    {
        return response()->json([
            'kode' => $this->promoService->generateCode(),
        ]);
    }

    // --- LOG ---

    public function exportLog(Request $request)
    {
        $result = $this->logService->getAll($request->only(['aksi', 'modul', 'status', 'user_id', 'outlet_id', 'dari', 'sampai', 'limit']));

        $this->logService->log(
            userId: $request->user()->id,
            aksi: 'EXPORT',
            modul: 'Settings',
            detail: ['count' => count($result['logs'])],
        );

        return response()->json($result['logs']);
    }
}
