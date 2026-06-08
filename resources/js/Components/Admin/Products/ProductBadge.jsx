// resources/js/Components/Admin/Products/ProductBadge.jsx
import React from 'react';

export default function ProductBadge({ type, value }) {
  if (type === 'status') {
    let classes = 'px-2.5 py-1 text-xs font-semibold rounded-full border ';
    let label = '';

    switch (value) {
      case 'aktif':
        classes += 'bg-emerald-50 text-emerald-700 border-emerald-200';
        label = 'Aktif';
        break;
      case 'nonaktif':
        classes += 'bg-gray-100 text-gray-600 border-gray-200';
        label = 'Nonaktif';
        break;
      case 'habis':
        classes += 'bg-red-50 text-red-600 border-red-200';
        label = 'Habis';
        break;
      case 'menipis':
        classes += 'bg-amber-50 text-amber-700 border-amber-200';
        label = 'Menipis';
        break;
      default:
        classes += 'bg-gray-50 text-gray-500 border-gray-200';
        label = value;
    }

    return (
      <span className={`inline-flex items-center gap-1.5 ${classes}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${
          value === 'aktif' ? 'bg-emerald-500' :
          value === 'nonaktif' ? 'bg-gray-400' :
          value === 'habis' ? 'bg-red-500' : 'bg-amber-500'
        }`} />
        {label}
      </span>
    );
  }

  if (type === 'kategori') {
    let colorClasses = '';
    switch (value) {
      case 'Atasan':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-150';
        break;
      case 'Bawahan':
        colorClasses = 'bg-blue-50 text-blue-700 border-blue-150';
        break;
      case 'Dress':
        colorClasses = 'bg-pink-50 text-pink-700 border-pink-150';
        break;
      case 'Outer':
        colorClasses = 'bg-purple-50 text-purple-700 border-purple-150';
        break;
      case 'Gamis & Hijab':
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-150';
        break;
      case 'Aksesoris':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-150';
        break;
      default:
        colorClasses = 'bg-slate-50 text-slate-700 border-slate-150';
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${colorClasses}`}>
        {value}
      </span>
    );
  }

  return null;
}
