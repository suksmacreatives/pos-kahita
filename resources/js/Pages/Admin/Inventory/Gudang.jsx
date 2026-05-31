import React, { useState, useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import GudangStatCard from '@/Components/Admin/Inventory/Gudang/GudangStatCard';
import MutasiChart from '@/Components/Admin/Inventory/Gudang/MutasiChart';
import StokGudangTable from '@/Components/Admin/Inventory/Gudang/StokGudangTable';
import PenerimaanBarangTable from '@/Components/Admin/Inventory/Gudang/PenerimaanBarangTable';
import DistribusiOutletTable from '@/Components/Admin/Inventory/Gudang/DistribusiOutletTable';
import ReturSupplierTable from '@/Components/Admin/Inventory/Gudang/ReturSupplierTable';
import StockOpnameTable from '@/Components/Admin/Inventory/Gudang/StockOpnameTable';
import FormPenerimaanModal from '@/Components/Admin/Inventory/Gudang/FormPenerimaanModal';
import FormDistribusiModal from '@/Components/Admin/Inventory/Gudang/FormDistribusiModal';
import FormReturModal from '@/Components/Admin/Inventory/Gudang/FormReturModal';
import FormOpnameModal from '@/Components/Admin/Inventory/Gudang/FormOpnameModal';
import DetailProdukModal from '@/Components/Admin/Inventory/Gudang/DetailProdukModal';
import TambahStokModal from '@/Components/Admin/Inventory/Gudang/TambahStokModal';
import LihatMutasiModal from '@/Components/Admin/Inventory/Gudang/LihatMutasiModal';
import DetailDistribusiModal from '@/Components/Admin/Inventory/Gudang/DetailDistribusiModal';
import {
  warehouseProducts as initialProducts,
  penerimaanBarang as initialPenerimaan,
  distribusiOutlet as initialDistribusi,
  returSupplier as initialRetur,
  stockOpname as initialOpname,
  mutasiLog as initialMutasiLog,
  gudangStats as initialStats,
} from '@/data/inventoryGudangData';

const tabs = [
  { id: 'stock', label: 'Stok Gudang', Component: StokGudangTable },
  { id: 'penerimaan', label: 'Penerimaan Barang', Component: PenerimaanBarangTable },
  { id: 'distribusi', label: 'Distribusi Outlet', Component: DistribusiOutletTable },
  { id: 'retur', label: 'Retur Supplier', Component: ReturSupplierTable },
  { id: 'opname', label: 'Stock Opname', Component: StockOpnameTable },
];

function Gudang() {
  const [activeTab, setActiveTab] = useState('stock');
  const [modalType, setModalType] = useState(null);

  const [penerimaan, setPenerimaan] = useState(initialPenerimaan);
  const [distribusi, setDistribusi] = useState(initialDistribusi);
  const [retur, setRetur] = useState(initialRetur);
  const [opname, setOpname] = useState(initialOpname || []);
  const [produkStok, setProdukStok] = useState(initialProducts);
  const [mutasiLog] = useState(initialMutasiLog);
  const [stats] = useState(initialStats);
  const [detailProduk, setDetailProduk] = useState(null);
  const [tambahStok, setTambahStok] = useState(null);
  const [lihatMutasi, setLihatMutasi] = useState(null);
  const [detailDistribusi, setDetailDistribusi] = useState(null);

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.Component || (() => null);

  const tabBadges = useMemo(() => ({
    stock: produkStok.length,
    penerimaan: penerimaan.length,
    distribusi: distribusi.length,
    retur: retur.length,
    opname: opname.length,
  }), [produkStok, penerimaan, distribusi, retur, opname]);

  const handleOpenModal = (type) => setModalType(type);
  const handleCloseModal = () => setModalType(null);

  const handlePenerimaanSubmit = (data) => {
    const nomor = `PO-${String(penerimaan.length + 1).padStart(3, '0')}`;
    setPenerimaan(prev => [{ ...data, nomor_po: nomor, id: prev.length + 1, tanggal_terima: null, items: data.items.map(it => ({ ...it, qty_terima: 0 })) }, ...prev]);
  };

  const handleDistribusiSubmit = (data) => {
    const nomor = `DO-${String(distribusi.length + 1).padStart(3, '0')}`;
    setDistribusi(prev => [{ ...data, nomor_do: nomor, id: prev.length + 1 }, ...prev]);
  };

  const handleReturSubmit = (data) => {
    const nomor = `RTR-${String(retur.length + 1).padStart(3, '0')}`;
    setRetur(prev => [{ ...data, nomor_retur: nomor, id: prev.length + 1 }, ...prev]);
  };

  const handleOpnameSubmit = (data) => {
    const nomor = `OP-${String(opname.length + 1).padStart(3, '0')}`;
    setOpname(prev => [{
      ...data,
      nomor_opname: nomor,
      id: prev.length + 1,
      tanggal_mulai: new Date().toISOString().split('T')[0],
      tanggal_selesai: new Date().toISOString().split('T')[0],
      petugas: 'Admin Gudang',
    }, ...prev]);
  };

  const handleTandaiTerima = (item) => {
    setPenerimaan(prev => prev.map(p =>
      p.nomor_po === item.nomor_po ? { ...p, status: 'lengkap', tanggal_terima: new Date().toISOString().split('T')[0] } : p
    ));
  };

  const handleKonfirmasiTerima = (item) => {
    setDistribusi(prev => prev.map(d =>
      d.nomor_do === item.nomor_do ? { ...d, status: 'diterima', tanggal_terima: new Date().toISOString().split('T')[0] } : d
    ));
  };

  const handleProses = (item) => {
    setDistribusi(prev => prev.map(d =>
      d.nomor_do === item.nomor_do ? { ...d, status: 'dikirim', tanggal_kirim: new Date().toISOString().split('T')[0] } : d
    ));
  };

  const handleLihat = (item) => setDetailDistribusi(item);
  const handleDetail = (item) => setDetailProduk(item);
  const handleCetak = () => {};
  const handleTambahStok = (item) => setTambahStok(item);
  const handleLihatMutasi = (item) => setLihatMutasi(item);

  const handleTambahStokSubmit = ({ produk_id, qty }) => {
    setProdukStok(prev => prev.map(p =>
      p.id === produk_id ? { ...p, total_stok: p.total_stok + qty, varian: p.varian.map(v => ({ ...v, stok: v.stok + qty })) } : p
    ));
  };

  const tableData = useMemo(() => {
    switch (activeTab) {
      case 'stock': return produkStok;
      case 'penerimaan': return penerimaan;
      case 'distribusi': return distribusi;
      case 'retur': return retur;
      case 'opname': return opname;
      default: return [];
    }
  }, [activeTab, produkStok, penerimaan, distribusi, retur, opname]);

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Inventory Gudang</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manajemen stok pusat dan distribusi ke outlet</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleOpenModal('penerimaan')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer">+ Tambah Penerimaan</button>
          <button onClick={() => handleOpenModal('distribusi')} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer">+ Tambah Distribusi</button>
          <button onClick={() => handleOpenModal('retur')} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer">+ Tambah Retur</button>
          <button onClick={() => handleOpenModal('opname')} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer">+ Stock Opname</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GudangStatCard title="Total SKU" value={stats.total_sku} sub="produk unik" color="emerald" alert={false} />
        <GudangStatCard title="Total Stok" value={stats.total_stok} sub="semua varian" color="blue" />
        <GudangStatCard title="Nilai Stok" value={`Rp ${stats.nilai_stok.toLocaleString()}`} sub="harga beli" color="violet" />
        <GudangStatCard title="Produk Menipis" value={stats.produk_menipis + stats.produk_habis} sub="stok ≤ minimum" color="rose" alert={true} percentage={Math.round(((stats.produk_menipis + stats.produk_habis) / stats.total_sku) * 100)} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <MutasiChart data={mutasiLog} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5">
          <nav className="-mb-px flex gap-1" aria-label="Tabs">
            {tabs.map(tab => {
              const badge = tabBadges[tab.id];
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-3 text-xs font-semibold transition-colors cursor-pointer ${activeTab === tab.id ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>
                  <div className="flex items-center gap-1.5">
                    {tab.label}
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${activeTab === tab.id ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                      {badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-5">
          <ActiveComponent
            data={tableData}
            onDetail={handleDetail}
            onTambahStok={handleTambahStok}
            onLihatMutasi={handleLihatMutasi}
            onTandaiTerima={handleTandaiTerima}
            onCetak={handleCetak}
            onLihat={handleLihat}
            onKonfirmasiTerima={handleKonfirmasiTerima}
            onProses={handleProses}
            onLanjutkan={(item) => {
              setOpname(prev => prev.map(o =>
                o.nomor_opname === item.nomor_opname ? { ...o, status: 'berlangsung' } : o
              ));
            }}
          />
        </div>
      </div>

      <FormPenerimaanModal open={modalType === 'penerimaan'} onClose={handleCloseModal} onSubmit={handlePenerimaanSubmit} />
      <FormDistribusiModal open={modalType === 'distribusi'} onClose={handleCloseModal} onSubmit={handleDistribusiSubmit} />
      <FormReturModal open={modalType === 'retur'} onClose={handleCloseModal} onSubmit={handleReturSubmit} />
      <FormOpnameModal open={modalType === 'opname'} onClose={handleCloseModal} onSubmit={handleOpnameSubmit} />

      <DetailProdukModal data={detailProduk} onClose={() => setDetailProduk(null)} />
      <TambahStokModal data={tambahStok} onClose={() => setTambahStok(null)} onSubmit={handleTambahStokSubmit} />
      <LihatMutasiModal data={lihatMutasi} onClose={() => setLihatMutasi(null)} />
      <DetailDistribusiModal data={detailDistribusi} onClose={() => setDetailDistribusi(null)} />
    </div>
  );
}

Gudang.layout = page => <AdminLayout>{page}</AdminLayout>;

export default Gudang;
