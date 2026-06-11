export default function VariantSummary({ colors, sizes, variants, hasColor, hasSize, formatRupiah }) {
  const aktif = variants.filter(v => v.aktif);

  if (!hasColor && !hasSize) {
    const v = variants[0];
    if (!v) return null;
    return (
      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-xs text-gray-600">
        <span className="font-semibold text-gray-800">Stok: {v.stok} pcs</span>
        <span className="text-gray-300">|</span>
        <span>Jual: {formatRupiah(v.harga_jual)}</span>
        <span className="text-gray-300">|</span>
        <span>Beli: {formatRupiah(v.harga_beli)}</span>
      </div>
    );
  }

  if (hasColor && !hasSize) {
    const total = variants.reduce((s, v) => s + v.stok, 0);
    const maxStok = Math.max(...variants.map(v => v.stok), 1);
    return (
      <div className="space-y-2 p-3 bg-slate-50 rounded-xl">
        {colors.map(c => {
          const v = variants.find(v => v.color_id === c.id);
          const stok = v?.stok ?? 0;
          return (
            <div key={c.id} className="flex items-center gap-2 text-xs">
              <span className="w-16 font-semibold text-gray-700 truncate">{c.nama}</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${(stok / maxStok) * 100}%` }} />
              </div>
              <span className="w-16 text-right text-gray-600 font-medium">{stok} pcs</span>
            </div>
          );
        })}
        <div className="flex items-center gap-2 pt-1.5 border-t border-gray-200 text-xs font-bold text-gray-800">
          <span className="w-16">Total</span>
          <span className="flex-1" />
          <span className="w-16 text-right">{total} pcs</span>
        </div>
      </div>
    );
  }

  if (!hasColor && hasSize) {
    const total = variants.reduce((s, v) => s + v.stok, 0);
    const maxStok = Math.max(...variants.map(v => v.stok), 1);
    return (
      <div className="space-y-2 p-3 bg-slate-50 rounded-xl">
        {sizes.map(s => {
          const v = variants.find(v => v.size_id === s.id);
          const stok = v?.stok ?? 0;
          return (
            <div key={s.id} className="flex items-center gap-2 text-xs">
              <span className="w-12 font-semibold text-gray-700">{s.label}</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${(stok / maxStok) * 100}%` }} />
              </div>
              <span className="w-16 text-right text-gray-600 font-medium">{stok} pcs</span>
            </div>
          );
        })}
        <div className="flex items-center gap-2 pt-1.5 border-t border-gray-200 text-xs font-bold text-gray-800">
          <span className="w-12">Total</span>
          <span className="flex-1" />
          <span className="w-16 text-right">{total} pcs</span>
        </div>
      </div>
    );
  }

  const total = variants.reduce((s, v) => s + v.stok, 0);
  const totalCells = colors.length * sizes.length;
  const activeCells = aktif.length;
  const maxStok = Math.max(...variants.map(v => v.stok), 1);

  return (
    <div className="space-y-2 p-3 bg-slate-50 rounded-xl">
      {colors.map(c => {
        const colorVariants = variants.filter(v => v.color_id === c.id);
        const colorTotal = colorVariants.reduce((s, v) => s + v.stok, 0);
        const parts = sizes.map(s => {
          const v = colorVariants.find(v => v.size_id === s.id);
          return `${s.label}:${v?.stok ?? 0}`;
        });
        return (
          <div key={c.id} className="flex items-center gap-2 text-xs">
            <span className="w-16 font-semibold text-gray-700 truncate">{c.nama}</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${(colorTotal / maxStok) * 100}%` }} />
            </div>
            <span className="text-gray-500 text-right text-[10px]">{parts.join(' · ')}</span>
            <span className="w-12 text-right text-gray-600 font-medium">{colorTotal} pcs</span>
          </div>
        );
      })}
      <div className="flex items-center gap-2 pt-1.5 border-t border-gray-200 text-xs font-bold text-gray-800">
        <span className="w-16">Total</span>
        <span className="flex-1" />
        <span className="text-gray-500 text-[10px] font-normal">{activeCells} varian aktif / {totalCells}</span>
        <span className="w-12 text-right">{total} pcs</span>
      </div>
    </div>
  );
}
