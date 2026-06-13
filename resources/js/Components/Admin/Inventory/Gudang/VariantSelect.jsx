import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function VariantSelect({ variants = [], value, onChange, className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = variants.find(v => v.ukuran === value?.ukuran && v.warna === value?.warna);
  const grouped = {};
  variants.forEach(v => {
    const key = v.warna || "__nowarna__";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(v);
  });

  const select = (v) => {
    onChange({ ukuran: v.ukuran, warna: v.warna });
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-36 px-2 py-1.5 border border-gray-200 rounded-lg text-xs flex items-center gap-1.5 bg-white hover:border-emerald-500 outline-none cursor-pointer"
      >
        {current ? (
          <>
            {current.warna && <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-gray-300" style={{ backgroundColor: current.warna_hex || "#6b7280" }} />}
            <span className="text-gray-800 truncate">
              {current.warna ? `${current.warna} / ${current.ukuran}` : current.ukuran}
            </span>
          </>
        ) : (
          <span className="text-gray-400">Pilih varian</span>
        )}
        <ChevronDown className="w-3 h-3 ml-auto text-gray-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-20 top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
          {Object.entries(grouped).map(([warnaKey, varianList]) => {
            const sampleHex = varianList[0]?.warna_hex || "#6b7280";
            const colorLabel = warnaKey === "__nowarna__" ? "Tanpa Warna" : warnaKey;
            return (
              <div key={warnaKey}>
                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase bg-gray-50 flex items-center gap-1.5 border-b border-gray-100">
                  {warnaKey !== "__nowarna__" && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sampleHex }} />}
                  {colorLabel}
                </div>
                {varianList.map((v, i) => {
                  const isActive = value?.ukuran === v.ukuran && value?.warna === v.warna;
                  return (
                    <button
                      key={`${v.warna}-${v.ukuran}-${i}`}
                      type="button"
                      onClick={() => select(v)}
                      className={`w-full px-3 py-1.5 text-xs text-left flex items-center gap-2 hover:bg-emerald-50 cursor-pointer ${isActive ? "bg-emerald-50 font-semibold text-emerald-700" : "text-gray-700"}`}
                    >
                      <span className="w-2 h-2 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: v.warna_hex || "#6b7280" }} />
                      <span className="truncate">{v.ukuran}</span>
                      <span className="ml-auto text-[10px] text-gray-400">stok: {v.stok}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
