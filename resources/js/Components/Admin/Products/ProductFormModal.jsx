// resources/js/Components/Admin/Products/ProductFormModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload, Shirt } from 'lucide-react';
import { categoriesData, outletsList } from '@/data/productsData';

export const generateKodeProduct = (existingProducts = []) => {
  const ids = existingProducts.map(p => p.id).filter(id => typeof id === 'number');
  const maxId = ids.length > 0 ? Math.max(...ids) : 0;
  const nextId = maxId + 1;
  return `KHT-${String(nextId).padStart(4, '0')}`;
};

export default function ProductFormModal({ isOpen, onClose, product, onSave, existingProducts }) {
  if (!isOpen) return null;

  const isEditMode = !!product;

  // Basic Form States
  const [namaProduk, setNamaProduk] = useState('');
  const [kodeProduk, setKodeProduk] = useState('');
  const [kategori, setKategori] = useState('');
  const [subKategori, setSubKategori] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [hargaBeli, setHargaBeli] = useState('');
  const [hargaJual, setHargaJual] = useState('');
  const [diskon, setDiskon] = useState(0);
  const [status, setStatus] = useState('aktif');
  
  // Varian & Outlet States
  const [varian, setVarian] = useState([]);
  const [outlets, setOutlets] = useState([]);

  // Image Simulation State
  const [imagePreview, setImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize/reset form fields
  useEffect(() => {
    if (isEditMode && product) {
      setNamaProduk(product.nama_produk || '');
      setKodeProduk(product.kode_produk || '');
      setKategori(product.kategori || '');
      setSubKategori(product.sub_kategori || '');
      setDeskripsi(product.deskripsi || '');
      setHargaBeli(product.harga_beli || '');
      setHargaJual(product.harga_jual || '');
      setDiskon(product.diskon || 0);
      setStatus(product.status || 'aktif');
      setVarian(product.varian ? JSON.parse(JSON.stringify(product.varian)) : []);
      setOutlets(product.outlet_tersedia ? [...product.outlet_tersedia] : []);
      setImagePreview('has-image'); // simulated representation
    } else {
      // Add mode defaults
      setNamaProduk('');
      const newCode = generateKodeProduct(existingProducts);
      setKodeProduk(newCode);
      setKategori('');
      setSubKategori('');
      setDeskripsi('');
      setHargaBeli('');
      setHargaJual('');
      setDiskon(0);
      setStatus('aktif');
      setVarian([
        { ukuran: 'M', warna: { nama: 'Hitam', hex: '#000000' }, stok: 10, sku: `${newCode}-M-HT` }
      ]);
      setOutlets(['denpasar', 'jakarta']); // defaults
      setImagePreview(null);
    }
  }, [product, isOpen]);

  // Handle Category Select Cascading
  const handleCategoryChange = (e) => {
    const selected = e.target.value;
    setKategori(selected);
    // Auto-select first subcategory
    const subs = categoriesData[selected] || [];
    setSubKategori(subs.length > 0 ? subs[0] : '');
  };

  // Add Varian Row
  const addVarianRow = () => {
    const lastVarian = varian[varian.length - 1];
    const size = lastVarian ? lastVarian.ukuran : 'M';
    const colorName = lastVarian ? lastVarian.warna.nama : 'Hitam';
    const colorHex = lastVarian ? lastVarian.warna.hex : '#000000';
    
    // Auto SKU generator helper for new row
    const cleanColorAbbr = colorName.slice(0, 2).toUpperCase();
    const newSku = `${kodeProduk}-${size}-${cleanColorAbbr}`;

    setVarian([
      ...varian,
      {
        ukuran: size,
        warna: { nama: colorName, hex: colorHex },
        stok: 5,
        sku: newSku
      }
    ]);
  };

  // Update Varian values
  const updateVarianField = (index, field, value) => {
    const updated = [...varian];
    if (field === 'warna_nama') {
      updated[index].warna.nama = value;
      // Auto-update SKU with new color abbreviation
      const cleanColorAbbr = value.slice(0, 2).toUpperCase();
      updated[index].sku = `${kodeProduk}-${updated[index].ukuran}-${cleanColorAbbr}`;
    } else if (field === 'warna_hex') {
      updated[index].warna.hex = value;
    } else if (field === 'ukuran') {
      updated[index].ukuran = value;
      // Auto-update SKU with size
      const cleanColorAbbr = updated[index].warna.nama.slice(0, 2).toUpperCase();
      updated[index].sku = `${kodeProduk}-${value}-${cleanColorAbbr}`;
    } else {
      updated[index][field] = value;
    }
    setVarian(updated);
  };

  // Remove Varian Row
  const removeVarianRow = (index) => {
    const updated = varian.filter((_, idx) => idx !== index);
    setVarian(updated);
  };

  // Toggle Outlets
  const handleOutletToggle = (outletId) => {
    if (outlets.includes(outletId)) {
      setOutlets(outlets.filter(id => id !== outletId));
    } else {
      setOutlets([...outlets, outletId]);
    }
  };

  // Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!namaProduk || !kategori || !hargaBeli || !hargaJual) {
      alert('Mohon lengkapi semua kolom wajib (*)');
      return;
    }

    setIsSaving(true);

    // Simulate Network/Processing latency for visual wow factor
    setTimeout(() => {
      const calculatedTotalStock = varian.reduce((sum, item) => sum + Number(item.stok || 0), 0);
      
      const savedProduct = {
        id: isEditMode ? product.id : (existingProducts.length > 0 ? Math.max(...existingProducts.map(p => p.id)) + 1 : 1),
        kode_produk: kodeProduk,
        nama_produk: namaProduk,
        kategori,
        sub_kategori: subKategori,
        deskripsi,
        harga_beli: Number(hargaBeli),
        harga_jual: Number(hargaJual),
        diskon: Number(diskon || 0),
        status,
        outlet_tersedia: outlets,
        varian,
        total_stok: calculatedTotalStock,
        updated_at: new Date().toISOString(),
        created_at: isEditMode ? product.created_at : new Date().toISOString()
      };

      onSave(savedProduct, isEditMode);
      setIsSaving(false);
      onClose();
    }, 600);
  };

  const categories = Object.keys(categoriesData);
  const subCategories = kategori ? categoriesData[kategori] || [] : [];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-base font-extrabold text-gray-900">
            {isEditMode ? `Edit Produk: ${product.nama_produk}` : 'Tambah Produk Baru'}
          </h3>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* KOLOM KIRI: Info Dasar */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider border-b pb-1.5">Info Dasar</h4>
            
            {/* Foto Upload Zone (Simulated) */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-700">Foto Produk</label>
              <div className="border-2 border-dashed border-gray-200 hover:border-emerald-400 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50/50 cursor-pointer transition-colors group">
                {imagePreview ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-16 bg-emerald-100 text-emerald-700 rounded-xl border flex items-center justify-center shadow-xs">
                      <Shirt className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-[11px] font-bold text-slate-800">Mockup_Fashion.jpg</p>
                      <p className="text-[9px] text-gray-400">Placeholder foto solid warna per kategori</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagePreview(null);
                      }} 
                      className="text-red-500 text-[10px] font-bold hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-7 h-7 text-gray-400 group-hover:text-emerald-500 transition-colors mb-1.5" />
                    <p className="text-[11px] font-bold text-gray-700">Tarik gambar kemari atau klik untuk unggah</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Format JPG, PNG maks. 2MB</p>
                  </>
                )}
              </div>
            </div>

            {/* Nama & Kode */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={namaProduk}
                  onChange={(e) => setNamaProduk(e.target.value)}
                  placeholder="Misal: Blouse Satin Premium"
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Kode Produk</label>
                <input
                  type="text"
                  value={kodeProduk}
                  onChange={(e) => setKodeProduk(e.target.value)}
                  placeholder="KHT-XXXX"
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none focus:ring-2 bg-slate-50"
                />
              </div>
            </div>

            {/* Kategori & Sub Kategori */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Kategori *</label>
                <select
                  required
                  value={kategori}
                  onChange={handleCategoryChange}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none focus:ring-2"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Sub-Kategori</label>
                <select
                  value={subKategori}
                  disabled={!kategori}
                  onChange={(e) => setSubKategori(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none focus:ring-2 disabled:bg-gray-50"
                >
                  <option value="">Pilih Sub-Kategori</option>
                  {subCategories.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Deskripsi Produk</label>
              <textarea
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Tuliskan keterangan detail mengenai bahan, ukuran pas, dll..."
                rows="3"
                className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none focus:ring-2"
              />
            </div>

            {/* Harga Beli, Harga Jual, Diskon */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Harga Beli (Rp) *</label>
                <input
                  type="number"
                  required
                  value={hargaBeli}
                  onChange={(e) => setHargaBeli(e.target.value)}
                  placeholder="100000"
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Harga Jual (Rp) *</label>
                <input
                  type="number"
                  required
                  value={hargaJual}
                  onChange={(e) => setHargaJual(e.target.value)}
                  placeholder="150000"
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Diskon (%)</label>
                <input
                  type="number"
                  value={diskon}
                  min="0"
                  max="100"
                  onChange={(e) => setDiskon(e.target.value)}
                  placeholder="0"
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none focus:ring-2"
                />
              </div>
            </div>

            {/* Status toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-gray-150 rounded-2xl">
              <div>
                <span className="block text-xs font-bold text-gray-800">Status Produk</span>
                <span className="block text-[10px] text-gray-400">Aktifkan agar dapat dipilih di kasir POS</span>
              </div>
              <button
                type="button"
                onClick={() => setStatus(status === 'aktif' ? 'nonaktif' : 'aktif')}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                  status === 'aktif' ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <div 
                  className={`w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 ${
                    status === 'aktif' ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

          </div>

          {/* KOLOM KANAN: Varian & Distribusi */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-1.5">
                <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider">Varian Produk</h4>
                <button
                  type="button"
                  onClick={addVarianRow}
                  className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Varian
                </button>
              </div>

              {/* Varian Table List */}
              <div className="border border-gray-100 rounded-xl overflow-hidden shadow-2xs max-h-60 overflow-y-auto">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-50 text-gray-500 font-semibold sticky top-0">
                    <tr>
                      <th className="py-2 px-2.5">Ukuran</th>
                      <th className="py-2 px-2">Warna</th>
                      <th className="py-2 px-2 w-16">Stok</th>
                      <th className="py-2 px-2">SKU</th>
                      <th className="py-2 px-2 text-center w-8">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700 bg-white">
                    {varian.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-6 text-gray-400 italic">
                          Belum ada varian ditambahkan.
                        </td>
                      </tr>
                    ) : (
                      varian.map((row, index) => (
                        <tr key={index} className="hover:bg-slate-50/50">
                          {/* Ukuran Dropdown */}
                          <td className="py-1 px-1.5">
                            <select
                              value={row.ukuran}
                              onChange={(e) => updateVarianField(index, 'ukuran', e.target.value)}
                              className="block w-full p-1 border border-gray-200 rounded-md text-[11px] focus:outline-none"
                            >
                              {sizes.map(sz => (
                                <option key={sz} value={sz}>{sz}</option>
                              ))}
                            </select>
                          </td>
                          
                          {/* Warna Name & Hex picker */}
                          <td className="py-1 px-1.5">
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={row.warna.nama}
                                onChange={(e) => updateVarianField(index, 'warna_nama', e.target.value)}
                                placeholder="Merah"
                                className="w-16 p-1 border border-gray-200 rounded-md text-[10px] focus:outline-none"
                              />
                              <input
                                type="color"
                                value={row.warna.hex}
                                onChange={(e) => updateVarianField(index, 'warna_hex', e.target.value)}
                                className="w-5 h-5 rounded border border-gray-200 cursor-pointer p-0 shrink-0"
                              />
                            </div>
                          </td>

                          {/* Stok Number Input */}
                          <td className="py-1 px-1.5">
                            <input
                              type="number"
                              value={row.stok}
                              min="0"
                              onChange={(e) => updateVarianField(index, 'stok', Number(e.target.value))}
                              className="w-full p-1 border border-gray-200 rounded-md text-[11px] font-semibold text-center focus:outline-none"
                            />
                          </td>

                          {/* SKU Text Input */}
                          <td className="py-1 px-1.5">
                            <input
                              type="text"
                              value={row.sku}
                              onChange={(e) => updateVarianField(index, 'sku', e.target.value)}
                              placeholder="SKU"
                              className="w-full p-1 border border-gray-200 rounded-md text-[10px] font-mono text-gray-400 focus:outline-none"
                            />
                          </td>

                          {/* Action Delete */}
                          <td className="py-1 px-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => removeVarianRow(index)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              title="Hapus Baris"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section Distribusi */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider border-b pb-1.5">Distribusi Outlet</h4>
              
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-gray-100 rounded-2xl">
                {outletsList.map((out) => {
                  const isChecked = outlets.includes(out.id);
                  return (
                    <label 
                      key={out.id} 
                      className={`flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer text-xs font-medium transition-all ${
                        isChecked 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleOutletToggle(out.id)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 w-3.5 h-3.5"
                      />
                      {out.name}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            {isSaving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Simpan Produk'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
