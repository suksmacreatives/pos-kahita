import React, { createContext, useContext, useState, useCallback } from 'react';

// Create Filter Context
const FilterContext = createContext();

// Provider Component
export function FilterProvider({ children, initialOutlet = null }) {
  const [outlet, setOutletState] = useState(initialOutlet || 'all');
  const [period, setPeriod] = useState('monthly');

  const setOutlet = useCallback((val) => {
    if (initialOutlet) return;
    setOutletState(val);
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
