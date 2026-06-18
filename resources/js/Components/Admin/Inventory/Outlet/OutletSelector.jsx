import React from 'react';
import { usePage } from '@inertiajs/react';
import { useFilter } from '@/Context/FilterContext';
import { Store, AlertTriangle, MapPin } from 'lucide-react';
import SelectDropdown from '@/Components/Admin/SelectDropdown';

export default function OutletSelector({ outlets = [], outletStatsAll = {} }) {
  const { auth } = usePage().props;
  const { outlet, setOutlet } = useFilter();

  if (auth?.user?.outlet_id) return null;

  const selectedOutletObj = outlets.find(o => (o.slug || o.id) === outlet);

  const issues = outlet !== 'all' && outletStatsAll[outlet]
    ? (outletStatsAll[outlet].menipis || 0) + (outletStatsAll[outlet].habis || 0)
    : 0;

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
        Pilih Outlet
      </label>
      <SelectDropdown
        value={outlet || 'all'}
        onChange={(val) => setOutlet(val)}
        options={[
          { value: 'all', label: 'Semua Outlet' },
          ...outlets.map(o => ({ value: o.slug || o.id, label: o.nama, kota: o.kota }))
        ]}
        placeholder="-- Pilih Outlet --"
        searchable
      />
      {outlet !== 'all' && selectedOutletObj?.kota && (
        <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {selectedOutletObj.kota}
        </p>
      )}
      {issues > 0 && (
        <p className="text-[10px] text-amber-600 font-semibold mt-1.5 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {issues} produk dengan stok menipis/habis
        </p>
      )}
    </div>
  );
}
