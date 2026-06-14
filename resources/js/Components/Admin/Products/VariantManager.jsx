import { useState, useEffect, useRef, useCallback } from "react";
import VariantColorSection from "./VariantColorSection";
import VariantSizeSection from "./VariantSizeSection";
import VariantSimpleList from "./VariantSimpleList";
import VariantMatrix from "./VariantMatrix";
import VariantBulkEdit from "./VariantBulkEdit";
import VariantSummary from "./VariantSummary";

const genId = () => Math.random().toString(36).slice(2, 8);

const abbr = (s) => (s || "").slice(0, 2).toUpperCase();

const generateSku = (productCode, colorName, sizeLabel) => {
  if (!productCode) return "";
  const parts = [productCode];
  if (colorName) parts.push(abbr(colorName));
  if (sizeLabel) parts.push(sizeLabel);
  return parts.join("-");
};

function rebuildVariants(colors, sizes, hasColor, hasSize, prevVariants, { productCode, hargaJualDefault, hargaBeliDefault }) {
  const defaults = {
    stok: 0,
    harga_jual: parseInt(hargaJualDefault) || 0,
    harga_beli: parseInt(hargaBeliDefault) || 0,
  };

  if (!hasColor && !hasSize) {
    const existing = prevVariants.find(v => !v.color_nama && !v.size_label);
    return [{
      id: "v_simple",
      color_id: null,
      color_nama: null,
      size_id: null,
      size_label: null,
      size_standar: null,
      stok: existing?.stok ?? defaults.stok,
      harga_jual: existing?.harga_jual ?? defaults.harga_jual,
      harga_beli: existing?.harga_beli ?? defaults.harga_beli,
      sku: existing?.sku ?? generateSku(productCode, null, null),
      aktif: true,
    }];
  }

  if (hasColor && !hasSize) {
    return colors.map(c => {
      const existing = prevVariants.find(v => v.color_nama === c.nama && !v.size_label);
      return {
        id: `v_${c.id}`,
        color_id: c.id,
        color_nama: c.nama,
        size_id: null,
        size_label: null,
        size_standar: null,
        stok: existing?.stok ?? defaults.stok,
        harga_jual: existing?.harga_jual ?? defaults.harga_jual,
        harga_beli: existing?.harga_beli ?? defaults.harga_beli,
        sku: existing?.sku ?? generateSku(productCode, c.nama, null),
        aktif: existing?.aktif ?? true,
      };
    });
  }

  if (!hasColor && hasSize) {
    return sizes.map(s => {
      const existing = prevVariants.find(v => !v.color_nama && v.size_label === s.label);
      return {
        id: `v_${s.id}`,
        color_id: null,
        color_nama: null,
        size_id: s.id,
        size_label: s.label,
        size_standar: s.standar,
        stok: existing?.stok ?? defaults.stok,
        harga_jual: existing?.harga_jual ?? defaults.harga_jual,
        harga_beli: existing?.harga_beli ?? defaults.harga_beli,
        sku: existing?.sku ?? generateSku(productCode, null, s.label),
        aktif: existing?.aktif ?? true,
      };
    });
  }

  const result = [];
  for (const c of colors) {
    for (const s of sizes) {
      const existing = prevVariants.find(v => v.color_nama === c.nama && v.size_label === s.label);
      result.push({
        id: `v_${c.id}_${s.id}`,
        color_id: c.id,
        color_nama: c.nama,
        size_id: s.id,
        size_label: s.label,
        size_standar: s.standar,
        stok: existing?.stok ?? defaults.stok,
        harga_jual: existing?.harga_jual ?? defaults.harga_jual,
        harga_beli: existing?.harga_beli ?? defaults.harga_beli,
        sku: existing?.sku ?? generateSku(productCode, c.nama, s.label),
        aktif: existing?.aktif ?? true,
      });
    }
  }
  return result;
}

function formatRupiah(n) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n || 0);
}

