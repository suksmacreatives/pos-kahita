import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, MapPin, Phone, Mail, User, Store, ChevronDown } from 'lucide-react';

export default function OutletFormModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    alamat: '',
    kota: '',
    provinsi: '',
    kode_pos: '',
    telp: '',
    email: '',
    manajer_nama: '',
    warna: 'emerald',
    tipe: 'cabang',
    luas_m2: ''
  });

  const [isWarnaOpen, setIsWarnaOpen] = useState(false);
  const [isTipeOpen, setIsTipeOpen] = useState(false);
  const warnaRef = useRef(null);
  const tipeRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (warnaRef.current && !warnaRef.current.contains(e.target)) setIsWarnaOpen(false);
      if (tipeRef.current && !tipeRef.current.contains(e.target)) setIsTipeOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      kode: '',
      nama: '',
      alamat: '',
      kota: '',
      provinsi: '',
      kode_pos: '',
      telp: '',
      email: '',
      manajer_nama: '',
      warna: 'emerald',
      tipe: 'cabang',
      luas_m2: ''
    });
    onClose();
  };

  const warnaOptions = [
    { value: 'emerald', label: 'Emerald' },
    { value: 'blue', label: 'Blue' },
    { value: 'amber', label: 'Amber' },
    { value: 'purple', label: 'Purple' },
    { value: 'rose', label: 'Rose' },
  ];

  const tipeOptions = [
    { value: 'cabang', label: 'Cabang' },
    { value: 'flagship', label: 'Flagship' },
    { value: 'kiosk', label: 'Kiosk' },
  ];

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">Tambah Outlet Baru</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode *</label>
              <input name="kode" value={formData.kode} onChange={handleChange} required className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
              <input name="nama" value={formData.nama} onChange={handleChange} required className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat *</label>
              <input name="alamat" value={formData.alamat} onChange={handleChange} required className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kota *</label>
              <input name="kota" value={formData.kota} onChange={handleChange} required className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi *</label>
              <input name="provinsi" value={formData.provinsi} onChange={handleChange} required className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pos *</label>
              <input name="kode_pos" value={formData.kode_pos} onChange={handleChange} required className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telepon *</label>
              <input name="telp" value={formData.telp} onChange={handleChange} required className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manajer *</label>
              <input name="manajer_nama" value={formData.manajer_nama} onChange={handleChange} required className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warna *</label>
              <div className="relative z-10" ref={warnaRef}>
                <button
                  type="button"
                  onClick={() => setIsWarnaOpen(!isWarnaOpen)}
                  className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <span className="truncate">{warnaOptions.find(o => o.value === formData.warna)?.label || 'Pilih Warna'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isWarnaOpen ? 'rotate-180' : ''}`} />
                </button>
                {isWarnaOpen && (
                  <ul className="absolute left-0 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-lg z-40 py-1 text-xs">
                    {warnaOptions.map(opt => (
                      <li key={opt.value}
                        onClick={() => { handleSelect('warna', opt.value); setIsWarnaOpen(false); }}
                        className={`px-3 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${formData.warna === opt.value ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-600'}`}
                      >
                        {opt.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipe *</label>
              <div className="relative z-10" ref={tipeRef}>
                <button
                  type="button"
                  onClick={() => setIsTipeOpen(!isTipeOpen)}
                  className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <span className="truncate">{tipeOptions.find(o => o.value === formData.tipe)?.label || 'Pilih Tipe'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isTipeOpen ? 'rotate-180' : ''}`} />
                </button>
                {isTipeOpen && (
                  <ul className="absolute left-0 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-lg z-40 py-1 text-xs">
                    {tipeOptions.map(opt => (
                      <li key={opt.value}
                        onClick={() => { handleSelect('tipe', opt.value); setIsTipeOpen(false); }}
                        className={`px-3 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${formData.tipe === opt.value ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-600'}`}
                      >
                        {opt.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Luas (m²)</label>
              <input type="number" name="luas_m2" value={formData.luas_m2} onChange={handleChange} className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
              Simpan Outlet
            </button>
          </div>
        </form>
      </div>
    </div>
    , document.body
  );
}
