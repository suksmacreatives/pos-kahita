import React, { useState } from "react";
import {
    Search,
    RefreshCcw,
    FileSpreadsheet,
    FileText,
    Package,
    AlertTriangle,
    Archive,
    Boxes
} from "lucide-react";

export default function InventoryStockView({
    products = [],
    categories = [],
}) {

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState("");

    const filteredProducts = products.filter((item) => {

        const keyword =
            item.name?.toLowerCase().includes(search.toLowerCase()) ||
            item.sku?.toLowerCase().includes(search.toLowerCase());

        const categoryMatch =
            !category ||
            item.category?.id == category;

        let statusMatch = true;

        if (status === "habis") {
            statusMatch = item.stock <= 0;
        }

        if (status === "menipis") {
            statusMatch = item.stock > 0 && item.stock <= 5;
        }

        if (status === "aman") {
            statusMatch = item.stock > 5;
        }

        return keyword && categoryMatch && statusMatch;
    });

    const totalStock =
        products.reduce(
            (sum, item) => sum + Number(item.stock || 0),
            0
        );

    const lowStock =
        products.filter(
            (item) =>
                item.stock > 0 &&
                item.stock <= 5
        ).length;

    const outStock =
        products.filter(
            (item) => item.stock <= 0
        ).length;

    return (
        <div className="flex-1 bg-[#f7f8fa] p-5 overflow-y-auto">

            {/* HEADER */}

            <div className="mb-5">

                <h1 className="text-2xl font-black text-slate-800">
                    Inventory Stock
                </h1>

                <p className="text-sm text-slate-500">
                    Monitoring stok seluruh produk outlet
                </p>

            </div>

            {/* KPI */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">

                <div className="bg-white border rounded-xl p-5">
                    <div className="flex justify-between">
                        <div>
                            <p className="text-xs text-slate-500">
                                Total SKU
                            </p>

                            <h2 className="text-3xl font-black mt-2">
                                {products.length}
                            </h2>
                        </div>

                        <Package className="text-slate-400" />
                    </div>
                </div>

                <div className="bg-white border rounded-xl p-5">
                    <div className="flex justify-between">
                        <div>
                            <p className="text-xs text-slate-500">
                                Total Stock
                            </p>

                            <h2 className="text-3xl font-black mt-2">
                                {totalStock}
                            </h2>
                        </div>

                        <Boxes className="text-emerald-500" />
                    </div>
                </div>

                <div className="bg-white border rounded-xl p-5">
                    <div className="flex justify-between">
                        <div>
                            <p className="text-xs text-slate-500">
                                Menipis
                            </p>

                            <h2 className="text-3xl font-black mt-2 text-amber-500">
                                {lowStock}
                            </h2>
                        </div>

                        <AlertTriangle className="text-amber-500" />
                    </div>
                </div>

                <div className="bg-white border rounded-xl p-5">
                    <div className="flex justify-between">
                        <div>
                            <p className="text-xs text-slate-500">
                                Habis
                            </p>

                            <h2 className="text-3xl font-black mt-2 text-red-500">
                                {outStock}
                            </h2>
                        </div>

                        <Archive className="text-red-500" />
                    </div>
                </div>

            </div>

            {/* FILTER */}

            <div className="bg-white border rounded-xl p-4 mb-5">

                <div className="grid xl:grid-cols-12 gap-3">

                    <div className="xl:col-span-5 relative">

                        <Search
                            size={16}
                            className="absolute left-3 top-3 text-slate-400"
                        />

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Cari produk atau SKU..."
                            className="w-full border rounded-lg pl-10 pr-3 py-2"
                        />

                    </div>

                    <div className="xl:col-span-2">

                        <select
                            value={category}
                            onChange={(e) =>
                                setCategory(e.target.value)
                            }
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value="">
                                Semua Kategori
                            </option>

                            {categories.map((cat) => (
                                <option
                                    key={cat.id}
                                    value={cat.id}
                                >
                                    {cat.name}
                                </option>
                            ))}
                        </select>

                    </div>

                    <div className="xl:col-span-2">

                        <select
                            value={status}
                            onChange={(e) =>
                                setStatus(e.target.value)
                            }
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value="">
                                Semua Status
                            </option>

                            <option value="aman">
                                Aman
                            </option>

                            <option value="menipis">
                                Menipis
                            </option>

                            <option value="habis">
                                Habis
                            </option>

                        </select>

                    </div>

                    <div className="xl:col-span-3 flex gap-2">

                        <button className="flex-1 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2">
                            <FileSpreadsheet size={16} />
                            Excel
                        </button>

                        <button className="flex-1 bg-red-600 text-white rounded-lg flex items-center justify-center gap-2">
                            <FileText size={16} />
                            PDF
                        </button>

                        <button className="w-12 border rounded-lg flex items-center justify-center">
                            <RefreshCcw size={16} />
                        </button>

                    </div>

                </div>

            </div>

            {/* TABLE */}

            <div className="bg-white border rounded-xl overflow-hidden">

                <div className="overflow-x-auto">

                    <table className="w-full">

                        <thead>

                            <tr className="bg-slate-50 text-slate-600 text-xs uppercase">

                                <th className="p-4 text-left">
                                    Produk
                                </th>

                                <th className="p-4 text-left">
                                    SKU
                                </th>

                                <th className="p-4 text-left">
                                    Kategori
                                </th>

                                <th className="p-4 text-right">
                                    Harga
                                </th>

                                <th className="p-4 text-center">
                                    Stock
                                </th>

                                <th className="p-4 text-center">
                                    Status
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {filteredProducts.map((product) => {

                                let badge =
                                    "bg-green-100 text-green-700";

                                let label = "Aman";

                                if (product.stock <= 0) {
                                    badge =
                                        "bg-red-100 text-red-700";

                                    label = "Habis";
                                }

                                else if (
                                    product.stock <= 5
                                ) {
                                    badge =
                                        "bg-yellow-100 text-yellow-700";

                                    label = "Menipis";
                                }

                                return (

                                    <tr
                                        key={product.id}
                                        className="border-t hover:bg-slate-50"
                                    >

                                        <td className="p-4">

                                            <div className="flex items-center gap-3">

                                                <div className="w-12 h-12 rounded-lg overflow-hidden border bg-slate-50">

                                                    {product.image ? (
                                                        <img
                                                            src={product.image}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-300">
                                                            IMG
                                                        </div>
                                                    )}

                                                </div>

                                                <div>

                                                    <div className="font-bold text-slate-800">
                                                        {product.name}
                                                    </div>

                                                </div>

                                            </div>

                                        </td>

                                        <td className="p-4 text-sm">
                                            {product.sku}
                                        </td>

                                        <td className="p-4 text-sm">
                                            {product.category?.name}
                                        </td>

                                        <td className="p-4 text-right font-bold">
                                            Rp{" "}
                                            {Number(
                                                product.price
                                            ).toLocaleString(
                                                "id-ID"
                                            )}
                                        </td>

                                        <td className="p-4 text-center font-bold">
                                            {product.stock}
                                        </td>

                                        <td className="p-4 text-center">

                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${badge}`}
                                            >
                                                {label}
                                            </span>

                                        </td>

                                    </tr>
                                );
                            })}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}