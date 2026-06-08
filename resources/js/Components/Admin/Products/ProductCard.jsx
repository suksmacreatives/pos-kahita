// resources/js/Components/Admin/Products/ProductCard.jsx
import React from 'react';
import { Eye, Edit, Trash, Shirt } from 'lucide-react';
import ProductBadge from './ProductBadge';
import { categoryConfig, formatRupiah } from './ProductTable';

export default function ProductCard({ product, onOpenDrawer, onOpenEdit, onDeleteProduct }) {
  const config = categoryConfig[product.kategori] || { bg: 'bg-gray-100 text-gray-500', icon: Shirt };
  const IconComponent = config.icon;

  const finalPrice = product.harga_jual;

  const maxStockCapacity = 100;
  const stockPercent = Math.min((product.total_stok / maxStockCapacity) * 100, 100);

  let stockStatus = 'normal';
  if (product.total_stok === 0) stockStatus = 'habis';
  else if (product.total_stok < 5) stockStatus = 'menipis';

  const displayStatus = product.total_stok === 0 ? 'habis' : (stockStatus === 'menipis' ? 'menipis' : product.status);

  const getVariantSizes = () => {
    if (!product.varian || product.varian.length === 0) return 'T/A';
    const sizes = [...new Set(product.varian.map(v => v.ukuran))];
    return sizes.join(', ');
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group h-full">
      {/* Photo Area (Aspect Ratio 3:4) */}
      <div className={`aspect-[3/4] w-full relative flex items-center justify-center border-b overflow-hidden ${!product.image ? config.bg : ''}`}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.nama_produk}
            className="w-full h-full object-cover absolute inset-0 group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <IconComponent className="w-16 h-16 opacity-75 group-hover:scale-110 transition-transform duration-300" />
        )}
        
        {/* Status Badge (Pojok Kanan Atas) */}
        <div className="absolute top-3 right-3 shadow-md rounded-full bg-white/90 backdrop-blur-sm p-0.5">
          <ProductBadge type="status" value={displayStatus} />
        </div>
      </div>

      {/* Info Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <ProductBadge type="kategori" value={product.kategori} />
            <span className="text-[10px] text-gray-400 font-medium">{product.sub_kategori}</span>
          </div>
          
          <h4 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {product.nama_produk}
          </h4>
          <span className="font-mono text-[9px] text-gray-400 block">{product.kode_produk}</span>
        </div>

        <div>
          <div className="text-gray-900 font-bold text-sm">
            {formatRupiah(product.harga_jual)}
          </div>
        </div>

        {/* Stock Mini Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-semibold text-gray-500">
            <span>Stok</span>
            <span className={stockStatus !== 'normal' ? 'text-red-500 font-bold' : ''}>
              {product.total_stok} pcs
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                stockStatus === 'habis' ? 'bg-red-500' :
                stockStatus === 'menipis' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${stockPercent}%` }}
            />
          </div>
        </div>

        {/* Varian Chip */}
        <div className="text-[10px] text-gray-400 bg-slate-50 border border-slate-100 p-1.5 rounded-lg">
          <span className="font-semibold text-gray-500">Ukuran: </span>
          {getVariantSizes()}
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="border-t border-gray-50 bg-slate-50/50 p-2.5 grid grid-cols-3 gap-1.5">
        <button
          onClick={() => onOpenDrawer(product)}
          className="flex items-center justify-center gap-1 py-1.5 bg-white border border-gray-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 text-gray-600 rounded-lg text-[10px] font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          Lihat
        </button>
        <button
          onClick={() => onOpenEdit(product)}
          className="flex items-center justify-center gap-1 py-1.5 bg-white border border-gray-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-gray-600 rounded-lg text-[10px] font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Edit className="w-3.5 h-3.5" />
          Edit
        </button>
        <button
          onClick={() => onDeleteProduct(product)}
          className="flex items-center justify-center gap-1 py-1.5 bg-white border border-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-600 rounded-lg text-[10px] font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Trash className="w-3.5 h-3.5" />
          Hapus
        </button>
      </div>
    </div>
  );
}
