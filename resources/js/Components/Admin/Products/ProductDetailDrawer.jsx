// resources/js/Components/Admin/Products/ProductDetailDrawer.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Edit, Power, DollarSign, ShoppingBag, Store, Warehouse, MapPin } from 'lucide-react';
import { categoryConfig, formatRupiah } from './ProductTable';
import ProductBadge from './ProductBadge';

export default function ProductDetailDrawer({ isOpen, onClose, product, onOpenEdit, onToggleStatus, allOutlets = [] }) {
  const [activeColorTab, setActiveColorTab] = useState('');

  useEffect(() => {
    if (product && product.varian && product.varian.length > 0) {
      setActiveColorTab(product.varian[0].color_name || "");
    } else {
      setActiveColorTab('');
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const config = categoryConfig[product.kategori] || { bg: 'bg-gray-100 text-gray-500', icon: MapPin };
  const IconComponent = config.icon;

  const colorGroups = {};
  product.varian.forEach(v => {
    const colName = v.color_name || "Tanpa Warna";
    if (!colorGroups[colName]) {
      colorGroups[colName] = { items: [] };
    }
    colorGroups[colName].items.push(v);
  });

  const uniqueColors = Object.keys(colorGroups);

  const totalTerjual = product.terjual ?? 0;
  const totalOmset = product.omset ?? 0;

  return createPortal(
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-[70] flex flex-col animate-in slide-in-from-right duration-350 ease-out border-l border-gray-100">
        
        {/* Header Drawer */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Detail Produk</span>
            <span className="text-[10px] text-gray-400 font-mono">({product.kode_produk})</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Top Banner and Photo */}
          <div className="flex gap-4">
            <div className={`w-28 h-36 rounded-2xl flex items-center justify-center border shadow-sm shrink-0 overflow-hidden ${!product.image ? config.bg : ''}`}>
              {product.image ? (
                <img src={product.image} alt={product.nama_produk} className="w-full h-full object-cover" />
              ) : (
                <IconComponent className="w-10 h-10 opacity-70" />
              )}
            </div>
            
            <div className="space-y-2 flex-1">
              <div className="flex items-start justify-between">
                <ProductBadge type="kategori" value={product.kategori} />
                <ProductBadge type="status" value={product.total_stok === 0 ? 'habis' : (product.total_stok < 5 ? 'menipis' : product.status)} />
              </div>
              <h3 className="font-extrabold text-gray-900 text-base leading-tight">
                {product.nama_produk}
              </h3>
              <div className="text-[10px] text-gray-400 font-medium">
                {product.kategori} &rsaquo; {product.sub_kategori}
              </div>
              
              <div className="pt-1">
                <div className="text-gray-950 font-extrabold text-lg">
                  {formatRupiah(product.harga_jual)}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  Harga Beli: {formatRupiah(product.harga_beli)}
                </div>
              </div>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Deskripsi</h4>
            <p className="text-xs text-gray-600 leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-xl whitespace-pre-line">
              {product.deskripsi || 'Tidak ada deskripsi produk.'}
            </p>
          </div>

          {/* Section Varian: Tabs by Color */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Varian Stok</h4>
            
            {uniqueColors.length > 0 ? (
              <div className="space-y-3">
                {/* Color Dot Tabs */}
                <div className="flex flex-wrap gap-1.5 border-b border-gray-100 pb-2">
                  {uniqueColors.map((colorName) => {
                    const isActive = activeColorTab === colorName;
                    return (
                      <button
                        key={colorName}
                        onClick={() => setActiveColorTab(colorName)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-white text-gray-600 hover:bg-slate-50 border-gray-200'
                        }`}
                      >
                        {colorName}
                      </button>
                    );
                  })}
                </div>

                {/* Table of sizes for active color */}
                {activeColorTab && colorGroups[activeColorTab] && (
                  <div className="border border-gray-100 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-gray-500 font-semibold">
                        <tr className="border-b border-gray-100">
                          <th className="py-2 px-3">Ukuran</th>
                          <th className="py-2 px-3">SKU</th>
                          <th className="py-2 px-3 text-right">Stok</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-gray-600">
                        {colorGroups[activeColorTab].items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-semibold text-gray-800">{item.size_label || "—"}</td>
                            <td className="py-2 px-3 font-mono text-[10px] text-gray-400">{item.sku}</td>
                            <td className="py-2 px-3 text-right font-bold">
                              <span className={item.stok === 0 ? 'text-red-500' : item.stok < 5 ? 'text-amber-500' : 'text-gray-800'}>
                                {item.stok} pcs
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Tidak ada varian terdaftar.</p>
            )}
          </div>

          {/* Section Distribusi */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-emerald-500" />
              Tersedia Di Outlet
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {product.outlet_tersedia && product.outlet_tersedia.length > 0 ? (
                product.outlet_tersedia.map((outId) => {
                  const found = allOutlets.find(o => String(o.id) === String(outId));
                  const label = found ? found.name : `Outlet #${outId}`;
                  return (
                    <span 
                      key={outId}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-700 shadow-2xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {label}
                    </span>
                  );
                })
              ) : (
                <span className="text-xs text-gray-400 italic">Belum didistribusikan ke outlet manapun.</span>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Analisis Performa</h4>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col justify-between">
                <ShoppingBag className="w-4 h-4 text-emerald-500" />
                <div className="mt-2">
                  <span className="text-[10px] text-gray-400 block font-medium">Terjual</span>
                  <span className="text-sm font-extrabold text-gray-900">{totalTerjual} pcs</span>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col justify-between">
                <DollarSign className="w-4 h-4 text-blue-500" />
                <div className="mt-2">
                  <span className="text-[10px] text-gray-400 block font-medium">Omset</span>
                  <span className="text-sm font-extrabold text-gray-900 truncate block" title={formatRupiah(totalOmset)}>
                    {formatRupiah(totalOmset)}
                  </span>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col justify-between">
                <div className="flex items-center gap-0.5 text-gray-400">
                  <Warehouse className="w-4 h-4" />
                </div>
                <div className="mt-2">
                  <span className="text-[10px] text-gray-400 block font-medium">Stok Gudang</span>
                  <span className="text-sm font-extrabold text-gray-900">{product.stok_gudang ?? 0} pcs</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Drawer */}
        <div className="p-4 border-t border-gray-100 bg-slate-50/50 flex gap-3">
          <button
            onClick={() => {
              onOpenEdit(product);
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 hover:bg-slate-50 text-gray-700 text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Edit className="w-4 h-4 text-gray-500" />
            Edit Produk
          </button>
          <button
            onClick={() => {
              onToggleStatus(product.id);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 border text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer ${
              product.status === 'aktif'
                ? 'bg-red-50 border-red-200 hover:bg-red-100 text-red-700'
                : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-700'
            }`}
          >
            <Power className="w-4 h-4" />
            {product.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
          </button>
        </div>

      </div>
    </>,
    document.body
  );
}
