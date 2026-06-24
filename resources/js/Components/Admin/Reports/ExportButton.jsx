import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, Printer } from 'lucide-react';

export default function ExportButton({ routeName, params = {}, showPrint = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(null);
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

  const handleExport = async (format) => {
    setLoading(format);
    try {
      const fd = new FormData();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          fd.append(key, value);
        }
      });
      fd.append('format', format);

      const response = await fetch(route(routeName), {
        method: 'POST',
        body: fd,
      });

      if (!response.ok) {
        console.error('Export failed:', await response.text());
        alert('Gagal mengexport data. Silakan coba lagi.');
        return;
      }

      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition');
      let filename = `export-${format === 'excel' ? 'xlsx' : 'pdf'}`;
      if (disposition) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match) filename = match[1].replace(/['"]/g, '');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Gagal mengexport data. Silakan coba lagi.');
    }
    setLoading(null);
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
        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
      >
        <Download size={18} />
        <span>Export</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          <button
            onClick={() => handleExport('pdf')}
            disabled={loading === 'pdf'}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 disabled:opacity-50"
          >
            <FileText size={16} className="text-rose-500" />
            <span>{loading === 'pdf' ? 'Loading...' : 'Export PDF'}</span>
          </button>
          <button
            onClick={() => handleExport('excel')}
            disabled={loading === 'excel'}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 disabled:opacity-50"
          >
            <FileSpreadsheet size={16} className="text-emerald-500" />
            <span>{loading === 'excel' ? 'Loading...' : 'Export Excel'}</span>
          </button>
          {showPrint && (
            <>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={handlePrint}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <Printer size={16} className="text-blue-500" />
                <span>Print</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
