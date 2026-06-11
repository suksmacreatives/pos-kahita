// resources/js/Components/Admin/Products/ProductTable.jsx
import React, { useState } from "react";
import {
    Shirt,
    Layers,
    Sparkles,
    Wind,
    Gem,
    Moon,
    Eye,
    Edit,
    Trash,
    ArrowUpDown,
} from "lucide-react";
import ProductBadge from "./ProductBadge";

export const categoryConfig = {
    Atasan: {
        bg: "bg-emerald-100 text-emerald-700 border-emerald-200",
        icon: Shirt,
    },
    Bawahan: { bg: "bg-blue-100 text-blue-700 border-blue-200", icon: Layers },
    Dress: { bg: "bg-pink-100 text-pink-700 border-pink-200", icon: Sparkles },
    Outer: {
        bg: "bg-purple-100 text-purple-700 border-purple-200",
        icon: Wind,
    },
    "Gamis & Hijab": {
        bg: "bg-amber-100 text-amber-700 border-amber-200",
        icon: Moon,
    },
    Aksesoris: { bg: "bg-rose-100 text-rose-700 border-rose-200", icon: Gem },
};

export const formatRupiah = (num) => {
    return "Rp " + Number(num).toLocaleString("id-ID");
};

export default function ProductTable({
    products,
    onOpenDrawer,
    onOpenEdit,
    onDeleteProduct,
}) {
    const [sortField, setSortField] = useState("");
    const [sortDirection, setSortDirection] = useState("asc");

    const handleSort = (field) => {
        const isAsc = sortField === field && sortDirection === "asc";
        setSortDirection(isAsc ? "desc" : "asc");
        setSortField(field);
    };

    const sortedProducts = [...products].sort((a, b) => {
        if (!sortField) return 0;

        let aValue = a[sortField];
        let bValue = b[sortField];

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
    });

    const getVariantSummary = (varian) => {
        if (!varian || varian.length === 0) return "Tidak ada varian";
        const sizes = [...new Set(varian.map((v) => v.size_label).filter(Boolean))];
        const colors = [...new Set(varian.map((v) => v.color_name).filter(Boolean))];
        return `${sizes.length} Ukuran · ${colors.length} Warna`;
    };

    return (
        <div className="overflow-x-auto relative bg-white border border-gray-100 rounded-2xl shadow-sm">
            <table className="w-full text-xs text-left text-gray-600 border-collapse">
                <thead className="bg-slate-50/75 border-b border-gray-100 text-gray-500 font-semibold sticky top-0 backdrop-blur-md z-10">
                    <tr>
                        <th className="py-3 px-4 w-12 text-center">#</th>
                        <th className="py-3 px-4 w-16">Foto</th>
                        <th
                            className="py-3 px-4 min-w-[150px] cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort("kode_produk")}
                        >
                            <div className="flex items-center gap-1.5">
                                Kode Produk
                                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                        </th>
                        <th
                            className="py-3 px-4 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort("kategori")}
                        >
                            <div className="flex items-center gap-1.5">
                                Kategori
                                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                        </th>
                        <th
                            className="py-3 px-4 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort("harga_jual")}
                        >
                            <div className="flex items-center gap-1.5">
                                Harga Jual
                                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                        </th>
                        <th
                            className="py-3 px-4 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort("total_stok")}
                        >
                            <div className="flex items-center gap-1.5">
                                Stok
                                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                        </th>
                        <th className="py-3 px-4">Varian</th>
                        <th
                            className="py-3 px-4 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort("status")}
                        >
                            <div className="flex items-center gap-1.5">
                                Status
                                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                        </th>
                        <th className="py-3 px-4 text-center w-32">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {sortedProducts.length === 0 ? (
                        <tr>
                            <td
                                colSpan="9"
                                className="text-center py-10 text-gray-400 font-medium"
                            >
                                Tidak ada produk ditemukan.
                            </td>
                        </tr>
                    ) : (
                        sortedProducts.map((product, index) => {
                            const config = categoryConfig[product.kategori] || {
                                bg: "bg-gray-100 text-gray-500",
                                icon: Shirt,
                            };
                            const IconComponent = config.icon;

                            // Stock classes and progress bar info
                            const maxStockCapacity = 100;
                            const stockPercent = Math.min(
                                (product.total_stok / maxStockCapacity) * 100,
                                100,
                            );

                            let stockStatus = "normal";
                            if (product.total_stok === 0) stockStatus = "habis";
                            else if (product.total_stok < 5)
                                stockStatus = "menipis";

                            const displayStatus =
                                product.total_stok === 0
                                    ? "habis"
                                    : stockStatus === "menipis"
                                      ? "menipis"
                                      : product.status;

                            return (
                                <tr
                                    key={product.id}
                                    className="hover:bg-slate-50/50 transition-colors group odd:bg-white even:bg-slate-50/20"
                                >
                                    <td className="py-3 px-4 text-center font-medium text-gray-400">
                                        {index + 1}
                                    </td>
                                    <td className="py-3 px-4">
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.nama_produk}
                                                className="w-10 h-10 rounded-xl object-cover border shadow-sm"
                                            />
                                        ) : (
                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${config.bg}`}
                                            >
                                                <IconComponent className="w-5 h-5" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="font-bold text-gray-900 font-mono group-hover:text-emerald-600 transition-colors">
                                            {product.kode_produk}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="space-y-1">
                                            <ProductBadge
                                                type="kategori"
                                                value={product.kategori}
                                            />
                                            <div className="text-[10px] text-gray-400 pl-1">
                                                {product.sub_kategori}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        {/* Tampilan harga jual langsung disederhanakan tanpa pengecekan diskon */}
                                        <span className="text-gray-900 font-semibold">
                                            {formatRupiah(product.harga_jual)}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex flex-col gap-1.5 max-w-[80px]">
                                            <div className="flex items-center justify-between font-semibold text-gray-800">
                                                <span>
                                                    {product.total_stok} pcs
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-300 ${
                                                        stockStatus === "habis"
                                                            ? "bg-red-500"
                                                            : stockStatus ===
                                                                "menipis"
                                                              ? "bg-amber-500"
                                                              : "bg-emerald-500"
                                                    }`}
                                                    style={{
                                                        width: `${stockPercent}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="inline-block bg-slate-50 border border-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-[10px] font-medium">
                                            {getVariantSummary(product.varian)}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <ProductBadge
                                            type="status"
                                            value={displayStatus}
                                        />
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() =>
                                                    onOpenDrawer(product)
                                                }
                                                className="p-1.5 rounded-lg border border-gray-100 bg-white hover:bg-emerald-50 hover:text-emerald-600 transition-colors shadow-sm cursor-pointer"
                                                title="Lihat Detail"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    onOpenEdit(product)
                                                }
                                                className="p-1.5 rounded-lg border border-gray-100 bg-white hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-sm cursor-pointer"
                                                title="Edit Produk"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    onDeleteProduct(product)
                                                }
                                                className="p-1.5 rounded-lg border border-gray-100 bg-white hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm cursor-pointer"
                                                title="Hapus Produk"
                                            >
                                                <Trash className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
