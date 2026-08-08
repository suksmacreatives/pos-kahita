import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Percent, DollarSign, Package, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

export default function PromoFormModal({ isOpen, mode, data, onClose, onSave, outletList = [], kategoriList = [] }) {
    const isEdit = mode === 'edit';
    const outlets = [{ id: 'semua', name: 'Semua Outlet' }, ...outletList];
    const kategoriItems = [{ id: 'semua', name: 'Semua Produk' }, ...kategoriList];
    const [formData, setFormData] = useState({
        nama_promo: '',
        kode_promo: '',
        deskripsi: '',
        tipe: 'persentase',
        nilai_diskon: '',
        max_diskon: '',
        min_transaksi: '0',
        berlaku_dari: format(new Date(), 'yyyy-MM-dd'),
        berlaku_sampai: format(new Date(), 'yyyy-MM-dd'),
        kuota_tipe: 'unlimited',
        kuota: '',
        berlaku_di: 'semua',
        berlaku_untuk: 'semua',
        status: 'aktif'
    });

    useEffect(() => {
        if (isOpen && isEdit && data) {
            setFormData({
                nama_promo: data.nama_promo || '',
                kode_promo: data.kode_promo || '',
                deskripsi: data.deskripsi || '',
                tipe: data.tipe || 'persentase',
                nilai_diskon: data.nilai_diskon || '',
                max_diskon: data.max_diskon || '',
                min_transaksi: data.min_transaksi || '0',
                berlaku_dari: data.berlaku_dari ? format(new Date(data.berlaku_dari), 'yyyy-MM-dd') : '',
                berlaku_sampai: data.berlaku_sampai ? format(new Date(data.berlaku_sampai), 'yyyy-MM-dd') : '',
                kuota_tipe: data.kuota === null ? 'unlimited' : 'limit',
                kuota: data.kuota || '',
                berlaku_di: Array.isArray(data.berlaku_di) ? data.berlaku_di.join(',') : 'semua',
                berlaku_untuk: Array.isArray(data.berlaku_untuk) ? data.berlaku_untuk.join(',') : 'semua',
                status: data.status || 'aktif'
            });
        } else if (isOpen && !isEdit) {
            setFormData({
                nama_promo: '', kode_promo: '', deskripsi: '', tipe: 'persentase', nilai_diskon: '', max_diskon: '', min_transaksi: '0', berlaku_dari: format(new Date(), 'yyyy-MM-dd'), berlaku_sampai: format(new Date(), 'yyyy-MM-dd'), kuota_tipe: 'unlimited', kuota: '', berlaku_di: 'semua', berlaku_untuk: 'semua', status: 'aktif'
            });
        }
    }, [isOpen, isEdit, data]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'kode_promo') {
            setFormData(prev => ({ ...prev, [name]: value.toUpperCase().replace(/\s/g, '') }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const [isBerlakuDiOpen, setIsBerlakuDiOpen] = useState(false);
    const [isBerlakuUntukOpen, setIsBerlakuUntukOpen] = useState(false);
    const [kategoriSearch, setKategoriSearch] = useState('');
    const berlakuDiRef = useRef(null);
    const berlakuUntukRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (berlakuDiRef.current && !berlakuDiRef.current.contains(e.target)) setIsBerlakuDiOpen(false);
            if (berlakuUntukRef.current && !berlakuUntukRef.current.contains(e.target)) setIsBerlakuUntukOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredKategori = kategoriItems.filter(k =>
        k.id === 'semua' || k.name.toLowerCase().includes(kategoriSearch.toLowerCase())
    );

    const handleSelect = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const generateKode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
        setFormData(prev => ({ ...prev, kode_promo: result }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">
                        {isEdit ? 'Edit Promo' : 'Buat Promo Baru'}
                    </h2>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* KOLOM KIRI */}
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Promo *</label>
                                <input type="text" name="nama_promo" value={formData.nama_promo} onChange={handleChange} required className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Kode Promo *</label>
                                <div className="flex gap-2">
                                    <input type="text" name="kode_promo" value={formData.kode_promo} onChange={handleChange} required className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm font-mono focus:ring-emerald-500 focus:border-emerald-500" placeholder="LEBARAN25" />
                                    <button type="button" onClick={generateKode} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-200 shrink-0">Generate</button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi</label>
                                <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange} rows="2" className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"></textarea>
                            </div>

                            <div className="pt-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tipe Promo *</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {/* Persentase */}
                                    <label className={`cursor-pointer flex flex-col items-center p-3 border rounded-xl transition-colors ${formData.tipe === 'persentase' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input type="radio" name="tipe" value="persentase" checked={formData.tipe === 'persentase'} onChange={handleChange} className="sr-only" />
                                        <Percent size={20} className="mb-1" />
                                        <span className="text-xs font-bold">% Diskon</span>
                                    </label>
                                    {/* Nominal */}
                                    <label className={`cursor-pointer flex flex-col items-center p-3 border rounded-xl transition-colors ${formData.tipe === 'nominal' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input type="radio" name="tipe" value="nominal" checked={formData.tipe === 'nominal'} onChange={handleChange} className="sr-only" />
                                        <DollarSign size={20} className="mb-1" />
                                        <span className="text-xs font-bold">Rp Potongan</span>
                                    </label>
                                    {/* Bundle */}
                                    <label className={`cursor-pointer flex flex-col items-center p-3 border rounded-xl transition-colors ${formData.tipe === 'bundle' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input type="radio" name="tipe" value="bundle" checked={formData.tipe === 'bundle'} onChange={handleChange} className="sr-only" />
                                        <Package size={20} className="mb-1" />
                                        <span className="text-xs font-bold text-center">Bundle Paket</span>
                                    </label>
                                </div>
                            </div>

                            {/* Dynamic Fields based on Tipe */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                {formData.tipe === 'persentase' && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Nilai Diskon (%) *</label>
                                            <input type="number" name="nilai_diskon" value={formData.nilai_diskon} onChange={handleChange} required min="1" max="100" className="block w-full rounded-lg border-gray-300 px-3 py-2 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Maksimal Diskon (Rp)</label>
                                            <input type="number" name="max_diskon" value={formData.max_diskon} onChange={handleChange} placeholder="Opsional" className="block w-full rounded-lg border-gray-300 px-3 py-2 text-sm" />
                                        </div>
                                        {formData.nilai_diskon && (
                                            <p className="text-[10px] text-gray-500 italic">Contoh: Belanja Rp 100rb, diskon {formData.nilai_diskon}% = Rp {(100000 * (formData.nilai_diskon/100)).toLocaleString('id-ID')}</p>
                                        )}
                                    </div>
                                )}
                                {formData.tipe === 'nominal' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Nilai Potongan (Rp) *</label>
                                        <input type="number" name="nilai_diskon" value={formData.nilai_diskon} onChange={handleChange} required min="1" className="block w-full rounded-lg border-gray-300 px-3 py-2 text-sm" />
                                    </div>
                                )}
                                {formData.tipe === 'bundle' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Harga Bundle (Rp) *</label>
                                        <input type="number" name="nilai_diskon" value={formData.nilai_diskon} onChange={handleChange} required min="1" className="block w-full rounded-lg border-gray-300 px-3 py-2 text-sm" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* KOLOM KANAN */}
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Min. Transaksi (Rp)</label>
                                <input type="number" name="min_transaksi" value={formData.min_transaksi} onChange={handleChange} min="0" className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
                                <p className="text-[10px] text-gray-500 mt-1">Isi 0 jika tidak ada batas minimum</p>
                            </div>

                            <div className="p-3 border border-gray-200 rounded-xl space-y-3">
                                <h4 className="text-sm font-bold text-gray-900">Periode Berlaku</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Dari Tanggal</label>
                                        <input type="date" name="berlaku_dari" value={formData.berlaku_dari} onChange={handleChange} required className="block w-full rounded-lg border-gray-300 px-2 py-1.5 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Sampai Tanggal</label>
                                        <input type="date" name="berlaku_sampai" value={formData.berlaku_sampai} onChange={handleChange} required className="block w-full rounded-lg border-gray-300 px-2 py-1.5 text-sm" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 border border-gray-200 rounded-xl space-y-3">
                                <h4 className="text-sm font-bold text-gray-900">Batasan Kuota</h4>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="radio" name="kuota_tipe" value="unlimited" checked={formData.kuota_tipe === 'unlimited'} onChange={handleChange} className="text-emerald-500 focus:ring-emerald-500" />
                                        Unlimited
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="radio" name="kuota_tipe" value="limit" checked={formData.kuota_tipe === 'limit'} onChange={handleChange} className="text-emerald-500 focus:ring-emerald-500" />
                                        Batasi Kuota
                                    </label>
                                </div>
                                {formData.kuota_tipe === 'limit' && (
                                    <input type="number" name="kuota" value={formData.kuota} onChange={handleChange} required placeholder="Masukkan jumlah kuota" className="block w-full rounded-lg border-gray-300 px-3 py-2 text-sm mt-2" />
                                )}
                            </div>

                            <div className="p-3 border border-gray-200 rounded-xl space-y-3">
                                <h4 className="text-sm font-bold text-gray-900">Cakupan</h4>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Berlaku di Outlet</label>
                                    <div className="relative" ref={berlakuDiRef}>
                                        <button
                                            type="button"
                                            onClick={() => setIsBerlakuDiOpen(!isBerlakuDiOpen)}
                                            className="flex items-center justify-between w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        >
                                            <span className="truncate text-gray-700 font-medium">
                                                {outlets.find(o => o.id === formData.berlaku_di)?.name || 'Semua Outlet'}
                                            </span>
                                            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isBerlakuDiOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        {isBerlakuDiOpen && (
                                            <ul className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-40 py-1 text-sm">
                                                {outlets.map(o => (
                                                    <li key={o.id}
                                                        onClick={() => { handleSelect('berlaku_di', o.id); setIsBerlakuDiOpen(false); }}
                                                        className={`px-3 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${formData.berlaku_di === o.id ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-600'}`}
                                                    >
                                                        {o.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Berlaku untuk Kategori</label>
                                    <div className="relative" ref={berlakuUntukRef}>
                                        <button
                                            type="button"
                                            onClick={() => { setIsBerlakuUntukOpen(!isBerlakuUntukOpen); if (!isBerlakuUntukOpen) setKategoriSearch(''); }}
                                            className="flex items-center justify-between w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        >
                                            <span className="truncate text-gray-700 font-medium">
                                                {kategoriItems.find(k => k.id === formData.berlaku_untuk)?.name || 'Semua Produk'}
                                            </span>
                                            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isBerlakuUntukOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        {isBerlakuUntukOpen && (
                                            <div className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-40 py-1 text-sm">
                                                <div className="px-2 pb-1.5">
                                                    <input
                                                        type="text"
                                                        value={kategoriSearch}
                                                        onChange={(e) => setKategoriSearch(e.target.value)}
                                                        placeholder="Cari kategori..."
                                                        autoFocus
                                                        className="block w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs bg-gray-50 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                </div>
                                                <ul className="max-h-44 overflow-y-auto">
                                                    {filteredKategori.length > 0 ? filteredKategori.map(k => (
                                                        <li key={k.id}
                                                            onClick={() => { handleSelect('berlaku_untuk', k.id); setIsBerlakuUntukOpen(false); setKategoriSearch(''); }}
                                                            className={`px-3 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${formData.berlaku_untuk === k.id ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-600'}`}
                                                        >
                                                            {k.name}
                                                        </li>
                                                    )) : (
                                                        <li className="px-3 py-2 text-xs text-gray-400 text-center">Kategori tidak ditemukan</li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">Status Promo</h4>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={formData.status === 'aktif'} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'aktif' : 'nonaktif' }))} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10 pb-2">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                            Batal
                        </button>
                        <button type="submit" className="px-6 py-2.5 bg-emerald-600 rounded-xl text-sm font-bold text-white hover:bg-emerald-700 transition-colors">
                            {isEdit ? 'Simpan Perubahan' : 'Simpan Promo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        , document.body
    );
}

