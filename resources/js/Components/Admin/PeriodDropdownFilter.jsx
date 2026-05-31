import React, { useState, useRef, useEffect } from 'react';
import { useFilter } from '@/Context/FilterContext';
import { Calendar, ChevronDown, Check } from 'lucide-react';

export default function PeriodDropdownFilter() {
  const { period, setPeriod } = useFilter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { value: 'daily', label: 'Harian' },
    { value: 'weekly', label: 'Mingguan' },
    { value: 'monthly', label: 'Bulanan' }
  ];

  const currentOption = options.find(opt => opt.value === period) || options[0];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 md:py-2 bg-white border border-gray-100 hover:border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 shadow-sm transition-all duration-200 cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span>{currentOption.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-250 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Options List Menu */}
      {isOpen && (
        <ul
          className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-xl z-40 p-1.5 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-150"
          role="listbox"
        >
          {options.map((opt) => {
            const isSelected = opt.value === period;
            return (
              <li
                key={opt.value}
                onClick={() => {
                  setPeriod(opt.value);
                  setIsOpen(false);
                }}
                className={`
                  flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors
                  ${isSelected 
                    ? 'bg-emerald-50 text-emerald-800' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                role="option"
                aria-selected={isSelected}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
