import React, { useEffect, useRef } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { X, Plus, Trash2, Upload } from "lucide-react";

const letterSizes = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const numberSizes = ["36", "37", "38", "39", "40", "41", "42"];

const abbr = (s) => (s || "").slice(0, 2).toUpperCase();
const randomSuffix = () => Math.random().toString(36).slice(2, 5).toUpperCase();

const generateSku = (kodeProduk, ukuran, warnaNama) => {
  if (!kodeProduk) return "";
  const a = abbr(warnaNama);
  if (!ukuran) {
    const prefix = kodeProduk.split("-")[0];
    return `${prefix}-${a}-${randomSuffix()}`;
  }
  return `${kodeProduk}-${ukuran}-${a}`;
};

export default function ProductFormModal({
  isOpen,
  onClose,
  product,
  onSave,
  outlets = [],
  categories = [],
}) {
  const { errors } = usePage().props;
  const isEditMode = !!product;
  const fileInputRef = useRef(null);

  const { data, setData, processing, reset } = useForm({
    kode_produk: "",
    nama_produk: "",
    category_id: "",
    sub_kategori: "",
    deskripsi: "",
    harga_beli: "",
    harga_jual: "",
    status: "aktif",
    variants: [],
    outlet_tersedia: [],
    image: null,
  });

  const [imagePreview, setImagePreview] = React.useState(null);

  useEffect(() => {
    if (!isOpen) return;
    if (isEditMode && product) {
      setData({
        kode_produk: product.kode_produk || "",
        nama_produk: product.nama_produk || "",
        category_id: product.category_id || "",
        sub_kategori: product.sub_kategori || "",
        deskripsi: product.deskripsi || "",
        harga_beli: product.harga_beli || "",
        harga_jual: product.harga_jual || "",
        status: product.status || "aktif",
        variants: product.varian && product.varian.length > 0
          ? JSON.parse(JSON.stringify(product.varian))
          : [],
        outlet_tersedia: product.outlet_tersedia ? [...product.outlet_tersedia] : [],
        image: null,
      });
      setImagePreview(product.image || null);
    } else {
      const autoKode = "KHT-" + String(Date.now()).slice(-4);
      reset();
      setData("kode_produk", autoKode);
      setImagePreview(null);
    }
  }, [product, isOpen]);

  const handleKodeProdukChange = (value) => {
    setData("kode_produk", value);
    const updated = data.variants.map((v) => ({
      ...v,
      sku: generateSku(value, v.ukuran, v.warna.nama),
    }));
    setData("variants", updated);
  };

  const addEmptyVariant = () => {
    setData("variants", [
      ...data.variants,
      { ukuran: null, warna: { nama: "Hitam", hex: "#000000" }, stok: 0, sku: generateSku(data.kode_produk, null, "Hitam") },
    ]);
  };

  const addLetterVariant = () => {
    const newSku = generateSku(data.kode_produk, "M", "Hitam");
    setData("variants", [
      ...data.variants,
      { ukuran: "M", warna: { nama: "Hitam", hex: "#000000" }, stok: 0, sku: newSku },
    ]);
  };

  const updateVariantField = (index, field, value) => {
    const updated = [...data.variants];
    if (field === "warna_nama") {
      updated[index].warna.nama = value;
      updated[index].sku = generateSku(data.kode_produk, updated[index].ukuran, value);
    } else if (field === "warna_hex") {
      updated[index].warna.hex = value;
    } else if (field === "ukuran") {
      updated[index].ukuran = value;
      updated[index].sku = generateSku(data.kode_produk, value, updated[index].warna.nama);
    } else {
      updated[index][field] = value;
    }
    setData("variants", updated);
  };

  const removeVariantRow = (index) => {
    setData("variants", data.variants.filter((_, i) => i !== index));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setData("image", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setData("image", null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOutletToggle = (outletId) => {
    const updated = data.outlet_tersedia.includes(outletId)
      ? data.outlet_tersedia.filter((id) => id !== outletId)
      : [...data.outlet_tersedia, outletId];
    setData("outlet_tersedia", updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.nama_produk || !data.harga_beli || !data.harga_jual) {
      alert("Mohon lengkapi semua kolom wajib (*)");
      return;
    }

    const fd = new FormData();
    if (isEditMode) {
      fd.append("_method", "PATCH");
      fd.append("id", String(product.id));
    }
    fd.append("kode_produk", data.kode_produk);
    fd.append("nama_produk", data.nama_produk);
    fd.append("category_id", String(data.category_id));
    fd.append("sub_kategori", data.sub_kategori);
    fd.append("deskripsi", data.deskripsi);
    fd.append("harga_beli", String(data.harga_beli));
    fd.append("harga_jual", String(data.harga_jual));
    fd.append("status", data.status);

    data.variants.forEach((v, i) => {
      fd.append(`variants[${i}][ukuran]`, v.ukuran ?? "");
      fd.append(`variants[${i}][warna][nama]`, v.warna.nama);
      fd.append(`variants[${i}][warna][hex]`, v.warna.hex);
      fd.append(`variants[${i}][stok]`, String(v.stok));
      fd.append(`variants[${i}][sku]`, v.sku);
    });

    data.outlet_tersedia.forEach((id) => {
      fd.append("outlet_tersedia[]", id);
    });

    if (data.image) {
      fd.append("image", data.image);
    }

    onSave(fd, isEditMode);
    onClose();
  };

  if (!isOpen) return null;

  const fieldError = (field) => {
    const msg = errors[field];
    return msg ? <p className="text-[10px] text-red-500 mt-0.5 font-semibold">{msg}</p> : null;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-base font-extrabold text-gray-900">
            {isEditMode ? `Edit Produk: ${product.kode_produk}` : "Tambah Produk Baru"}
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
                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileSelect} />
                {imagePreview ? (
                  <div className="flex items-center gap-3">
                    <img src={imagePreview} alt="Preview" className="w-14 h-16 object-cover rounded-xl border shadow-xs" />
                    <div className="text-left">
                      <p className="text-[11px] font-bold text-slate-800">{data.image?.name || "Gambar produk"}</p>
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
              {fieldError("image")}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Kode Produk</label>
              <input type="text" value={data.kode_produk} onChange={(e) => handleKodeProdukChange(e.target.value)} placeholder="KHT-XXXX"
                className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none focus:ring-2 bg-slate-50" />
              {fieldError("kode_produk")}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Nama Produk *</label>
              <input type="text" required value={data.nama_produk} onChange={(e) => setData("nama_produk", e.target.value)}
                placeholder="Nama produk"
                className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none focus:ring-2" />
              {fieldError("nama_produk")}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Kategori</label>
                <select value={data.category_id} onChange={(e) => setData("category_id", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none focus:ring-2 bg-white"
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {fieldError("category_id")}
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Sub-Kategori</label>
                <input type="text" value={data.sub_kategori} onChange={(e) => setData("sub_kategori", e.target.value)}
                  placeholder="Misal: Kemeja"
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none focus:ring-2" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Deskripsi Produk</label>
              <textarea value={data.deskripsi} onChange={(e) => setData("deskripsi", e.target.value)}
                placeholder="Tuliskan keterangan detail mengenai bahan, ukuran pas, dll..." rows="3"
                className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none focus:ring-2" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Harga Beli (Rp) *</label>
                <input type="number" required value={data.harga_beli} onChange={(e) => setData("harga_beli", e.target.value)} placeholder="100000"
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none focus:ring-2" />
                {fieldError("harga_beli")}
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Harga Jual (Rp) *</label>
                <input type="number" required value={data.harga_jual} onChange={(e) => setData("harga_jual", e.target.value)} placeholder="150000"
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none focus:ring-2" />
                {fieldError("harga_jual")}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 border border-gray-150 rounded-2xl">
              <div>
                <span className="block text-xs font-bold text-gray-800">Status Produk</span>
                <span className="block text-[10px] text-gray-400">Aktifkan agar dapat dipilih di kasir POS</span>
              </div>
              <button type="button" onClick={() => setData("status", data.status === "aktif" ? "nonaktif" : "aktif")}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${data.status === "aktif" ? "bg-emerald-500" : "bg-gray-300"}`}>
                <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 ${data.status === "aktif" ? "translate-x-5.5" : "translate-x-0"}`} />
              </button>
            </div>
          </div>

          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-1.5">
                <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider">Varian & Stok</h4>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={addEmptyVariant} className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-[10px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                  <Plus className="w-3 h-3" /> Tambah Varian
                </button>
                <button type="button" onClick={addLetterVariant} className="flex items-center gap-1 px-3 py-1.5 border border-emerald-300 rounded-lg text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 transition-colors">
                  <Plus className="w-3 h-3" /> Tambah Ukuran
                </button>
              </div>

              <div className="border border-gray-100 rounded-xl overflow-hidden shadow-2xs max-h-72 overflow-y-auto">
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
                    {data.variants.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-gray-400 italic text-xs">Belum ada data. Tambah varian atau ukuran di atas.</td>
                      </tr>
                    ) : (
                      data.variants.map((row, index) => (
                        <tr key={index} className="hover:bg-slate-50/50">
                          <td className="py-1 px-1.5">
                            {row.ukuran ? (
                              <select value={row.ukuran} onChange={(e) => updateVariantField(index, "ukuran", e.target.value)}
                                className="block w-full p-1 border border-gray-200 rounded-md text-[11px] focus:outline-none bg-white">
                                <option value="">Pilih Ukuran</option>
                                <optgroup label="─ Huruf ─">
                                  {letterSizes.map((sz) => (<option key={sz} value={sz}>{sz}</option>))}
                                </optgroup>
                                <optgroup label="─ Angka ─">
                                  {numberSizes.map((sz) => (<option key={sz} value={sz}>{sz}</option>))}
                                </optgroup>
                              </select>
                            ) : (
                              <span className="block text-center text-gray-300 font-bold text-xs px-2 py-1">—</span>
                            )}  
                          </td>
                          <td className="py-1 px-1.5">
                            <div className="flex items-center gap-1">
                              <input type="text" value={row.warna.nama} onChange={(e) => updateVariantField(index, "warna_nama", e.target.value)}
                                placeholder="Hitam" className="w-16 p-1 border border-gray-200 rounded-md text-[10px] focus:outline-none" />
                              <input type="color" value={row.warna.hex} onChange={(e) => updateVariantField(index, "warna_hex", e.target.value)}
                                className="w-5 h-5 rounded border border-gray-200 cursor-pointer p-0 shrink-0" />
                            </div>
                          </td>
                          <td className="py-1 px-1.5">
                            <input type="number" value={row.stok} min="0" onChange={(e) => updateVariantField(index, "stok", Number(e.target.value))}
                              className="w-full p-1 border border-gray-200 rounded-md text-[11px] font-semibold text-center focus:outline-none" />
                          </td>
                          <td className="py-1 px-1.5">
                            <input type="text" value={row.sku} onChange={(e) => updateVariantField(index, "sku", e.target.value)}
                              placeholder="SKU" className="w-full p-1 border border-gray-200 rounded-md text-[10px] font-mono text-gray-400 focus:outline-none" />
                          </td>
                          <td className="py-1 px-1.5 text-center">
                            <button type="button" onClick={() => removeVariantRow(index)}
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
              {fieldError("variants")}
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider border-b pb-1.5">Distribusi Outlet</h4>
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-gray-100 rounded-2xl">
                {outlets.map((out) => {
                  const outletId = String(out.id);
                  const isChecked = data.outlet_tersedia.includes(outletId);
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
              {fieldError("outlet_tersedia")}
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer">Batal</button>
          <button type="button" onClick={handleSubmit} disabled={processing}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer">
            {processing ? (
              <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Menyimpan...</>
            ) : "Simpan Produk"}
          </button>
        </div>
      </div>
    </div>
  );
}
