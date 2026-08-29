import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Head, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/Admin/DataTable';
import {
    Tag,
    Plus,
    Eye,
    Edit,
    Trash,
    AlertCircle,
    X,
} from 'lucide-react';

export default function Categories({ categories, outlets }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', outlet_id: '' });

    const showToast = (message, type = 'success') => {
        if (type === 'success') toast.success(message);
        else toast.error(message);
    };

    const openAddModal = () => {
        setEditingCategory(null);
        setForm({ name: '', description: '', outlet_id: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (cat) => {
        setEditingCategory(cat);
        setForm({
            name: cat.name,
            description: cat.description || '',
            outlet_id: cat.outlet_id || '',
        });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        const isEdit = !!editingCategory;
        const url = isEdit
            ? `/admin/categories/${editingCategory.id}`
            : '/admin/categories';

        const method = isEdit ? 'patch' : 'post';

        router[method](url, form, {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
                setEditingCategory(null);
                showToast(
                    isEdit
                        ? 'Kategori berhasil diperbarui'
                        : 'Kategori berhasil ditambahkan',
                );
            },
            onError: (errors) =>
                showToast(
                    'Gagal menyimpan: ' + Object.values(errors).join(', '),
                    'error',
                ),
        });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/admin/categories/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteTarget(null);
                showToast('Kategori berhasil dihapus');
            },
            onError: (errors) =>
                showToast(
                    'Gagal menghapus: ' + Object.values(errors).join(', '),
                    'error',
                ),
        });
    };

    const headers = [
        { key: 'name', label: 'Nama Kategori' },
        { key: 'slug', label: 'Slug' },
        { key: 'description', label: 'Deskripsi' },
        {
            key: 'outlet_name',
            label: 'Outlet',
            render: (row) =>
                row.outlet_name ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100/40">
                        {row.outlet_name}
                    </span>
                ) : (
                    <span className="text-gray-400">—</span>
                ),
        },
        {
            key: 'product_count',
            label: 'Produk',
            align: 'center',
            render: (row) => (
                <span className="font-bold text-gray-900">
                    {row.product_count}
                </span>
            ),
        },
        {
            key: 'id',
            label: 'Aksi',
            align: 'center',
            render: (row) => (
                <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => openEditModal(row)}
                        className="p-1.5 rounded-lg border border-gray-100 bg-white hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-sm cursor-pointer"
                        title="Edit Kategori"
                    >
                        <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => setDeleteTarget(row)}
                        className="p-1.5 rounded-lg border border-gray-100 bg-white hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm cursor-pointer"
                        title="Hapus Kategori"
                    >
                        <Trash className="w-3.5 h-3.5" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6 w-full min-h-screen pb-12 box-border">
            <Head title="Kategori Produk" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                        <span>Dashboard</span>
                        <span>&rsaquo;</span>
                        <span className="text-emerald-600 font-bold">
                            Categories
                        </span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-none">
                        Kategori Produk
                    </h1>
                    <p className="text-xs font-semibold text-gray-400 mt-1.5">
                        Kelola kategori produk Kahita Busana
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Kategori</span>
                </button>
            </div>

            <DataTable
                headers={headers}
                data={categories}
                emptyMessage="Belum ada kategori produk"
            />

            {/* Modal Tambah / Edit via Portal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-2xl max-w-md w-full space-y-5 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between">
                            <h4 className="font-extrabold text-sm text-gray-950">
                                {editingCategory
                                    ? 'Edit Kategori'
                                    : 'Tambah Kategori'}
                            </h4>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Nama Kategori
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                                    placeholder="Masukkan nama kategori"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Deskripsi
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            description: e.target.value,
                                        })
                                    }
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all resize-none"
                                    rows={3}
                                    placeholder="Deskripsi kategori (opsional)"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Outlet
                                </label>
                                <select
                                    value={form.outlet_id}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            outlet_id: e.target.value,
                                        })
                                    }
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                                >
                                    <option value="">Semua Outlet</option>
                                    {outlets.map((o) => (
                                        <option key={o.id} value={o.id}>
                                            {o.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-3.5 py-2 border border-gray-200 text-gray-700 rounded-xl text-[11px] font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[11px] font-bold shadow-md transition-colors cursor-pointer"
                            >
                                {editingCategory ? 'Simpan' : 'Tambah'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Konfirmasi Hapus via Portal */}
            {deleteTarget && createPortal(
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-2xl max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center gap-3 text-red-500">
                            <AlertCircle className="w-6 h-6 shrink-0" />
                            <h4 className="font-extrabold text-sm text-gray-950">
                                Konfirmasi Hapus
                            </h4>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            Apakah Anda yakin ingin menghapus kategori{' '}
                            <span className="font-bold text-gray-900">
                                "{deleteTarget.name}"
                            </span>
                            ? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        {deleteTarget.product_count > 0 && (
                            <p className="text-[11px] text-amber-600 bg-amber-50 px-3 py-2 rounded-lg font-semibold">
                                Kategori ini memiliki {deleteTarget.product_count}{' '}
                                produk yang akan terlepas.
                            </p>
                        )}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-3.5 py-2 border border-gray-200 text-gray-700 rounded-xl text-[11px] font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-3.5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[11px] font-bold shadow-md transition-colors cursor-pointer"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

Categories.layout = (page) => <AdminLayout>{page}</AdminLayout>;
