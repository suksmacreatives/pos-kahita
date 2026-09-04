import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { ShoppingBag, Package, ClipboardList } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import GudangStatCard from '@/Components/Admin/Inventory/Gudang/GudangStatCard';
import DistribusiOutletTable from '@/Components/Admin/Inventory/Gudang/DistribusiOutletTable';
import FormDistribusiModal from '@/Components/Admin/Inventory/Gudang/FormDistribusiModal';
import DetailDistribusiModal from '@/Components/Admin/Inventory/Gudang/DetailDistribusiModal';
import ConfirmDialog from '@/Components/Admin/ConfirmDialog';

function OnlineShop() {
  const { props } = usePage();
  const {
    warehouseProducts: initialProducts,
    distribusiOnline: initialDistribusi,
    onlineShops,
    outlets,
  } = props;

  const [processing, setProcessing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [confirmBatal, setConfirmBatal] = useState(null);
  const [produkStok] = useState(initialProducts || []);
  const [distribusi] = useState(initialDistribusi || []);

  const showToast = (message, type = 'success') => {
    if (type === 'error') toast.error(message);
    else toast.success(message);
  };

  const totalQty = distribusi.reduce((a, d) => a + (parseInt(d.total_qty) || 0), 0);
  const dibuatHariIni = distribusi.filter(d => {
    if (!d.created_at) return false;
    const t = new Date(d.created_at);
    const now = new Date();
    return t.getFullYear() === now.getFullYear() && t.getMonth() === now.getMonth() && t.getDate() === now.getDate();
  }).length;

  const batalUntil = new Date().toISOString();

  const reloadData = () => {
    router.reload({
      only: ['warehouseProducts', 'distribusiOnline'],
      preserveScroll: true,
    });
  };

  const handleDistribusiSubmit = (data) => {
    if (processing) return;
    setProcessing(true);
    router.post(route('admin.inventory.gudang.distribusi'), data, {
      preserveScroll: true,
      onSuccess: () => { setModalOpen(false); reloadData(); showToast('Distribusi online shop berhasil dicatat'); },
      onError: (errors) => showToast('Gagal: ' + Object.values(errors).join(', '), 'error'),
      onFinish: () => setProcessing(false),
    });
  };

  const handleBatal = (d) => {
    if (processing) return;
    setConfirmBatal(d);
  };

  const runBatal = () => {
    if (!confirmBatal) return;
    setProcessing(true);
    setConfirmBatal(null);
    router.patch(route('admin.inventory.gudang.distribusi.batal', confirmBatal.id), {}, {
      preserveScroll: true,
      onSuccess: () => { reloadData(); showToast('Distribusi online shop dibatalkan, stok gudang dikembalikan'); },
      onError: (errors) => showToast('Gagal: ' + Object.values(errors).join(', '), 'error'),
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Inventory Online Shop</h1>
          <p className="text-xs text-gray-400 mt-0.5">Pencatatan barang yang dikirim ke online shop</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer">+ Tambah Distribusi Online Shop</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GudangStatCard title="Total Pengiriman" value={distribusi.length} sub="distribusi online" color="sky" icon={ShoppingBag} />
        <GudangStatCard title="Total Qty" value={totalQty} sub="semua produk" color="blue" icon={Package} />
        <GudangStatCard title="Dibuat Hari Ini" value={dibuatHariIni} sub="pencatatan hari ini" color="emerald" icon={ClipboardList} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {onlineShops.map(s => {
          const count = distribusi.filter(d => d.online_shop_id === s.id).length;
          const qty = distribusi.filter(d => d.online_shop_id === s.id).reduce((a, d) => a + (parseInt(d.total_qty) || 0), 0);
          return (
            <div key={s.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
              <div className="p-3 bg-sky-100 rounded-xl">
                <ShoppingBag className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{s.nama}</p>
                <p className="text-xs text-gray-400">{count} pengiriman · {qty} pcs</p>
              </div>
            </div>
          );
        })}
      </div>

      <DistribusiOutletTable
        title="Distribusi Online Shop"
        data={distribusi}
        showTanggalTerima={false}
        showStatus={false}
        batalUntil={batalUntil}
        onLihat={setDetail}
        onProses={() => {}}
        onBatalDO={handleBatal}
      />

      <FormDistribusiModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleDistribusiSubmit}
        outlets={outlets}
        onlineShops={onlineShops}
        warehouseProducts={produkStok}
        processing={processing}
      />

      <DetailDistribusiModal data={detail} onClose={() => setDetail(null)} />

      <ConfirmDialog
        isOpen={!!confirmBatal}
        variant="danger"
        title="Batalkan Distribusi Online Shop"
        message="Batalkan pencatatan ini? Stok gudang akan dikembalikan."
        confirmLabel="Ya, Batalkan"
        processing={processing}
        onConfirm={runBatal}
        onCancel={() => setConfirmBatal(null)}
      />
    </div>
  );
}

OnlineShop.layout = page => <AdminLayout>{page}</AdminLayout>;

export default OnlineShop;
