import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

export default function SelectDropdown({
  value,
  onChange,
  options = [],
  placeholder = "-- Pilih --",
  searchable = false,
  className = "",
  displayKey = "label",
  valueKey = "value",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => {
    const optVal = typeof o === "object" ? o[valueKey] : o;
    return String(optVal) === String(value);
  });

  const displayValue = selected
    ? typeof selected === "object"
      ? selected[displayKey]
      : selected
    : "";

  const filtered = options.filter((o) => {
    if (!search) return true;
    const label = typeof o === "object" ? o[displayKey] : String(o);
    return label.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
      >
        <span className="truncate">
          {displayValue || placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform shrink-0 ml-2 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-lg z-40 overflow-hidden">
          {searchable && (
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-lg">
                <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari..."
                  className="w-full bg-transparent text-xs outline-none text-gray-600 placeholder:text-gray-400"
                  autoFocus
                />
              </div>
            </div>
          )}

          <ul className="max-h-48 overflow-y-auto py-1 text-xs">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-gray-400 text-center font-medium">
                Tidak ditemukan
              </li>
            ) : (
              filtered.map((o, i) => {
                const optVal = typeof o === "object" ? o[valueKey] : o;
                const optLabel = typeof o === "object" ? o[displayKey] : String(o);
                const isSelected = String(optVal) === String(value);
                return (
                  <li
                    key={i}
                    onClick={() => {
                      onChange(optVal);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`px-3 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-700 font-semibold"
                        : "text-gray-600"
                    }`}
                  >
                    {optLabel}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
