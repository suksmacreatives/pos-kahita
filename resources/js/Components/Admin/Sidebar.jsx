import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    ShoppingBag,
    Layers,
    Warehouse,
    Store,
    Receipt,
    BarChart3,
    Settings,
    X,
    Coffee,
    UserCheck,
    Shirt,
    Package,
    Users2,
    Wallet,
    Tag,
    ChevronDown,
} from "lucide-react";

// === KOMPONEN SUB-MENU DROPDOWN ===
const SidebarDropdown = ({ item, currentUrl, checkActive }) => {
    // Cek apakah ada salah satu anak sub-menu yang sedang aktif saat ini
    const isChildActive = item.children.some((child) => checkActive(child));

    // State untuk buka/tutup dropdown (otomatis terbuka jika sub-menunya sedang diakses)
    const [isOpen, setIsOpen] = useState(isChildActive);
    const Icon = item.icon;

    return (
        <div className="w-full space-y-1">
            {/* Tombol Pemicu Dropdown */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative
          ${
              isChildActive
                  ? "bg-emerald-50/60 text-emerald-700 font-semibold"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/70"
          }
        `}
            >
                {/* Active Border Indicator jika anak aktif */}
                {isChildActive && (
                    <span className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-600 rounded-r-full" />
                )}

                <div className="flex items-center gap-3">
                    <Icon
                        className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${isChildActive ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-600"}`}
                    />
                    <span>{item.label}</span>
                </div>

                {/* Panah Indikator */}
                <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-emerald-600" : ""}`}
                />
            </button>

            {/* Konten Dropdown (Sub-Items) */}
            {isOpen && (
                <div className="pl-11 pr-2 space-y-1 animate-fadeIn">
                    {item.children.map((child) => {
                        const childActive = checkActive(child);
                        return (
                            <Link
                                key={child.label}
                                href={child.href}
                                className={`
                  block px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150
                  ${
                      childActive
                          ? "text-emerald-700 font-semibold bg-emerald-50/40"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/50"
                  }
                `}
                            >
                                {child.label}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// === KOMPONEN UTAMA SIDEBAR ===
export default function Sidebar({ isOpen, onClose }) {
    const { url } = usePage();
    const { auth } = usePage().props;
    const user = auth?.user;
    const isScoped = !!user?.outlet_id;

    const getRoute = (name, fallback) => {
        try {
            return route(name);
        } catch (e) {
            return fallback;
        }
    };

    const menuItems = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: getRoute("admin.dashboard.index", "/admin/dashboard"),
            pattern: /^\/admin\/dashboard/,
        },
        {
            label: "Products",
            icon: Shirt,
            href: getRoute("admin.products.index", "/admin/products"),
            pattern: /^\/admin\/products/,
        },
        {
            label: "Categories",
            icon: Tag,
            href: getRoute("admin.categories.index", "/admin/categories"),
            pattern: /^\/admin\/categories/,
        },
        {
            label: "Inventory",
            icon: Layers,
            children: [
                ...(isScoped ? [] : [{
                    label: "Gudang",
                    href: getRoute(
                        "admin.inventory.gudang",
                        "/admin/inventory/gudang",
                    ),
                    pattern: /^\/admin\/inventory\/gudang/,
                }]),
                {
                    label: "Outlet",
                    href: getRoute(
                        "admin.inventory.outlet",
                        "/admin/inventory/outlet",
                    ),
                    pattern: /^\/admin\/inventory\/outlet/,
                },
                ...(isScoped ? [] : [{
                    label: "Online Shop",
                    href: getRoute(
                        "admin.inventory.online-shop",
                        "/admin/inventory/online-shop",
                    ),
                    pattern: /^\/admin\/inventory\/online-shop/,
                }]),
            ],
        },
        ...(isScoped ? [] : [{
            label: "Outlets",
            icon: Store,
            href: getRoute("admin.outlets.index", "/admin/outlets"),
            pattern: /^\/admin\/outlets/,
        }]),
        {
            label: "Reports",
            icon: BarChart3,
            children: [
                {
                    label: "Laporan Penjualan",
                    href: getRoute("admin.reports.index", "/admin/reports") + "?kategori=penjualan&sub=ringkasan-omset",
                    pattern: /kategori=penjualan/,
                },
                {
                    label: "Laporan Produk",
                    href: getRoute("admin.reports.index", "/admin/reports") + "?kategori=produk&sub=produk-terlaris",
                    pattern: /kategori=produk/,
                },
                {
                    label: "Laporan Inventori",
                    href: getRoute("admin.reports.index", "/admin/reports") + "?kategori=inventori&sub=mutasi-stok",
                    pattern: /kategori=inventori/,
                },
                {
                    label: "Laporan Kasir",
                    href: getRoute("admin.reports.index", "/admin/reports") + "?kategori=kasir&sub=performa-kasir",
                    pattern: /kategori=kasir/,
                },
                {
                    label: "Laporan Keuangan",
                    href: getRoute("admin.reports.index", "/admin/reports") + "?kategori=keuangan&sub=laba-rugi",
                    pattern: /kategori=keuangan/,
                },
            ],
        },
        {
            label: "Settings",
            icon: Settings,
            children: [
                {
                    label: "Kelola Akun",
                    href: "/admin/settings?tab=kelola_akun",
                    pattern: /tab=kelola_akun/,
                },
                {
                    label: "Promo",
                    href: "/admin/settings?tab=promo",
                    pattern: /tab=promo/,
                },
                {
                    label: "Log Aktivitas",
                    href: "/admin/settings?tab=log_aktivitas",
                    pattern: /tab=log_aktivitas/,
                },
                {
                    label: "Notifikasi",
                    href: "/admin/settings?tab=notifikasi",
                    pattern: /tab=notifikasi/,
                },
            ],
        },
    ];

    const checkActive = (item) => {
        if (item.pattern) {
            return item.pattern.test(url);
        }
        return url === item.href;
    };

    return (
        <>
            {/* Mobile Sidebar Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Shell */}
            <aside
                className={`
        fixed top-0 bottom-0 left-0 z-50 
        w-[260px] bg-white border-r border-gray-100 
        flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        md:translate-x-0 
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
            >
                {/* Brand / Top Section */}
                <div>
                    <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between">
                        <Link
                            href="/"
                            className="flex items-center gap-2.5 group"
                        >
                            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
                                <Store className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="font-semibold text-gray-900 text-base leading-none block">
                                    Kahita Busana POS
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase mt-0.5 block">
                                    {isScoped ? 'Admin Outlet' : 'HQ Admin'}
                                </span>
                            </div>
                        </Link>

                        {/* Mobile Close Button */}
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-50 md:hidden transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
                        {menuItems.map((item) => {
                            // JIKA MEMILIKI ANAK/CHILDREN -> Render sebagai Dropdown
                            if (item.children) {
                                return (
                                    <SidebarDropdown
                                        key={item.label}
                                        item={item}
                                        currentUrl={url}
                                        checkActive={checkActive}
                                    />
                                );
                            }

                            // JIKA MENU BIASA -> Render Link seperti kode lama Anda
                            const active = checkActive(item);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative
                    ${
                        active
                            ? "bg-emerald-50 text-emerald-700 font-semibold"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/70"
                    }
                  `}
                                >
                                    {active && (
                                        <span className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-600 rounded-r-full" />
                                    )}

                                    <Icon
                                        className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${active ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-600"}`}
                                    />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer / Profile Section */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3 px-2 py-1.5">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-semibold text-sm">
                            {(user?.nama || user?.name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-gray-900 truncate">
                                {user?.nama || user?.name || 'Admin'}
                            </p>
                            <p className="text-[10px] text-gray-400 truncate">
                                {user?.email || ''}
                            </p>
                        </div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-500/30" />
                    </div>
                </div>
            </aside>
        </>
    );
}
