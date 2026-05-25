import AdminSidebar from '@/Components/AdminSidebar';
import { Head, useForm, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useState } from 'react';

export default function Products({ auth, products, outlets }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const { data, setData, post, patch, errors, processing, reset } = useForm({
        name: '',
        sku: '',
        price: '',
        cost_price: '',
        description: '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            patch(route('admin.products.update', editId), { onSuccess: () => cancelEdit() });
        } else {
            post(route('admin.products.store'), { onSuccess: () => reset() });
        }
    };

    const startEdit = (product) => {
        setIsEditing(true);
        setEditId(product.id);
        setData({
            name: product.name,
            sku: product.sku,
            price: product.price,
            cost_price: product.cost_price,
            description: product.description || '',
        });
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
        reset();
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <Head title="Kelola Produk" />

            <AdminSidebar auth={auth} outlets={outlets} currentOutlet="all" onOutletChange={() => {}} />

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
                    <h2 className="font-bold text-xl text-gray-800">Master Katalog Produk</h2>
                    <div className="text-sm text-emerald-600 font-semibold">Gudang Utama (HQ)</div>
                </header>

                <div className="p-6 overflow-y-auto h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* FORM PRODUK */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                            <h3 className="font-bold text-lg mb-4 border-b pb-2">
                                {isEditing ? '⚡ Edit Produk' : '✨ Tambah Katalog Barang'}
                            </h3>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <InputLabel value="Nama Produk" />
                                    <TextInput value={data.name} onChange={e => setData('name', e.target.value)} className="w-full" required />
                                    <InputError message={errors.name} />
                                </div>

                                <div>
                                    <InputLabel value="SKU / Kode Barang" />
                                    <TextInput value={data.sku} onChange={e => setData('sku', e.target.value)} className="w-full" placeholder="Contoh: KHT-LINEN-01" required />
                                    <InputError message={errors.sku} />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <InputLabel value="Harga Modal" />
                                        <TextInput type="number" value={data.cost_price} onChange={e => setData('cost_price', e.target.value)} className="w-full" required />
                                    </div>
                                    <div>
                                        <InputLabel value="Harga Jual" />
                                        <TextInput type="number" value={data.price} onChange={e => setData('price', e.target.value)} className="w-full" required />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel value="Keterangan (Opsional)" />
                                    <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-sm" rows="2" />
                                </div>

                                <PrimaryButton className="w-full justify-center bg-emerald-600 hover:bg-emerald-700" disabled={processing}>
                                    {isEditing ? 'Simpan Perubahan' : 'Simpan Produk'}
                                </PrimaryButton>
                                {isEditing && <button type="button" onClick={cancelEdit} className="w-full text-gray-500 text-sm mt-2">Batal</button>}
                            </form>
                        </div>

                        {/* TABEL DAFTAR PRODUK */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                            <div className="p-4 bg-gray-50 border-b font-bold text-gray-700">Daftar Barang Pusat</div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3">Barang / SKU</th>
                                            <th className="px-4 py-3">Harga Modal</th>
                                            <th className="px-4 py-3">Harga Jual</th>
                                            <th className="px-4 py-3 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y text-gray-600">
                                        {products.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="text-center p-8 text-gray-400">Belum ada produk terdaftar. Silakan tambah data di kolom kiri.</td>
                                            </tr>
                                        ) : (
                                            products.map(product => (
                                                <tr key={product.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3">
                                                        <div className="font-bold text-gray-900">{product.name}</div>
                                                        <div className="text-xs text-gray-400 font-mono">{product.sku}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500">Rp {Number(product.cost_price).toLocaleString('id-ID')}</td>
                                                    <td className="px-4 py-3 text-emerald-600 font-semibold">Rp {Number(product.price).toLocaleString('id-ID')}</td>
                                                    <td className="px-4 py-3 text-center space-x-3 whitespace-nowrap">
                                                        <button onClick={() => startEdit(product)} className="text-emerald-600 font-bold hover:text-emerald-800">Edit</button>
                                                        <button onClick={() => { if(confirm('Hapus produk ini?')) router.delete(route('admin.products.destroy', product.id)) }} className="text-red-500 font-bold hover:text-red-700">Hapus</button>
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