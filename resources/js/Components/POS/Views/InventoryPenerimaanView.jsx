import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import PenerimaanGudangTable from '@/Components/Admin/Inventory/Outlet/PenerimaanGudangTable';
import KonfirmasiTerimaModal from '@/Components/Admin/Inventory/Outlet/KonfirmasiTerimaModal';

export default function InventoryPenerimaanView({ penerimaanList = {}, outletSlug, userName = 'Kasir' }) {
  const [isTerimaOpen, setIsTerimaOpen] = useState(false);
  const [activeTerimaDo, setActiveTerimaDo] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleOpenTerimaModal = (doRow) => {
    setActiveTerimaDo(doRow);
    setIsTerimaOpen(true);
  };

  const handleConfirmReceive = (confirmedData) => {
    if (processing) return;
    setProcessing(true);

    router.post(route('pos.penerimaan.konfirmasi', {
      distributionOrder: confirmedData.id
    }), {
      items: confirmedData.items.map(it => ({
        id: it.id || it.produk_id,
        qty_terima: it.qty_terima,
        kondisi: it.kondisi || 'baik',
        catatan: it.catatan || '',
      })),
      penerima: userName
    }, {
      onSuccess: () => {
        setIsTerimaOpen(false);
        setActiveTerimaDo(null);
      },
      onError: (errors) => {
        alert('Gagal konfirmasi: ' + Object.values(errors).join(', '));
      },
      onFinish: () => {
        setProcessing(false);
      }
    });
  };

  return (
    <div className="flex-1 bg-[#f7f8fa] p-5 overflow-y-auto">
      <div className="mb-4">
        <h1 className="text-lg font-black text-slate-800">Penerimaan Barang</h1>
        <p className="text-xs text-slate-500">Barang yang diterima dari distribusi gudang pusat</p>
      </div>

      <PenerimaanGudangTable
        selectedOutlet={outletSlug}
        onConfirmClick={handleOpenTerimaModal}
        penerimaanList={penerimaanList}
      />

      <KonfirmasiTerimaModal
        isOpen={isTerimaOpen}
        onClose={() => { setIsTerimaOpen(false); setActiveTerimaDo(null); }}
        data={activeTerimaDo}
        onConfirm={handleConfirmReceive}
        processing={processing}
      />
    </div>
  );
}
