import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { Store, ShieldCheck } from 'lucide-react';
import AvatarInitials from '@/Components/Admin/Settings/KelolAkun/AvatarInitials';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';

export default function Edit({ outlet_nama }) {
    const props = usePage().props;
    const user = props.auth?.user || {};

    const showToast = (message, type = 'success') => {
        if (type === 'success') toast.success(message);
        else toast.error(message);
    };

    const isCashier = user.role === 'cashier';
    const roleLabel = isCashier ? 'Kasir' : 'Admin';
    const roleColor = isCashier
        ? 'bg-amber-100 text-amber-700'
        : 'bg-blue-100 text-blue-700';
    const avatarColor = user.foto_color || '#10B981';

    return (
        <div className="min-h-screen pb-12">
            <Head title="Profil Saya" />

            <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="px-6 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Kelola informasi akun dan keamanan Anda
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto mt-6 space-y-6">
                {/* Kartu Header Profil */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center gap-5">
                    <AvatarInitials name={user.name} color={avatarColor} size={64} />
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-gray-900 truncate">
                            {user.name}
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5 truncate">
                            {user.email}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${roleColor}`}
                            >
                                <ShieldCheck size={13} /> {roleLabel}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold">
                                <Store size={13} /> {outlet_nama || 'Semua Outlet'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Informasi Akun */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="text-base font-bold text-gray-900">Informasi Akun</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Perbarui nama, email, dan nomor telepon Anda
                        </p>
                    </div>
                    <div className="p-5">
                        <UpdateProfileInformationForm
                            onSuccess={() => showToast('Profil berhasil diperbarui')}
                            onError={(errors) =>
                                showToast(Object.values(errors).join(', '), 'error')
                            }
                        />
                    </div>
                </div>

                {/* Ubah Password */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="text-base font-bold text-gray-900">Ubah Password</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Gunakan password minimal 6 karakter yang sulit ditebak
                        </p>
                    </div>
                    <div className="p-5">
                        <UpdatePasswordForm
                            onSuccess={() => showToast('Password berhasil diubah')}
                            onError={(errors) =>
                                showToast(Object.values(errors).join(', '), 'error')
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

Edit.layout = (page) => <AdminLayout>{page}</AdminLayout>;
