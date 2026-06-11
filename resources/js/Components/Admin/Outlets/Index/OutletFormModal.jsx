import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, MapPin, Phone, Mail, User, Store } from 'lucide-react';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass the new outlet data up to the parent component
    onSave(formData);
    // Reset form and close
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

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
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
              <select name="warna" value={formData.warna} onChange={handleChange} className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500">
                <option value="emerald">Emerald</option>
                <option value="blue">Blue</option>
                <option value="amber">Amber</option>
                <option value="purple">Purple</option>
                <option value="rose">Rose</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipe *</label>
              <select name="tipe" value={formData.tipe} onChange={handleChange} className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500">
                <option value="cabang">Cabang</option>
                <option value="flagship">Flagship</option>
                <option value="kiosk">Kiosk</option>
              </select>
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
      </div>
    </>
    , document.body
  );
}

