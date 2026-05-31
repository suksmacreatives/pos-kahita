import React, { useState } from 'react';
import Sidebar from '@/Components/Admin/Sidebar';
import Topbar from '@/Components/Admin/Topbar';
import { FilterProvider } from '@/Context/FilterContext';

export default function AdminLayout({ children }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <FilterProvider>
      <div className="min-h-screen bg-[#F8FAFC] text-gray-900 flex font-sans antialiased">
        {/* Desktop Sidebar & Mobile Sidebar Wrapper */}
        <Sidebar 
          isOpen={isMobileSidebarOpen} 
          onClose={() => setIsMobileSidebarOpen(false)} 
        />

        {/* Content Wrapper (Offset for fixed 260px sidebar on medium/large screens) */}
        <div className="flex-1 flex flex-col min-w-0 md:pl-[260px]">
          {/* Sticky Topbar */}
          <Topbar 
            onToggleSidebar={() => setIsMobileSidebarOpen(true)} 
          />

          {/* Main App Content Area */}
          <main className="flex-grow p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto transition-all duration-300">
            {children}
          </main>

          {/* Optional: Footer */}
          <footer className="py-4 px-6 md:px-8 border-t border-gray-100 bg-white text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Suksema Creatives. All rights reserved.
          </footer>
        </div>
      </div>
    </FilterProvider>
  );
}
