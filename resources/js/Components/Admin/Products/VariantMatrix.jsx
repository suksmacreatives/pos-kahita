import { useState } from "react";
import { Plus, X } from "lucide-react";

function formatNumber(n) {
  return new Intl.NumberFormat("id-ID").format(n || 0);
}

export default function VariantMatrix({
  colors, sizes, variants, selected,
  onToggleSelect, onUpdateVariant, onToggleAktif,
  onRemoveColor, onRemoveSize,
  onAddColorQuick, onAddSizeQuick,
  readonlyStok = false,
}) {
  const [showAddColor, setShowAddColor] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  const [showAddSize, setShowAddSize] = useState(false);
  const [newSizeLabel, setNewSizeLabel] = useState("");

  const allSelected = variants.length > 0 && variants.every(v => selected.has(v.id));

  const handleToggleAll = () => {
    if (allSelected) {
      variants.forEach(v => { if (selected.has(v.id)) onToggleSelect(v.id); });
    } else {
      variants.forEach(v => { if (!selected.has(v.id)) onToggleSelect(v.id); });
    }
  };

  const allColorSelected = (colorId) => {
    const colorVariants = variants.filter(v => v.color_id === colorId);
    return colorVariants.length > 0 && colorVariants.every(v => selected.has(v.id));
  };

  const toggleColorSelect = (colorId) => {
    const colorVariants = variants.filter(v => v.color_id === colorId);
    const allSelected = colorVariants.every(v => selected.has(v.id));
    colorVariants.forEach(v => {
      if (allSelected && selected.has(v.id)) onToggleSelect(v.id);
      else if (!allSelected && !selected.has(v.id)) onToggleSelect(v.id);
    });
  };

  const allSizeSelected = (sizeId) => {
    const sizeVariants = variants.filter(v => v.size_id === sizeId);
    return sizeVariants.length > 0 && sizeVariants.every(v => selected.has(v.id));
  };

  const toggleSizeSelect = (sizeId) => {
    const sizeVariants = variants.filter(v => v.size_id === sizeId);
    const allSelected = sizeVariants.every(v => selected.has(v.id));
    sizeVariants.forEach(v => {
      if (allSelected && selected.has(v.id)) onToggleSelect(v.id);
      else if (!allSelected && !selected.has(v.id)) onToggleSelect(v.id);
    });
  };

  const findVariant = (colorId, sizeId) =>
    variants.find(v => v.color_id === colorId && v.size_id === sizeId);

  if (colors.length === 0 || sizes.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="border border-gray-100 rounded-xl overflow-x-auto shadow-xs">
        <table className="w-full text-[11px] text-left min-w-[500px]">
          <thead className="bg-slate-50 text-gray-500 font-semibold">
            <tr>
              <th className="py-2 px-2.5 w-8">
                <input type="checkbox" checked={allSelected} onChange={handleToggleAll}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 w-3.5 h-3.5" />
              </th>
              <th className="py-2 px-2.5 w-24 text-left">Warna / Ukuran</th>
              {sizes.map(s => (
                <th key={s.id} className="py-2 px-1.5 text-center min-w-[100px]">
                  <div className="flex items-center justify-center gap-1">
                    <input type="checkbox" checked={allSizeSelected(s.id)}
                      onChange={() => toggleSizeSelect(s.id)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 w-3 h-3" />
                    <span className="text-[11px]">{s.label}</span>
                    <button type="button" onClick={() => onRemoveSize(s.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </th>
              ))}
              <th className="py-2 px-1 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-gray-700 bg-white">
            {colors.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/50">
                <td className="py-1.5 px-2.5 align-top pt-3">
                  <input type="checkbox" checked={allColorSelected(c.id)}
                    onChange={() => toggleColorSelect(c.id)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 w-3.5 h-3.5" />
                </td>
                <td className="py-1.5 px-2.5 font-semibold text-gray-800 align-top pt-3">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate">{c.nama}</span>
                    <button type="button" onClick={() => onRemoveColor(c.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer shrink-0">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </td>
                {sizes.map(s => {
                  const v = findVariant(c.id, s.id);
                  const isSelected = v && selected.has(v.id);
                  return (
                    <td key={s.id} className={`py-1 px-1.5 align-top ${!v?.aktif ? "bg-gray-50/50" : ""}`}>
                      {v ? (
                        <div className={`space-y-0.5 p-1 rounded-lg border transition-colors ${
                          isSelected ? "border-blue-300 bg-blue-50/40" : "border-transparent"
                        } ${!v.aktif ? "opacity-50" : ""}`}>
                          <div className="flex items-center gap-1">
                            <input type="checkbox" checked={isSelected} onChange={() => onToggleSelect(v.id)}
                              className="rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 w-3 h-3" />
                            <input type="number" min="0" value={v.stok}
                              onChange={e => onUpdateVariant(v.id, "stok", Number(e.target.value))}
                              disabled={!v.aktif || readonlyStok}
                              className="w-full p-0.5 border-0 text-[11px] font-semibold text-center focus:outline-none focus:ring-0 bg-transparent disabled:text-gray-400" />
                            <button type="button" onClick={() => onToggleAktif(v.id)}
                              className={`w-3 h-3 rounded-full border transition-colors cursor-pointer ${
                                v.aktif ? "bg-emerald-500 border-emerald-500" : "bg-gray-200 border-gray-300"
                              }`} />
                          </div>
                          <div className="flex gap-1">
                            <span className="text-[9px] text-gray-400">Rp</span>
                            <input type="text" value={formatNumber(v.harga_jual)}
                              onChange={e => onUpdateVariant(v.id, "harga_jual", Number(e.target.value.replace(/\D/g, "")) || 0)}
                              disabled={!v.aktif}
                              className="w-full p-0.5 border-0 text-[10px] text-right focus:outline-none focus:ring-0 bg-transparent disabled:text-gray-400" />
                          </div>
                        </div>
                      ) : (
                        <div className="p-1 text-center text-gray-300 text-[10px] italic">—</div>
                      )}
                    </td>
                  );
                })}
                <td className="py-1.5 px-1 w-8" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        {showAddColor ? (
          <div className="flex gap-1.5 items-center">
            <input type="text" value={newColorName} autoFocus
              onChange={e => setNewColorName(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (newColorName.trim()) {
                    onAddColorQuick(newColorName.trim());
                    setNewColorName("");
                    setShowAddColor(false);
                  }
                }
                if (e.key === "Escape") setShowAddColor(false);
              }}
              placeholder="Nama warna baru"
              className="px-2 py-1 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500 w-36" />
            <button type="button" onClick={() => { if (newColorName.trim()) { onAddColorQuick(newColorName.trim()); setNewColorName(""); setShowAddColor(false); } }}
              className="px-2 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-600 transition-colors cursor-pointer">Tambah</button>
            <button type="button" onClick={() => { setShowAddColor(false); setNewColorName(""); }}
              className="px-2 py-1 text-gray-400 hover:text-gray-600 text-[10px] cursor-pointer">Batal</button>
          </div>
        ) : (
          <button type="button" onClick={() => setShowAddColor(true)}
            className="flex items-center gap-1 px-2.5 py-1 border border-emerald-200 text-emerald-700 rounded-lg text-[10px] font-bold hover:bg-emerald-50 transition-colors cursor-pointer">
            <Plus className="w-3 h-3" /> Tambah Warna
          </button>
        )}

        {showAddSize ? (
          <div className="flex gap-1.5 items-center">
            <input type="text" value={newSizeLabel} autoFocus
              onChange={e => setNewSizeLabel(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (newSizeLabel.trim()) {
                    onAddSizeQuick(newSizeLabel.trim());
                    setNewSizeLabel("");
                    setShowAddSize(false);
                  }
                }
                if (e.key === "Escape") setShowAddSize(false);
              }}
              placeholder="Ukuran baru"
              className="px-2 py-1 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500 w-28" />
            <button type="button" onClick={() => { if (newSizeLabel.trim()) { onAddSizeQuick(newSizeLabel.trim()); setNewSizeLabel(""); setShowAddSize(false); } }}
              className="px-2 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-600 transition-colors cursor-pointer">Tambah</button>
            <button type="button" onClick={() => { setShowAddSize(false); setNewSizeLabel(""); }}
              className="px-2 py-1 text-gray-400 hover:text-gray-600 text-[10px] cursor-pointer">Batal</button>
          </div>
        ) : (
          <button type="button" onClick={() => setShowAddSize(true)}
            className="flex items-center gap-1 px-2.5 py-1 border border-emerald-200 text-emerald-700 rounded-lg text-[10px] font-bold hover:bg-emerald-50 transition-colors cursor-pointer">
            <Plus className="w-3 h-3" /> Tambah Ukuran
          </button>
        )}
      </div>
    </div>
  );
}
