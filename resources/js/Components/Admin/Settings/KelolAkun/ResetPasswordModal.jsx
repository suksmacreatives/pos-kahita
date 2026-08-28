import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, KeyRound, AlertTriangle } from 'lucide-react';
import AvatarInitials from './AvatarInitials';

export default function ResetPasswordModal({ isOpen, data, onClose, onSubmit }) {
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setPassword('');
            setPasswordConfirmation('');
            setErrors({});
            setProcessing(false);
        }
    }, [isOpen]);

    if (!isOpen || !data) return null;

    const validate = () => {
        const errs = {};
        if (!password) errs.password = 'Password baru wajib diisi';
        else if (password.length < 8) errs.password = 'Password minimal 8 karakter';
        if (!passwordConfirmation) errs.password_confirmation = 'Konfirmasi password wajib diisi';
        else if (password !== passwordConfirmation) errs.password_confirmation = 'Konfirmasi password tidak cocok';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        if (!validate()) return;
        setProcessing(true);
        onSubmit(data, { password, password_confirmation: passwordConfirmation });
    };

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

                <form onSubmit={handleSubmit} className="p-6 flex-1 space-y-5">
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">Minimal 8 karakter</p>
                        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password *</label>
                        <input
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        {errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>}
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
