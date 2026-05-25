import AdminSidebar from '@/Components/AdminSidebar';
import { Head } from '@inertiajs/react';

export default function Placeholder({ auth, title }) {
    // Kita buat dummy outlets agar sidebar tidak crash saat me-render dropdown
    const dummyOutlets = []; 

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <Head title={title} />
            <AdminSidebar auth={auth} outlets={dummyOutlets} currentOutlet="all" onOutletChange={() => {}} />
            
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm p-4">
                    <h2 className="font-bold text-xl text-gray-800">{title}</h2>
                </header>
                <div className="p-6 flex flex-col items-center justify-center h-full text-gray-500">
                    <span className="text-4xl mb-2">🚧</span>
                    <p className="text-lg font-medium">Halaman {title} Sedang Dalam Konstruksi</p>
                    <p className="text-xs text-gray-400 mt-1">Sistem rute berhasil terhubung dengan aman.</p>
                </div>
            </main>
        </div>
    );
}