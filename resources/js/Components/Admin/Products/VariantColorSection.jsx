import { useState } from "react";
import { Plus, X } from "lucide-react";

const genId = () => Math.random().toString(36).slice(2, 8);

export default function VariantColorSection({ colors, onAdd, onRemove }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    const val = input.trim();
    if (!val) {
      setError("Nama warna tidak boleh kosong");
      return;
    }
    if (colors.some(c => c.nama.toLowerCase() === val.toLowerCase())) {
      setError(`Warna "${val}" sudah ada`);
      return;
    }
    onAdd({ id: `c_${genId()}`, nama: val });
    setInput("");
    setError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold text-gray-700">Warna</label>
      <div className="flex gap-1.5">
        <input type="text" value={input} onChange={e => { setInput(e.target.value); setError(""); }}
          onKeyDown={handleKeyDown}
          placeholder="Nama warna, cth: Biru, Sage Green"
          className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500" />
        <button type="button" onClick={handleAdd}
          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-600 transition-colors cursor-pointer shrink-0">
          <Plus className="w-3 h-3" /> Tambah
        </button>
      </div>
      {error && <p className="text-[10px] text-red-500 font-semibold">{error}</p>}
      {colors.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {colors.map(c => (
            <span key={c.id}
              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-semibold">
              {c.nama}
              <button type="button" onClick={() => onRemove(c.id)}
                className="text-emerald-400 hover:text-red-500 transition-colors cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
