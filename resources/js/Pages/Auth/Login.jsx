import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function Login({ status, cashiers = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        selected_user: '', // Menyimpan pilihan dropdown (ID Kasir atau kata 'admin')
        email: '',         // Muncul hanya jika memilih opsi Admin
        password: '',
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Log In" />

            {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

            <form onSubmit={submit}>
                {/* 1. DROPDOWN TUNGGAL */}
                <div>
                    <InputLabel htmlFor="selected_user" value="Pilih Akun" />
                    <select
                        id="selected_user"
                        name="selected_user"
                        value={data.selected_user}
                        className="mt-1 block w-full border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-md shadow-sm text-gray-700 bg-white"
                        onChange={(e) => setData('selected_user', e.target.value)}
                        required
                    >
                        <option value="">-- Silahkan Pilih Akun --</option>
                        
                        {/* Memunculkan daftar kasir dari database */}
                        {cashiers.map((cashier) => (
                            <option key={cashier.id} value={cashier.id}>
                                {cashier.name} (Kasir)
                            </option>
                        ))}

                        {/* Opsi khusus paling bawah untuk Admin */}
                        <option value="admin">Owner / Admin</option>
                    </select>
                    <InputError message={errors.selected_user} className="mt-2" />
                </div>

                {/* 2. INPUT USERNAME/EMAIL KHUSUS ADMIN (Otomatis muncul jika memilih 'admin') */}
                {data.selected_user === 'admin' && (
                    <div className="mt-4">
                        <InputLabel htmlFor="email" value="Username / Email Admin" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            placeholder="masukkan email admin..."
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>
                )}

                {/* 3. INPUT PASSWORD (Selalu muncul untuk siapa pun) */}
                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-end mt-6">
                    <PrimaryButton className="w-full justify-center bg-neutral-800 hover:bg-neutral-700" disabled={processing}>
                        Masuk ke Sistem
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}