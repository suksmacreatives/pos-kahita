import { useState } from "react";
import { Plus, X } from "lucide-react";

const genId = () => Math.random().toString(36).slice(2, 8);

const PRESETS = {
  INT: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
  US: ["0", "2", "4", "6", "8", "10", "12", "14"],
  EU: ["34", "36", "38", "40", "42", "44", "46"],
  UK: ["6", "8", "10", "12", "14", "16", "18"],
};

export default function VariantSizeSection({ sizes, onAdd, onRemove }) {
  const [activeTab, setActiveTab] = useState("INT");
  const [customInput, setCustomInput] = useState("");
  const [customError, setCustomError] = useState("");

  const selectedLabels = new Set(sizes.map(s => s.label));

  const handleTogglePreset = (label, standar) => {
    if (selectedLabels.has(label)) {
      const found = sizes.find(s => s.label === label);
      if (found) onRemove(found.id);
    } else {
      onAdd({ id: `s_${genId()}`, label, standar });
    }
  };

  const handleAddCustom = () => {
    const val = customInput.trim();
    if (!val) {
      setCustomError("Ukuran tidak boleh kosong");
      return;
    }
    if (selectedLabels.has(val)) {
      setCustomError(`Ukuran "${val}" sudah ada`);
      return;
    }
    onAdd({ id: `s_${genId()}`, label: val, standar: "Custom" });
    setCustomInput("");
    setCustomError("");
  };

  const tabs = ["INT", "US", "EU", "UK", "Custom"];

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold text-gray-700">Ukuran</label>
      <div className="flex border-b border-gray-200">
        {tabs.map(tab => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-[10px] font-bold transition-colors cursor-pointer ${
              activeTab === tab
                ? "text-emerald-600 border-b-2 border-emerald-500"
                : "text-gray-400 hover:text-gray-600"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="p-2 border border-gray-100 rounded-lg min-h-[40px]">
        {activeTab === "Custom" ? (
          <div className="flex gap-1.5">
            <input type="text" value={customInput} onChange={e => { setCustomInput(e.target.value); setCustomError(""); }}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddCustom(); } }}
              placeholder="Ukuran custom, cth: 2XL"
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            <button type="button" onClick={handleAddCustom}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-600 transition-colors cursor-pointer shrink-0">
              <Plus className="w-3 h-3" /> Tambah
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {PRESETS[activeTab].map(label => {
              const selected = selectedLabels.has(label);
              return (
                <button key={label} type="button" onClick={() => handleTogglePreset(label, activeTab)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-colors cursor-pointer ${
                    selected
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}>
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {customError && <p className="text-[10px] text-red-500 font-semibold">{customError}</p>}

      {sizes.length > 0 && (
        <div>
          <p className="text-[10px] text-gray-400 font-semibold mb-1">Terpilih:</p>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map(s => (
              <span key={s.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-semibold">
                {s.label}
                <button type="button" onClick={() => onRemove(s.id)}
                  className="text-emerald-400 hover:text-red-500 transition-colors cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