export default function VariantManager({
  value,
  onChange,
  productCode,
  hargaDefault,
  hargaBeliDefault,
  readonlyStok = false,
}) {
  const { hasColor, hasSize, colors, sizes, variants } = value;

  const [selected, setSelected] = useState(new Set());
  const [confirmToggle, setConfirmToggle] = useState(null);
  const [pendingToggle, setPendingToggle] = useState(null);

  const isUpdating = useRef(false);

  useEffect(() => {
    setSelected(new Set());
  }, [hasColor, hasSize, colors, sizes]);

  const sync = useCallback((overrides = {}) => {
    const newHasColor = overrides.hasColor ?? hasColor;
    const newHasSize = overrides.hasSize ?? hasSize;
    const newColors = overrides.colors ?? colors;
    const newSizes = overrides.sizes ?? sizes;

    const newVariants = rebuildVariants(newColors, newSizes, newHasColor, newHasSize, variants, {
      productCode,
      hargaJualDefault: hargaDefault,
      hargaBeliDefault: hargaBeliDefault,
    });

    isUpdating.current = true;
    onChange({
      hasColor: newHasColor,
      hasSize: newHasSize,
      colors: newColors,
      sizes: newSizes,
      variants: newVariants,
    });
    setTimeout(() => { isUpdating.current = false; }, 0);
  }, [hasColor, hasSize, colors, sizes, variants, productCode, hargaDefault, hargaBeliDefault, onChange]);

  const handleToggleColor = () => {
    if (hasColor && colors.length > 0) {
      setConfirmToggle("color");
      setPendingToggle(false);
      return;
    }
    sync({ hasColor: !hasColor });
  };

  const handleToggleSize = () => {
    if (hasSize && sizes.length > 0) {
      setConfirmToggle("size");
      setPendingToggle(false);
      return;
    }
    sync({ hasSize: !hasSize });
  };

  const confirmDisable = () => {
    if (confirmToggle === "color") sync({ hasColor: false });
    if (confirmToggle === "size") sync({ hasSize: false });
    setConfirmToggle(null);
  };

  const handleAddColor = (newColor) => {
    sync({ colors: [...colors, newColor] });
  };

  const handleRemoveColor = (colorId) => {
    sync({ colors: colors.filter(c => c.id !== colorId) });
  };

  const handleAddSize = (newSize) => {
    sync({ sizes: [...sizes, newSize] });
  };

  const handleRemoveSize = (sizeId) => {
    sync({ sizes: sizes.filter(s => s.id !== sizeId) });
  };

  const handleAddColorQuick = (nama) => {
    const newColor = { id: `c_${genId()}`, nama };
    handleAddColor(newColor);
  };

  const handleAddSizeQuick = (label) => {
    const newSize = { id: `s_${genId()}`, label, standar: "Custom" };
    handleAddSize(newSize);
  };

  const handleUpdateVariant = (variantId, field, val) => {
    const updated = variants.map(v =>
      v.id === variantId ? { ...v, [field]: val } : v
    );
    onChange({ ...value, variants: updated });
  };

  const handleToggleAktif = (variantId) => {
    const updated = variants.map(v =>
      v.id === variantId ? { ...v, aktif: !v.aktif } : v
    );
    onChange({ ...value, variants: updated });
  };

  const handleToggleSelect = (variantId) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(variantId)) next.delete(variantId);
      else next.add(variantId);
      return next;
    });
  };

  const handleApplyBulk = (field, val) => {
    const updated = variants.map(v =>
      selected.has(v.id) ? { ...v, [field]: val } : v
    );
    onChange({ ...value, variants: updated });
  };

  const handleActivateAll = (aktif) => {
    const updated = variants.map(v =>
      selected.has(v.id) ? { ...v, aktif } : v
    );
    onChange({ ...value, variants: updated });
  };

  const handleClearSelected = () => setSelected(new Set());

  const selectAll = () => {
    const allIds = new Set(variants.map(v => v.id));
    setSelected(allIds);
  };

  const selectByColor = (colorId) => {
    const ids = new Set(variants.filter(v => v.color_id === colorId).map(v => v.id));
    setSelected(ids);
  };

  const selectBySize = (sizeId) => {
    const ids = new Set(variants.filter(v => v.size_id === sizeId).map(v => v.id));
    setSelected(ids);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider">Variasi Produk</h4>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
          <div>
            <span className="block text-xs font-bold text-gray-800">Warna</span>
            <span className="block text-[10px] text-gray-400">Produk hadir dalam beberapa pilihan warna</span>
          </div>
          <button type="button" onClick={handleToggleColor}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${hasColor ? "bg-emerald-500" : "bg-gray-200"}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${hasColor ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>

        {hasColor && (
          <div className="pl-2">
            <VariantColorSection colors={colors} onAdd={handleAddColor} onRemove={handleRemoveColor} />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
          <div>
            <span className="block text-xs font-bold text-gray-800">Ukuran</span>
            <span className="block text-[10px] text-gray-400">Produk hadir dalam beberapa pilihan ukuran</span>
          </div>
          <button type="button" onClick={handleToggleSize}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${hasSize ? "bg-emerald-500" : "bg-gray-200"}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${hasSize ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>

        {hasSize && (
          <div className="pl-2">
            <VariantSizeSection sizes={sizes} onAdd={handleAddSize} onRemove={handleRemoveSize} />
          </div>
        )}
      </div>

      {!hasColor && !hasSize && (
        <div className="space-y-2">
          <p className="text-[10px] text-gray-400 font-semibold italic">Produk tanpa variasi: satu harga dan satu stok saja</p>
          {(() => {
            const v = variants[0] || { stok: 0, harga_jual: parseInt(hargaDefault) || 0, harga_beli: parseInt(hargaBeliDefault) || 0, sku: productCode || "" };
            return (
              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border border-gray-100 rounded-xl">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Stok</label>
                  <input type="number" min="0" value={v.stok}
                    onChange={e => handleUpdateVariant(v.id || "v_simple", "stok", Number(e.target.value))}
                    disabled={readonlyStok}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-center font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Harga Jual</label>
                  <input type="text" value={formatRupiah(v.harga_jual)}
                    onChange={e => handleUpdateVariant(v.id || "v_simple", "harga_jual", Number(e.target.value.replace(/\D/g, "")) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-center font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Harga Beli</label>
                  <input type="text" value={formatRupiah(v.harga_beli)}
                    onChange={e => handleUpdateVariant(v.id || "v_simple", "harga_beli", Number(e.target.value.replace(/\D/g, "")) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-center font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {(hasColor || hasSize) && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button type="button" onClick={selectAll}
              className="px-2.5 py-1 border border-gray-200 rounded-lg text-[10px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
              Pilih Semua
            </button>
            {hasColor && (
              <div className="relative group">
                <button type="button"
                  className="px-2.5 py-1 border border-gray-200 rounded-lg text-[10px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
                  Per Warna ▾
                </button>
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg py-1 min-w-[100px] hidden group-hover:block z-20">
                  {colors.map(c => (
                    <button key={c.id} type="button" onClick={() => selectByColor(c.id)}
                      className="block w-full text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer">
                      {c.nama}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {hasSize && (
              <div className="relative group">
                <button type="button"
                  className="px-2.5 py-1 border border-gray-200 rounded-lg text-[10px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
                  Per Ukuran ▾
                </button>
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg py-1 min-w-[100px] hidden group-hover:block z-20">
                  {sizes.map(s => (
                    <button key={s.id} type="button" onClick={() => selectBySize(s.id)}
                      className="block w-full text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer">
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {hasColor && hasSize ? (
            <VariantMatrix
              colors={colors}
              sizes={sizes}
              variants={variants}
              selected={selected}
              onToggleSelect={handleToggleSelect}
              onUpdateVariant={handleUpdateVariant}
              onToggleAktif={handleToggleAktif}
              onRemoveColor={handleRemoveColor}
              onRemoveSize={handleRemoveSize}
              onAddColorQuick={handleAddColorQuick}
              onAddSizeQuick={handleAddSizeQuick}
              readonlyStok={readonlyStok}
            />
          ) : (
            <VariantSimpleList
              mode={hasColor ? "color" : "size"}
              colors={colors}
              sizes={sizes}
              variants={variants}
              selected={selected}
              onToggleSelect={handleToggleSelect}
              onUpdateVariant={handleUpdateVariant}
              formatRupiah={formatRupiah}
              readonlyStok={readonlyStok}
            />
          )}
        </div>
      )}

      <VariantBulkEdit
        selected={selected}
        variants={variants}
        colors={colors}
        sizes={sizes}
        onApplyBulk={handleApplyBulk}
        onActivateAll={handleActivateAll}
        onClear={handleClearSelected}
        readonlyStok={readonlyStok}
      />

      {(hasColor || hasSize) && (
        <VariantSummary
          colors={colors}
          sizes={sizes}
          variants={variants}
          hasColor={hasColor}
          hasSize={hasSize}
          formatRupiah={formatRupiah}
        />
      )}

      {confirmToggle && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-5 w-80 space-y-3">
            <p className="text-sm font-bold text-gray-900">
              Hapus semua data {confirmToggle === "color" ? "warna" : "ukuran"}?
            </p>
            <p className="text-xs text-gray-500">
              Semua varian yang terkait akan dihapus. Data stok dan harga akan digabungkan.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmToggle(null)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
                Batal
              </button>
              <button type="button" onClick={confirmDisable}
                className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg cursor-pointer">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
