import React, { useRef } from 'react';
import { useForm } from '@inertiajs/react';

export default function UpdatePasswordForm({ onError }) {
    const currentPasswordInput = useRef();
    const passwordInput = useRef();

    const { data, setData, put, reset, errors, processing, clearErrors } =
        useForm({
            current_password: '',
            password: '',
            password_confirmation: '',
        });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
            },
            onError: (errs) => {
                onError?.(errs);

                if (errs.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errs.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    const inputClass =
        'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500';
    const labelClass = 'block text-xs font-semibold text-gray-700 mb-1.5';

    return (
        <form onSubmit={updatePassword} className="space-y-5">
            <div>
                <label htmlFor="current_password" className={labelClass}>
                    Password Saat Ini
                </label>
                <input
                    id="current_password"
                    ref={currentPasswordInput}
                    type="password"
                    className={inputClass}
                    value={data.current_password}
                    onChange={(e) =>
                        setData('current_password', e.target.value)
                    }
                    autoComplete="current-password"
                />
                {errors.current_password && (
                    <p className="text-xs text-red-600 mt-1.5">
                        {errors.current_password}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="password" className={labelClass}>
                    Password Baru
                </label>
                <input
                    id="password"
                    ref={passwordInput}
                    type="password"
                    className={inputClass}
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    autoComplete="new-password"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                    Minimal 8 karakter
                </p>
                {errors.password && (
                    <p className="text-xs text-red-600 mt-1.5">
                        {errors.password}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="password_confirmation" className={labelClass}>
                    Konfirmasi Password Baru
                </label>
                <input
                    id="password_confirmation"
                    type="password"
                    className={inputClass}
                    value={data.password_confirmation}
                    onChange={(e) =>
                        setData('password_confirmation', e.target.value)
                    }
                    autoComplete="new-password"
                />
                {errors.password_confirmation && (
                    <p className="text-xs text-red-600 mt-1.5">
                        {errors.password_confirmation}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-3 pt-1">
                <button
                    type="submit"
                    disabled={processing}
                    className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                    {processing ? 'Menyimpan...' : 'Ubah Password'}
                </button>
            </div>
        </form>
    );
}
