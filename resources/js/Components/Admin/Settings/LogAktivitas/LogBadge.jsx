import React from 'react';

export default function LogBadge({ aksi }) {
    if (!aksi) return null;

    const styles = {
        LOGIN: 'bg-blue-100 text-blue-800',
        LOGOUT: 'bg-blue-100 text-blue-800',
        TAMBAH: 'bg-emerald-100 text-emerald-800',
        TERIMA_BARANG: 'bg-emerald-100 text-emerald-800',
        EDIT: 'bg-amber-100 text-amber-800',
        HAPUS: 'bg-red-100 text-red-800',
        VOID: 'bg-red-100 text-red-800',
        REFUND: 'bg-orange-100 text-orange-800',
        EXPORT: 'bg-purple-100 text-purple-800',
        CETAK: 'bg-purple-100 text-purple-800',
        TRANSFER_STOK: 'bg-teal-100 text-teal-800',
        UBAH_PASSWORD: 'bg-gray-100 text-gray-800',
    };

    const labels = {
        TERIMA_BARANG: 'Terima',
        TRANSFER_STOK: 'Transfer',
        UBAH_PASSWORD: 'Ubah PW',
    };

    const style = styles[aksi] || 'bg-gray-100 text-gray-800';
    const label = labels[aksi] || aksi.charAt(0) + aksi.slice(1).toLowerCase();

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${style}`}>
            {label}
        </span>
    );
}
