import React, { useState, useEffect, useRef } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import { Menu, Bell, BellDot, Search, ChevronDown, User, LogOut, Settings as SettingsIcon, Package, Clock, AlertTriangle, Info } from 'lucide-react';
import OutletDropdownFilter from './OutletDropdownFilter';
import PeriodDropdownFilter from './PeriodDropdownFilter';

const NOTIF_ICONS = { package: Package, clock: Clock, 'alert-triangle': AlertTriangle, bell: Bell, info: Info };
const NOTIF_COLORS = { danger: 'red', warning: 'amber', info: 'blue', success: 'emerald' };

export default function Topbar({ onToggleSidebar }) {
  const { auth, notifications: notifProp } = usePage().props;
  const userName = auth?.user?.name || 'Admin Pusat';
  const userEmail = auth?.user?.email || 'admin@kahita.com';

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const bellRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isNotificationsOpen && bellRef.current && !bellRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
      if (isProfileOpen && profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isNotificationsOpen, isProfileOpen]);

  const notifications = notifProp?.data || [];
  const unreadCount = notifProp?.unread_count || 0;

  useEffect(() => {
    const interval = setInterval(() => {
      router.reload({ only: ['notifications'], preserveState: true });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id) => {
    router.post(route('admin.notifications.read', id), {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const markAllAsRead = () => {
    router.post(route('admin.notifications.read-all'), {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleNotifClick = (n) => {
    if (!n.is_read) markAsRead(n.id);
    setIsNotificationsOpen(false);
    if (n.link) window.location.href = n.link;
  };

  const severityDotColor = (severity) => {
    const map = { danger: 'bg-red-500', warning: 'bg-amber-500', info: 'bg-blue-500', success: 'bg-emerald-500' };
    return map[severity] || 'bg-gray-400';
  };

  return (
    <header className="sticky top-0 right-0 z-50 h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 md:hidden transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5.5 h-5.5" />
        </button>

        <div className="hidden lg:flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 w-72 focus-within:ring-1 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all duration-200">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari transaksi, produk, mutasi..."
            className="bg-transparent border-none text-xs text-gray-900 placeholder-gray-400 outline-none w-full p-0 focus:ring-0"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <div className="flex items-center gap-2">
          <OutletDropdownFilter />
          <PeriodDropdownFilter />
        </div>

        <div className="w-px h-6 bg-gray-100 hidden sm:block" />

        <div className="relative" ref={bellRef}>
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            className="relative p-2 rounded-xl text-gray-500 hover:text-gray-950 hover:bg-gray-50 transition-colors"
            aria-label="Notifications"
          >
            {unreadCount > 0 ? <BellDot className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <>
              <div className="absolute right-0 mt-2.5 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-[60] transform origin-top-right transition-all duration-200">
                <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-50">
                  <span className="font-semibold text-xs text-gray-900">
                    Notifikasi {unreadCount > 0 && <span className="text-emerald-600 font-bold">({unreadCount})</span>}
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] text-emerald-600 font-medium hover:underline"
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-[320px] overflow-y-auto">
                  {!notifProp ? (
                    <div className="p-4 space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-2.5 items-start p-1.5 animate-pulse">
                          <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-200 flex-shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-3 bg-gray-200 rounded w-3/4" />
                            <div className="h-2 bg-gray-100 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">Tidak ada notifikasi</p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {notifications.map((n) => {
                        const IconComp = NOTIF_ICONS[n.icon] || Bell;
                        return (
                          <div
                            key={n.id}
                            onClick={() => handleNotifClick(n)}
                            className={`flex gap-2.5 items-start p-2 rounded-xl transition-colors cursor-pointer ${
                              n.is_read ? 'hover:bg-gray-50' : 'bg-emerald-50/40 hover:bg-emerald-50'
                            }`}
                          >
                            <span className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${n.is_read ? 'bg-transparent' : severityDotColor(n.severity)}`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs leading-normal ${n.is_read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                {n.message}
                              </p>
                              <span className="text-[10px] text-gray-400 block mt-0.5">{n.time_ago}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="text-center pt-3 pb-4 border-t border-gray-50 mt-1">
                    <Link
                      href="/admin/settings?tab=notifikasi"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-xs text-gray-500 hover:text-gray-900 cursor-pointer font-medium inline-block"
                    >
                      Lihat Semua Notifikasi
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="relative" ref={profileRef}>
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

          {isProfileOpen && (
            <>
              <div className="absolute right-0 mt-2.5 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-40 p-2 transform origin-top-right transition-all duration-200">
                <div className="px-3 py-2 border-b border-gray-50 mb-1.5">
                  <p className="text-xs font-bold text-gray-900 truncate">{userName}</p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">{userEmail}</p>
                </div>

                <Link
                  href={route('profile.edit')}
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
                  href={route('logout')}
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
