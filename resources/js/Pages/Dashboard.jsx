import AdminSidebar from '@/Components/AdminSidebar';
import { Head, useForm, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useState, useEffect } from 'react';

export default function Dashboard({ auth, users, outlets }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    
    // State untuk mengontrol filter outlet aktif dari sidebar
    const [activeOutletFilter, setActiveOutletFilter] = useState('all');

    const { data, setData, post, patch, errors, processing, reset } = useForm({
        name: '',
        password: '',
        role: 'cashier',
        outlet_id: '',
    });

    // Otomatis bersihkan/sesuaikan outlet_id jika admin mengubah pilihan role staf
    useEffect(() => {
        if (data.role === 'admin') {
            setData('outlet_id', '');
        }
    }, [data.role]);

    // Menyaring daftar user berdasarkan outlet yang dipilih di sidebar
    const filteredUsers = users.filter(user => {
        if (activeOutletFilter === 'all') return true;
        return String(user.outlet_id) === String(activeOutletFilter);
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            patch(route('admin.user.update', editId), { 
                onSuccess: () => cancelEdit() 
            });
        } else {
            post(route('admin.cashier.store'), { 
                onSuccess: () => reset() 
            });
        }
    };

    const startEdit = (user) => {
        setIsEditing(true);
        setEditId(user.id);
        setData({ 
            name: user.name, 
            role: user.role, 
            outlet_id: user.outlet_id || '', 
            password: '' 
        });
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
        reset();
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <Head title="Manajemen Staf & Akun" />

            {/* SIDEBAR KIRI - Desain Baru Putih Minimalis dengan Fitur Drawer Buka Tutup */}
            <AdminSidebar 
                auth={auth} 
                outlets={outlets} 
                currentOutlet={activeOutletFilter} 
                onOutletChange={(id) => setActiveOutletFilter(id)} 
            />

            {/* KONTEN KANAN */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10 pl-14 lg:pl-4">
                    <h2 className="font-bold text-xl text-gray-800">Manajemen Staf & Outlet</h2>
                    <div className="text-sm text-gray-500">Pusat Kendali Kahita</div>
                </header>

                <div className="p-6 overflow-y-auto h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* FORM DAFTAR / EDIT */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                            <h3 className="font-bold text-lg mb-4 border-b pb-2">
                                {isEditing ? '⚡ Edit Akun Staf' : '✨ Pendaftaran Staf'}
                            </h3>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <InputLabel value="Nama Lengkap" />
                                    <TextInput 
                                        value={data.name} 
                                        onChange={e => setData('name', e.target.value)} 
                                        className="w-full mt-1" 
                                        required 
                                    />
                                    <InputError message={errors.name} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel value="Role Kontrol Akses" />
                                    <select 
                                        value={data.role} 
                                        onChange={e => setData('role', e.target.value)} 
                                        className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-emerald-500"
                                    >
                                        <option value="cashier">Kasir (Akses POS Cabang)</option>
                                        <option value="admin">Admin (Akses Dashboard Pusat)</option>
                                    </select>
                                    <InputError message={errors.role} className="mt-1" />
                                </div>

                                {/* INPUT LOKASI TUGAS */}
                                {data.role === 'cashier' && (
                                    <div>
                                        <InputLabel value="Tugaskan di Outlet" />
                                        <select 
                                            value={data.outlet_id} 
                                            onChange={e => setData('outlet_id', e.target.value)}
                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-emerald-500"
                                            required
                                        >
                                            <option value="">-- Pilih Cabang --</option>
                                            {outlets.map(o => (
                                                <option key={o.id} value={o.id}>{o.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.outlet_id} className="mt-1" />
                                    </div>
                                )}

                                <div>
                                    <InputLabel value={isEditing ? "Password Baru (Kosongkan jika tidak diubah)" : "Password Akses"} />
                                    <TextInput 
                                        type="password" 
                                        value={data.password} 
                                        onChange={e => setData('password', e.target.value)} 
                                        className="w-full mt-1" 
                                        required={!isEditing} 
                                    />
                                    <InputError message={errors.password} className="mt-1" />
                                </div>

                                <PrimaryButton className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 mt-2" disabled={processing}>
                                    {isEditing ? 'Simpan Perubahan' : 'Daftarkan Staf'}
                                </PrimaryButton>
                                
                                {isEditing && (
                                    <button type="button" onClick={cancelEdit} className="w-full text-gray-500 text-sm mt-2 block hover:underline">
                                        Batal Mengedit
                                    </button>
                                )}
                            </form>
                        </div>

                        {/* TABEL DATA AKUN */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                            <div className="p-4 bg-gray-50 border-b font-bold text-gray-700 flex justify-between items-center">
                                <span>Daftar Akun Terdaftar</span>
                                {activeOutletFilter !== 'all' && (
                                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-200 font-normal">
                                        Terfilter
                                    </span>
                                )}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3">Nama & Role</th>
                                            <th className="px-4 py-3">Lokasi Tugas</th>
                                            <th className="px-4 py-3 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="text-center py-8 text-gray-400">
                                                    Tidak ada staf terdaftar di outlet ini.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map(user => (
                                                <tr key={user.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3">
                                                        <div className="font-bold text-gray-800">{user.name}</div>
                                                        <div className="text-xs text-gray-400 font-medium capitalize">{user.role}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-emerald-700 font-medium">
                                                        {user.role === 'admin' ? '🌐 HQ / Manajemen Pusat' : (user.outlet ? `🏪 ${user.outlet.name}` : '⚠️ Belum Ada Cabang')}
                                                    </td>
                                                    <td className="px-4 py-3 text-center space-x-3">
                                                        <button onClick={() => startEdit(user)} className="text-emerald-600 font-bold hover:underline">Edit</button>
                                                        {auth.user.id !== user.id && (
                                                            <button 
                                                                onClick={() => {
                                                                    if(confirm(`Hapus permanen akun ${user.name}?`)) {
                                                                        router.delete(route('admin.user.destroy', user.id));
                                                                    }
                                                                }} 
                                                                className="text-red-500 font-bold hover:underline"
                                                            >
                                                                Hapus
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}