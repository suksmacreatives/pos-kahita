import React, { useState } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { Menu, Bell, Search, ChevronDown, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import OutletDropdownFilter from './OutletDropdownFilter';
import PeriodDropdownFilter from './PeriodDropdownFilter';

export default function Topbar({ onToggleSidebar }) {
  const { auth } = usePage().props;
  const userName = auth?.user?.name || 'Admin Pusat';
  const userEmail = auth?.user?.email || 'admin@kahita.com';
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Helper to safely resolve Laravel routes with a string fallback if not defined in Ziggy
  const getRoute = (name, fallback) => {
    try {
      return route(name);
    } catch (e) {
      return fallback;
    }
  };

  return (
    <header className="sticky top-0 right-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shadow-sm">
      {/* Left Section: Mobile Menu + Search */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 md:hidden transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5.5 h-5.5" />
        </button>

        {/* Search Bar (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 w-72 focus-within:ring-1 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all duration-200">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari transaksi, produk, mutasi..."
            className="bg-transparent border-none text-xs text-gray-900 placeholder-gray-400 outline-none w-full p-0 focus:ring-0"
          />
        </div>
      </div>

      {/* Right Section: Filters & Profile Controls */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Filters */}
        <div className="flex items-center gap-2">
          <OutletDropdownFilter />
          <PeriodDropdownFilter />
        </div>

        <div className="w-px h-6 bg-gray-100 hidden sm:block" />

        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            className="relative p-2 rounded-xl text-gray-500 hover:text-gray-950 hover:bg-gray-50 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsNotificationsOpen(false)} />
              <div className="absolute right-0 mt-2.5 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-40 p-4 transform origin-top-right transition-all duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-gray-50 mb-3">
                  <span className="font-semibold text-xs text-gray-900">Notifikasi Baru</span>
                  <span className="text-[10px] text-emerald-600 font-medium hover:underline cursor-pointer">Tandai dibaca</span>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-2.5 items-start p-1.5 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                    <span className="w-2 h-2 mt-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-800 font-medium leading-normal">Stok Paper Cup Hot 8oz kritis (&lt; 100 pcs) di Bandung</p>
                      <span className="text-[10px] text-gray-400 block mt-0.5">8 menit yang lalu</span>
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-start p-1.5 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                    <span className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-800 font-medium leading-normal">Transfer Mutasi Susu UHT 120 Pcs menunggu persetujuan</p>
                      <span className="text-[10px] text-gray-400 block mt-0.5">45 menit yang lalu</span>
                    </div>
                  </div>
                </div>
                <div className="text-center pt-3 border-t border-gray-50 mt-3">
                  <span className="text-xs text-gray-500 hover:text-gray-900 cursor-pointer font-medium">Lihat Semua Notifikasi</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-2 p-1 md:py-1.5 md:pl-2 md:pr-1.5 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
          >
            <div className="w-7.5 h-7.5 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <span className="hidden md:block text-xs font-semibold text-gray-700 truncate max-w-28">{userName}</span>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 mt-2.5 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-40 p-2 transform origin-top-right transition-all duration-200">
                <div className="px-3 py-2 border-b border-gray-50 mb-1.5">
                  <p className="text-xs font-bold text-gray-900 truncate">{userName}</p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">{userEmail}</p>
                </div>
                
                <Link
                  href={getRoute('profile.edit', '/profile')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <User className="w-4 h-4 text-gray-400" />
                  Profil Saya
                </Link>

                <Link
                  href="/admin/settings"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <SettingsIcon className="w-4 h-4 text-gray-400" />
                  Pengaturan
                </Link>

                <div className="h-px bg-gray-50 my-1.5" />

                <Link
                  method="post"
                  as="button"
                  href={getRoute('logout', '/logout')}
                  className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Keluar Akun
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
