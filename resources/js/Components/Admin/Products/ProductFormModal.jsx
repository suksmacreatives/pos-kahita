import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm, usePage } from "@inertiajs/react";
import { X, Upload, ChevronDown, Search } from "lucide-react";
import VariantManager from "./VariantManager";

function convertProductVariants(varian) {
  if (!varian || varian.length === 0) {
    return { hasColor: false, hasSize: false, colors: [], sizes: [], variants: [] };
  }

  const colorNames = [...new Set(varian.map(v => v.color_name).filter(Boolean))];
  const sizeLabels = [...new Set(varian.map(v => v.size_label).filter(Boolean))];

  const genId = () => Math.random().toString(36).slice(2, 8);

  const colors = colorNames.map(n => ({ id: `c_${genId()}`, nama: n }));
  const sizes = sizeLabels.map(l => ({ id: `s_${genId()}`, label: l, standar: "Custom" }));

  const colorMap = Object.fromEntries(colors.map(c => [c.nama, c.id]));
  const sizeMap = Object.fromEntries(sizes.map(s => [s.label, s.id]));

  const variants = varian.map(v => ({
    id: `v_${v.color_name ? colorMap[v.color_name] : "null"}_${v.size_label ? sizeMap[v.size_label] : "null"}`,
    color_id: v.color_name ? colorMap[v.color_name] : null,
    color_nama: v.color_name || null,
    size_id: v.size_label ? sizeMap[v.size_label] : null,
    size_label: v.size_label || null,
    size_standar: v.size_label ? "Custom" : null,
    stok: v.stok ?? 0,
    harga_jual: v.harga_jual ?? 0,
    harga_beli: v.harga_beli ?? 0,
    sku: v.sku || "",
    aktif: true,
  }));

  return {
    hasColor: colors.length > 0,
    hasSize: sizes.length > 0,
    colors,
    sizes,
    variants,
  };
}

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
  const initialVariantData = useRef(null);

  const { data, setData, processing, reset } = useForm({
    kode_produk: "",
    nama_produk: "",
    category_id: "",
    // sub_kategori: "",
    deskripsi: "",
    harga_beli: "",
    harga_jual: "",
    status: "aktif",
    outlet_tersedia: [],
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const categoryRef = useRef(null);
  const [variantData, setVariantData] = useState({
    hasColor: false,
    hasSize: false,
    colors: [],
    sizes: [],
    variants: [],
  });

  useEffect(() => {
    if (!isOpen) return;
    if (isEditMode && product) {
      setData({
        kode_produk: product.kode_produk || "",
        nama_produk: product.nama_produk || "",
        category_id: product.category_id || "",
        // sub_kategori: product.sub_kategori || "",
        deskripsi: product.deskripsi || "",
        status: product.status || "aktif",
        outlet_tersedia: product.outlet_tersedia ? product.outlet_tersedia.map(String) : [],
        image: null,
      });
      setImagePreview(product.image || null);

      const converted = convertProductVariants(product.varian);
      initialVariantData.current = converted;
      setVariantData(converted);
    } else {
      const autoKode = "KHT-" + crypto.randomUUID().slice(0, 8).toUpperCase();
      reset();
      setData("kode_produk", autoKode);
      setImagePreview(null);
      const empty = { hasColor: false, hasSize: false, colors: [], sizes: [], variants: [] };
      initialVariantData.current = empty;
      setVariantData(empty);
    }
  }, [product, isOpen]);

  useEffect(() => {
    if (variantData.variants.length > 0) return;
    if (!variantData.hasColor && !variantData.hasSize && data.kode_produk) {
      const v = [{
        id: "v_simple",
        color_id: null, color_nama: null,
        size_id: null, size_label: null, size_standar: null,
        stok: 0,
        harga_jual: 0,
        harga_beli: 0,
        sku: data.kode_produk || "",
        aktif: true,
      }];
      setVariantData(prev => ({ ...prev, variants: v }));
    }
  }, [data.kode_produk]);

  useEffect(() => {
    const handleClick = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.nama_produk) {
      alert("Mohon lengkapi Nama Produk");
      return;
    }

    const first = variantData.variants[0] || {};
    const baseHargaBeli = first.harga_beli ?? 0;
    const baseHargaJual = first.harga_jual ?? 0;

    const fd = new FormData();
    if (isEditMode) {
      fd.append("_method", "PATCH");
      fd.append("id", String(product.id));
    }
    fd.append("kode_produk", data.kode_produk);
    fd.append("nama_produk", data.nama_produk);
    fd.append("category_id", String(data.category_id));
    // fd.append("sub_kategori", data.sub_kategori);
    fd.append("deskripsi", data.deskripsi);
    fd.append("harga_beli", String(baseHargaBeli));
    fd.append("harga_jual", String(baseHargaJual));
    fd.append("status", data.status);

    variantData.variants.forEach((v, i) => {
      fd.append(`variants[${i}][color_name]`, v.color_nama ?? "");
      fd.append(`variants[${i}][size_label]`, v.size_label ?? "");
      fd.append(`variants[${i}][stok]`, String(v.stok));
      fd.append(`variants[${i}][harga_jual]`, String(v.harga_jual));
      fd.append(`variants[${i}][harga_beli]`, String(v.harga_beli));
      fd.append(`variants[${i}][sku]`, v.sku);
    });

    fd.append("outlet_tersedia", JSON.stringify(data.outlet_tersedia));

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

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
          <div className="relative bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
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
                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) { setData("image", file); setImagePreview(URL.createObjectURL(file)); }
                }} />
                {imagePreview ? (
                  <div className="flex items-center gap-3">
                    <img src={imagePreview} alt="Preview" className="w-14 h-16 object-cover rounded-xl border shadow-xs" />
                    <div className="text-left">
                      <p className="text-[11px] font-bold text-slate-800">{data.image?.name || "Gambar produk"}</p>
                      <p className="text-[9px] text-gray-400">Klik untuk ganti gambar</p>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setData("image", null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-red-500 text-[10px] font-bold hover:underline">Hapus</button>
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
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Kode Produk *</label>
              <input type="text" value={data.kode_produk} onChange={(e) => {
                setData("kode_produk", e.target.value);
                const updated = variantData.variants.map(v => ({
                  ...v,
                  sku: generateSku(e.target.value, v.color_nama, v.size_label),
                }));
                setVariantData(prev => ({ ...prev, variants: updated }));
              }} placeholder="KHT-XXXX"
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
                <div className="relative z-10" ref={categoryRef}>
                  <button
                    type="button"
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <span className="truncate">
                      {data.category_id
                        ? categories.find((c) => c.id == data.category_id)?.name || "-- Pilih Kategori --"
                        : "-- Pilih Kategori --"}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isCategoryOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isCategoryOpen && (
                    <div className="absolute left-0 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-lg z-40 overflow-hidden">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-lg">
                          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <input
                            type="text"
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            placeholder="Cari kategori..."
                            className="w-full bg-transparent text-xs outline-none text-gray-600 placeholder:text-gray-400"
                            autoFocus
                          />
                        </div>
                      </div>
                      <ul className="max-h-48 overflow-y-auto py-1 text-xs">
                        {filteredCategories.length === 0 ? (
                          <li className="px-3 py-3 text-gray-400 text-center font-medium">Kategori tidak ditemukan</li>
                        ) : (
                          filteredCategories.map((cat) => (
                            <li
                              key={cat.id}
                              onClick={() => {
                                setData("category_id", cat.id);
                                setIsCategoryOpen(false);
                                setCategorySearch("");
                              }}
                              className={`px-3 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${
                                data.category_id == cat.id ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-600"
                              }`}
                            >
                              {cat.name}
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                {fieldError("category_id")}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Deskripsi Produk</label>
              <textarea value={data.deskripsi} onChange={(e) => setData("deskripsi", e.target.value)}
                placeholder="Tuliskan keterangan detail mengenai bahan, ukuran pas, dll..." rows="3"
                className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none focus:ring-2" />
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
              <VariantManager
                value={variantData}
                onChange={setVariantData}
                productCode={data.kode_produk}
                hargaDefault={data.harga_jual}
                hargaBeliDefault={data.harga_beli}
              />
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
                      <input type="checkbox" checked={isChecked} onChange={() => {
                        const updated = data.outlet_tersedia.includes(outletId)
                          ? data.outlet_tersedia.filter((id) => id !== outletId)
                          : [...data.outlet_tersedia, outletId];
                        setData("outlet_tersedia", updated);
                      }}
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
  </div>,
  document.body
);
}

function generateSku(productCode, colorName, sizeLabel) {
  if (!productCode) return "";
  const abbr = (s) => (s || "").slice(0, 2).toUpperCase();
  const parts = [productCode];
  if (colorName) parts.push(abbr(colorName));
  if (sizeLabel) parts.push(sizeLabel);
  return parts.join("-");
}
