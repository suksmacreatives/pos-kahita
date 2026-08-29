import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

const VARIANT_STYLES = {
    danger: {
        icon: 'text-red-500',
        iconWrap: 'bg-red-100',
        confirmBtn:
            'bg-red-500 hover:bg-red-600 text-white',
    },
    primary: {
        icon: 'text-emerald-500',
        iconWrap: 'bg-emerald-100',
        confirmBtn:
            'bg-emerald-500 hover:bg-emerald-600 text-white',
    },
};

export default function ConfirmDialog({
    isOpen,
    title = 'Konfirmasi',
    message = '',
    confirmLabel = 'Ya',
    cancelLabel = 'Batal',
    variant = 'danger',
    processing = false,
    onConfirm,
    onCancel,
}) {
    if (!isOpen) return null;

    const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.danger;
    const Icon = variant === 'primary' ? CheckCircle2 : AlertTriangle;

    return createPortal(
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={processing ? undefined : onCancel}
        >
            <div
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-2xl max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start gap-3">
                    <div
                        className={`w-10 h-10 rounded-full ${styles.iconWrap} flex items-center justify-center shrink-0`}
                    >
                        <Icon className={`w-5 h-5 ${styles.icon}`} />
                    </div>
                    <div className="min-w-0 pt-0.5">
                        <h4 className="font-extrabold text-sm text-gray-950">{title}</h4>
                        {message && (
                            <p className="text-xs text-gray-600 leading-relaxed mt-1.5">
                                {message}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={processing}
                        className="px-3.5 py-2 border border-gray-200 text-gray-700 rounded-xl text-[11px] font-bold hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={processing}
                        className={`px-3.5 py-2 rounded-xl text-[11px] font-bold shadow-md transition-colors cursor-pointer disabled:opacity-50 ${styles.confirmBtn}`}
                    >
                        {processing ? 'Memproses...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
