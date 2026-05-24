import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useState } from 'react';

export default function Dashboard({ auth, cashiers }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const { data, setData, post, patch, errors, processing, reset } = useForm({
        name: '',
        password: '',
        role: 'cashier',
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            patch(route('admin.user.update', editId), {
                onSuccess: () => cancelEdit(),
            });
        } else {
            post(route('admin.cashier.store'), {
                onSuccess: () => reset(),
            });
        }
    };

    const startEdit = (user) => {
        setIsEditing(true);
        setEditId(user.id);
        setData({
            name: user.name,
            role: user.role,
            password: '',
        });
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
        reset();
    };

    const handleDelete = (id, name) => {
        if (confirm(`Apakah Anda yakin ingin menghapus akun "${name}" secara permanen?`)) {
            router.delete(route('admin.user.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-neutral-800 leading-tight">Dashboard Admin (Manajemen Staf)</h2>}
        >
            <Head title="Dashboard" />

            {/* FIX: Container Utama dikunci posisinya menggunakan inset koordinat layar agar mutlak tidak melebihi viewport */}
            <div className="fixed md:absolute top-[140px] bottom-0 left-0 right-0 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full py-4">
                    
                    {/* Grid Layout dipaksa mengisi penuh tinggi area yang tersisa (h-full) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full pb-4">
                        
                        {/* KOTAK FORM: Tinggi mengikuti konten asli saja, tidak ikut memanjang */}
                        <div className="bg-white shadow-sm sm:rounded-lg p-6 h-fit border border-neutral-100">
                            <h3 className="font-bold text-lg text-neutral-800 mb-4 pb-2 border-b">
                                {isEditing ? '⚡ Edit Data Akun' : '✨ Tambah Staf Baru'}
                            </h3>
                            
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="name" value="Nama Lengkap" />
                                    <TextInput
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        autoComplete="off"
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="role" value="Tingkat Akses (Role)" />
                                    <select
                                        id="role"
                                        name="role"
                                        value={data.role}
                                        className="mt-1 block w-full border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-md shadow-sm text-gray-700 bg-white p-2 border"
                                        onChange={(e) => setData('role', e.target.value)}
                                        required
                                    >
                                        <option value="cashier">Staf Kasir (Hanya POS)</option>
                                        <option value="admin">Admin (Full Dashboard)</option>
                                    </select>
                                    <InputError message={errors.role} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password" value={isEditing ? "Password Baru (Kosongkan jika tak diubah)" : "Password Akun"} />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('password', e.target.value)}
                                        required={!isEditing}
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div className="pt-2 space-y-2">
                                    <PrimaryButton 
                                        className={`w-full justify-center ${isEditing ? 'bg-amber-600 hover:bg-amber-700' : 'bg-neutral-800 hover:bg-neutral-950'}`} 
                                        disabled={processing}
                                    >
                                        {processing ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Daftarkan Akun'}
                                    </PrimaryButton>

                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="w-full text-center text-sm text-neutral-500 hover:text-neutral-800 transition py-2"
                                        >
                                            Batal Edit
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* KOTAK TABEL: h-full dikombinasikan dengan flex agar overflow bekerja sempurna */}
                        <div className="md:col-span-2 bg-white shadow-sm sm:rounded-lg p-6 h-full flex flex-col border border-neutral-100 overflow-hidden">
                            <h3 className="font-bold text-lg text-neutral-800 mb-4 pb-2 border-b flex-shrink-0">
                                Semua Pengguna Terdaftar
                            </h3>

                            {/* Pembungkus Baris Tabel Eksternal yang Mengatur Scroll-Bar */}
                            <div className="overflow-y-auto flex-grow basis-0 min-h-0 pr-1">
                                <table className="w-full text-sm text-left text-neutral-500">
                                    <thead className="text-xs text-neutral-700 uppercase bg-neutral-50 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="px-6 py-3 bg-neutral-50">Nama</th>
                                            <th className="px-6 py-3 bg-neutral-50">Role</th>
                                            <th className="px-6 py-3 text-center bg-neutral-50">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cashiers.map((user) => (
                                            <tr key={user.id} className="bg-white border-b hover:bg-neutral-50">
                                                <td className="px-6 py-4 font-medium text-neutral-900">
                                                    <div>{user.name}</div>
                                                    <div className="text-xs text-neutral-400 font-normal">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center space-x-2 whitespace-nowrap">
                                                    <button
                                                        onClick={() => startEdit(user)}
                                                        className="text-amber-600 hover:text-amber-900 text-xs font-bold uppercase tracking-wider px-2 py-1 border border-amber-300 rounded hover:bg-amber-50"
                                                    >
                                                        Edit
                                                    </button>
                                                    
                                                    {auth.user.id !== user.id && (
                                                        <button
                                                            onClick={() => handleDelete(user.id, user.name)}
                                                            className="text-red-600 hover:text-red-900 text-xs font-bold uppercase tracking-wider px-2 py-1 border border-red-300 rounded hover:bg-red-50"
                                                        >
                                                            Hapus
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}