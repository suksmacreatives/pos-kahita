import React from 'react';
import { FileX } from 'lucide-react';

export default function EmptyReport({ message = 'Tidak ada data untuk periode ini', sub = 'Coba ubah filter periode atau outlet' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <FileX className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{message}</h3>
      <p className="text-sm text-gray-500">{sub}</p>
    </div>
  );
}
