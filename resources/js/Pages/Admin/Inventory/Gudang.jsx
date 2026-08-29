import React, { useState, useMemo, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
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
import ConfirmDialog from '@/Components/Admin/ConfirmDialog';

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
    errors: validationErrors,
  } = props;

  const [processing, setProcessing] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const showToast = (message, type = 'success') => {
    if (type === 'error') toast.error(message);
    else toast.success(message);
  };

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
    if (processing) return;
    setProcessing(true);
    router.post(route('admin.inventory.gudang.penerimaan'), data, {
      preserveScroll: true,
      onSuccess: () => { handleCloseModal(); reloadData(); showToast('Penerimaan barang berhasil diajukan'); },
      onError: (errors) => showToast('Gagal: ' + Object.values(errors).join(', '), 'error'),
      onFinish: () => setProcessing(false),
    });
  };

  const handleTandaiTerima = (item) => {
    if (processing) return;
    setProcessing(true);
    router.patch(route('admin.inventory.gudang.penerimaan.terima', item.id), {}, {
      preserveScroll: true,
      onSuccess: () => { reloadData(); showToast('Barang berhasil ditandai diterima'); },
      onError: (errors) => showToast('Gagal: ' + Object.values(errors).join(', '), 'error'),
      onFinish: () => setProcessing(false),
    });
  };

  const handleProsesPenerimaan = (item) => {
    if (processing) return;
    setProcessing(true);
    router.patch(route('admin.inventory.gudang.penerimaan.proses', item.id), {}, {
      preserveScroll: true,
      onSuccess: () => { reloadData(); showToast('Penerimaan berhasil diproses'); },
      onError: (errors) => showToast('Gagal: ' + Object.values(errors).join(', '), 'error'),
      onFinish: () => setProcessing(false),
    });
  };

  const handleDistribusiSubmit = (data) => {
    if (processing) return;
    setProcessing(true);
    router.post(route('admin.inventory.gudang.distribusi'), data, {
      preserveScroll: true,
      onSuccess: () => { handleCloseModal(); reloadData(); showToast('Distribusi berhasil diajukan'); },
      onError: (errors) => showToast('Gagal: ' + Object.values(errors).join(', '), 'error'),
      onFinish: () => setProcessing(false),
    });
  };

  const handleProses = (item) => {
    if (processing) return;
    setProcessing(true);
    router.patch(route('admin.inventory.gudang.distribusi.proses', item.id), {}, {
      preserveScroll: true,
      onSuccess: () => { reloadData(); showToast('Distribusi berhasil diproses'); },
      onError: (errors) => showToast('Gagal: ' + Object.values(errors).join(', '), 'error'),
      onFinish: () => setProcessing(false),
    });
  };

  const handleKonfirmasiTerima = (item) => {
    if (processing) return;
    setProcessing(true);
    router.patch(route('admin.inventory.gudang.distribusi.konfirmasi', item.id), {}, {
      preserveScroll: true,
      onSuccess: () => { reloadData(); showToast('Distribusi berhasil dikonfirmasi diterima'); },
      onError: (errors) => showToast('Gagal: ' + Object.values(errors).join(', '), 'error'),
      onFinish: () => setProcessing(false),
    });
  };

  const handleReturSubmit = (data) => {
    if (processing) return;
    setProcessing(true);
    router.post(route('admin.inventory.gudang.retur'), data, {
      preserveScroll: true,
      onSuccess: () => { handleCloseModal(); reloadData(); showToast('Retur berhasil diajukan'); },
      onError: (errors) => showToast('Gagal: ' + Object.values(errors).join(', '), 'error'),
      onFinish: () => setProcessing(false),
    });
  };

  const handleTerimaReturOutlet = (item) => {
    if (processing) return;
    setConfirmAction({ type: 'terima-retur-outlet', item });
  };

  const handleBatalReturOutlet = (item) => {
    if (processing) return;
    setConfirmAction({ type: 'batal-retur-outlet', item });
  };

  const handleBatalPO = (item) => {
    if (processing) return;
    setConfirmAction({ type: 'batal-po', item });
  };

  const handleBatalDO = (item) => {
    if (processing) return;
    setConfirmAction({ type: 'batal-do', item });
  };

  const handleBatalReturSupplier = (item) => {
    if (processing) return;
    setConfirmAction({ type: 'batal-retur-supplier', item });
  };

  const confirmMeta = {
    'terima-retur-outlet': {
      variant: 'primary',
      title: 'Terima Retur Outlet',
      message: 'Terima retur ini? Stok gudang akan bertambah sesuai qty barang yang diretur.',
      confirmLabel: 'Ya, Terima',
    },
    'batal-retur-outlet': {
      variant: 'danger',
      title: 'Batalkan Retur Outlet',
      message: 'Batalkan retur dari outlet ini? Stok outlet akan dikembalikan.',
      confirmLabel: 'Ya, Batalkan',
    },
    'batal-po': {
      variant: 'danger',
      title: 'Batalkan Purchase Order',
      message: 'Batalkan Purchase Order ini?',
      confirmLabel: 'Ya, Batalkan',
    },
    'batal-do': {
      variant: 'danger',
      title: 'Batalkan Distribution Order',
      message: 'Batalkan Distribution Order ini?',
      confirmLabel: 'Ya, Batalkan',
    },
    'batal-retur-supplier': {
      variant: 'danger',
      title: 'Batalkan Retur Supplier',
      message: 'Batalkan Retur Supplier? Stok gudang akan dikembalikan.',
      confirmLabel: 'Ya, Batalkan',
    },
  };

  const runConfirmAction = () => {
    if (!confirmAction) return;
    const { type, item } = confirmAction;
    setProcessing(true);
    setConfirmAction(null);

    const done = (msg) => () => { reloadData(); showToast(msg); };
    const fail = () => (errors) => showToast('Gagal: ' + Object.values(errors).join(', '), 'error');
    const finish = () => setProcessing(false);

    if (type === 'terima-retur-outlet') {
      router.patch(route('admin.inventory.gudang.retur-outlet.terima', item.id), {}, { preserveScroll: true, onSuccess: done('Retur outlet berhasil diterima'), onError: fail(), onFinish: finish });
    } else if (type === 'batal-retur-outlet') {
      router.patch(route('admin.inventory.gudang.retur-outlet.batal', item.id), {}, { preserveScroll: true, onSuccess: done('Retur outlet dibatalkan'), onError: fail(), onFinish: finish });
    } else if (type === 'batal-po') {
      router.patch(route('admin.inventory.gudang.penerimaan.batal', item.id), {}, { preserveScroll: true, onSuccess: done('Purchase Order dibatalkan'), onError: fail(), onFinish: finish });
    } else if (type === 'batal-do') {
      router.patch(route('admin.inventory.gudang.distribusi.batal', item.id), {}, { preserveScroll: true, onSuccess: done('Distribution Order dibatalkan'), onError: fail(), onFinish: finish });
    } else if (type === 'batal-retur-supplier') {
      router.patch(route('admin.inventory.gudang.retur.batal', item.id), {}, { preserveScroll: true, onSuccess: done('Retur supplier dibatalkan'), onError: fail(), onFinish: finish });
    }
  };

  const handleOpnameSubmit = (data) => {
    if (processing) return;
    setProcessing(true);
    router.post(route('admin.inventory.gudang.opname'), data, {
      preserveScroll: true,
      onSuccess: () => { handleCloseModal(); reloadData(); showToast('Stock opname berhasil disimpan'); },
      onError: (errors) => showToast('Gagal: ' + Object.values(errors).join(', '), 'error'),
      onFinish: () => setProcessing(false),
    });
  };

  const handleTambahStokSubmit = ({ produk_id, nama, ukuran, warna, qty, catatan }) => {
    if (processing) return;
    setProcessing(true);
    router.post(route('admin.inventory.gudang.tambah-stok'), {
      produk_id,
      nama,
      ukuran,
      warna,
      qty,
      catatan: catatan || '',
    }, {
      preserveScroll: true,
      onSuccess: () => { setTambahStok(null); reloadData(); showToast('Stok berhasil ditambahkan'); },
      onError: (errors) => showToast('Gagal: ' + Object.values(errors).join(', '), 'error'),
      onFinish: () => setProcessing(false),
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
        processing={processing}
      />
      <FormDistribusiModal
        open={modalType === 'distribusi'}
        onClose={handleCloseModal}
        onSubmit={handleDistribusiSubmit}
        outlets={outlets}
        warehouseProducts={produkStok}
        processing={processing}
      />
      <FormReturModal
        open={modalType === 'retur'}
        onClose={handleCloseModal}
        onSubmit={handleReturSubmit}
        suppliers={suppliers}
        warehouseProducts={produkStok}
        processing={processing}
      />
      <FormOpnameModal
        open={modalType === 'opname'}
        onClose={handleCloseModal}
        onSubmit={handleOpnameSubmit}
        warehouseProducts={produkStok}
        processing={processing}
      />

      <DetailProdukModal data={detailProduk} onClose={() => setDetailProduk(null)} />
      <TambahStokModal data={tambahStok} onClose={() => setTambahStok(null)} onSubmit={handleTambahStokSubmit} processing={processing} />
      <LihatMutasiModal data={lihatMutasi} onClose={() => setLihatMutasi(null)} mutasiLog={mutasiLog} />
      <DetailDistribusiModal data={detailDistribusi} onClose={() => setDetailDistribusi(null)} />

      <ConfirmDialog
        isOpen={!!confirmAction}
        variant={confirmAction ? (confirmMeta[confirmAction.type]?.variant || 'danger') : 'danger'}
        title={confirmAction ? (confirmMeta[confirmAction.type]?.title || 'Konfirmasi') : 'Konfirmasi'}
        message={confirmAction ? (confirmMeta[confirmAction.type]?.message || '') : ''}
        confirmLabel={confirmAction ? (confirmMeta[confirmAction.type]?.confirmLabel || 'Ya') : 'Ya'}
        processing={processing}
        onConfirm={runConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}

Gudang.layout = page => <AdminLayout>{page}</AdminLayout>;

export default Gudang;
