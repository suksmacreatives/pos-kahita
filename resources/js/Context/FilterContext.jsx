import React, { createContext, useContext, useState } from 'react';

// Create Filter Context
const FilterContext = createContext();

// Provider Component
export function FilterProvider({ children }) {
  const [outlet, setOutlet] = useState('all');
  const [period, setPeriod] = useState('monthly'); // Default to monthly for better initial metrics

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
