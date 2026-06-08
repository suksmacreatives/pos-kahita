import React, { useState, useEffect, useRef } from "react";
import { X, Plus, Trash2, Upload, Shirt } from "lucide-react";

export default function ProductFormModal({
  isOpen,
  onClose,
  product,
  onSave,
  outlets = [],
  categories = [],
}) {
  const isEditMode = !!product;

  const [namaProduk, setNamaProduk] = useState("");
  const [kategori, setKategori] = useState("");
  const [subKategori, setSubKategori] = useState("");
  const [kodeProduk, setKodeProduk] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [hargaBeli, setHargaBeli] = useState("");
  const [hargaJual, setHargaJual] = useState("");
  const [status, setStatus] = useState("aktif");
  const [varian, setVarian] = useState([]);
  const [outletTersedia, setOutletTersedia] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isEditMode && product) {
      setNamaProduk(product.nama_produk || "");
      setKategori(product.kategori || "");
      setSubKategori(product.sub_kategori || "");
      setKodeProduk(product.kode_produk || "");
      setDeskripsi(product.deskripsi || "");
      setHargaBeli(product.harga_beli || "");
      setHargaJual(product.harga_jual || "");
      setStatus(product.status || "aktif");
      setVarian(
        product.varian
          ? JSON.parse(JSON.stringify(product.varian))
          : [],
      );
      setOutletTersedia(
        product.outlet_tersedia ? [...product.outlet_tersedia] : [],
      );
      setImageFile(null);
      setImagePreview(product.image || null);
    } else {
      setNamaProduk("");
      setKodeProduk("KHT-" + String(Date.now()).slice(-4));
      setKategori("");
      setSubKategori("");
      setDeskripsi("");
      setHargaBeli("");
      setHargaJual("");
      setStatus("aktif");
      setVarian([
        {
          ukuran: "M",
          warna: { nama: "Hitam", hex: "#000000" },
          stok: 10,
          sku: "",
        },
      ]);
      setOutletTersedia([]);
      setImageFile(null);
      setImagePreview(null);
    }
  }, [product, isOpen]);

  const addVarianRow = () => {
    const lastVarian = varian[varian.length - 1];
    const size = lastVarian ? lastVarian.ukuran : "M";
    const colorName = lastVarian ? lastVarian.warna.nama : "Hitam";
    const colorHex = lastVarian ? lastVarian.warna.hex : "#000000";

    const cleanColorAbbr = colorName.slice(0, 2).toUpperCase();
    const newSku = kodeProduk ? `${kodeProduk}-${size}-${cleanColorAbbr}` : "";

    setVarian([
      ...varian,
      {
        ukuran: size,
        warna: { nama: colorName, hex: colorHex },
        stok: 5,
        sku: newSku,
      },
    ]);
  };

  const updateVarianField = (index, field, value) => {
    const updated = [...varian];
    if (field === "warna_nama") {
      updated[index].warna.nama = value;
      const cleanColorAbbr = value.slice(0, 2).toUpperCase();
      updated[index].sku =
        kodeProduk ? `${kodeProduk}-${updated[index].ukuran}-${cleanColorAbbr}` : "";
    } else if (field === "warna_hex") {
      updated[index].warna.hex = value;
    } else if (field === "ukuran") {
      updated[index].ukuran = value;
      const cleanColorAbbr = updated[index].warna.nama
        .slice(0, 2)
        .toUpperCase();
      updated[index].sku = kodeProduk ? `${kodeProduk}-${value}-${cleanColorAbbr}` : "";
    } else {
      updated[index][field] = value;
    }
    setVarian(updated);
  };

  const removeVarianRow = (index) => {
    setVarian(varian.filter((_, idx) => idx !== index));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOutletToggle = (outletId) => {
    if (outletTersedia.includes(outletId)) {
      setOutletTersedia(outletTersedia.filter((id) => id !== outletId));
    } else {
      setOutletTersedia([...outletTersedia, outletId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!namaProduk || !hargaBeli || !hargaJual) {
      alert("Mohon lengkapi semua kolom wajib (*)");
      return;
    }

    setIsSaving(true);

    const fd = new FormData();

    if (isEditMode) {
      fd.append('_method', 'PATCH');
      fd.append('id', String(product.id));
    }
    fd.append('kode_produk', kodeProduk);
    fd.append('nama_produk', namaProduk);
    fd.append('kategori', kategori);
    fd.append('sub_kategori', subKategori);
    fd.append('deskripsi', deskripsi);
    fd.append('harga_beli', String(hargaBeli));
    fd.append('harga_jual', String(hargaJual));
    fd.append('status', status);

    varian.forEach((v, i) => {
      fd.append(`varian[${i}][ukuran]`, v.ukuran);
      fd.append(`varian[${i}][warna][nama]`, v.warna.nama);
      fd.append(`varian[${i}][warna][hex]`, v.warna.hex);
      fd.append(`varian[${i}][stok]`, String(v.stok));
      fd.append(`varian[${i}][sku]`, v.sku);
    });

    outletTersedia.forEach((id) => {
      fd.append('outlet_tersedia[]', id);
    });

    if (imageFile) {
      fd.append('image', imageFile);
    }

    onSave(fd, isEditMode);
    setIsSaving(false);
    onClose();
  };

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-base font-extrabold text-gray-900">
            {isEditMode
              ? `Edit Produk: ${product.kode_produk}`
              : "Tambah Produk Baru"}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider border-b pb-1.5">Info Dasar</h4>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-700">Foto Produk</label>
              <div
                className="border-2 border-dashed border-gray-200 hover:border-emerald-400 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50/50 cursor-pointer transition-colors group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {imagePreview ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-14 h-16 object-cover rounded-xl border shadow-xs"
                    />
                    <div className="text-left">
                      <p className="text-[11px] font-bold text-slate-800">{imageFile?.name || 'Gambar produk'}</p>
                      <p className="text-[9px] text-gray-400">Klik untuk ganti gambar</p>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }} className="text-red-500 text-[10px] font-bold hover:underline">Hapus</button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-7 h-7 text-gray-400 group-hover:text-emerald-500 transition-colors mb-1.5" />
                    <p className="text-[11px] font-bold text-gray-700">Klik untuk unggah gambar</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Format JPG, PNG maks. 2MB</p>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Kode Produk</label>
              <input type="text" value={kodeProduk} onChange={(e) => setKodeProduk(e.target.value)} placeholder="KHT-XXXX"
                className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none focus:ring-2 bg-slate-50" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Nama Produk *</label>
              <input type="text" required value={namaProduk} onChange={(e) => setNamaProduk(e.target.value)}
                placeholder="Nama produk"
                className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none focus:ring-2" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Kategori</label>
                <input type="text" value={kategori} onChange={(e) => setKategori(e.target.value)}
                  placeholder="Misal: Atasan"
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none focus:ring-2" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Sub-Kategori</label>
                <input type="text" value={subKategori} onChange={(e) => setSubKategori(e.target.value)}
                  placeholder="Misal: Kemeja"
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none focus:ring-2" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Deskripsi Produk</label>
              <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Tuliskan keterangan detail mengenai bahan, ukuran pas, dll..." rows="3"
                className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none focus:ring-2" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Harga Beli (Rp) *</label>
                <input type="number" required value={hargaBeli} onChange={(e) => setHargaBeli(e.target.value)} placeholder="100000"
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none focus:ring-2" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Harga Jual (Rp) *</label>
                <input type="number" required value={hargaJual} onChange={(e) => setHargaJual(e.target.value)} placeholder="150000"
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none focus:ring-2" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 border border-gray-150 rounded-2xl">
              <div>
                <span className="block text-xs font-bold text-gray-800">Status Produk</span>
                <span className="block text-[10px] text-gray-400">Aktifkan agar dapat dipilih di kasir POS</span>
              </div>
              <button type="button" onClick={() => setStatus(status === "aktif" ? "nonaktif" : "aktif")}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                  status === "aktif" ? "bg-emerald-500" : "bg-gray-300"
                }`}>
                <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 ${
                  status === "aktif" ? "translate-x-5.5" : "translate-x-0"
                }`} />
              </button>
            </div>
          </div>

          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-1.5">
                <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider">Varian Produk</h4>
                <button type="button" onClick={addVarianRow} className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-800 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Tambah Varian
                </button>
              </div>

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
                        <td colSpan="5" className="text-center py-6 text-gray-400 italic">Belum ada varian ditambahkan.</td>
                      </tr>
                    ) : (
                      varian.map((row, index) => (
                        <tr key={index} className="hover:bg-slate-50/50">
                          <td className="py-1 px-1.5">
                            <select value={row.ukuran} onChange={(e) => updateVarianField(index, "ukuran", e.target.value)}
                              className="block w-full p-1 border border-gray-200 rounded-md text-[11px] focus:outline-none">
                              {sizes.map((sz) => (<option key={sz} value={sz}>{sz}</option>))}
                            </select>
                          </td>
                          <td className="py-1 px-1.5">
                            <div className="flex items-center gap-1">
                              <input type="text" value={row.warna.nama} onChange={(e) => updateVarianField(index, "warna_nama", e.target.value)}
                                placeholder="Merah" className="w-16 p-1 border border-gray-200 rounded-md text-[10px] focus:outline-none" />
                              <input type="color" value={row.warna.hex} onChange={(e) => updateVarianField(index, "warna_hex", e.target.value)}
                                className="w-5 h-5 rounded border border-gray-200 cursor-pointer p-0 shrink-0" />
                            </div>
                          </td>
                          <td className="py-1 px-1.5">
                            <input type="number" value={row.stok} min="0" onChange={(e) => updateVarianField(index, "stok", Number(e.target.value))}
                              className="w-full p-1 border border-gray-200 rounded-md text-[11px] font-semibold text-center focus:outline-none" />
                          </td>
                          <td className="py-1 px-1.5">
                            <input type="text" value={row.sku} onChange={(e) => updateVarianField(index, "sku", e.target.value)}
                              placeholder="SKU" className="w-full p-1 border border-gray-200 rounded-md text-[10px] font-mono text-gray-400 focus:outline-none" />
                          </td>
                          <td className="py-1 px-1.5 text-center">
                            <button type="button" onClick={() => removeVarianRow(index)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Hapus Baris">
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

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider border-b pb-1.5">Distribusi Outlet</h4>
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-gray-100 rounded-2xl">
                {outlets.map((out) => {
                  const outletId = String(out.id);
                  const isChecked = outletTersedia.includes(outletId);
                  return (
                    <label key={out.id} className={`flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer text-xs font-medium transition-all ${
                      isChecked ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-white border-gray-200 text-gray-600 hover:bg-slate-50"
                    }`}>
                      <input type="checkbox" checked={isChecked} onChange={() => handleOutletToggle(outletId)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 w-3.5 h-3.5" />
                      {out.name}
                    </label>
                  );
                })}
                {outlets.length === 0 && (
                  <p className="text-xs text-gray-400 col-span-2 text-center py-2">Tidak ada outlet tersedia</p>
                )}
              </div>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer">Batal</button>
          <button type="button" onClick={handleSubmit} disabled={isSaving}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer">
            {isSaving ? (
              <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Menyimpan...</>
            ) : "Simpan Produk"}
          </button>
        </div>
      </div>
    </div>
  );
}
