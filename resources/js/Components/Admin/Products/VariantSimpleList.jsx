

function formatNumber(n) {
  return new Intl.NumberFormat("id-ID").format(n || 0);
}

export default function VariantSimpleList({ mode, colors, sizes, variants, selected, onToggleSelect, onUpdateVariant, formatRupiah, readonlyStok = false }) {
  const items = mode === "color" ? colors : sizes;
  const allSelected = items.length > 0 && items.every(item => {
    const v = variants.find(v => mode === "color" ? v.color_id === item.id : v.size_id === item.id);
    return v && selected.has(v.id);
  });

  const handleToggleAll = () => {
    if (allSelected) {
      variants.forEach(v => { if (selected.has(v.id)) onToggleSelect(v.id); });
    } else {
      variants.forEach(v => { if (!selected.has(v.id)) onToggleSelect(v.id); });
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-xs">
      <table className="w-full text-[11px] text-left">
        <thead className="bg-slate-50 text-gray-500 font-semibold">
          <tr>
            <th className="py-2 px-2.5 w-8">
              <input type="checkbox" checked={allSelected} onChange={handleToggleAll}
                className="rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 w-3.5 h-3.5" />
            </th>
            <th className="py-2 px-2.5">{mode === "color" ? "Warna" : "Ukuran"}</th>
            <th className="py-2 px-2 w-16">Stok</th>
            <th className="py-2 px-2">Harga Jual</th>
            <th className="py-2 px-2">Harga Beli</th>
            <th className="py-2 px-2">SKU</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 text-gray-700 bg-white">
          {items.map(item => {
            const v = variants.find(v => mode === "color" ? v.color_id === item.id : v.size_id === item.id);
            if (!v) return null;
            return (
              <tr key={item.id} className={`hover:bg-slate-50/50 ${v.aktif ? "" : "bg-gray-50 text-gray-400"}`}>
                <td className="py-1.5 px-2.5">
                  <input type="checkbox" checked={selected.has(v.id)} onChange={() => onToggleSelect(v.id)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 w-3.5 h-3.5" />
                </td>
                <td className="py-1.5 px-2.5 font-semibold text-gray-800">{mode === "color" ? item.nama : item.label}</td>
                <td className="py-1.5 px-2">
                  <input type="number" min="0" value={v.stok}
                    onChange={e => onUpdateVariant(v.id, "stok", Number(e.target.value))}
                    disabled={!v.aktif || readonlyStok}
                    className="w-full p-1 border border-gray-200 rounded-md text-[11px] font-semibold text-center focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-transparent disabled:text-gray-400" />
                </td>
                <td className="py-1.5 px-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-400">Rp</span>
                    <input type="text" value={formatNumber(v.harga_jual)}
                      onChange={e => onUpdateVariant(v.id, "harga_jual", Number(e.target.value.replace(/\D/g, "")) || 0)}
                      disabled={!v.aktif}
                      className="w-full p-1 border border-gray-200 rounded-md text-[11px] text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-transparent disabled:text-gray-400" />
                  </div>
                </td>
                <td className="py-1.5 px-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-400">Rp</span>
                    <input type="text" value={formatNumber(v.harga_beli)}
                      onChange={e => onUpdateVariant(v.id, "harga_beli", Number(e.target.value.replace(/\D/g, "")) || 0)}
                      disabled={!v.aktif}
                      className="w-full p-1 border border-gray-200 rounded-md text-[11px] text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-transparent disabled:text-gray-400" />
                  </div>
                </td>
                <td className="py-1.5 px-2">
                  <input type="text" value={v.sku}
                    onChange={e => onUpdateVariant(v.id, "sku", e.target.value)}
                    className="w-full p-1 border border-gray-200 rounded-md text-[10px] font-mono text-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
