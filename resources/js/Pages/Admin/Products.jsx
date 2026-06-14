import React, { useState, useEffect, useMemo } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useFilter } from '@/Context/FilterContext';
import StatCard from '@/Components/Admin/StatCard';
import { 
  Shirt, Plus, Upload, Download, 
  AlertCircle, CheckCircle2, 
  ChevronLeft, ChevronRight, X
} from 'lucide-react';

import ProductBadge from '@/Components/Admin/Products/ProductBadge';
import ProductFilterBar from '@/Components/Admin/Products/ProductFilterBar';
import ProductTable from '@/Components/Admin/Products/ProductTable';
import ProductCard from '@/Components/Admin/Products/ProductCard';
import ProductDetailDrawer from '@/Components/Admin/Products/ProductDetailDrawer';
import ProductFormModal from '@/Components/Admin/Products/ProductFormModal';

export default function Products({ products: initialProducts, outlets, categories }) {
  const { outlet } = useFilter();
  const { props } = usePage();
  const flash = props.flash;

  const [products, setProducts] = useState(initialProducts || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua Kategori');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setProducts(initialProducts || []);
  }, [initialProducts]);

  useEffect(() => {
    if (flash?.success) {
      showToast(flash.success);
    }
  }, [flash]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedKategori, selectedStatus, outlet]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesSearch = 
        (prod.nama_produk || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (prod.kode_produk || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (prod.kategori || '').toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesCategory = 
        selectedKategori === 'Semua Kategori' || 
        prod.kategori === selectedKategori;

      let matchesStatus = true;
      if (selectedStatus === 'aktif') {
        matchesStatus = prod.status === 'aktif' && prod.total_stok > 0;
      } else if (selectedStatus === 'nonaktif') {
        matchesStatus = prod.status === 'nonaktif';
      } else if (selectedStatus === 'habis') {
        matchesStatus = prod.total_stok === 0;
      }

      const matchesOutlet = 
        outlet === 'all' || 
        (prod.outlet_tersedia && prod.outlet_tersedia.includes(outlet));

      return matchesSearch && matchesCategory && matchesStatus && matchesOutlet;
    });
  }, [products, debouncedSearch, selectedKategori, selectedStatus, outlet]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const metrics = useMemo(() => {
    const scopeProducts = products.filter(p => outlet === 'all' || (p.outlet_tersedia && p.outlet_tersedia.includes(outlet)));
    const total = scopeProducts.length;
    const active = scopeProducts.filter(p => p.status === 'aktif' && p.total_stok > 0).length;
    const thinStock = scopeProducts.filter(p => p.total_stok > 0 && p.total_stok < 5).length;
    const inactive = scopeProducts.filter(p => p.status === 'nonaktif' || p.total_stok === 0).length;
    return { total, active, thinStock, inactive };
  }, [products, outlet]);

  const handleSaveProduct = (formData, isEdit) => {
    const url = isEdit ? `/admin/products/${formData.get('id')}` : '/admin/products';

    router.post(url, formData, {
      preserveScroll: true,
      onSuccess: () => showToast(isEdit ? 'Produk berhasil diperbarui!' : 'Produk baru berhasil ditambahkan!'),
      onError: (errors) => showToast('Gagal menyimpan: ' + Object.values(errors).join(', '), 'warning'),
    });
  };

  const handleDeleteProduct = () => {
    if (deleteConfirmTarget) {
      router.delete(`/admin/products/${deleteConfirmTarget.id}`, {
        preserveScroll: true,
        onSuccess: () => {
          showToast(`Produk "${deleteConfirmTarget.nama_produk}" berhasil dihapus.`, 'warning');
          setDeleteConfirmTarget(null);
        },
      });
    }
  };

  const handleToggleStatus = (productId) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const nextStatus = prod.status === 'aktif' ? 'nonaktif' : 'aktif';
    router.patch(`/admin/products/${productId}`, {
      nama_produk: prod.nama_produk,
      kode_produk: prod.kode_produk,
      harga_jual: prod.harga_jual,
      harga_beli: prod.harga_beli,
      outlet_tersedia: prod.outlet_tersedia,
      status: nextStatus,
    }, {
      preserveScroll: true,
      onSuccess: () => showToast(`Status produk dirubah menjadi ${nextStatus}`),
    });
  };

  const handleExport = () => {
    showToast('Data produk berhasil diekspor ke format XLSX (Mock)', 'success');
  };

  const handleImport = () => {
    showToast('Mockup data berhasil diimpor kembali.', 'success');
  };

  return (
    <div className="space-y-6 w-full min-h-screen pb-12 box-border">
      <Head title="Manajemen Produk" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            <span>Dashboard</span>
            <span>&rsaquo;</span>
            <span className="text-emerald-600 font-bold">Products</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-none">
            Manajemen Produk
          </h1>
          <p className="text-xs font-semibold text-gray-400 mt-1.5">
            Kelola produk Kahita Busana
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleImport}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          <button 
            onClick={() => {
              setSelectedProduct(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Produk" value={`${metrics.total} item`} trend="neutral" comparisonText="Katalog Pusat" icon={Shirt} color="emerald" />
        <StatCard title="Produk Aktif" value={`${metrics.active} item`} trend="up" change={10} comparisonText="Tersedia untuk dijual" icon={CheckCircle2} color="blue" />
        <StatCard title="Stok Menipis" value={`${metrics.thinStock} item`} trend="down" change={2} comparisonText="Stok kritis < 5 pcs" icon={AlertCircle} color="amber" />
        <StatCard title="Produk Nonaktif / Habis" value={`${metrics.inactive} item`} trend="neutral" comparisonText="Arsip / Out of Stock" icon={X} color="indigo" />
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs">
        <ProductFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedKategori={selectedKategori}
          setSelectedKategori={setSelectedKategori}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          viewMode={viewMode}
          setViewMode={setViewMode}
          categories={categories?.map(c => c.name) || []}
          allOutlets={outlets || []}
        />
      </div>

      <div className="min-h-[400px]">
        {viewMode === 'table' ? (
          <ProductTable
            products={paginatedProducts}
            onOpenDrawer={(prod) => { setSelectedProduct(prod); setIsDrawerOpen(true); }}
            onOpenEdit={(prod) => { setSelectedProduct(prod); setIsModalOpen(true); }}
            onDeleteProduct={(prod) => setDeleteConfirmTarget(prod)}
            allOutlets={outlets}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {paginatedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDrawer={(prod) => { setSelectedProduct(prod); setIsDrawerOpen(true); }}
                onOpenEdit={(prod) => { setSelectedProduct(prod); setIsModalOpen(true); }}
                onDeleteProduct={(prod) => setDeleteConfirmTarget(prod)}
              />
            ))}
            {paginatedProducts.length === 0 && (
              <div className="col-span-full text-center py-20 text-gray-400 font-medium bg-white border border-gray-100 rounded-2xl shadow-xs">
                Tidak ada produk ditemukan.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-gray-100 rounded-2xl px-5 py-3 shadow-xs">
        <div className="flex items-center gap-2.5 text-xs text-gray-500 font-semibold">
          <span>Tampilkan</span>
          <select
            value={itemsPerPage}
            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="p-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span>
            Menampilkan {filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredProducts.length)} dari {filteredProducts.length} produk
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentPage === i + 1 ? 'bg-emerald-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-slate-50'
            }`}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onSave={handleSaveProduct}
        outlets={outlets}
        categories={categories}
      />

      <ProductDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        product={selectedProduct}
        onOpenEdit={(prod) => { setSelectedProduct(prod); setIsModalOpen(true); }}
        onToggleStatus={handleToggleStatus}
        allOutlets={outlets}
      />

      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-2xl max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-500">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h4 className="font-extrabold text-sm text-gray-950">Konfirmasi Hapus</h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus produk <span className="font-bold text-gray-900">"{deleteConfirmTarget.nama_produk}"</span> ({deleteConfirmTarget.kode_produk})? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setDeleteConfirmTarget(null)} className="px-3.5 py-2 border border-gray-200 text-gray-700 rounded-xl text-[11px] font-bold hover:bg-slate-100 transition-colors cursor-pointer">Batal</button>
              <button onClick={handleDeleteProduct} className="px-3.5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[11px] font-bold shadow-md transition-colors cursor-pointer">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-2xl shadow-xl border bg-white animate-in slide-in-from-bottom-6 duration-200">
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />}
          <span className="text-xs font-semibold text-gray-800">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 ml-1.5 p-0.5 rounded"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
    </div>
  );
}

Products.layout = (page) => <AdminLayout>{page}</AdminLayout>;
