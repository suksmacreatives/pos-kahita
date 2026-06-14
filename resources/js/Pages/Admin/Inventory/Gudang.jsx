import React, { useState, useMemo, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import GudangStatCard from '@/Components/Admin/Inventory/Gudang/GudangStatCard';
// import MutasiChart from '@/Components/Admin/Inventory/Gudang/MutasiChart';
import StokGudangTable from '@/Components/Admin/Inventory/Gudang/StokGudangTable';
import PenerimaanBarangTable from '@/Components/Admin/Inventory/Gudang/PenerimaanBarangTable';
import DistribusiOutletTable from '@/Components/Admin/Inventory/Gudang/DistribusiOutletTable';
import ReturSupplierTable from '@/Components/Admin/Inventory/Gudang/ReturSupplierTable';
import ReturOutletTable from '@/Components/Admin/Inventory/Gudang/ReturOutletTable';
import StockOpnameTable from '@/Components/Admin/Inventory/Gudang/StockOpnameTable';
import FormPenerimaanModal from '@/Components/Admin/Inventory/Gudang/FormPenerimaanModal';
import FormDistribusiModal from '@/Components/Admin/Inventory/Gudang/FormDistribusiModal';
import FormReturModal from '@/Components/Admin/Inventory/Gudang/FormReturModal';
import FormOpnameModal from '@/Components/Admin/Inventory/Gudang/FormOpnameModal';
import DetailProdukModal from '@/Components/Admin/Inventory/Gudang/DetailProdukModal';
import TambahStokModal from '@/Components/Admin/Inventory/Gudang/TambahStokModal';
import LihatMutasiModal from '@/Components/Admin/Inventory/Gudang/LihatMutasiModal';
import DetailDistribusiModal from '@/Components/Admin/Inventory/Gudang/DetailDistribusiModal';

const tabs = [
  { id: 'stock', label: 'Stok Gudang', Component: StokGudangTable },
  { id: 'penerimaan', label: 'Penerimaan Barang', Component: PenerimaanBarangTable },
  { id: 'distribusi', label: 'Distribusi Outlet', Component: DistribusiOutletTable },
  { id: 'retur', label: 'Retur Supplier', Component: ReturSupplierTable },
  { id: 'retur-outlet', label: 'Retur Outlet', Component: ReturOutletTable },
  { id: 'opname', label: 'Stock Opname', Component: StockOpnameTable },
];

function Gudang() {
  const { props } = usePage();
  const {
    warehouseProducts: initialProducts,
    penerimaanBarang: initialPenerimaan,
    distribusiOutlet: initialDistribusi,
    returSupplier: initialRetur,
    returOutlet: initialReturOutlet,
    stockOpname: initialOpname,
    mutasiLog: initialMutasiLog,
    gudangStats: initialStats,
    outlets,
    suppliers,
    flash,
    errors: validationErrors,
  } = props;

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (flash?.success) showToast(flash.success, 'success');
    if (flash?.error) showToast(flash.error, 'error');
  }, [flash]);

  const [activeTab, setActiveTab] = useState('stock');
  const [modalType, setModalType] = useState(null);

  const [penerimaan, setPenerimaan] = useState(initialPenerimaan || []);
  const [distribusi, setDistribusi] = useState(initialDistribusi || []);
  const [retur, setRetur] = useState(initialRetur || []);
  const [returOutlet, setReturOutlet] = useState(initialReturOutlet || []);
  const [opname, setOpname] = useState(initialOpname || []);
  const [produkStok, setProdukStok] = useState(initialProducts || []);
  const [mutasiLog, setMutasiLog] = useState(initialMutasiLog || []);
  const [stats, setStats] = useState(initialStats || { total_sku: 0, total_stok: 0, nilai_stok: 0, menipis: 0, habis: 0 });

  useEffect(() => { setPenerimaan(initialPenerimaan || []); }, [initialPenerimaan]);
  useEffect(() => { setDistribusi(initialDistribusi || []); }, [initialDistribusi]);
  useEffect(() => { setRetur(initialRetur || []); }, [initialRetur]);
  useEffect(() => { setReturOutlet(initialReturOutlet || []); }, [initialReturOutlet]);
  useEffect(() => { setOpname(initialOpname || []); }, [initialOpname]);
  useEffect(() => { setProdukStok(initialProducts || []); }, [initialProducts]);
  useEffect(() => { setMutasiLog(initialMutasiLog || []); }, [initialMutasiLog]);
  useEffect(() => { setStats(initialStats || { total_sku: 0, total_stok: 0, nilai_stok: 0, menipis: 0, habis: 0 }); }, [initialStats]);
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
    'retur-outlet': returOutlet.length,
    opname: opname.length,
  }), [produkStok, penerimaan, distribusi, retur, returOutlet, opname]);

  const handleOpenModal = (type) => setModalType(type);
  const handleCloseModal = () => setModalType(null);

  const reloadData = () => {
    router.reload({
      only: ['warehouseProducts', 'penerimaanBarang', 'distribusiOutlet', 'returSupplier', 'returOutlet', 'stockOpname', 'mutasiLog', 'gudangStats'],
      preserveScroll: true,
    });
  };

  const handlePenerimaanSubmit = (data) => {
    router.post(route('admin.inventory.gudang.penerimaan'), data, {
      preserveScroll: true,
      onSuccess: () => { handleCloseModal(); reloadData(); },
      onError: () => {},
    });
  };

  const handleTandaiTerima = (item) => {
    router.patch(route('admin.inventory.gudang.penerimaan.terima', item.id), {}, {
      preserveScroll: true,
      onSuccess: () => reloadData(),
      onError: () => {},
    });
  };

  const handleProsesPenerimaan = (item) => {
    router.patch(route('admin.inventory.gudang.penerimaan.proses', item.id), {}, {
      preserveScroll: true,
      onSuccess: () => reloadData(),
      onError: () => {},
    });
  };

  const handleDistribusiSubmit = (data) => {
    router.post(route('admin.inventory.gudang.distribusi'), data, {
      preserveScroll: true,
      onSuccess: () => { handleCloseModal(); reloadData(); },
      onError: () => {},
    });
  };

  const handleProses = (item) => {
    router.patch(route('admin.inventory.gudang.distribusi.proses', item.id), {}, {
      preserveScroll: true,
      onSuccess: () => reloadData(),
      onError: () => {},
    });
  };

  const handleKonfirmasiTerima = (item) => {
    router.patch(route('admin.inventory.gudang.distribusi.konfirmasi', item.id), {}, {
      preserveScroll: true,
      onSuccess: () => reloadData(),
      onError: () => {},
    });
  };

  const handleReturSubmit = (data) => {
    router.post(route('admin.inventory.gudang.retur'), data, {
      preserveScroll: true,
      onSuccess: () => { handleCloseModal(); reloadData(); },
      onError: () => {},
    });
  };

  const handleTerimaReturOutlet = (item) => {
    if (confirm('Terima retur ini? Stok gudang akan bertambah sesuai qty barang yang diretur.')) {
      router.patch(route('admin.inventory.gudang.retur-outlet.terima', item.id), {}, {
        preserveScroll: true,
        onSuccess: () => reloadData(),
        onError: () => {},
      });
    }
  };

  const handleBatalReturOutlet = (item) => {
    if (confirm('Batalkan retur dari outlet ini? Stok outlet akan dikembalikan.')) {
      router.patch(route('admin.inventory.gudang.retur-outlet.batal', item.id), {}, {
        preserveScroll: true,
        onSuccess: () => reloadData(),
        onError: () => {},
      });
    }
  };

  const handleBatalPO = (item) => {
    if (confirm('Batalkan Purchase Order ini?')) {
      router.patch(route('admin.inventory.gudang.penerimaan.batal', item.id), {}, {
        preserveScroll: true,
        onSuccess: () => reloadData(),
        onError: () => {},
      });
    }
  };

  const handleBatalDO = (item) => {
    if (confirm('Batalkan Distribution Order ini?')) {
      router.patch(route('admin.inventory.gudang.distribusi.batal', item.id), {}, {
        preserveScroll: true,
        onSuccess: () => reloadData(),
        onError: () => {},
      });
    }
  };

  const handleBatalReturSupplier = (item) => {
    if (confirm('Batalkan Retur Supplier ini?')) {
      router.patch(route('admin.inventory.gudang.retur.batal', item.id), {}, {
        preserveScroll: true,
        onSuccess: () => reloadData(),
        onError: () => {},
      });
    }
  };

  const handleOpnameSubmit = (data) => {
    router.post(route('admin.inventory.gudang.opname'), data, {
      preserveScroll: true,
      onSuccess: () => { handleCloseModal(); reloadData(); },
      onError: () => {},
    });
  };

  const handleTambahStokSubmit = ({ produk_id, nama, ukuran, warna, qty, catatan }) => {
    router.post(route('admin.inventory.gudang.tambah-stok'), {
      produk_id,
      nama,
      ukuran,
      warna,
      qty,
      catatan: catatan || '',
    }, {
      preserveScroll: true,
      onSuccess: () => { setTambahStok(null); reloadData(); },
      onError: () => {},
    });
  };

  const handleLihat = (item) => setDetailDistribusi(item);
  const handleDetail = (item) => setDetailProduk(item);
  const handleCetak = () => {};
  const handleTambahStok = (item) => setTambahStok(item);
  const handleLihatMutasi = (item) => setLihatMutasi(item);

  const tableData = useMemo(() => {
    switch (activeTab) {
      case 'stock': return produkStok;
      case 'penerimaan': return penerimaan;
      case 'distribusi': return distribusi;
      case 'retur': return retur;
      case 'retur-outlet': return returOutlet;
      case 'opname': return opname;
      default: return [];
    }
  }, [activeTab, produkStok, penerimaan, distribusi, retur, returOutlet, opname]);

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
        <GudangStatCard title="Nilai Stok" value={`Rp ${(stats.nilai_stok || 0).toLocaleString()}`} sub="harga beli" color="violet" />
        <GudangStatCard title="Produk Menipis" value={stats.menipis + stats.habis} sub="stok ≤ minimum" color="rose" alert={true} percentage={stats.total_sku > 0 ? Math.round(((stats.menipis + stats.habis) / stats.total_sku) * 100) : 0} />
      </div>

      {/* <div className="bg-white rounded-2xl shadow-sm p-5">
        <MutasiChart data={mutasiLog} />
      </div> */}

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
            onProsesPenerimaan={handleProsesPenerimaan}
            onProses={handleProses}
            onCetak={handleCetak}
            onLihat={handleLihat}
            onKonfirmasiTerima={handleKonfirmasiTerima}
            onTerimaRetur={handleTerimaReturOutlet}
            onBatalRetur={handleBatalReturOutlet}
            onBatalPO={handleBatalPO}
            onBatalDO={handleBatalDO}
            onBatalReturSupplier={handleBatalReturSupplier}
          />
        </div>
      </div>

      <FormPenerimaanModal
        open={modalType === 'penerimaan'}
        onClose={handleCloseModal}
        onSubmit={handlePenerimaanSubmit}
        warehouseProducts={produkStok}
      />
      <FormDistribusiModal
        open={modalType === 'distribusi'}
        onClose={handleCloseModal}
        onSubmit={handleDistribusiSubmit}
        outlets={outlets}
        warehouseProducts={produkStok}
      />
      <FormReturModal
        open={modalType === 'retur'}
        onClose={handleCloseModal}
        onSubmit={handleReturSubmit}
        suppliers={suppliers}
        warehouseProducts={produkStok}
      />
      <FormOpnameModal
        open={modalType === 'opname'}
        onClose={handleCloseModal}
        onSubmit={handleOpnameSubmit}
        warehouseProducts={produkStok}
      />

      <DetailProdukModal data={detailProduk} onClose={() => setDetailProduk(null)} />
      <TambahStokModal data={tambahStok} onClose={() => setTambahStok(null)} onSubmit={handleTambahStokSubmit} />
      <LihatMutasiModal data={lihatMutasi} onClose={() => setLihatMutasi(null)} mutasiLog={mutasiLog} />
      <DetailDistribusiModal data={detailDistribusi} onClose={() => setDetailDistribusi(null)} />

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-2xl shadow-xl border bg-white animate-in slide-in-from-bottom-6 duration-200">
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />}
          <span className="text-xs font-semibold text-gray-800">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 ml-1.5 p-0.5 rounded"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
    </div>
  );
}

Gudang.layout = page => <AdminLayout>{page}</AdminLayout>;

export default Gudang;
