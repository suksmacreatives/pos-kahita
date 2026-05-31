// resources/js/Components/Admin/Products/ProductFilterBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, Grid, List, X, ChevronDown, RefreshCw } from 'lucide-react';
import { useFilter } from '@/Context/FilterContext';
import { categoriesData } from '@/data/productsData';

export default function ProductFilterBar({
  searchQuery,
  setSearchQuery,
  selectedKategori,
  setSelectedKategori,
  selectedStatus,
  setSelectedStatus,
  viewMode,
  setViewMode
}) {
  const { outlet, setOutlet } = useFilter();
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isOutletOpen, setIsOutletOpen] = useState(false);
  
  const catRef = useRef(null);
  const statusRef = useRef(null);
  const outletRef = useRef(null);

  const categories = ['Semua Kategori', ...Object.keys(categoriesData)];
  const statuses = [
    { value: 'all', label: 'Semua Status' },
    { value: 'aktif', label: 'Aktif' },
    { value: 'nonaktif', label: 'Nonaktif' },
    { value: 'habis', label: 'Habis' }
  ];
  
  const outlets = [
    { value: 'all', label: 'Semua Outlet' },
    { value: 'denpasar', label: 'Outlet Denpasar' },
    { value: 'jakarta', label: 'Outlet Jakarta' },
    { value: 'bandung', label: 'Outlet Bandung' },
    { value: 'surabaya', label: 'Outlet Surabaya' }
  ];

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (catRef.current && !catRef.current.contains(event.target)) setIsCatOpen(false);
      if (statusRef.current && !statusRef.current.contains(event.target)) setIsStatusOpen(false);
      if (outletRef.current && !outletRef.current.contains(event.target)) setIsOutletOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasActiveFilters = 
    searchQuery !== '' || 
    (selectedKategori && selectedKategori !== 'Semua Kategori') || 
    selectedStatus !== 'all' || 
    outlet !== 'all';

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedKategori('Semua Kategori');
    setSelectedStatus('all');
    setOutlet('all');
  };

  const getOutletLabel = (val) => {
    const found = outlets.find(o => o.value === val);
    return found ? found.label : val;
  };

  const getStatusLabel = (val) => {
    const found = statuses.find(s => s.value === val);
    return found ? found.label : val;
  };

  return (
    <div className="space-y-3">
      {/* Baris 1: Main Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search & Selects Group */}
        <div className="flex flex-1 flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          {/* Search Bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, kode, kategori..."
              className="block w-full pl-10 pr-4 py-2 border border-gray-100 rounded-xl bg-white text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative z-20" ref={catRef}>
            <button
              onClick={() => setIsCatOpen(!isCatOpen)}
              className="flex items-center justify-between w-full sm:w-44 px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
            >
              <span className="truncate">{selectedKategori || 'Semua Kategori'}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isCatOpen ? 'rotate-180' : ''}`} />
            </button>
            {isCatOpen && (
              <ul className="absolute left-0 mt-1.5 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-35 py-1 text-xs">
                {categories.map((cat) => (
                  <li
                    key={cat}
                    onClick={() => {
                      setSelectedKategori(cat);
                      setIsCatOpen(false);
                    }}
                    className={`px-3 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedKategori === cat ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-600'
                    }`}
                  >
                    {cat}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative z-20" ref={statusRef}>
            <button
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="flex items-center justify-between w-full sm:w-36 px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
            >
              <span className="truncate">{getStatusLabel(selectedStatus)}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
            </button>
            {isStatusOpen && (
              <ul className="absolute left-0 mt-1.5 w-40 bg-white border border-gray-100 rounded-xl shadow-lg z-35 py-1 text-xs">
                {statuses.map((st) => (
                  <li
                    key={st.value}
                    onClick={() => {
                      setSelectedStatus(st.value);
                      setIsStatusOpen(false);
                    }}
                    className={`px-3 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedStatus === st.value ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-600'
                    }`}
                  >
                    {st.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Outlet Dropdown */}
          <div className="relative z-20" ref={outletRef}>
            <button
              onClick={() => setIsOutletOpen(!isOutletOpen)}
              className="flex items-center justify-between w-full sm:w-44 px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
            >
              <span className="truncate">{getOutletLabel(outlet)}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOutletOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOutletOpen && (
              <ul className="absolute left-0 mt-1.5 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-35 py-1 text-xs">
                {outlets.map((out) => (
                  <li
                    key={out.value}
                    onClick={() => {
                      setOutlet(out.value);
                      setIsOutletOpen(false);
                    }}
                    className={`px-3 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${
                      outlet === out.value ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-600'
                    }`}
                  >
                    {out.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* View Mode Toggle Button */}
        <div className="flex items-center self-end md:self-auto border border-gray-100 bg-white p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'table' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-gray-700'
            }`}
            title="Mode Tabel"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-gray-700'
            }`}
            title="Mode Grid"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Baris 2: Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-gray-400 mr-1.5 font-medium">Filter Aktif:</span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-600 rounded-lg">
              Cari: "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:text-red-500 ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedKategori && selectedKategori !== 'Semua Kategori' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg">
              Kategori: {selectedKategori}
              <button onClick={() => setSelectedKategori('Semua Kategori')} className="hover:text-red-500 ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedStatus !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg">
              Status: {getStatusLabel(selectedStatus)}
              <button onClick={() => setSelectedStatus('all')} className="hover:text-red-500 ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {outlet !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 border border-purple-100 text-purple-700 rounded-lg">
              Outlet: {getOutletLabel(outlet)}
              <button onClick={() => setOutlet('all')} className="hover:text-red-500 ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={resetAllFilters}
            className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-semibold px-2 py-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Reset filter
          </button>
        </div>
      )}
    </div>
  );
}
