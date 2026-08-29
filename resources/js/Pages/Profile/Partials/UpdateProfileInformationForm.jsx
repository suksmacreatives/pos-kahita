import React from 'react';
import { useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformationForm({ onSuccess, onError }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, clearErrors } = useForm({
        name: user.name || '',
        email: user.email || '',
        telp: user.telp || '',
    });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            onSuccess: () => {
                clearErrors();
                onSuccess?.();
            },
            onError: (errs) => onError?.(errs),
        });
    };

    const inputClass =
        'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500';
    const labelClass = 'block text-xs font-semibold text-gray-700 mb-1.5';

    return (
        <form onSubmit={submit} className="space-y-5">
            <div>
                <label htmlFor="name" className={labelClass}>
                    Nama Lengkap
                </label>
                <input
                    id="name"
                    className={inputClass}
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                    autoComplete="name"
                />
                {errors.name && (
                    <p className="text-xs text-red-600 mt-1.5">{errors.name}</p>
                )}
            </div>

            <div>
                <label htmlFor="email" className={labelClass}>
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    className={inputClass}
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    required
                    autoComplete="username"
                />
                {errors.email && (
                    <p className="text-xs text-red-600 mt-1.5">{errors.email}</p>
                )}
            </div>

            <div>
                <label htmlFor="telp" className={labelClass}>
                    No. Telepon
                </label>
                <input
                    id="telp"
                    type="tel"
                    className={inputClass}
                    value={data.telp}
                    onChange={(e) => setData('telp', e.target.value)}
                    placeholder="Contoh: 081234567890"
                    autoComplete="tel"
                />
                {errors.telp && (
                    <p className="text-xs text-red-600 mt-1.5">{errors.telp}</p>
                )}
            </div>

            <div className="flex items-center gap-3 pt-1">
                <button
                    type="submit"
                    disabled={processing}
                    className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
            </div>
        </form>
    );
}
