import React, { createContext, useContext, useState, useCallback } from 'react';

// Create Filter Context
const FilterContext = createContext();

// Provider Component
export function FilterProvider({ children, initialOutlet = null }) {
  // Disimpan sebagai string agar tipe konsisten dengan nilai yang dikirim
  // OutletDropdownFilter (String(o.id)). Sebelumnya nilai dari auth.user
  // berupa angka, sehingga perbandingan `outlet === optValue` di dropdown
  // selalu gagal dan labelnya jatuh ke "Semua Outlet".
  const [outlet, setOutletState] = useState(
    initialOutlet !== null && initialOutlet !== undefined ? String(initialOutlet) : 'all'
  );
  const [period, setPeriod] = useState('monthly');

  const setOutlet = useCallback((val) => {
    if (initialOutlet) return;
    setOutletState(val === null || val === undefined ? 'all' : String(val));
  }, [initialOutlet]);

  return (
    <FilterContext.Provider value={{ outlet, setOutlet, period, setPeriod }}>
      {children}
    </FilterContext.Provider>
  );
}

// Custom Hook to consume filter context
export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}

export default FilterContext;
