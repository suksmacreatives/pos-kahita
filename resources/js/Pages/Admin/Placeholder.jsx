import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Placeholder({ title }) {
  return (
    <div className="space-y-6">
      <Head title={title} />

      {/* Page Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-none">
          {title}
        </h1>
        <p className="text-xs font-semibold text-gray-400 mt-2">
          Fitur administrasi & analisis laporan
        </p>
      </div>

      {/* Main warning card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[420px] transition-all duration-300 hover:shadow-md">
        <span className="text-5xl mb-4 animate-bounce">🚧</span>
        <h3 className="text-lg font-extrabold text-gray-900">
          Halaman {title} Sedang Dalam Konstruksi
        </h3>
        <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
          Tim pengembang kami sedang menyempurnakan fitur ini untuk rilis mendatang. Koneksi routing sistem telah berhasil dikonfigurasi secara aman.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="mt-6 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          Kembali ke Halaman Sebelumnya
        </button>
      </div>
    </div>
  );
}

// Bind Global Layout Layout Wrapper
Placeholder.layout = (page) => <AdminLayout>{page}</AdminLayout>;