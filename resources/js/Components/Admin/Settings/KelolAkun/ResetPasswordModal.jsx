import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from '@inertiajs/react';
import { X, KeyRound, AlertTriangle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AvatarInitials from './AvatarInitials';

export default function ResetPasswordModal({ isOpen, data, onClose }) {
    const {
        data: form,
        setData,
        post,
        errors,
        processing,
        setError,
        clearErrors,
        reset,
    } = useForm({
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (isOpen) {
            reset();
            clearErrors();
        }
    }, [isOpen]);

    if (!isOpen || !data) return null;

    const handleChange = (name, value) => {
        setData(name, value);
        clearErrors(name);

        if (name === 'password' && form.password_confirmation) {
            if (value !== form.password_confirmation) {
                setError('password_confirmation', 'Konfirmasi password tidak cocok');
            } else {
                clearErrors('password_confirmation');
            }
        } else if (name === 'password_confirmation') {
            if (value && value !== form.password) {
                setError('password_confirmation', 'Konfirmasi password tidak cocok');
            } else {
                clearErrors('password_confirmation');
            }
        }
    };

    const submit = (e) => {
        e.preventDefault();

        let hasError = false;
        if (!form.password) {
            setError('password', 'Password baru wajib diisi');
            hasError = true;
        } else if (form.password.length < 6) {
            setError('password', 'Password minimal 6 karakter');
            hasError = true;
        }
        if (!form.password_confirmation) {
            setError('password_confirmation', 'Konfirmasi password wajib diisi');
            hasError = true;
        } else if (form.password !== form.password_confirmation) {
            setError('password_confirmation', 'Konfirmasi password tidak cocok');
            hasError = true;
        }
        if (hasError) return;

        post(route('admin.settings.akun.reset-password', data.id), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Password berhasil di-reset');
                onClose();
            },
            onError: (errs) => {
                toast.error(Object.values(errs).join(', '));
            },
        });
    };

    const passwordsMatch =
        form.password &&
        form.password_confirmation &&
        form.password === form.password_confirmation;

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <KeyRound size={20} className="text-blue-500" /> Reset Password
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={submit} noValidate className="p-6 flex-1 space-y-5">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <AvatarInitials name={data.nama} color={data.foto_color} size={44} />
                        <div className="min-w-0">
                            <div className="text-sm font-bold text-gray-900 truncate">{data.nama}</div>
                            <div className="text-xs text-gray-500 truncate">{data.email}</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4 border border-amber-200">
                        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800">
                            Akun ini akan segera logout dari semua sesi. Beri tahu {data.nama} password baru secara langsung.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru *</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            autoFocus
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">Minimal 6 karakter</p>
                        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password *</label>
                        <input
                            type="password"
                            value={form.password_confirmation}
                            onChange={(e) => handleChange('password_confirmation', e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        {passwordsMatch ? (
                            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                <CheckCircle2 size={14} /> Password cocok
                            </p>
                        ) : (
                            errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {processing ? 'Memproses...' : 'Reset Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}