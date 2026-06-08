//         // import { Link } from '@inertiajs/react';
// // import { useState, useRef, useEffect } from 'react';
// 
// // export default function AdminSidebar({ auth, outlets, currentOutlet, onOutletChange }) {
// //     // State untuk kontrol mengecilkan sidebar (Mini Sidebar)
// //     const [isCollapsed, setIsCollapsed] = useState(false);
// 
// //     // State untuk mengontrol custom dropdown outlet
// //     const [openOutletDropdown, setOpenOutletDropdown] = useState(false);
// 
// //     // State untuk kontrol dropdown sub-menu
// //     const [openReports, setOpenReports] = useState(false);
// //     const [openInventory, setOpenInventory] = useState(false);
// 
// //     const dropdownRef = useRef(null);
// 
// //     // Menutup custom dropdown outlet jika klik di luar daerah komponen
// //     useEffect(() => {
// //         function handleClickOutside(event) {
// //             if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
// //                 setOpenOutletDropdown(false);
// //             }
// //         }
// //         document.addEventListener("mousedown", handleClickOutside);
// //         return () => document.removeEventListener("mousedown", handleClickOutside);
// //     }, []);
// 
// //     // Ambil label teks outlet yang sedang aktif saat ini
// //     const activeOutletLabel = currentOutlet === 'all' 
// //         ? 'Semua Cabang (HQ)' 
// //         : outlets?.find(o => String(o.id) === String(currentOutlet))?.name || 'Pilih Cabang';
// 
// //     return (
// //         <div className="flex flex-shrink-0 h-screen relative z-30 transition-all duration-300">
//             
// //             {/* BADAN SIDEBAR UTAMA */}
// //             <aside className={`bg-white border-r border-gray-200 text-gray-700 flex flex-col h-screen shadow-sm transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
//                 
// //                 {/* BRANDING HEADER - LOGO K SEBAGAI TOMBOL BUKA TUTUP */}
// //                 <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50 h-[73px] overflow-hidden">
// //                     <button
// //                         type="button"
// //                         onClick={() => setIsCollapsed(!isCollapsed)}
// //                         className="flex items-center space-x-3 text-left focus:outline-none group w-full"
// //                         title={isCollapsed ? "Perluas Navigasi" : "Kecilkan Navigasi"}
// //                     >
// //                         {/* Logo K sebagai pemicu (trigger) utama */}
// //                         <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-extrabold text-xl shadow-sm flex-shrink-0 group-hover:bg-emerald-700 transition-colors">
// //                             K
// //                         </div>
//                         
// //                         {/* Judul teks otomatis tersembunyi dengan transisi halus tanpa merusak tata letak */}
// //                         {!isCollapsed && (
// //                             <div className="transition-opacity duration-200 whitespace-nowrap overflow-hidden">
// //                                 <h1 className="font-extrabold text-sm tracking-wide text-gray-800 uppercase flex items-center space-x-1">
// //                                     <span>Kahita Busana</span>
// //                                     <span className="text-[10px] text-gray-400 font-normal">◂</span>
// //                                 </h1>
// //                                 <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Pusat Manajemen</p>
// //                             </div>
// //                         )}
// //                     </button>
// //                 </div>
// 
// //                 {/* NAVIGASI UTAMA */}
// //                 <nav className="flex-1 p-3 space-y-4 overflow-y-auto select-none scrollbar-thin flex flex-col items-stretch">
//                     
// //                     {/* CUSTOM DROPDOWN OUTLET AKTIF (Sama Sekali Tidak Menggunakan Tag Select Bawaan) */}
// //                     <div className="space-y-1 px-1 relative" ref={dropdownRef}>
// //                         {!isCollapsed && (
// //                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block px-1">
// //                                 Outlet Aktif
// //                             </label>
// //                         )}
//                         
// //                         {/* Tombol Ikon Pemicu Dropdown */}
// //                         <button
// //                             type="button"
// //                             onClick={() => setOpenOutletDropdown(!openOutletDropdown)}
// //                             className={`w-full flex items-center bg-gray-50 border border-gray-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold hover:bg-gray-100 transition ${
// //                                 isCollapsed ? 'justify-center h-10 w-10 mx-auto p-0 text-base shadow-sm' : 'justify-between py-1.5 px-2.5 text-xs'
// //                             }`}
// //                             title={`Outlet: ${activeOutletLabel}`}
// //                         >
// //                             <div className="flex items-center space-x-2 truncate">
// //                                 <span className="text-sm flex-shrink-0">🌐</span>
// //                                 {!isCollapsed && <span className="truncate font-medium">{activeOutletLabel}</span>}
// //                             </div>
// //                             {/* Tanda panah kecil hanya tampil di mode desktop lebar */}
// //                             {!isCollapsed && (
// //                                 <svg className={`w-3 h-3 text-gray-400 transition-transform ${openOutletDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/>
// //                                 </svg>
// //                             )}
// //                         </button>
// 
// //                         {/* LAPISAN POPUP MENU PILIHAN OUTLET (Melayang ke Kanan jika Mode Mini) */}
// //                         {openOutletDropdown && (
// //                             <div className={`absolute bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50 text-xs w-56 ${
// //                                 isCollapsed ? 'left-14 top-0' : 'left-1 right-1 top-full mt-1'
// //                             }`}>
// //                                 <button
// //                                     type="button"
// //                                     onClick={() => {
// //                                         onOutletChange('all');
// //                                         setOpenOutletDropdown(false);
// //                                     }}
// //                                     className={`w-full text-left px-3 py-2 hover:bg-emerald-50 hover:text-emerald-600 font-medium flex items-center space-x-2 ${currentOutlet === 'all' ? 'bg-emerald-50/50 text-emerald-600 font-bold' : ''}`}
// //                                 >
// //                                     <span>🌐</span>
// //                                     <span>Semua Cabang (HQ)</span>
// //                                 </button>
// //                                 {outlets && outlets.map((outlet) => (
// //                                     <button
// //                                         key={outlet.id}
// //                                         type="button"
// //                                         onClick={() => {
// //                                             onOutletChange(outlet.id);
// //                                             setOpenOutletDropdown(false);
// //                                         }}
// //                                         className={`w-full text-left px-3 py-2 hover:bg-emerald-50 hover:text-emerald-600 font-medium flex items-center space-x-2 ${String(currentOutlet) === String(outlet.id) ? 'bg-emerald-50/50 text-emerald-600 font-bold' : ''}`}
// //                                     >
// //                                         <span>🏪</span>
// //                                         <span className="truncate">{outlet.name}</span>
// //                                     </button>
// //                                 ))}
// //                             </div>
// //                         )}
// //                     </div>
// 
// //                     {/* SEPARATOR BARIS */}
// //                     <div className="border-t border-gray-100 my-1"></div>
// 
// //                     {/* KELOMPOK MENU NAVIGASI UTAMA */}
// //                     <div className="space-y-1 flex-1">
// //                         {/* Dashboard Utama */}
// //                         <Link
// //                             href={route('admin.dashboard.index')}
// //                             className={`flex items-center rounded-lg text-xs font-semibold transition ${isCollapsed ? 'justify-center h-10 w-10 mx-auto' : 'space-x-3 px-3 py-2'} ${
// //                                 route().current('admin.dashboard.index')
// //                                     ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
// //                                     : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
// //                             }`}
// //                             title="Dashboard Utama"
// //                         >
// //                             <span className="text-sm flex-shrink-0">📊</span>
// //                             {!isCollapsed && <span>Dashboard Utama</span>}
// //                         </Link>
// 
// //                         {/* Kelola Staf & Akun */}
// //                         <Link
// //                             href={route('admin.staff.index')}
// //                             className={`flex items-center rounded-lg text-xs font-semibold transition ${isCollapsed ? 'justify-center h-10 w-10 mx-auto' : 'space-x-3 px-3 py-2'} ${
// //                                 route().current('admin.staff.index')
// //                                     ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
// //                                     : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
// //                             }`}
// //                             title="Kelola Staf & Akun"
// //                         >
// //                             <span className="text-sm flex-shrink-0">👥</span>
// //                             {!isCollapsed && <span>Kelola Staf & Akun</span>}
// //                         </Link>
// 
// //                         {/* Master Produk */}
// //                         <Link
// //                             href={route('admin.products.index')}
// //                             className={`flex items-center rounded-lg text-xs font-semibold transition ${isCollapsed ? 'justify-center h-10 w-10 mx-auto' : 'space-x-3 px-3 py-2'} ${
// //                                 route().current('admin.products.index')
// //                                     ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
// //                                     : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
// //                             }`}
// //                             title="Master Produk (Menu)"
// //                         >
// //                             <span className="text-sm flex-shrink-0">📦</span>
// //                             {!isCollapsed && <span>Master Produk (Menu)</span>}
// //                         </Link>
// 
// //                         {/* Kelola Promo */}
// //                         <Link
// //                             href={route('admin.promos.index')}
// //                             className={`flex items-center rounded-lg text-xs font-semibold transition ${isCollapsed ? 'justify-center h-10 w-10 mx-auto' : 'space-x-3 px-3 py-2'} ${
// //                                 route().current('admin.promos.index')
// //                                     ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
// //                                     : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
// //                             }`}
// //                             title="Kelola Promo / Diskon"
// //                         >
// //                             <span className="text-sm flex-shrink-0">🎟️</span>
// //                             {!isCollapsed && <span>Kelola Promo / Diskon</span>}
// //                         </Link>
// 
// //                         {/* MENU DROPDOWN: LAPORAN PENJUALAN */}
// //                         <div className="space-y-1">
// //                             <button
// //                                 type="button"
// //                                 onClick={() => {
// //                                     if (isCollapsed) setIsCollapsed(false); // Otomatis perluas jika diklik saat mini
// //                                     setOpenReports(!openReports);
// //                                 }}
// //                                 className={`w-full flex items-center rounded-lg text-xs font-semibold transition ${isCollapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 py-2'} ${
// //                                     openReports && !isCollapsed ? 'bg-gray-50 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
// //                                 }`}
// //                                 title="Laporan Penjualan"
// //                             >
// //                                 <div className="flex items-center space-x-3 truncate">
// //                                     <span className="text-sm flex-shrink-0">📈</span>
// //                                     {!isCollapsed && <span>Laporan Penjualan</span>}
// //                                 </div>
// //                                 {!isCollapsed && (
// //                                     <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 flex-shrink-0 ${openReports ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
// //                                     </svg>
// //                                 )}
// //                             </button>
// 
// //                             {openReports && !isCollapsed && (
// //                                 <div className="pl-9 pr-1 py-1 space-y-1 bg-gray-50/50 rounded-lg border border-gray-100/50 mt-1">
// //                                     <Link href={route('admin.reports.summary')} className="block py-1.5 text-[11px] text-gray-500 hover:text-emerald-600 font-medium transition">Ringkasan Omset</Link>
// //                                     <Link href={route('admin.reports.outlet')} className="block py-1.5 text-[11px] text-gray-500 hover:text-emerald-600 font-medium transition">Per-Outlet Cabang</Link>
// //                                     <Link href={route('admin.reports.payment')} className="block py-1.5 text-[11px] text-gray-500 hover:text-emerald-600 font-medium transition">Metode Pembayaran</Link>
// //                                     <Link href={route('admin.reports.void')} className="block py-1.5 text-[11px] text-gray-500 hover:text-emerald-600 font-medium transition">Laporan Void (Batal)</Link>
// //                                     <Link href={route('admin.reports.refund')} className="block py-1.5 text-[11px] text-gray-500 hover:text-emerald-600 font-medium transition">Laporan Refund</Link>
// //                                 </div>
// //                             )}
// //                         </div>
// 
// //                         {/* MENU DROPDOWN: INVENTORY */}
// //                         <div className="space-y-1">
// //                             <button
// //                                 type="button"
// //                                 onClick={() => {
// //                                     if (isCollapsed) setIsCollapsed(false);
// //                                     setOpenInventory(!openInventory);
// //                                 }}
// //                                 className={`w-full flex items-center rounded-lg text-xs font-semibold transition ${isCollapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 py-2'} ${
// //                                     openInventory && !isCollapsed ? 'bg-gray-50 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
// //                                 }`}
// //                                 title="Inventory & Stok"
// //                             >
// //                                 <div className="flex items-center space-x-3 truncate">
// //                                     <span className="text-sm flex-shrink-0">🏬</span>
// //                                     {!isCollapsed && <span>Inventory & Stok</span>}
// //                                 </div>
// //                                 {!isCollapsed && (
// //                                     <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 flex-shrink-0 ${openInventory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
// //                                     </svg>
// //                                 )}
// //                             </button>
// 
// //                             {openInventory && !isCollapsed && (
// //                                 <div className="pl-9 pr-1 py-1 space-y-1 bg-gray-50/50 rounded-lg border border-gray-100/50 mt-1">
// //                                     <Link href={route('admin.inventory.central')} className="block py-1.5 text-[11px] text-gray-500 hover:text-emerald-600 font-medium transition">Stok Gudang Pusat</Link>
// //                                     <Link href={route('admin.inventory.branch')} className="block py-1.5 text-[11px] text-gray-500 hover:text-emerald-600 font-medium transition">Stok di Cabang</Link>
// //                                     <Link href={route('admin.inventory.mutation')} className="block py-1.5 text-[11px] text-gray-500 hover:text-emerald-600 font-medium transition">Mutasi / Transfer Stok</Link>
// //                                 </div>
// //                             )}
// //                         </div>
// //                     </div>
// 
// //                 </nav>
// 
// //                 {/* PROFILE FOOTER USER & LOGOUT */}
// //                 <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between h-[60px] overflow-hidden">
// //                     <div className="flex items-center space-x-2.5 overflow-hidden mx-auto lg:mx-0">
// //                         <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700 shadow-inner flex-shrink-0">
// //                             {auth.user.name.charAt(0).toUpperCase()}
// //                         </div>
// //                         {!isCollapsed && (
// //                             <div className="truncate whitespace-nowrap">
// //                                 <p className="text-xs font-bold text-gray-800 truncate">{auth.user.name}</p>
// //                                 <p className="text-[10px] text-gray-400 font-medium capitalize">{auth.user.role} Pusat</p>
// //                             </div>
// //                         )}
// //                     </div>
//                     
// //                     {!isCollapsed && (
// //                         <Link
// //                             href={route('logout')}
// //                             method="post"
// //                             as="button"
// //                             className="p-1.5 rounded-md text-gray-400 hover:bg-gray-200 hover:text-red-500 transition text-xs flex-shrink-0"
// //                             title="Keluar Aplikasi"
// //                         >
// //                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
// //                             </svg>
// //                         </Link>
// //                     )}
// //                 </div>
// //             </aside>
// //         </div>
// //     );
// // }
