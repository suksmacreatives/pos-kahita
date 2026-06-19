import React, { useState } from "react";
import { Trash2 } from "lucide-react";

export default function VariantTableGrid({
    nama,
    kode,
    variants,
    onRemove,
    onQtyChange,
    onHargaChange,
    showHarga = false,
    maxKey = null,
}) {
    const [bulkVal, setBulkVal] = useState("");

    const handleBulkFill = () => {
        const v = parseInt(bulkVal);
        if (isNaN(v) || v < 0) return;
        variants.forEach((_, i) => onQtyChange(i, v));
        setBulkVal("");
    };

    const totalQty = variants.reduce((a, v) => a + (parseInt(v.qty) || 0), 0);
    const totalHarga = showHarga
        ? variants.reduce(
              (a, v) =>
                  a + (parseInt(v.qty) || 0) * (parseInt(v.harga_beli) || 0),
              0,
          )
        : 0;

    return (
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">
                        {nama}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono">
                        {kode}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onRemove}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer ml-2 shrink-0"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                            {/* Kolom 1 */}
                            <th className="py-2 px-3 text-left font-semibold">
                                Warna
                            </th>

                            {/* Kolom 2 */}
                            <th className="py-2 px-3 text-left font-semibold">
                                Ukuran
                            </th>

                            {/* Kolom 3: Harus sama kondisinya */}
                            {maxKey && (
                                <th className="py-2 px-3 text-right font-semibold">
                                    Stok
                                </th>
                            )}

                            {/* Kolom 4 */}
                            <th
                                className="py-2 px-3 text-left font-semibold"
                                style={{ width: "80px" }}
                            >
                                Qty
                            </th>

                            {/* Kolom 5: Harus sama kondisinya */}
                            {showHarga && (
                                <th
                                    className="py-2 px-3 text-left font-semibold"
                                    style={{ width: "110px" }}
                                >
                                    Harga
                                </th>
                            )}

                            {/* Kolom 6: Harus sama kondisinya */}
                            {showHarga && (
                                <th className="py-2 px-3 text-right font-semibold">
                                    Subtotal
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {variants.map((v, i) => {
                            const qty = parseInt(v.qty) || 0;
                            const harga = parseInt(v.harga_beli) || 0;
                            const maxVal = maxKey
                                ? (v[maxKey] ?? Infinity)
                                : Infinity;
                            const overMax = maxKey && qty > maxVal;
                            const subtotal = showHarga ? qty * harga : 0;

                            return (
                                <tr
                                    key={`${v.warna}-${v.ukuran}-${i}`}
                                    className={`border-t border-gray-100 transition-colors ${overMax ? "bg-rose-50/70" : "hover:bg-gray-50/50"}`}
                                >
                                    {/* Kolom 1: Warna */}
                                    <td className="py-2 px-3 align-middle">
                                        <div className="flex items-center gap-2">
                                            {v.warna && (
                                                <span
                                                    className="w-3 h-3 rounded-full shrink-0 border border-gray-300 shadow-sm"
                                                    style={{
                                                        backgroundColor:
                                                            v.warna_hex ||
                                                            "#6b7280",
                                                    }}
                                                />
                                            )}
                                            <span className="text-gray-600 truncate text-sm">
                                                {v.warna || "\u2014"}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Kolom 2: Ukuran */}
                                    <td className="py-2 px-3 align-middle">
                                        <span className="font-semibold text-gray-700 text-sm">
                                            {v.ukuran || "\u2014"}
                                        </span>
                                    </td>

                                    {/* Kolom 3: Max Stok (Kondisional) */}
                                    {maxKey && (
                                        <td className="py-2 px-3 text-right align-middle">
                                            <span className="text-gray-500 text-sm">
                                                {v[maxKey]}
                                            </span>
                                        </td>
                                    )}

                                    {/* Kolom 4: Qty Input */}
                                    <td className="py-2 px-3 align-middle">
                                        <input
                                            type="number"
                                            min="0"
                                            max={
                                                maxVal === Infinity
                                                    ? undefined
                                                    : maxVal
                                            }
                                            className={`w-16 px-2 py-1 border rounded-lg text-xs text-right font-bold outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                                                overMax
                                                    ? "border-rose-400 bg-rose-100 text-rose-700"
                                                    : "border-gray-200 text-gray-800"
                                            }`}
                                            value={v.qty}
                                            onChange={(e) =>
                                                onQtyChange(
                                                    i,
                                                    parseInt(e.target.value) ||
                                                        0,
                                                )
                                            }
                                        />
                                    </td>

                                    {/* Kolom 5: Harga Beli Input (Kondisional) */}
                                    {showHarga && (
                                        <td className="py-2 px-3 align-middle">
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-24 px-2 py-1 border border-gray-200 rounded-lg text-xs text-right outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800"
                                                value={v.harga_beli}
                                                onChange={(e) =>
                                                    onHargaChange(
                                                        i,
                                                        parseInt(
                                                            e.target.value,
                                                        ) || 0,
                                                    )
                                                }
                                            />
                                        </td>
                                    )}

                                    {/* Kolom 6: Subtotal (Kondisional) */}
                                    {showHarga && (
                                        <td className="py-2 px-3 text-right align-middle">
                                            <span className="font-bold text-gray-700 text-sm">
                                                {subtotal.toLocaleString()}
                                            </span>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 font-medium">
                        Isi Semua:
                    </span>
                    <input
                        type="number"
                        min="0"
                        className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-xs text-right outline-none focus:border-emerald-500"
                        placeholder="qty"
                        value={bulkVal}
                        onChange={(e) => setBulkVal(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={handleBulkFill}
                        disabled={!bulkVal || parseInt(bulkVal) < 0}
                        className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold hover:bg-emerald-200 cursor-pointer disabled:opacity-50"
                    >
                        Terapkan
                    </button>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-gray-500">
                        Qty:{" "}
                        <strong className="text-gray-800">{totalQty}</strong>
                    </span>
                    {showHarga && (
                        <span className="text-gray-500">
                            Total:{" "}
                            <strong className="text-gray-800">
                                Rp {totalHarga.toLocaleString()}
                            </strong>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
