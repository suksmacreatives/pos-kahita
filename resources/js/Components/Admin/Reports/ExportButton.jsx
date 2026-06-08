import React, { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Download, FileText, FileSpreadsheet, Printer } from 'lucide-react';

export default function ExportButton({ kategori, sub, filters }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleExport = (format) => {
    router.post(
      route('admin.reports.export'),
      { kategori, sub, ...filters, format },
      { preserveState: true, preserveScroll: true }
    );
    setIsOpen(false);
  };

  const handlePrint = () => {
    window.print();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
      >
        <Download size={18} />
        <span className="font-medium text-sm">Export</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          <button
            onClick={() => handleExport('pdf')}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
          >
            <FileText size={16} className="text-rose-500" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
          >
            <FileSpreadsheet size={16} className="text-emerald-500" />
            <span>Export Excel</span>
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={handlePrint}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
          >
            <Printer size={16} className="text-blue-500" />
            <span>Print</span>
          </button>
        </div>
      )}
    </div>
  );
}
